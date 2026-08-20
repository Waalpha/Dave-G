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
   * Log receipt print job for accounting and audit tracking
   */
  public async logReceiptPrint(
    receipt: UniversalReceipt,
    options?: { isReprint?: boolean; copies?: number }
  ): Promise<void> {
    try {
      const jobPayload: Partial<PrintJobRecord> = {
        id: `job_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        receiptId: receipt.id,
        receiptNumber: receipt.receiptNumber,
        printerId: 'system_installed_printer',
        printerName: 'System Installed Printer',
        stationTarget: 'ALL',
        interfaceType: 'SYSTEM_DEFAULT',
        paperWidth: '80mm',
        copies: options?.copies || 1,
        status: 'COMPLETED',
        attempts: 1,
        maxAttempts: 1,
        isAutoTriggered: !options?.isReprint,
        isReprint: !!options?.isReprint
      };

      await fetch('/api/app/print-jobs', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(jobPayload)
      });
    } catch {
      // Ignored non-blocking audit logging
    }
  }

  /**
   * Print or Auto-Print a Universal Receipt to system installed printer
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
      // Ensure reprint metadata is accurate
      const receiptToPrint: UniversalReceipt = {
        ...receipt,
        isReprint: options?.isReprint || receipt.isReprint || false,
        reprintCount: options?.isReprint ? (receipt.reprintCount || 0) + 1 : (receipt.reprintCount || 0)
      };

      // 1. Invoke OS / Browser installed printer dialog
      if (typeof window !== 'undefined') {
        window.focus();
        window.print();
      }

      // 2. Log print job asynchronously
      const jobId = `job_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      this.logReceiptPrint(receiptToPrint, options).catch(() => {});

      return {
        success: true,
        queued: false,
        message: `Receipt ${receiptToPrint.receiptNumber} sent to system installed printer`,
        jobId
      };
    } catch (err: any) {
      console.error('Universal print execution failed:', err);
      return {
        success: false,
        queued: false,
        message: 'Could not open system print dialog',
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
