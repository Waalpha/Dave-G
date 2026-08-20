import { UniversalReceipt, PrinterDevice, PrintJobRecord, PrinterStationTarget } from '../types';
import { buildReceiptEscPos, buildTestPrintEscPos, dispatchEscPosToHardware } from './escPosService';

class UniversalPrintService {
  private printersCache: PrinterDevice[] = [];
  private lastFetchTime: number = 0;

  private getAuthHeaders(): HeadersInit {
    const userId = typeof localStorage !== 'undefined' ? localStorage.getItem('erp_user_id') || '' : '';
    const tenantId = typeof localStorage !== 'undefined' ? localStorage.getItem('erp_tenant_id') || '' : '';
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-tenant-id': tenantId
    };
  }

  /**
   * Fetch all configured printers for current tenant
   */
  public async getPrinters(forceRefresh: boolean = false): Promise<PrinterDevice[]> {
    const now = Date.now();
    if (!forceRefresh && this.printersCache.length > 0 && now - this.lastFetchTime < 10000) {
      return this.printersCache;
    }
    try {
      const res = await fetch('/api/app/printers', { headers: this.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        this.printersCache = data.printers || [];
        this.lastFetchTime = now;
        return this.printersCache;
      }
    } catch (err) {
      console.error('Failed to fetch printers:', err);
    }
    return this.printersCache;
  }

  /**
   * Find appropriate printer for station target
   */
  public async resolvePrinterForStation(station: PrinterStationTarget = 'CASHIER'): Promise<PrinterDevice | null> {
    const printers = await this.getPrinters();
    if (printers.length === 0) return null;

    // 1. Exact station match
    const stationMatch = printers.find(p => p.stationTarget === station);
    if (stationMatch) return stationMatch;

    // 2. ALL stations match
    const allMatch = printers.find(p => p.stationTarget === 'ALL');
    if (allMatch) return allMatch;

    // 3. Default printer
    const defaultPrinter = printers.find(p => p.isDefault);
    if (defaultPrinter) return defaultPrinter;

    // 4. First configured printer
    return printers[0] || null;
  }

  /**
   * Print or Auto-Print a Universal Receipt to physical thermal hardware
   */
  public async printReceipt(
    receipt: UniversalReceipt,
    options?: {
      printerId?: string;
      station?: PrinterStationTarget;
      isReprint?: boolean;
      copies?: number;
    }
  ): Promise<{ success: boolean; queued: boolean; message: string; jobId?: string; error?: string }> {
    try {
      const printers = await this.getPrinters();
      let targetPrinter: PrinterDevice | null = null;

      if (options?.printerId) {
        targetPrinter = printers.find(p => p.id === options.printerId) || null;
      }

      if (!targetPrinter) {
        targetPrinter = await this.resolvePrinterForStation(options?.station || 'CASHIER');
      }

      // Default fallback virtual printer if none configured in settings
      const printer: PrinterDevice = targetPrinter || {
        id: 'default_virtual_printer',
        tenantId: receipt.tenantId,
        name: 'Default Thermal Slip Printer',
        stationTarget: 'CASHIER',
        interfaceType: 'SYSTEM_DEFAULT',
        paperWidth: '80mm',
        isDefault: true,
        autoPrint: true,
        kickCashDrawer: false,
        cutPaper: true,
        copies: 1,
        status: 'ONLINE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ensure reprint metadata is accurate
      const receiptToPrint: UniversalReceipt = {
        ...receipt,
        isReprint: options?.isReprint || receipt.isReprint || false,
        reprintCount: options?.isReprint ? (receipt.reprintCount || 0) + 1 : (receipt.reprintCount || 0)
      };

      // 1. Build raw ESC/POS binary buffer
      const rawBytes = buildReceiptEscPos(receiptToPrint, printer);

      // 2. Enqueue print job in database for persistence & retry tracking
      let jobId = `job_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      try {
        const jobPayload: Partial<PrintJobRecord> = {
          id: jobId,
          receiptId: receiptToPrint.id,
          receiptNumber: receiptToPrint.receiptNumber,
          printerId: printer.id,
          printerName: printer.name,
          stationTarget: printer.stationTarget,
          interfaceType: printer.interfaceType,
          paperWidth: printer.paperWidth,
          copies: options?.copies || printer.copies || 1,
          status: 'PRINTING',
          attempts: 1,
          maxAttempts: 5,
          isAutoTriggered: !options?.isReprint,
          isReprint: !!options?.isReprint
        };

        const jobRes = await fetch('/api/app/print-jobs', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(jobPayload)
        });
        if (jobRes.ok) {
          const resJson = await jobRes.json();
          if (resJson.job?.id) jobId = resJson.job.id;
        }
      } catch (queueErr) {
        console.warn('Could not persist print job to queue:', queueErr);
      }

      // 3. Attempt direct physical dispatch to ESC/POS hardware
      const dispatchResult = await dispatchEscPosToHardware(printer, rawBytes);

      if (dispatchResult.success) {
        // Update job status to COMPLETED
        this.updateJobStatus(jobId, 'COMPLETED').catch(() => {});
        return {
          success: true,
          queued: false,
          message: `Receipt ${receiptToPrint.receiptNumber} printed successfully to ${printer.name}`,
          jobId
        };
      } else {
        // Printer is offline or unreachable - queue for retry without failing transaction
        const errMsg = dispatchResult.error || 'Printer connection timed out / offline';
        this.updateJobStatus(jobId, 'OFFLINE_QUEUED', errMsg).catch(() => {});
        return {
          success: false,
          queued: true,
          message: `Printer "${printer.name}" is offline. Print job queued for automatic retry.`,
          jobId,
          error: errMsg
        };
      }
    } catch (err: any) {
      console.error('Universal print execution failed:', err);
      return {
        success: false,
        queued: true,
        message: 'Printer not reachable. Receipt saved and queued in retry queue.',
        error: err.message
      };
    }
  }

  /**
   * Update print job status in backend
   */
  private async updateJobStatus(jobId: string, status: string, error?: string): Promise<void> {
    try {
      await fetch(`/api/app/print-jobs/${jobId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, lastError: error })
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Test physical printer hardware with diagnostic slip
   */
  public async testPrinter(
    printer: PrinterDevice,
    tenantName: string,
    testedBy: string = 'Admin'
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const rawBytes = buildTestPrintEscPos(printer, tenantName, testedBy);
      const res = await dispatchEscPosToHardware(printer, rawBytes);

      // Log printer test audit
      fetch('/api/app/printers/audit-logs', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'PRINTER_TESTED',
          printerName: printer.name,
          details: `Self-test executed on ${printer.name} (${printer.interfaceType}, ${printer.paperWidth}) — Result: ${res.success ? 'PASSED' : 'FAILED: ' + res.error}`
        })
      }).catch(() => {});

      if (res.success) {
        return { success: true, message: `Test slip sent successfully to ${printer.name}!` };
      } else {
        return { success: false, message: `Could not connect to ${printer.name}`, error: res.error };
      }
    } catch (err: any) {
      return { success: false, message: 'Printer test failed', error: err.message };
    }
  }

  /**
   * Trigger Cash Drawer Pulse on physical printer
   */
  public async kickCashDrawer(printer?: PrinterDevice): Promise<boolean> {
    try {
      const target = printer || (await this.resolvePrinterForStation('CASHIER'));
      if (!target) return false;
      const drawerBytes = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
      const res = await dispatchEscPosToHardware(target, drawerBytes);
      return res.success;
    } catch {
      return false;
    }
  }
}

export const printService = new UniversalPrintService();
