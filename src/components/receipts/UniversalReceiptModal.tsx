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
  DollarSign
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

  const handleDirectPrint = async () => {
    setIsPrinting(true);
    setPrintStatus(null);
    try {
      const result = await printService.printReceipt(receipt, {
        isReprint: false
      });
      if (result.success) {
        setPrintStatus({ type: 'success', message: result.message });
      } else if (result.queued) {
        setPrintStatus({ type: 'warning', message: result.message });
      } else {
        setPrintStatus({ type: 'error', message: result.error || 'Failed to print receipt' });
      }
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
        const printRes = await printService.printReceipt(data.receipt, { isReprint: true });
        if (printRes.success) {
          setPrintStatus({ type: 'success', message: `Reprint copy #${data.receipt.reprintCount} sent to printer!` });
        } else {
          setPrintStatus({ type: 'warning', message: printRes.message });
        }
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
        setPrintStatus({ type: 'warning', message: 'Cash drawer trigger sent (check hardware port)' });
      }
    } catch {
      setPrintStatus({ type: 'error', message: 'Failed to trigger drawer' });
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Universal Receipt & Print Center</h2>
              <p className="text-xs text-slate-400">Receipt No: <span className="font-mono font-medium text-emerald-400">{receipt.receiptNumber}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  paperWidth === '58mm' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  paperWidth === '80mm' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                80mm
              </button>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {printStatus && (
          <div
            className={`flex items-center gap-2 border-b px-6 py-2.5 text-xs font-medium ${
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

        {/* Scrollable Receipt Slip Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-950/80 p-6">
          <div
            className={`mx-auto rounded bg-white p-6 font-mono text-slate-900 shadow-md ${
              paperWidth === '58mm' ? 'max-w-[320px] text-[11px]' : 'max-w-[420px] text-xs'
            }`}
          >
            {/* Business Branding */}
            <div className="text-center">
              {receipt.logoUrl && (
                <img
                  src={receipt.logoUrl}
                  alt={receipt.businessName}
                  className="mx-auto mb-2 max-h-12 object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <h1 className="text-sm font-bold uppercase tracking-tight text-slate-950">
                {receipt.businessName}
              </h1>
              {receipt.tradingName && receipt.tradingName !== receipt.businessName && (
                <p className="text-[11px] text-slate-700">{receipt.tradingName}</p>
              )}
              {receipt.address && <p className="text-[10px] text-slate-600">{receipt.address}</p>}
              {(receipt.phone || receipt.email) && (
                <p className="text-[10px] text-slate-600">
                  {[receipt.phone ? `Tel: ${receipt.phone}` : '', receipt.email].filter(Boolean).join(' | ')}
                </p>
              )}
              {receipt.taxRegistrationNumber && (
                <p className="font-semibold text-slate-800">PIN/VAT: {receipt.taxRegistrationNumber}</p>
              )}
              {receipt.customHeader && (
                <p className="mt-1 italic text-slate-700">{receipt.customHeader}</p>
              )}
            </div>

            {/* Reprint Banner */}
            {receipt.isReprint && (
              <div className="my-2 border-y-2 border-dashed border-rose-600 py-1 text-center font-bold text-rose-700">
                *** OFFICIAL REPRINT (COPY #{receipt.reprintCount}) ***
                {receipt.issuedAt && (
                  <p className="text-[10px] font-normal text-slate-600">
                    Orig: {new Date(receipt.issuedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="my-2 border-t border-slate-300" />

            {/* Receipt Meta */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">RECEIPT NO:</span>
                <span className="font-bold text-slate-900">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">DATE:</span>
                <span>{new Date(receipt.issuedAt || receipt.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CASHIER:</span>
                <span>{receipt.cashierName || 'Authorized Staff'}</span>
              </div>
              {receipt.branchName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">BRANCH:</span>
                  <span>{receipt.branchName}</span>
                </div>
              )}
              {receipt.customerName && receipt.customerName !== 'Walk-in Customer' && (
                <div className="flex justify-between">
                  <span className="text-slate-600">CUSTOMER:</span>
                  <span className="font-medium text-slate-900">{receipt.customerName}</span>
                </div>
              )}
              {receipt.studentAdmissionNo && (
                <div className="flex justify-between">
                  <span className="text-slate-600">ADM NO:</span>
                  <span className="font-semibold text-slate-900">{receipt.studentAdmissionNo}</span>
                </div>
              )}
              {receipt.patientId && (
                <div className="flex justify-between">
                  <span className="text-slate-600">PATIENT ID:</span>
                  <span className="font-semibold text-slate-900">{receipt.patientId}</span>
                </div>
              )}
              {receipt.candidateNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-600">CANDIDATE NO:</span>
                  <span className="font-semibold text-slate-900">{receipt.candidateNumber}</span>
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

            {/* Line Items Table */}
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 font-bold text-slate-800">
                  <th className="pb-1">QTY</th>
                  <th className="pb-1">DESCRIPTION</th>
                  <th className="pb-1 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1 font-medium">{item.quantity}x</td>
                    <td className="py-1 pr-1">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-slate-500">
                          @{sym} {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      {item.notes && <div className="text-[10px] italic text-slate-500">*{item.notes}</div>}
                    </td>
                    <td className="py-1 text-right font-medium text-slate-900">
                      {sym} {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="my-2 border-t border-slate-300" />

            {/* Totals Section */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">SUBTOTAL:</span>
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
              <div className="flex justify-between border-t border-slate-400 pt-1 text-sm font-bold text-slate-950">
                <span>GRAND TOTAL:</span>
                <span>{sym} {receipt.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="my-2 border-t border-slate-300" />

            {/* Payment Details */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">PAYMENT METHOD:</span>
                <span className="font-semibold text-slate-900">{receipt.paymentMethod.replace('_', ' ')}</span>
              </div>
              {receipt.paymentReference && (
                <div className="flex justify-between">
                  <span className="text-slate-600">REF / TXN ID:</span>
                  <span className="font-mono text-slate-800">{receipt.paymentReference}</span>
                </div>
              )}
              {receipt.amountTendered !== undefined && receipt.amountTendered > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">TENDERED:</span>
                  <span>{sym} {receipt.amountTendered.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {receipt.changeGiven !== undefined && receipt.changeGiven >= 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">CHANGE:</span>
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

            <div className="my-3 border-t-2 border-slate-300" />

            {/* Footer & QR Verification */}
            <div className="text-center text-[10px] text-slate-600">
              <p className="font-medium text-slate-800">
                {receipt.customFooter || 'Thank you for your business!'}
              </p>
              {receipt.verificationCode && (
                <div className="mt-2 space-y-1">
                  <p className="font-mono text-[9px] text-slate-500">AUTH CODE: {receipt.verificationCode}</p>
                  <div className="inline-block rounded border border-slate-200 bg-slate-50 p-1.5">
                    <QrCode className="mx-auto h-12 w-12 text-slate-800" />
                  </div>
                  <p className="text-[9px] text-slate-400">Scan to verify cryptographic authenticity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleKickDrawer}
              title="Send pulse command to open physical cash drawer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>Kick Drawer</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              <span>PDF / Browser Slip</span>
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
              <span>{isPrinting ? 'Dispatching to Hardware...' : 'Print to Thermal Printer'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
