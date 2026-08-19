import React, { useState } from 'react';
import { 
  BarChart3, DollarSign, TrendingUp, TrendingDown, 
  Plus, Download, Filter, Calendar, Layers, 
  ArrowUpRight, ArrowDownRight, Package, UserCheck, X, RefreshCw
} from 'lucide-react';
import { 
  PosExpense, PosSaleOrder, PosProduct, 
  CashierShift, PosTenantConfig 
} from '../../../types';

interface PosExpensesAndReportsProps {
  expenses: PosExpense[];
  sales: PosSaleOrder[];
  products: PosProduct[];
  shifts: CashierShift[];
  config: PosTenantConfig | null;
  currencySymbol: string;
  onAddExpense: (data: any) => Promise<void>;
  onRefresh: () => void;
}

export const PosExpensesAndReports: React.FC<PosExpensesAndReportsProps> = ({
  expenses,
  sales,
  products,
  shifts,
  config,
  currencySymbol,
  onAddExpense,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'expenses' | 'top_products'>('analytics');
  const [dateRange, setDateRange] = useState<'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL'>('THIS_MONTH');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: 'UTILITIES' as 'RENT' | 'UTILITIES' | 'WAGES' | 'SUPPLIES' | 'TRANSPORT' | 'MAINTENANCE' | 'OTHER',
    description: '',
    amount: 1000,
    paymentMethod: 'MPESA' as const,
    reference: '',
    notes: ''
  });

  // Calculate Metrics
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  // Cost of Goods Sold (COGS) Estimation
  const totalCogs = sales.reduce((sum, s) => {
    const saleCogs = s.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const cost = prod?.costPrice || (item.unitPrice * 0.7);
      return iSum + (cost * item.quantity);
    }, 0);
    return sum + saleCogs;
  }, 0);

  const grossProfit = totalSalesRevenue - totalCogs;
  const netProfit = grossProfit - totalExpensesAmount;
  const profitMargin = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : '0.0';

  // Payment Breakdown
  const paymentBreakdown = {
    CASH: sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.totalAmount, 0),
    MPESA: sales.filter(s => s.paymentMethod === 'MPESA').reduce((sum, s) => sum + s.totalAmount, 0),
    CARD: sales.filter(s => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.totalAmount, 0),
    CREDIT: sales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + s.totalAmount, 0),
    SPLIT: sales.filter(s => s.paymentMethod === 'SPLIT').reduce((sum, s) => sum + s.totalAmount, 0),
  };

  // Top Selling Products
  const productSalesMap: { [productId: string]: { name: string; qty: number; revenue: number } } = {};
  sales.forEach(s => {
    s.items.forEach(i => {
      if (!productSalesMap[i.productId]) {
        productSalesMap[i.productId] = { name: i.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[i.productId].qty += i.quantity;
      productSalesMap[i.productId].revenue += i.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddExpense(expenseForm);
    setShowExpenseModal(false);
    setExpenseForm({
      category: 'UTILITIES',
      description: '',
      amount: 1000,
      paymentMethod: 'MPESA',
      reference: '',
      notes: ''
    });
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Receipt Number', 'Date', 'Customer', 'Payment Method', 'Total Amount', 'Status'],
      ...sales.map(s => [
        s.receiptNumber,
        new Date(s.createdAt).toISOString(),
        s.customerName,
        s.paymentMethod,
        s.totalAmount,
        s.status
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pos_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Financial Reports, Gross Profit & Operating Expenses
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time Profit & Loss (P&L), Cost of Goods Sold (COGS), Cash vs M-Pesa channels, and expense tracking.
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
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-2 text-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {currencySymbol} {Number(totalSalesRevenue).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">{sales.length} completed transactions</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Est. Gross Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {currencySymbol} {Number(grossProfit).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            {profitMargin}% Gross Margin
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {currencySymbol} {Number(totalExpensesAmount).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">{expenses.length} expense vouchers</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Net Business Profit</span>
            <BarChart3 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {currencySymbol} {Number(netProfit).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Revenue − COGS − Expenses</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Channels & Profit Breakdown
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Expenses Ledger ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('top_products')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'top_products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Top Selling Products
        </button>
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Payment Method Inflow</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>M-Pesa Mobile Money</span>
                  <span className="font-bold text-emerald-700">
                    {currencySymbol} {paymentBreakdown.MPESA.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${totalSalesRevenue > 0 ? (paymentBreakdown.MPESA / totalSalesRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cash Drawer</span>
                  <span className="font-bold text-indigo-700">
                    {currencySymbol} {paymentBreakdown.CASH.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${totalSalesRevenue > 0 ? (paymentBreakdown.CASH / totalSalesRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Credit (Customer Ledger / Pay Later)</span>
                  <span className="font-bold text-amber-700">
                    {currencySymbol} {paymentBreakdown.CREDIT.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${totalSalesRevenue > 0 ? (paymentBreakdown.CREDIT / totalSalesRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Debit / Credit Cards & Split</span>
                  <span className="font-bold text-cyan-700">
                    {currencySymbol} {(paymentBreakdown.CARD + paymentBreakdown.SPLIT).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 rounded-full"
                    style={{ width: `${totalSalesRevenue > 0 ? ((paymentBreakdown.CARD + paymentBreakdown.SPLIT) / totalSalesRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick P&L Summary */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Profit & Loss (P&L) Statement</h3>

            <div className="space-y-2 text-sm divide-y divide-slate-100">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Total Sales Revenue (+)</span>
                <span className="font-bold text-slate-900">{currencySymbol} {totalSalesRevenue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-600">Estimated Cost of Goods Sold (COGS) (-)</span>
                <span className="font-medium text-rose-600">({currencySymbol} {totalCogs.toLocaleString()})</span>
              </div>

              <div className="flex justify-between py-2 font-bold bg-slate-50 px-2 rounded-lg">
                <span className="text-slate-800">Gross Margin Profit</span>
                <span className="text-emerald-600">{currencySymbol} {grossProfit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-600">Total Operating Expenses (-)</span>
                <span className="font-medium text-rose-600">({currencySymbol} {totalExpensesAmount.toLocaleString()})</span>
              </div>

              <div className="flex justify-between py-2 font-black text-base pt-3 border-t-2 border-slate-300">
                <span className="text-slate-900">NET RETAINED PROFIT</span>
                <span className={netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {currencySymbol} {netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Operating Expenses & Vouchers</h3>
            <span className="text-xs text-slate-500">Track day-to-day out-of-pocket costs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No expenses recorded yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "Record Expense" above to add operational costs.
                      </p>
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {e.description}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span>{e.paymentMethod}</span>
                        {e.reference && <span className="text-slate-400 ml-1">({e.reference})</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        {currencySymbol} {Number(e.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {e.recordedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOP PRODUCTS TAB */}
      {activeTab === 'top_products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Fast Moving / Best Selling Products</h3>
            <span className="text-xs text-slate-500">Ranked by gross sales volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No sales recorded to compute product rankings.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">{p.qty} units</td>
                      <td className="py-3 px-4 text-right font-black text-indigo-700">
                        {currencySymbol} {Number(p.revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Operating Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="UTILITIES">Electricity / Water / Internet</option>
                  <option value="RENT">Rent / Lease</option>
                  <option value="WAGES">Casual Wages / Staff Allowances</option>
                  <option value="SUPPLIES">Packaging, Bags & Stationery</option>
                  <option value="TRANSPORT">Transport & Fuel</option>
                  <option value="MAINTENANCE">Repairs & Maintenance</option>
                  <option value="OTHER">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KPLC Token recharge / Daily garbage fee"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="CASH">Cash Drawer</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Receipt Number</label>
                <input
                  type="text"
                  placeholder="e.g. MPESA TX ID: QKJ88123"
                  value={expenseForm.reference}
                  onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
