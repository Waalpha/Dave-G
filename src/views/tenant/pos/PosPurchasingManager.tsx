import React, { useState } from 'react';
import { 
  Truck, Plus, Search, CheckCircle2, FileText, 
  DollarSign, Package, User, Building, ArrowDownRight,
  Clock, X, RefreshCw
} from 'lucide-react';
import { 
  PosSupplier, PurchaseOrder, GoodsReceivedNote, 
  SupplierPayment, PosProduct, PosTenantConfig 
} from '../../../types';

interface PosPurchasingManagerProps {
  suppliers: PosSupplier[];
  purchaseOrders: PurchaseOrder[];
  grns: GoodsReceivedNote[];
  supplierPayments: SupplierPayment[];
  products: PosProduct[];
  config: PosTenantConfig | null;
  currencySymbol: string;
  onAddSupplier: (data: any) => Promise<void>;
  onCreatePurchaseOrder: (data: any) => Promise<void>;
  onCreateGRN: (data: any) => Promise<void>;
  onRecordSupplierPayment: (data: any) => Promise<void>;
  onRefresh: () => void;
}

export const PosPurchasingManager: React.FC<PosPurchasingManagerProps> = ({
  suppliers,
  purchaseOrders,
  grns,
  supplierPayments,
  products,
  config,
  currencySymbol,
  onAddSupplier,
  onCreatePurchaseOrder,
  onCreateGRN,
  onRecordSupplierPayment,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'grn' | 'po' | 'suppliers' | 'payments'>('grn');

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<PosSupplier | null>(null);

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    kraPin: '',
    paymentTerms: 'NET30',
    currentBalance: 0
  });

  // PO Form
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poExpectedDate, setPoExpectedDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; productName: string; quantityOrdered: number; unitCost: number }[]>([]);

  // GRN Form
  const [grnSupplierId, setGrnSupplierId] = useState('');
  const [grnPoId, setGrnPoId] = useState('');
  const [grnInvoiceNumber, setGrnInvoiceNumber] = useState('');
  const [grnDeliveryNote, setGrnDeliveryNote] = useState('');
  const [grnNotes, setGrnNotes] = useState('');
  const [grnItems, setGrnItems] = useState<{ productId: string; productName: string; quantityReceived: number; unitCost: number }[]>([]);

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'BANK_TRANSFER' | 'CHEQUE'>('MPESA');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleOpenAddSupplier = () => {
    setSupplierForm({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      kraPin: '',
      paymentTerms: 'NET30',
      currentBalance: 0
    });
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSupplier(supplierForm);
    setShowSupplierModal(false);
  };

  const handleOpenPOModal = () => {
    setPoSupplierId(suppliers[0]?.id || '');
    setPoExpectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPoNotes('');
    setPoItems(
      products.length > 0
        ? [
            {
              productId: products[0].id,
              productName: products[0].name,
              quantityOrdered: 10,
              unitCost: products[0].costPrice || 100
            }
          ]
        : []
    );
    setShowPOModal(true);
  };

  const handleSavePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === poSupplierId);
    if (!sup) {
      alert('Please select a supplier');
      return;
    }
    const totalAmount = poItems.reduce((sum, i) => sum + i.quantityOrdered * i.unitCost, 0);
    await onCreatePurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      items: poItems.map(i => ({
        ...i,
        totalCost: i.quantityOrdered * i.unitCost,
        quantityReceived: 0
      })),
      totalAmount,
      status: 'ISSUED',
      expectedDeliveryDate: poExpectedDate,
      notes: poNotes
    });
    setShowPOModal(false);
  };

  const handleOpenGRNModal = () => {
    setGrnSupplierId(suppliers[0]?.id || '');
    setGrnPoId('');
    setGrnInvoiceNumber(`INV-${Date.now().toString(36).toUpperCase()}`);
    setGrnDeliveryNote('');
    setGrnNotes('');
    setGrnItems(
      products.length > 0
        ? [
            {
              productId: products[0].id,
              productName: products[0].name,
              quantityReceived: 10,
              unitCost: products[0].costPrice || 100
            }
          ]
        : []
    );
    setShowGRNModal(true);
  };

  const handleSaveGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === grnSupplierId);
    if (!sup) {
      alert('Please select a supplier');
      return;
    }
    const totalAmount = grnItems.reduce((sum, i) => sum + i.quantityReceived * i.unitCost, 0);
    await onCreateGRN({
      supplierId: sup.id,
      supplierName: sup.name,
      poId: grnPoId || undefined,
      supplierInvoiceNumber: grnInvoiceNumber,
      deliveryNoteNumber: grnDeliveryNote,
      items: grnItems.map(i => ({
        ...i,
        totalCost: i.quantityReceived * i.unitCost
      })),
      totalAmount,
      notes: grnNotes
    });
    setShowGRNModal(false);
  };

  const handleOpenPaymentModal = (supplier: PosSupplier) => {
    setSelectedSupplierForPayment(supplier);
    setPaymentAmount(Math.max(0, supplier.currentBalance));
    setPaymentMethod('MPESA');
    setPaymentRef(`TX-${Date.now().toString(36).toUpperCase()}`);
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const handleSaveSupplierPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment) return;
    await onRecordSupplierPayment({
      supplierId: selectedSupplierForPayment.id,
      supplierName: selectedSupplierForPayment.name,
      amount: Number(paymentAmount),
      paymentMethod,
      reference: paymentRef,
      notes: paymentNotes
    });
    setShowPaymentModal(false);
    setSelectedSupplierForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            Purchasing, Suppliers & Goods Received Notes (GRN)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create purchase orders, receive supplier stock into warehouses with automatic inventory restock, and manage supplier debts.
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
            onClick={handleOpenGRNModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Stock (GRN)</span>
          </button>

          <button
            onClick={handleOpenPOModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('grn')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'grn'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Goods Received Notes ({grns.length})
        </button>
        <button
          onClick={() => setActiveTab('po')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'po'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'suppliers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Suppliers Directory ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Supplier Payments ({supplierPayments.length})
        </button>
      </div>

      {/* GRN TAB */}
      {activeTab === 'grn' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Goods Received Notes (Stock Inflow)</h3>
            <span className="text-xs text-slate-500">Every GRN automatically increments warehouse stock</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">GRN #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Invoice / Delivery Ref</th>
                  <th className="py-3 px-4">Items Received</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4">Received By</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No Goods Received Notes yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "Receive Stock (GRN)" above to record stock from your suppliers.
                      </p>
                    </td>
                  </tr>
                ) : (
                  grns.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                        {g.grnNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {g.supplierName}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {g.supplierInvoiceNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        {g.items.map((i, idx) => (
                          <div key={idx}>
                            {i.productName} ({i.quantityReceived} units @ {currencySymbol} {i.unitCost})
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {currencySymbol} {Number(g.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {g.receivedBy}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(g.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO TAB */}
      {activeTab === 'po' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Purchase Orders (PO)</h3>
            <span className="text-xs text-slate-500">Track orders issued to vendors</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items Ordered</th>
                  <th className="py-3 px-4 text-right">Order Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No Purchase Orders created</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "New Purchase Order" to generate an official order.
                      </p>
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {p.poNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {p.supplierName}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        {p.items.map((i, idx) => (
                          <div key={idx}>
                            {i.productName} ({i.quantityOrdered} ordered, {i.quantityReceived || 0} received)
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {currencySymbol} {Number(p.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.status === 'RECEIVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'PARTIAL_RECEIVED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPLIERS DIRECTORY TAB */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Vendor Directory & Payables</h3>
            <button
              onClick={handleOpenAddSupplier}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Phone / Email</th>
                    <th className="py-3 px-4">KRA PIN / Terms</th>
                    <th className="py-3 px-4 text-right">Current Payable Balance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No suppliers registered yet.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {s.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {s.contactPerson || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          <div>{s.phone}</div>
                          <div>{s.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div>PIN: {s.kraPin || '—'}</div>
                          <div className="text-slate-400">{s.paymentTerms}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {currencySymbol} {Number(s.currentBalance || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenPaymentModal(s)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold"
                          >
                            Record Payment
                          </button>
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

      {/* SUPPLIER PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Supplier Payment Disbursements</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No supplier payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  supplierPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.paymentNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {p.supplierName}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="font-semibold">{p.paymentMethod}</span>
                        {p.reference && <div className="text-slate-400 font-mono">{p.reference}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        {currencySymbol} {Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.paidBy}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE GRN MODAL */}
      {showGRNModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Receive Stock / Create Goods Received Note (GRN)
              </h3>
              <button
                onClick={() => setShowGRNModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGRN} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier *
                  </label>
                  <select
                    value={grnSupplierId}
                    onChange={(e) => setGrnSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Balance: {currencySymbol} {s.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Invoice Number
                  </label>
                  <input
                    type="text"
                    value={grnInvoiceNumber}
                    onChange={(e) => setGrnInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Received Items</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (products.length > 0) {
                        setGrnItems([
                          ...grnItems,
                          {
                            productId: products[0].id,
                            productName: products[0].name,
                            quantityReceived: 10,
                            unitCost: products[0].costPrice || 100
                          }
                        ]);
                      }
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Add Item Row
                  </button>
                </div>

                {grnItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const p = products.find(prod => prod.id === e.target.value);
                          if (p) {
                            const updated = [...grnItems];
                            updated[idx] = {
                              ...updated[idx],
                              productId: p.id,
                              productName: p.name,
                              unitCost: p.costPrice || 100
                            };
                            setGrnItems(updated);
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (In stock: {p.quantityInStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantityReceived}
                        onChange={(e) => {
                          const updated = [...grnItems];
                          updated[idx].quantityReceived = Number(e.target.value);
                          setGrnItems(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="col-span-3 flex gap-1 items-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="Cost"
                        value={item.unitCost}
                        onChange={(e) => {
                          const updated = [...grnItems];
                          updated[idx].unitCost = Number(e.target.value);
                          setGrnItems(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGRNModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Receive Stock & Restock Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {showPOModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Issue Purchase Order
              </h3>
              <button
                onClick={() => setShowPOModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Ordered Products</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (products.length > 0) {
                        setPoItems([
                          ...poItems,
                          {
                            productId: products[0].id,
                            productName: products[0].name,
                            quantityOrdered: 10,
                            unitCost: products[0].costPrice || 100
                          }
                        ]);
                      }
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Add Item Row
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const p = products.find(prod => prod.id === e.target.value);
                          if (p) {
                            const updated = [...poItems];
                            updated[idx] = {
                              ...updated[idx],
                              productId: p.id,
                              productName: p.name,
                              unitCost: p.costPrice || 100
                            };
                            setPoItems(updated);
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantityOrdered}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].quantityOrdered = Number(e.target.value);
                          setPoItems(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Unit Cost"
                        value={item.unitCost}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].unitCost = Number(e.target.value);
                          setPoItems(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Supplier</h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Person & Phone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KRA PIN & Payment Terms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="KRA PIN"
                    value={supplierForm.kraPin}
                    onChange={(e) => setSupplierForm({ ...supplierForm, kraPin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <select
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="CASH">Cash on Delivery</option>
                    <option value="NET15">15 Days</option>
                    <option value="NET30">30 Days</option>
                    <option value="NET60">60 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER PAYMENT MODAL */}
      {showPaymentModal && selectedSupplierForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Record Payment: {selectedSupplierForPayment.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs flex justify-between">
              <span>Outstanding Debt:</span>
              <span className="font-bold text-slate-900">
                {currencySymbol} {Number(selectedSupplierForPayment.currentBalance).toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleSaveSupplierPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
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
                  <option value="BANK_TRANSFER">Bank Transfer / EFT</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. QKJ1234567"
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
                  Record Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
