import React, { useState } from 'react';
import { 
  Clock, DollarSign, RotateCcw, ShieldCheck, 
  CheckCircle2, AlertTriangle, FileText, Printer, 
  Plus, X, RefreshCw, Layers
} from 'lucide-react';
import { 
  CashierShift, PosSaleReturn, PosSaleOrder, 
  PosTenantConfig, PosProduct 
} from '../../../types';

interface PosShiftsAndReturnsProps {
  shifts: CashierShift[];
  activeShift: CashierShift | null;
  returns: PosSaleReturn[];
  sales: PosSaleOrder[];
  products: PosProduct[];
  config: PosTenantConfig | null;
  currencySymbol: string;
  onOpenShift: (openingCashFloat: number) => Promise<void>;
  onCloseShift: (shiftId: string, actualCashCounted: number, notes?: string) => Promise<void>;
  onRecordReturn: (returnData: any) => Promise<void>;
  onRefresh: () => void;
}

export const PosShiftsAndReturns: React.FC<PosShiftsAndReturnsProps> = ({
  shifts,
  activeShift,
  returns,
  sales,
  products,
  config,
  currencySymbol,
  onOpenShift,
  onCloseShift,
  onRecordReturn,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'returns' | 'reports'>('shifts');

  // Modals
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [selectedShiftForReport, setSelectedShiftForReport] = useState<CashierShift | null>(null);

  // Forms
  const [openingFloat, setOpeningFloat] = useState(2000);
  const [actualCashCounted, setActualCashCounted] = useState(0);
  const [closeNotes, setCloseNotes] = useState('');

  // Return Form
  const [returnReceiptSearch, setReturnReceiptSearch] = useState('');
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<PosSaleOrder | null>(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  } | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState<'DAMAGED' | 'DEFECTIVE' | 'WRONG_ITEM' | 'CUSTOMER_CHANGE_MIND'>('CUSTOMER_CHANGE_MIND');
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'MPESA' | 'STORE_CREDIT'>('CASH');
  const [restockItem, setRestockItem] = useState(true);

  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onOpenShift(Number(openingFloat));
    setShowOpenShiftModal(false);
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    await onCloseShift(activeShift.id, Number(actualCashCounted), closeNotes);
    setShowCloseShiftModal(false);
  };

  const handleSearchSale = () => {
    const s = sales.find(order => 
      order.receiptNumber.toLowerCase() === returnReceiptSearch.trim().toLowerCase() ||
      order.id === returnReceiptSearch.trim()
    );
    if (s) {
      setSelectedSaleForReturn(s);
      if (s.items && s.items.length > 0) {
        setSelectedReturnItem(s.items[0]);
      }
    } else {
      alert('Sale receipt not found. Please verify the receipt number.');
    }
  };

  const handleRecordReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForReturn || !selectedReturnItem) return;

    const refundAmount = returnQuantity * selectedReturnItem.unitPrice;

    await onRecordReturn({
      originalSaleId: selectedSaleForReturn.id,
      receiptNumber: selectedSaleForReturn.receiptNumber,
      customerName: selectedSaleForReturn.customerName,
      items: [
        {
          productId: selectedReturnItem.productId,
          productName: selectedReturnItem.productName,
          quantity: returnQuantity,
          unitPrice: selectedReturnItem.unitPrice,
          total: refundAmount,
          reason: returnReason,
          restock: restockItem
        }
      ],
      totalRefund: refundAmount,
      refundMethod,
      restocked: restockItem,
      notes: `Return for receipt ${selectedSaleForReturn.receiptNumber}`
    });

    setShowReturnModal(false);
    setSelectedSaleForReturn(null);
    setSelectedReturnItem(null);
    setReturnReceiptSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Cashier Shifts, Cash Float Reconciliation & Sale Returns
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Maintain strict cashier drawer accountability with opening floats, closing cash declarations, discrepancy tracking and customer returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowReturnModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Process Return & Refund</span>
          </button>

          {activeShift ? (
            <button
              onClick={() => {
                const expected = (activeShift.openingCashFloat || 0) + (activeShift.totalCashSales || 0);
                setActualCashCounted(expected);
                setShowCloseShiftModal(true);
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Close Active Shift</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOpenShiftModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Open Cashier Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Summary Banner */}
      {activeShift && (
        <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-bold text-base">
                  Active Shift #{activeShift.shiftNumber} — Cashier: {activeShift.cashierName}
                </h3>
                <p className="text-xs text-indigo-200">
                  Started at {new Date(activeShift.openedAt).toLocaleTimeString()} ({new Date(activeShift.openedAt).toLocaleDateString()})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedShiftForReport(activeShift);
                  setShowZReportModal(true);
                }}
                className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Shift X-Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800">
              <span className="text-indigo-300">Opening Cash Float</span>
              <div className="font-bold text-base mt-1">
                {currencySymbol} {Number(activeShift.openingCashFloat || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800">
              <span className="text-indigo-300">Cash Sales</span>
              <div className="font-bold text-base text-emerald-400 mt-1">
                {currencySymbol} {Number(activeShift.totalCashSales || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800">
              <span className="text-indigo-300">M-Pesa Sales</span>
              <div className="font-bold text-base text-emerald-300 mt-1">
                {currencySymbol} {Number(activeShift.totalMpesaSales || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800">
              <span className="text-indigo-300">Card / Credit</span>
              <div className="font-bold text-base text-cyan-300 mt-1">
                {currencySymbol} {Number((activeShift.totalCardSales || 0) + (activeShift.totalCreditSales || 0)).toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800">
              <span className="text-indigo-300">Total Transactions</span>
              <div className="font-bold text-base mt-1">{activeShift.salesCount || 0} orders</div>
            </div>
            <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800">
              <span className="text-indigo-300">Expected Cash in Drawer</span>
              <div className="font-bold text-base text-amber-300 mt-1">
                {currencySymbol} {Number((activeShift.openingCashFloat || 0) + (activeShift.totalCashSales || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'shifts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Cashier Shifts History ({shifts.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'returns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Customer Returns & Refunds ({returns.length})
        </button>
      </div>

      {/* SHIFTS TAB */}
      {activeTab === 'shifts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Historical Shift Audit & Drawer Counts</h3>
            <span className="text-xs text-slate-500">Z-Report Shift Archives</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Shift #</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4">Opened / Closed</th>
                  <th className="py-3 px-4 text-right">Float</th>
                  <th className="py-3 px-4 text-right">Total Shift Sales</th>
                  <th className="py-3 px-4 text-right">Counted Cash</th>
                  <th className="py-3 px-4 text-right">Discrepancy (Variance)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No shifts recorded yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "Open Cashier Shift" to start shift float management.
                      </p>
                    </td>
                  </tr>
                ) : (
                  shifts.map((s) => {
                    const hasVariance = s.discrepancy && Math.abs(s.discrepancy) > 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          {s.shiftNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {s.cashierName}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div>In: {new Date(s.openedAt).toLocaleTimeString()}</div>
                          {s.closedAt && <div>Out: {new Date(s.closedAt).toLocaleTimeString()}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          {currencySymbol} {Number(s.openingCashFloat || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {currencySymbol} {Number(s.totalSales || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                          {s.status === 'CLOSED'
                            ? `${currencySymbol} ${Number(s.actualCashCounted || 0).toLocaleString()}`
                            : 'In Progress'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {s.status === 'CLOSED' ? (
                            <span
                              className={`font-bold ${
                                !hasVariance
                                  ? 'text-emerald-600'
                                  : (s.discrepancy || 0) > 0
                                  ? 'text-blue-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {!hasVariance
                                ? 'Exact (KES 0)'
                                : (s.discrepancy || 0) > 0
                                ? `+KES ${s.discrepancy} (Surplus)`
                                : `-KES ${Math.abs(s.discrepancy || 0)} (Shortage)`}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              s.status === 'OPEN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedShiftForReport(s);
                              setShowZReportModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Print Z-Report"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RETURNS TAB */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Sale Returns & Refunds Ledger</h3>
            <span className="text-xs text-slate-500">Restocked inventory and refund vouchers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Return #</th>
                  <th className="py-3 px-4">Orig. Receipt</th>
                  <th className="py-3 px-4">Returned Item(s)</th>
                  <th className="py-3 px-4 text-right">Refund Amount</th>
                  <th className="py-3 px-4">Refund Method</th>
                  <th className="py-3 px-4 text-center">Restocked</th>
                  <th className="py-3 px-4">Processed By</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No returns recorded</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Use "Process Return & Refund" above if a customer returns an item.
                      </p>
                    </td>
                  </tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {r.returnNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {r.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-800">
                        {r.items.map((i, idx) => (
                          <div key={idx}>
                            {i.quantity}x {i.productName} ({i.reason})
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        {currencySymbol} {Number(r.totalRefund || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {r.refundMethod}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          r.restocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {r.restocked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {r.processedBy}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPEN SHIFT MODAL */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Open Cashier Shift</h3>
              <button onClick={() => setShowOpenShiftModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenShiftSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Cash Float in Drawer ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value))}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the starting cash amount given to the cashier for change.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Start Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE SHIFT MODAL */}
      {showCloseShiftModal && activeShift && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Close Cashier Shift #{activeShift.shiftNumber}</h3>
              <button onClick={() => setShowCloseShiftModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Opening Cash Float:</span>
                <span className="font-semibold">{currencySymbol} {activeShift.openingCashFloat}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales Recorded:</span>
                <span className="font-semibold text-emerald-600">{currencySymbol} {activeShift.totalCashSales || 0}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                <span>Expected Drawer Cash:</span>
                <span>{currencySymbol} {(activeShift.openingCashFloat || 0) + (activeShift.totalCashSales || 0)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Physical Cash Counted in Drawer ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shift Notes / Discrepancy Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exact count / KES 50 short change"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Reconcile & Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCESS RETURN MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Process Sale Return & Refund</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Search Receipt */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Find Original Sale Receipt</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Receipt Number (e.g. RCP-0001)"
                  value={returnReceiptSearch}
                  onChange={(e) => setReturnReceiptSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleSearchSale}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer"
                >
                  Find
                </button>
              </div>
            </div>

            {selectedSaleForReturn && (
              <form onSubmit={handleRecordReturnSubmit} className="space-y-3 pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-900">
                    Receipt: {selectedSaleForReturn.receiptNumber} — {selectedSaleForReturn.customerName}
                  </div>
                  <div className="text-slate-500">
                    Date: {new Date(selectedSaleForReturn.createdAt).toLocaleString()} | Original Total: {currencySymbol} {selectedSaleForReturn.totalAmount}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Item to Return</label>
                  <select
                    value={selectedReturnItem?.productId}
                    onChange={(e) => {
                      const itm = selectedSaleForReturn.items.find(i => i.productId === e.target.value);
                      if (itm) setSelectedReturnItem(itm);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {selectedSaleForReturn.items.map((i) => (
                      <option key={i.productId} value={i.productId}>
                        {i.quantity}x {i.productName} (@ {currencySymbol} {i.unitPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Return Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedReturnItem?.quantity || 1}
                      value={returnQuantity}
                      onChange={(e) => setReturnQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Method</label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="CASH">Cash Refund</option>
                      <option value="MPESA">M-Pesa Refund</option>
                      <option value="STORE_CREDIT">Store Credit / Note</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="CUSTOMER_CHANGE_MIND">Customer Change of Mind</option>
                    <option value="DEFECTIVE">Defective / Malfunctioning</option>
                    <option value="DAMAGED">Damaged Goods</option>
                    <option value="WRONG_ITEM">Wrong Size / Item</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={restockItem}
                    onChange={(e) => setRestockItem(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span>Restock item back into store inventory quantity</span>
                </label>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Issue Refund ({currencySymbol} {(returnQuantity * (selectedReturnItem?.unitPrice || 0)).toLocaleString()})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Z-REPORT / X-REPORT MODAL */}
      {showZReportModal && selectedShiftForReport && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedShiftForReport.status === 'CLOSED' ? 'Shift Z-Report' : 'Live Shift X-Report'}
              </h3>
              <button onClick={() => setShowZReportModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-300 p-4 rounded-xl font-mono text-xs space-y-2 bg-white">
              <div className="text-center font-bold text-sm uppercase">
                {config?.businessName || 'DAVETECH ERP'}
              </div>
              <div className="text-center text-[10px] text-slate-500">
                {selectedShiftForReport.status === 'CLOSED' ? 'FINAL END-OF-SHIFT Z-REPORT' : 'MID-SHIFT X-REPORT'}
              </div>
              <div className="border-t border-b border-dashed border-slate-300 py-1.5 my-2 space-y-0.5">
                <div>Shift #: {selectedShiftForReport.shiftNumber}</div>
                <div>Cashier: {selectedShiftForReport.cashierName}</div>
                <div>Opened: {new Date(selectedShiftForReport.openedAt).toLocaleString()}</div>
                {selectedShiftForReport.closedAt && (
                  <div>Closed: {new Date(selectedShiftForReport.closedAt).toLocaleString()}</div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Opening Float:</span>
                  <span>KES {selectedShiftForReport.openingCashFloat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span>KES {selectedShiftForReport.totalCashSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>M-Pesa Sales:</span>
                  <span>KES {selectedShiftForReport.totalMpesaSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Card/Credit Sales:</span>
                  <span>KES {(selectedShiftForReport.totalCardSales || 0) + (selectedShiftForReport.totalCreditSales || 0)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                  <span>TOTAL SALES:</span>
                  <span>KES {selectedShiftForReport.totalSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orders Count:</span>
                  <span>{selectedShiftForReport.salesCount || 0}</span>
                </div>
              </div>

              {selectedShiftForReport.status === 'CLOSED' && (
                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Expected Drawer:</span>
                    <span>KES {(selectedShiftForReport.openingCashFloat || 0) + (selectedShiftForReport.totalCashSales || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Counted Cash:</span>
                    <span>KES {selectedShiftForReport.actualCashCounted || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-indigo-700">
                    <span>Variance:</span>
                    <span>KES {selectedShiftForReport.discrepancy || 0}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
