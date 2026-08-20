import { PrinterDevice, UniversalReceipt, ReceiptItem, PrinterPaperWidth } from '../types';

/**
 * Low-Level ESC/POS Thermal Receipt Command Builder
 * Supports 58mm (32 cols) and 80mm (48 cols) thermal printers.
 */
export class EscPosBuilder {
  private buffer: number[] = [];
  private cols: number;

  constructor(paperWidth: PrinterPaperWidth = '80mm') {
    this.cols = paperWidth === '58mm' ? 32 : 48;
    this.init();
  }

  public init(): this {
    // ESC @: Initialize printer
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  public align(alignment: 'left' | 'center' | 'right'): this {
    // ESC a n (0: Left, 1: Center, 2: Right)
    const n = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(0x1B, 0x61, n);
    return this;
  }

  public bold(enable: boolean = true): this {
    // ESC E n (1: on, 0: off)
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
    return this;
  }

  public underline(enable: boolean = true): this {
    // ESC - n (1: on, 0: off)
    this.buffer.push(0x1B, 0x2D, enable ? 1 : 0);
    return this;
  }

  public size(doubleWidth: boolean = false, doubleHeight: boolean = false): this {
    // GS ! n (bits 0-3: height, bits 4-7: width)
    let n = 0;
    if (doubleWidth) n |= 0x10;
    if (doubleHeight) n |= 0x01;
    this.buffer.push(0x1D, 0x21, n);
    return this;
  }

  public text(str: string): this {
    const clean = str.replace(/[^\x20-\x7E\r\n\t]/g, '?');
    for (let i = 0; i < clean.length; i++) {
      this.buffer.push(clean.charCodeAt(i));
    }
    return this;
  }

  public line(str: string = ''): this {
    this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  public divider(char: string = '-'): this {
    this.line(char.repeat(this.cols));
    return this;
  }

  public doubleDivider(): this {
    this.line('='.repeat(this.cols));
    return this;
  }

  public feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  public justifyTwoCols(left: string, right: string): this {
    const maxLeft = this.cols - right.length - 1;
    if (maxLeft < 0) {
      this.line(left);
      this.line(right.padStart(this.cols, ' '));
      return this;
    }
    const truncatedLeft = left.length > maxLeft ? left.substring(0, maxLeft) : left;
    const spaces = ' '.repeat(Math.max(1, this.cols - truncatedLeft.length - right.length));
    this.line(truncatedLeft + spaces + right);
    return this;
  }

  public tableRow(qty: string, desc: string, price: string, total: string): this {
    // Format 4 column row depending on width
    if (this.cols === 32) {
      // 58mm: Qty(3) Desc(15) Total(14)
      const q = (qty + '   ').slice(0, 3);
      const t = (price ? `${qty}x${price} ` : '') + total;
      const tPad = t.padStart(12, ' ');
      const availDesc = this.cols - q.length - tPad.length;
      const d = (desc + ' '.repeat(availDesc)).slice(0, availDesc);
      this.line(q + d + tPad);
    } else {
      // 80mm: Qty(4) Desc(22) Price(10) Total(12)
      const q = (qty + '    ').slice(0, 4);
      const p = price.padStart(10, ' ');
      const t = total.padStart(12, ' ');
      const availDesc = this.cols - 4 - 10 - 12;
      const d = (desc + ' '.repeat(availDesc)).slice(0, availDesc);
      this.line(q + d + p + t);
    }
    return this;
  }

  public kickDrawer(): this {
    // ESC p 0 25 250 (Cash drawer kick pulse)
    this.buffer.push(0x1B, 0x70, 0x00, 0x19, 0xFA);
    return this;
  }

  public cut(partial: boolean = false): this {
    this.feed(3);
    // GS V m (0x41 0x03 partial cut, 0x41 0x00 full cut)
    this.buffer.push(0x1D, 0x56, partial ? 0x01 : 0x00);
    return this;
  }

  public qrCode(content: string, size: number = 4): this {
    if (!content) return this;
    const len = content.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);

    this.align('center');
    // Model: GS ( k 4 0 49 65 50 0
    this.buffer.push(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // Size: GS ( k 3 0 49 67 size
    this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size);
    // Error correction: GS ( k 3 0 49 69 48 (Level L)
    this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30);
    // Store data: GS ( k pL pH 49 80 48 data
    this.buffer.push(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30);
    for (let i = 0; i < content.length; i++) {
      this.buffer.push(content.charCodeAt(i));
    }
    // Print QR: GS ( k 3 0 49 81 48
    this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
    this.feed(1);
    this.align('left');
    return this;
  }

  public barcode(content: string): this {
    if (!content) return this;
    this.align('center');
    // Set barcode height (GS h 60)
    this.buffer.push(0x1D, 0x68, 0x3C);
    // Set barcode text below (GS H 2)
    this.buffer.push(0x1D, 0x48, 0x02);
    // CODE128: GS k 73 len data
    this.buffer.push(0x1D, 0x6B, 0x49, content.length);
    for (let i = 0; i < content.length; i++) {
      this.buffer.push(content.charCodeAt(i));
    }
    this.feed(1);
    this.align('left');
    return this;
  }

  public getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  public getHex(): string {
    return Array.from(this.buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

/**
 * Format UniversalReceipt into ESC/POS thermal printer bytes
 */
export function buildReceiptEscPos(receipt: UniversalReceipt, printer: PrinterDevice): Uint8Array {
  const width = printer.paperWidth || '80mm';
  const builder = new EscPosBuilder(width);

  // 1. Header & Branding (NEVER Davetech unless Davetech is the tenant)
  builder.align('center');
  builder.bold(true);
  builder.size(true, true); // Double width & height
  builder.line(receipt.businessName || 'RECEIPT');
  builder.size(false, false);
  builder.bold(false);

  if (receipt.tradingName && receipt.tradingName !== receipt.businessName) {
    builder.line(receipt.tradingName);
  }

  if (receipt.address) {
    builder.line(receipt.address);
  }
  if (receipt.phone || receipt.email) {
    const contact = [receipt.phone ? `Tel: ${receipt.phone}` : '', receipt.email].filter(Boolean).join(' | ');
    builder.line(contact);
  }
  if (receipt.taxRegistrationNumber) {
    builder.bold(true);
    builder.line(`PIN/VAT: ${receipt.taxRegistrationNumber}`);
    builder.bold(false);
  }

  if (receipt.customHeader || printer.customHeader) {
    builder.feed(1);
    builder.line(receipt.customHeader || printer.customHeader || '');
  }

  // 2. Security Reprint Watermark if applicable
  if (receipt.isReprint) {
    builder.feed(1);
    builder.bold(true);
    builder.doubleDivider();
    builder.line(`*** OFFICIAL REPRINT (COPY #${receipt.reprintCount}) ***`);
    if (receipt.issuedAt) {
      builder.line(`ORIGINAL ISSUED: ${new Date(receipt.issuedAt).toLocaleString()}`);
    }
    builder.doubleDivider();
    builder.bold(false);
  } else {
    builder.doubleDivider();
  }

  // 3. Receipt Metadata
  builder.align('left');
  builder.justifyTwoCols('RECEIPT NO:', receipt.receiptNumber);
  builder.justifyTwoCols('DATE & TIME:', new Date(receipt.issuedAt || receipt.createdAt).toLocaleString());
  builder.justifyTwoCols('CASHIER/STAFF:', receipt.cashierName || 'Staff');

  if (receipt.branchName) {
    builder.justifyTwoCols('BRANCH/LOCATION:', receipt.branchName);
  }
  if (receipt.stationName) {
    builder.justifyTwoCols('STATION:', receipt.stationName);
  }

  // Domain specific customer information
  if (receipt.customerName && receipt.customerName !== 'Walk-in Customer') {
    builder.justifyTwoCols('CUSTOMER:', receipt.customerName);
  }
  if (receipt.customerPhone) {
    builder.justifyTwoCols('PHONE:', receipt.customerPhone);
  }
  if (receipt.studentAdmissionNo) {
    builder.justifyTwoCols('ADM NUMBER:', receipt.studentAdmissionNo);
  }
  if (receipt.patientId) {
    builder.justifyTwoCols('PATIENT ID:', receipt.patientId);
  }
  if (receipt.candidateNumber) {
    builder.justifyTwoCols('CANDIDATE NO:', receipt.candidateNumber);
  }
  if (receipt.roomOrTableNumber) {
    builder.justifyTwoCols('ROOM / TABLE:', receipt.roomOrTableNumber);
  }

  builder.divider('-');

  // 4. Line Items Table
  builder.bold(true);
  if (width === '58mm') {
    builder.tableRow('QTY', 'ITEM DESCRIPTION', '', 'AMOUNT');
  } else {
    builder.tableRow('QTY', 'ITEM DESCRIPTION', 'PRICE', 'TOTAL');
  }
  builder.bold(false);
  builder.divider('-');

  const sym = receipt.currencySymbol || 'KES';
  receipt.items.forEach((item: ReceiptItem) => {
    const qtyStr = `${item.quantity}`;
    const priceStr = `${sym} ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const totalStr = `${sym} ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    builder.tableRow(qtyStr, item.name, priceStr, totalStr);
    if (item.notes) {
      builder.line(`  * ${item.notes}`);
    }
  });

  builder.divider('-');

  // 5. Totals Breakdown
  builder.align('right');
  builder.justifyTwoCols('SUBTOTAL:', `${sym} ${receipt.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  if (receipt.discountAmount > 0) {
    builder.justifyTwoCols('DISCOUNT:', `-${sym} ${receipt.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }

  if (receipt.taxAmount > 0) {
    const taxLabel = receipt.taxRatePercentage ? `VAT (${receipt.taxRatePercentage}%):` : 'TAX / VAT:';
    builder.justifyTwoCols(taxLabel, `${sym} ${receipt.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }

  builder.bold(true);
  builder.size(false, true); // Double height for grand total
  builder.justifyTwoCols('TOTAL AMOUNT:', `${sym} ${receipt.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  builder.size(false, false);
  builder.bold(false);

  builder.divider('-');

  // 6. Payment Information
  builder.justifyTwoCols('PAYMENT METHOD:', receipt.paymentMethod.replace('_', ' '));
  if (receipt.paymentReference) {
    builder.justifyTwoCols('REF / TXN ID:', receipt.paymentReference);
  }
  if (receipt.amountTendered && receipt.amountTendered > 0) {
    builder.justifyTwoCols('AMOUNT TENDERED:', `${sym} ${receipt.amountTendered.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }
  if (receipt.changeGiven !== undefined && receipt.changeGiven >= 0) {
    builder.justifyTwoCols('CHANGE GIVEN:', `${sym} ${receipt.changeGiven.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }
  if (receipt.balanceRemaining !== undefined && receipt.balanceRemaining > 0) {
    builder.bold(true);
    builder.justifyTwoCols('BALANCE DUE:', `${sym} ${receipt.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    builder.bold(false);
  }

  builder.divider('=');

  // 7. Footer, Barcode & QR Verification
  builder.align('center');
  if (receipt.customFooter || printer.customFooter) {
    builder.line(receipt.customFooter || printer.customFooter || '');
  } else {
    builder.line('Thank you for your business!');
  }

  if (receipt.verificationCode) {
    builder.feed(1);
    builder.bold(true);
    builder.line(`VERIFICATION CODE: ${receipt.verificationCode}`);
    builder.bold(false);
    const verifyUrl = receipt.qrVerificationUrl || (typeof window !== 'undefined' ? `${window.location.origin}/verify-document/${receipt.verificationCode}` : `https://verify/${receipt.verificationCode}`);
    builder.qrCode(verifyUrl, width === '58mm' ? 4 : 5);
    builder.line('Scan QR code to verify authenticity');
  }

  // 8. Hardware Actions (Cash Drawer & Paper Cut)
  if (printer.kickCashDrawer) {
    builder.kickDrawer();
  }
  if (printer.cutPaper !== false) {
    builder.cut(false);
  } else {
    builder.feed(4);
  }

  return builder.getUint8Array();
}

/**
 * Format a Diagnostic Self-Test Slip for testing ESC/POS printers
 */
export function buildTestPrintEscPos(printer: PrinterDevice, tenantName: string, testedBy: string = 'System Admin'): Uint8Array {
  const width = printer.paperWidth || '80mm';
  const builder = new EscPosBuilder(width);
  const cols = width === '58mm' ? 32 : 48;

  builder.align('center');
  builder.bold(true);
  builder.size(true, true);
  builder.line('*** PRINTER TEST SLIP ***');
  builder.size(false, false);
  builder.bold(false);

  builder.line(tenantName || 'Enterprise System');
  builder.doubleDivider();

  builder.align('left');
  builder.justifyTwoCols('PRINTER NAME:', printer.name);
  builder.justifyTwoCols('INTERFACE TYPE:', printer.interfaceType);
  builder.justifyTwoCols('PAPER WIDTH:', `${printer.paperWidth} (${cols} Columns)`);
  builder.justifyTwoCols('TARGET STATION:', printer.stationTarget);
  builder.justifyTwoCols('AUTO PRINT:', printer.autoPrint ? 'ENABLED' : 'DISABLED');
  builder.justifyTwoCols('CASH DRAWER:', printer.kickCashDrawer ? 'PULSE ENABLED' : 'DISABLED');
  builder.justifyTwoCols('AUTO CUTTER:', printer.cutPaper ? 'ENABLED' : 'DISABLED');
  builder.justifyTwoCols('TESTED BY:', testedBy);
  builder.justifyTwoCols('TIMESTAMP:', new Date().toLocaleString());

  builder.divider('-');
  builder.align('center');
  builder.bold(true);
  builder.line('--- COLUMN ALIGNMENT RULER ---');
  builder.bold(false);
  if (cols === 32) {
    builder.line('12345678901234567890123456789012');
    builder.line('....|....|....|....|....|....|..');
  } else {
    builder.line('123456789012345678901234567890123456789012345678');
    builder.line('....|....|....|....|....|....|....|....|....|...');
  }

  builder.divider('-');
  builder.align('left');
  builder.line('Normal Text Style: PASS');
  builder.bold(true);
  builder.line('Bold Text Style: PASS');
  builder.bold(false);
  builder.underline(true);
  builder.line('Underline Text Style: PASS');
  builder.underline(false);

  builder.divider('-');
  builder.align('center');
  builder.line('ESC/POS QR CODE TEST:');
  builder.qrCode(`TEST-OK-${printer.id}-${Date.now()}`, cols === 32 ? 4 : 5);
  builder.line('[ Scan confirms 2D QR decoding ]');

  builder.doubleDivider();
  builder.line('If this slip printed cleanly,');
  builder.line('your physical printer is READY.');

  if (printer.kickCashDrawer) {
    builder.kickDrawer();
  }
  if (printer.cutPaper !== false) {
    builder.cut(false);
  } else {
    builder.feed(4);
  }

  return builder.getUint8Array();
}

/**
 * Dispatch ESC/POS raw bytes to physical printer hardware
 */
export async function dispatchEscPosToHardware(
  printer: PrinterDevice,
  rawBytes: Uint8Array
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (printer.interfaceType) {
      case 'WEB_USB': {
        if (!(navigator as any).usb) {
          throw new Error('WebUSB is not supported in this browser. Please use Chrome/Edge or Network LAN mode.');
        }
        const navUsb = (navigator as any).usb;
        let device: any;
        
        const pairedDevices = await navUsb.getDevices();
        if (pairedDevices.length > 0) {
          device = pairedDevices[0];
        } else {
          device = await navUsb.requestDevice({
            filters: [] // Allow user to choose any connected USB printer
          });
        }

        if (!device) throw new Error('No USB receipt printer selected or connected.');

        await device.open();
        if (device.configuration === null) {
          await device.selectConfiguration(1);
        }
        await device.claimInterface(0);

        // Find bulk OUT endpoint
        let endpointNumber = 1;
        try {
          const endpoints = device.configuration?.interfaces?.[0]?.alternate?.endpoints || [];
          const outEp = endpoints.find((e: any) => e.direction === 'out');
          if (outEp) endpointNumber = outEp.endpointNumber;
        } catch {
          endpointNumber = 1;
        }

        await device.transferOut(endpointNumber, rawBytes);
        await device.close();
        return { success: true };
      }

      case 'WEB_SERIAL': {
        if (!(navigator as any).serial) {
          throw new Error('Web Serial API is not supported in this browser.');
        }
        const navSerial = (navigator as any).serial;
        const port = await navSerial.requestPort();
        await port.open({ baudRate: printer.serialBaudRate || 9600 });
        const writer = port.writable.getWriter();
        await writer.write(rawBytes);
        writer.releaseLock();
        await port.close();
        return { success: true };
      }

      case 'LOCAL_BRIDGE': {
        const bridgeUrl = printer.bridgeUrl || 'http://127.0.0.1:9100';
        // Dispatch Base64 encoded payload to local print agent
        const binaryString = Array.from(rawBytes).map(b => String.fromCharCode(b)).join('');
        const base64Data = btoa(binaryString);

        const res = await fetch(bridgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            printerName: printer.name,
            rawBase64: base64Data,
            paperWidth: printer.paperWidth,
            cut: printer.cutPaper
          }),
          mode: 'cors'
        });

        if (!res.ok) {
          throw new Error(`Local Print Bridge responded with status ${res.status}`);
        }
        return { success: true };
      }

      case 'NETWORK_LAN': {
        // Send through backend TCP raw socket proxy
        const binaryString = Array.from(rawBytes).map(b => String.fromCharCode(b)).join('');
        const base64Data = btoa(binaryString);

        const res = await fetch('/api/app/printers/send-raw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('erp_user_id') || ''
          },
          body: JSON.stringify({
            printerId: printer.id,
            ipAddress: printer.ipAddress,
            port: printer.port || 9100,
            rawBase64: base64Data
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send print job to network printer');
        }
        return { success: true };
      }

      case 'SYSTEM_DEFAULT':
      default: {
        // Formatted thermal slip rendering for browser thermal print driver
        return renderAndPrintThermalSlip(rawBytes, printer);
      }
    }
  } catch (err: any) {
    console.warn(`Direct ESC/POS dispatch failed for printer ${printer.name}:`, err);
    return { success: false, error: err.message || 'Hardware connection failed' };
  }
}

/**
 * Render visual thermal slip for fallback / instant browser print dialog
 */
export function renderAndPrintThermalSlip(
  _rawBytes: Uint8Array,
  printer: PrinterDevice
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      window.focus();
      window.print();
      resolve({ success: true });
    } catch (err: any) {
      resolve({ success: false, error: err.message });
    }
  });
}
