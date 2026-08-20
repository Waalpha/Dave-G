import React, { useState } from 'react';
import {
  Printer,
  Download,
  RotateCw,
  X,
  CheckCircle,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Building,
  CreditCard,
  User,
  DollarSign,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { UniversalReceipt, PrinterPaperWidth } from '../../types';
import { printService } from '../../lib/printService';

interface UniversalReceiptModalProps {
  receipt: UniversalReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onReprint?: (receipt: UniversalReceipt) => void;
}

export const UniversalReceiptModal: React.FC<UniversalReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onReprint
}) => {
  const [paperWidth, setPaperWidth] = useState<PrinterPaperWidth>('80mm');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isReprinting, setIsReprinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  if (!isOpen || !receipt) return null;

  const sym = receipt.currencySymbol || 'KES';
  const logo = receipt.logoUrl;

  const handleDirectPrint = async () => {
    setIsPrinting(true);
    setPrintStatus(null);
    try {
      window.focus();
      window.print();
      setPrintStatus({ type: 'success', message: `Dispatched to system installed printer (${paperWidth})!` });
      printService.logReceiptPrint(receipt, { isReprint: false }).catch(() => {});
    } catch (err: any) {
      setPrintStatus({ type: 'error', message: err.message || 'Print dispatch failed' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReprint = async () => {
    setIsReprinting(true);
    setPrintStatus(null);
    try {
      const res = await fetch(`/api/app/receipts/${receipt.id}/reprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': localStorage.getItem('erp_tenant_id') || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.receipt) {
        if (onReprint) onReprint(data.receipt);
        window.focus();
        window.print();
        setPrintStatus({ type: 'success', message: `Reprint copy #${data.receipt.reprintCount} sent to system installed printer!` });
        printService.logReceiptPrint(data.receipt, { isReprint: true }).catch(() => {});
      } else {
        throw new Error(data.error || 'Could not issue reprint');
      }
    } catch (err: any) {
      setPrintStatus({ type: 'error', message: err.message || 'Reprint failed' });
    } finally {
      setIsReprinting(false);
    }
  };

  const handleKickDrawer = async () => {
    try {
      const ok = await printService.kickCashDrawer();
      if (ok) {
        setPrintStatus({ type: 'success', message: 'Cash drawer kick pulse sent' });
      } else {
        setPrintStatus({ type: 'warning', message: 'Cash drawer trigger sent (check hardware connection)' });
      }
    } catch {
      setPrintStatus({ type: 'error', message: 'Failed to trigger drawer' });
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs">
      
      {/* Dynamic Print Styles for Screen vs Physical Paper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt-area, #printable-receipt-area * {
            visibility: visible !important;
          }
          #printable-receipt-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperWidth === 'A4' ? '100%' : paperWidth === '58mm' ? '58mm' : '80mm'} !important;
            margin: 0 !important;
            padding: ${paperWidth === 'A4' ? '12mm' : '4mm'} !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          @page {
            size: ${paperWidth === 'A4' ? 'A4 portrait' : paperWidth === '58mm' ? '58mm auto' : '80mm auto'};
            margin: ${paperWidth === 'A4' ? '10mm' : '0'};
          }
        }
      `}</style>

      <div className={`flex max-h-[94vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 transition-all duration-200 ${
        paperWidth === 'A4' ? 'max-w-4xl' : 'max-w-xl'
      }`}>
        
        {/* Header Bar with Format Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Receipt &amp; Tax Invoice Center</h2>
                {receipt.isReprint && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                    REPRINT #{receipt.reprintCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {receipt.receiptNumber} <span className="text-slate-600">•</span> <span className="text-emerald-400">{receipt.sourceModule.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Paper Size Switcher */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-900/90 p-1 text-xs">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  paperWidth === '58mm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="58mm Compact POS Thermal Roll"
              >
                <Printer className="h-3 w-3" />
                <span>58mm Roll</span>
              </button>

              <button
                onClick={() => setPaperWidth('80mm')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  paperWidth === '80mm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="80mm Standard POS Counter Thermal Roll"
              >
                <Printer className="h-3 w-3" />
                <span>80mm Counter</span>
              </button>

              <button
                onClick={() => setPaperWidth('A4')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  paperWidth === 'A4'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="A4 Full Page Formal Tax Invoice & Payment Receipt"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>A4 Paper</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Notification */}
        {printStatus && (
          <div
            className={`flex items-center gap-2 border-b px-5 py-2.5 text-xs font-medium ${
              printStatus.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : printStatus.type === 'warning'
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
            }`}
          >
            {printStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            )}
            <span>{printStatus.message}</span>
          </div>
        )}

        {/* Live Preview Canvas Container */}
        <div className="flex-1 overflow-y-auto bg-slate-950/90 p-4 sm:p-8">
          
          {/* ========================================================
              LAYOUT VARIANT 1 & 2: 58mm / 80mm THERMAL SLIP
              ======================================================== */}
          {paperWidth !== 'A4' ? (
            <div className="flex justify-center">
              <div
                id="printable-receipt-area"
                className={`relative rounded-md bg-white text-slate-900 shadow-2xl transition-all font-mono ${
                  paperWidth === '58mm' ? 'w-[320px] p-4 text-[11px]' : 'w-[420px] p-6 text-xs'
                }`}
              >
                {/* Perforated edge effect */}
                <div className="absolute -top-1 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_3px,_#ffffff_3px)] bg-[length:8px_8px]" />

                {/* Header Branding */}
                <div className="text-center space-y-1">
                  {logo ? (
                    <div className="flex justify-center pb-1">
                      <img
                        src={logo}
                        alt={receipt.businessName}
                        className="max-h-14 max-w-[180px] object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm mb-1">
                      {receipt.businessName.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <h1 className="text-sm font-extrabold uppercase tracking-tight text-slate-950">
                    {receipt.businessName}
                  </h1>

                  {receipt.tradingName && receipt.tradingName !== receipt.businessName && (
                    <p className="text-[11px] font-semibold text-slate-700">{receipt.tradingName}</p>
                  )}

                  {receipt.address && (
                    <p className="text-[10px] text-slate-600 leading-tight">{receipt.address}</p>
                  )}

                  {(receipt.phone || receipt.email) && (
                    <p className="text-[10px] text-slate-600">
                      {[receipt.phone ? `Tel: ${receipt.phone}` : '', receipt.email].filter(Boolean).join(' | ')}
                    </p>
                  )}

                  {receipt.taxRegistrationNumber && (
                    <p className="font-bold text-slate-800 text-[11px]">
                      TAX PIN/VAT: {receipt.taxRegistrationNumber}
                    </p>
                  )}

                  {receipt.customHeader && (
                    <p className="italic text-slate-700 text-[10px] pt-1">{receipt.customHeader}</p>
                  )}
                </div>

                {/* Reprint Banner */}
                {receipt.isReprint && (
                  <div className="my-2.5 border-y-2 border-dashed border-rose-600 py-1 text-center font-bold text-rose-700">
                    *** OFFICIAL REPRINT (COPY #{receipt.reprintCount}) ***
                    {receipt.issuedAt && (
                      <p className="text-[9px] font-normal text-slate-600">
                        Orig: {new Date(receipt.issuedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="my-2 border-t border-slate-300" />

                {/* Receipt Metadata */}
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">RECEIPT NO:</span>
                    <span className="font-bold text-slate-950">{receipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">DATE &amp; TIME:</span>
                    <span>{new Date(receipt.issuedAt || receipt.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">SERVED BY:</span>
                    <span>{receipt.cashierName || 'Cashier / Bursar'}</span>
                  </div>
                  {receipt.branchName && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">BRANCH/STATION:</span>
                      <span>{receipt.branchName}</span>
                    </div>
                  )}
                  {receipt.customerName && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">CUSTOMER:</span>
                      <span className="font-semibold text-slate-900">{receipt.customerName}</span>
                    </div>
                  )}
                  {receipt.studentAdmissionNo && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">ADM NO:</span>
                      <span className="font-bold text-slate-900">{receipt.studentAdmissionNo}</span>
                    </div>
                  )}
                  {receipt.patientId && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">PATIENT ID:</span>
                      <span className="font-bold text-slate-900">{receipt.patientId}</span>
                    </div>
                  )}
                  {receipt.candidateNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">CANDIDATE NO:</span>
                      <span className="font-bold text-slate-900">{receipt.candidateNumber}</span>
                    </div>
                  )}
                  {receipt.roomOrTableNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">LOCATION:</span>
                      <span>{receipt.roomOrTableNumber}</span>
                    </div>
                  )}
                </div>

                <div className="my-2 border-t border-slate-300" />

                {/* Items Table */}
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-800">
                      <th className="pb-1">QTY</th>
                      <th className="pb-1">ITEM / DESCRIPTION</th>
                      <th className="pb-1 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipt.items.map((item, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-1 font-medium">{item.quantity}x</td>
                        <td className="py-1 pr-1">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {item.quantity > 1 && (
                            <div className="text-[9px] text-slate-500">
                              @{sym} {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                          {item.notes && <div className="text-[9px] italic text-slate-500">*{item.notes}</div>}
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {sym} {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="my-2 border-t border-slate-300" />

                {/* Financial Summary */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>SUBTOTAL:</span>
                    <span>{sym} {receipt.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {receipt.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>DISCOUNT:</span>
                      <span>-{sym} {receipt.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {receipt.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{receipt.taxRatePercentage ? `VAT (${receipt.taxRatePercentage}%):` : 'TAX / VAT:'}</span>
                      <span>{sym} {receipt.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-400 pt-1 text-sm font-extrabold text-slate-950">
                    <span>GRAND TOTAL:</span>
                    <span>{sym} {receipt.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="my-2 border-t border-slate-300" />

                {/* Payment Breakdown */}
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">PAYMENT METHOD:</span>
                    <span className="font-bold text-slate-900">{receipt.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  {receipt.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">REF / TXN NO:</span>
                      <span className="font-mono font-bold text-slate-900">{receipt.paymentReference}</span>
                    </div>
                  )}
                  {receipt.amountTendered !== undefined && receipt.amountTendered > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">AMOUNT TENDERED:</span>
                      <span>{sym} {receipt.amountTendered.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {receipt.changeGiven !== undefined && receipt.changeGiven >= 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">CHANGE RETURNED:</span>
                      <span>{sym} {receipt.changeGiven.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {receipt.balanceRemaining !== undefined && receipt.balanceRemaining > 0 && (
                    <div className="flex justify-between font-bold text-rose-700">
                      <span>OUTSTANDING BALANCE:</span>
                      <span>{sym} {receipt.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                <div className="my-3 border-t-2 border-dashed border-slate-300" />

                {/* Footer & QR Verification */}
                <div className="text-center text-[10px] text-slate-600 space-y-2">
                  <p className="font-medium text-slate-800">
                    {receipt.customFooter || 'Thank you for your business!'}
                  </p>
                  {receipt.verificationCode && (
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] font-bold text-slate-700">
                        AUTH: {receipt.verificationCode}
                      </p>
                      <div className="inline-block rounded border border-slate-300 bg-slate-50 p-1.5">
                        <QrCode className="mx-auto h-12 w-12 text-slate-900" />
                      </div>
                      <p className="text-[8px] text-slate-400">Scan to verify cryptographic authenticity</p>
                    </div>
                  )}
                </div>

                {/* Perforated bottom edge */}
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_3px,_#ffffff_3px)] bg-[length:8px_8px]" />
              </div>
            </div>
          ) : (
            /* ========================================================
               LAYOUT VARIANT 3: FULL A4 TAX INVOICE & OFFICIAL RECEIPT
               ======================================================== */
            <div className="flex justify-center">
              <div
                id="printable-receipt-area"
                className="w-full max-w-[820px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-lg font-sans border border-slate-200"
              >
                {/* A4 Top Letterhead with Logo & Company Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
                  <div className="flex items-start gap-4">
                    {logo ? (
                      <img
                        src={logo}
                        alt={receipt.businessName}
                        className="h-16 max-w-[160px] object-contain rounded"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-2xl shadow-md">
                        {receipt.businessName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                        {receipt.businessName}
                      </h1>
                      {receipt.tradingName && receipt.tradingName !== receipt.businessName && (
                        <p className="text-xs font-semibold text-slate-600">{receipt.tradingName}</p>
                      )}
                      <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                        {receipt.address && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400" /> {receipt.address}</p>}
                        {(receipt.phone || receipt.email) && (
                          <p className="flex items-center gap-3">
                            {receipt.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {receipt.phone}</span>}
                            {receipt.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {receipt.email}</span>}
                          </p>
                        )}
                        {receipt.taxRegistrationNumber && (
                          <p className="font-semibold text-slate-800">
                            TAX PIN / VAT REG: <span className="font-mono text-slate-900">{receipt.taxRegistrationNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="inline-block rounded-md bg-slate-900 px-3 py-1 text-xs font-extrabold text-white uppercase tracking-wider mb-2">
                      Official Receipt &amp; Tax Invoice
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-slate-500">Receipt No: <span className="font-mono font-bold text-slate-900 text-sm">{receipt.receiptNumber}</span></p>
                      <p className="text-slate-500">Date: <span className="font-medium text-slate-800">{new Date(receipt.issuedAt || receipt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></p>
                      <p className="text-slate-500">Time: <span className="font-medium text-slate-800">{new Date(receipt.issuedAt || receipt.createdAt).toLocaleTimeString()}</span></p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                          <CheckCircle className="h-3 w-3" /> SETTLED &amp; PAID
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reprint Watermark Banner */}
                {receipt.isReprint && (
                  <div className="my-4 rounded-md border-2 border-dashed border-rose-500 bg-rose-50 p-3 text-center text-rose-800">
                    <p className="text-xs font-extrabold tracking-wide">
                      *** OFFICIAL REPRINT COPY #{receipt.reprintCount} ***
                    </p>
                    <p className="text-[11px] text-rose-600">
                      Original Transaction Processed on: {new Date(receipt.issuedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Billed To & Transaction Details 2-Column Grid */}
                <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recipient Box */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs">
                    <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      <span>Billed To / Customer Details</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{receipt.customerName || 'Walk-in Customer'}</p>
                      {receipt.customerPhone && <p className="text-slate-600">Phone: {receipt.customerPhone}</p>}
                      {receipt.customerEmail && <p className="text-slate-600">Email: {receipt.customerEmail}</p>}
                      {receipt.customerTaxId && <p className="text-slate-600">Tax ID / PIN: {receipt.customerTaxId}</p>}
                      
                      {/* Context specific fields */}
                      {receipt.studentAdmissionNo && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                          <span>Student Admission No:</span>
                          <span className="font-mono">{receipt.studentAdmissionNo}</span>
                        </div>
                      )}
                      {receipt.patientId && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                          <span>Patient ID:</span>
                          <span className="font-mono">{receipt.patientId}</span>
                        </div>
                      )}
                      {receipt.candidateNumber && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                          <span>Candidate Index No:</span>
                          <span className="font-mono">{receipt.candidateNumber}</span>
                        </div>
                      )}
                      {receipt.roomOrTableNumber && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                          <span>Location / Table:</span>
                          <span>{receipt.roomOrTableNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment & Audit Info Box */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs">
                    <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Settlement &amp; Audit Reference</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Channel:</span>
                        <span className="font-bold text-slate-900">{receipt.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      {receipt.paymentReference && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">TXN / Reference Code:</span>
                          <span className="font-mono font-bold text-emerald-700">{receipt.paymentReference}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Authorized Cashier:</span>
                        <span className="font-medium text-slate-900">{receipt.cashierName || 'Bursar / Officer'}</span>
                      </div>
                      {receipt.branchName && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Department / Branch:</span>
                          <span className="text-slate-800">{receipt.branchName}</span>
                        </div>
                      )}
                      {receipt.verificationCode && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cryptographic Auth:</span>
                          <span className="font-mono text-slate-700 font-semibold">{receipt.verificationCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items & Services Breakdown Table */}
                <div className="my-6 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="p-3 text-center w-12">#</th>
                        <th className="p-3">Item / Service Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price ({sym})</th>
                        <th className="p-3 text-right">Tax Rate</th>
                        <th className="p-3 text-right">Amount ({sym})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {receipt.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            {item.notes && <p className="text-[11px] italic text-slate-500">{item.notes}</p>}
                            {item.code && <p className="text-[10px] font-mono text-slate-400">SKU/Code: {item.code}</p>}
                          </td>
                          <td className="p-3 text-center font-medium text-slate-700">{item.quantity}</td>
                          <td className="p-3 text-right font-mono text-slate-700">
                            {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right text-slate-500 font-mono">
                            {item.taxRate ? `${item.taxRate}%` : '16%'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & Total Callout */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 my-6">
                  {/* Left Side: Terms & Bank Remittance Information */}
                  <div className="w-full sm:w-1/2 space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                      <p className="font-bold text-slate-800 mb-1">Official Remittance &amp; Bank Details</p>
                      <p className="text-slate-600 text-[11px]">
                        Payment verified and cleared into institutional master account.
                      </p>
                      <div className="mt-2 space-y-0.5 text-[11px] text-slate-700">
                        <p><span className="font-semibold">M-Pesa Paybill:</span> 247247 / Official Till</p>
                        <p><span className="font-semibold">Bank:</span> Standard Chartered / Equity Bank</p>
                        <p><span className="font-semibold">Account:</span> Institutional Revenue Account</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 italic">
                      {receipt.customFooter || 'Official document generated electronically. Valid without physical signature if authenticated.'}
                    </p>
                  </div>

                  {/* Right Side: Totals Card */}
                  <div className="w-full sm:w-1/2 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>Subtotal Before Discounts:</span>
                      <span className="font-mono">{sym} {receipt.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {receipt.discountAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-medium">
                        <span>Discounts &amp; Waivers Applied:</span>
                        <span className="font-mono">-{sym} {receipt.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>Net Taxable Amount:</span>
                      <span className="font-mono">{sym} {(receipt.subtotal - receipt.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {receipt.taxAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span>VAT ({receipt.taxRatePercentage || 16}%):</span>
                        <span className="font-mono">{sym} {receipt.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center rounded-lg bg-slate-900 p-3 text-white">
                      <span className="font-extrabold text-sm uppercase tracking-wide">Total Amount Paid:</span>
                      <span className="font-mono font-black text-lg text-emerald-400">
                        {sym} {receipt.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {receipt.balanceRemaining !== undefined && receipt.balanceRemaining > 0 && (
                      <div className="flex justify-between py-1.5 px-3 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                        <span>Remaining Balance Due:</span>
                        <span className="font-mono">{sym} {receipt.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stamp & Authorized Signatory Block */}
                <div className="pt-6 mt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  {/* Digital Auth Seal */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase">Certified Authentic</p>
                      <p className="text-[10px] font-mono text-slate-500">{receipt.verificationCode}</p>
                    </div>
                  </div>

                  {/* QR Code Verification */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="rounded border border-slate-200 bg-white p-1 shadow-2xs">
                      <QrCode className="h-12 w-12 text-slate-900" />
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      <p className="font-semibold text-slate-700">Instant Verification</p>
                      <p>Scan code with mobile camera to confirm tax validity</p>
                    </div>
                  </div>

                  {/* Authorized Signatory Line */}
                  <div className="text-right">
                    <div className="inline-block w-44 border-b border-slate-400 pb-1 text-center">
                      <span className="font-serif italic text-xs text-slate-600">
                        {receipt.cashierName || 'Authorized Signatory'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                      Accounts &amp; Finance Department
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions & Hardware Commands */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleKickDrawer}
              title="Trigger physical cash drawer pulse (pin 2/5 command)"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>Kick Drawer</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              <span>PDF / Print Dialog</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReprint}
              disabled={isReprinting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isReprinting ? 'animate-spin' : ''}`} />
              <span>Issue Official Reprint</span>
            </button>

            <button
              onClick={handleDirectPrint}
              disabled={isPrinting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              <Printer className={`h-4 w-4 ${isPrinting ? 'animate-pulse' : ''}`} />
              <span>
                {isPrinting
                  ? 'Dispatching...'
                  : paperWidth === 'A4'
                  ? 'Print A4 Document'
                  : `Print ${paperWidth} Receipt`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
