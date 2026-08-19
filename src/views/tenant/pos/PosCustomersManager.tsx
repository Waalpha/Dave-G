import React, { useState } from 'react';
import { 
  Users, Plus, Search, DollarSign, CreditCard, 
  ArrowDownRight, CheckCircle2, History, X, RefreshCw, Phone, Mail
} from 'lucide-react';
import { PosCustomer, CustomerCreditTransaction, PosTenantConfig } from '../../../types';

interface PosCustomersManagerProps {
  customers: PosCustomer[];
  config: PosTenantConfig | null;
  currencySymbol: string;
  onAddCustomer: (data: any) => Promise<void>;
  onUpdateCustomer: (id: string, data: any) => Promise<void>;
  onRecordPayment: (customerId: string, data: any) => Promise<void>;
  onRefresh: () => void;
}

export const PosCustomersManager: React.FC<PosCustomersManagerProps> = ({
  customers,
  config,
  currencySymbol,
  onAddCustomer,
  onUpdateCustomer,
  onRecordPayment,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);

  // Statement modal
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerCreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Customer Form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 20000,
    currentBalance: 0,
    allowCredit: true
  });

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'BANK_TRANSFER'>('MPESA');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 20000,
      currentBalance: 0,
      allowCredit: true
    });
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCustomer(customerForm);
    setShowCustomerModal(false);
  };

  const handleOpenPayment = (cust: PosCustomer) => {
    setSelectedCustomer(cust);
    setPaymentAmount(Math.max(0, cust.currentBalance));
    setPaymentMethod('MPESA');
    setPaymentRef(`RCPT-${Date.now().toString(36).toUpperCase()}`);
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    await onRecordPayment(selectedCustomer.id, {
      amount: Number(paymentAmount),
      paymentMethod,
      reference: paymentRef,
      notes: paymentNotes
    });
    setShowPaymentModal(false);
    setSelectedCustomer(null);
  };

  const handleViewStatement = async (cust: PosCustomer) => {
    setSelectedCustomer(cust);
    setShowStatementModal(true);
    setLoadingTransactions(true);
    try {
      const res = await fetch(`/api/app/pos/customers/${cust.id}/transactions`);
      if (res.ok) {
        const d = await res.json();
        setCustomerTransactions(d.transactions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Customer Directory & Credit Accounts (Pay Later)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Maintain customer loyalty profiles, credit limits, outstanding balances, and credit debt repayments.
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
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">Current Credit Balance (Debt)</th>
                <th className="py-3 px-4 text-right">Lifetime Spent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No customers registered yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add Customer" above or create one directly during checkout.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasDebt = c.currentBalance > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {c.name}
                        {c.address && <div className="text-xs font-normal text-slate-500">{c.address}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-600">
                        {currencySymbol} {Number(c.creditLimit || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-bold ${hasDebt ? 'text-rose-600' : 'text-slate-800'}`}>
                          {currencySymbol} {Number(c.currentBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {currencySymbol} {Number(c.totalPurchases || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewStatement(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <History className="w-3 h-3" />
                            <span>Statement</span>
                          </button>
                          {hasDebt && (
                            <button
                              onClick={() => handleOpenPayment(c)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                            >
                              Receive Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register Customer</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. John Kamau"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="e.g. 0712 345 678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credit Limit ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customerForm.creditLimit}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customerForm.currentBalance}
                    onChange={(e) => setCustomerForm({ ...customerForm, currentBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE CREDIT PAYMENT MODAL */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Receive Credit Payment: {selectedCustomer.name}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg text-xs flex justify-between">
              <span className="text-rose-800 font-medium">Outstanding Balance:</span>
              <span className="font-bold text-rose-900">
                {currencySymbol} {Number(selectedCustomer.currentBalance).toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Receipt / Transaction Ref
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Record Payment & Clear Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATEMENT OF ACCOUNT MODAL */}
      {showStatementModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Statement: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">Phone: {selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setShowStatementModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-500">Total Invoiced / Bought:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {currencySymbol} {Number(selectedCustomer.totalPurchases || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Current Outstanding Balance:</span>
                <div className="font-bold text-rose-600 text-sm">
                  {currencySymbol} {Number(selectedCustomer.currentBalance || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Debit (+)</th>
                    <th className="py-2.5 px-3 text-right">Credit / Paid (-)</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        {loadingTransactions ? 'Loading statement...' : 'No transaction records found.'}
                      </td>
                    </tr>
                  ) : (
                    customerTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {tx.type}
                          {tx.reference && <span className="font-normal text-slate-400 ml-1">({tx.reference})</span>}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900">
                          {tx.type === 'SALE_ON_CREDIT' ? `${currencySymbol} ${tx.amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-emerald-600">
                          {tx.type === 'PAYMENT' ? `${currencySymbol} ${tx.amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {currencySymbol} {tx.balanceAfter.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
