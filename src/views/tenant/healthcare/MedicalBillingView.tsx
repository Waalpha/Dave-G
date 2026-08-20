import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { MedicalInvoice, InsuranceClaim, Patient, MedicalInvoiceItem, UniversalReceipt } from '../../../types';
import {
  DollarSign, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  FileSpreadsheet, Shield, CreditCard, XCircle, Printer, ArrowRight, Eye, Receipt
} from 'lucide-react';
import { UniversalReceiptModal } from '../../../components/receipts/UniversalReceiptModal';
import { printService } from '../../../lib/printService';

export const MedicalBillingView: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'CLAIMS'>('INVOICES');
  const [invoices, setInvoices] = useState<MedicalInvoice[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Universal Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<UniversalReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // New Invoice Modal State
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [paymentType, setPaymentType] = useState<'CASH' | 'INSURANCE' | 'CO_PAY'>('CASH');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [lineItems, setLineItems] = useState<Array<{
    description: string;
    category: 'CONSULTATION' | 'PHARMACY' | 'LABORATORY' | 'RADIOLOGY' | 'WARD_BED' | 'SURGERY' | 'PROCEDURE' | 'OTHER';
    quantity: number;
    unitPrice: number;
  }>>([
    { description: 'General Doctor OPD Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 25 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Recording Modal State
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<MedicalInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('CASH');
  const [paymentRef, setPaymentRef] = useState('');

  // Claim Filing Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimInvoiceId, setClaimInvoiceId] = useState('');
  const [preAuthCode, setPreAuthCode] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('J01.9');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, clmRes, pRes] = await Promise.all([
        fetch('/api/app/hospital/invoices', { headers: getHeaders() }),
        fetch('/api/app/hospital/insurance-claims', { headers: getHeaders() }),
        fetch('/api/app/hospital/patients', { headers: getHeaders() })
      ]);

      if (invRes.ok) setInvoices((await invRes.json()).invoices || []);
      if (clmRes.ok) setClaims((await clmRes.json()).claims || []);
      if (pRes.ok) {
        const pData = (await pRes.json()).patients || [];
        setPatients(pData);
        if (pData.length > 0 && !selectedPatientId) setSelectedPatientId(pData[0].id);
      }
    } catch (err) {
      console.error('Failed to load billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Medication / Investigation / Procedure', category: 'PHARMACY', quantity: 1, unitPrice: 15 }
    ]);
  };

  const handleRemoveLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const pObj = patients.find(p => p.id === selectedPatientId);
    if (!pObj || lineItems.length === 0) return;

    try {
      setIsSubmitting(true);
      const itemsPayload: MedicalInvoiceItem[] = lineItems.map((item, idx) => ({
        id: `inv-item-${Date.now()}-${idx}`,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      }));

      const subtotal = itemsPayload.reduce((acc, it) => acc + it.totalPrice, 0);

      const res = await fetch('/api/app/hospital/invoices', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: pObj.id,
          patientName: pObj.fullName,
          mrn: pObj.mrn,
          paymentType,
          insuranceProvider: paymentType !== 'CASH' ? (insuranceProvider || pObj.insurance?.provider) : undefined,
          policyNumber: paymentType !== 'CASH' ? (insurancePolicyNumber || pObj.insurance?.policyNumber) : undefined,
          items: itemsPayload,
          subtotal,
          discount: 0,
          totalAmount: subtotal
        })
      });

      if (res.ok) {
        setIsNewInvoiceOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceForPayment) return;

    const amount = parseFloat(paymentAmount) || activeInvoiceForPayment.balanceDue;
    if (amount <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/app/hospital/invoices/${activeInvoiceForPayment.id}/payments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          amount,
          paymentMethod,
          referenceNumber: paymentRef.trim() || `REC-${Date.now().toString().slice(-6)}`,
          receivedById: user?.id || 'cashier-1',
          receivedByName: user?.name || 'Cashier'
        })
      });

      if (res.ok) {
        const paymentData = await res.json();
        const currentInv = activeInvoiceForPayment;
        setActiveInvoiceForPayment(null);
        setPaymentAmount('');
        setPaymentRef('');
        fetchData();

        // Fetch or create UniversalReceipt for thermal print dispatch
        try {
          const rcptRes = await fetch(`/api/app/receipts?search=${paymentData.payment?.referenceNumber || paymentData.receipt?.receiptNumber || currentInv.invoiceNumber}`, {
            headers: getHeaders()
          });
          if (rcptRes.ok) {
            const rd = await rcptRes.json();
            const r = rd.receipts?.[0];
            if (r) {
              setSelectedReceipt(r);
              setIsReceiptModalOpen(true);
              printService.printReceipt(r).catch(() => {});
            }
          }
        } catch {
          // Fallback receipt
          if (currentInv) {
            openReceiptForInvoice(currentInv, amount);
          }
        }
      }
    } catch (err) {
      console.error('Error recording payment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceiptForInvoice = async (inv: MedicalInvoice, amountPaid?: number) => {
    try {
      const res = await fetch(`/api/app/receipts?search=${inv.invoiceNumber}`, { headers: getHeaders() });
      if (res.ok) {
        const d = await res.json();
        const r = d.receipts?.[0];
        if (r) {
          setSelectedReceipt(r);
          setIsReceiptModalOpen(true);
          return;
        }
      }
    } catch {}

    const pat = patients.find(p => p.id === inv.patientId);
    const fb: UniversalReceipt = {
      id: `rcpt_med_${inv.id}`,
      tenantId: tenant?.id || '',
      sourceModule: 'HEALTHCARE_BILLING',
      sourceReferenceId: inv.id,
      receiptNumber: `MED-RCT-${inv.invoiceNumber}`,
      businessName: tenant?.branding?.companyName || tenant?.name || 'Healthcare Center & Hospital',
      currency: 'USD',
      currencySymbol: '$',
      customerName: pat?.fullName || inv.patientName || 'Walk-in Patient',
      patientMrn: pat?.mrn || inv.mrn,
      items: inv.items.map(i => ({
        name: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.totalPrice
      })),
      subtotal: inv.totalAmount,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: amountPaid || inv.amountPaid || inv.totalAmount,
      paymentMethod: (inv.paymentType === 'INSURANCE' ? 'OTHER' : 'CASH'),
      paymentReference: inv.invoiceNumber,
      cashierName: user?.name || 'Medical Cashier',
      issuedAt: inv.createdAt,
      isReprint: false,
      reprintCount: 0,
      status: 'ISSUED',
      createdAt: inv.createdAt || new Date().toISOString()
    };
    setSelectedReceipt(fb);
    setIsReceiptModalOpen(true);
  };

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const invObj = invoices.find(i => i.id === claimInvoiceId);
    if (!invObj) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/insurance-claims', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          invoiceId: invObj.id,
          patientId: invObj.patientId,
          patientName: invObj.patientName,
          mrn: invObj.mrn,
          insuranceProvider: invObj.insuranceProvider || 'SHA / NHIF',
          policyNumber: invObj.policyNumber || 'POL-908123',
          claimAmount: invObj.totalAmount,
          preAuthCode: preAuthCode.trim() || undefined,
          diagnosisCode: diagnosisCode.trim()
        })
      });

      if (res.ok) {
        setIsClaimModalOpen(false);
        setPreAuthCode('');
        fetchData();
      }
    } catch (err) {
      console.error('Error filing claim:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Hospital Billing, Cashier & Insurance Claims</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Itemized invoices, M-Pesa / cash receipting, and NHIF / SHA / Private insurance claim tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Submit Claim</span>
          </button>
          <button
            onClick={() => setIsNewInvoiceOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Invoiced</span>
          <div className="text-xl font-bold font-mono text-slate-900">${totalInvoiced.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">{invoices.length} Total Patient Bills</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Payments Received</span>
          <div className="text-xl font-bold font-mono text-emerald-600">${totalCollected.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Collected Revenue</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Outstanding Balances</span>
          <div className="text-xl font-bold font-mono text-amber-600">${totalOutstanding.toLocaleString()}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Unsettled / Pending Insurance</span>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'INVOICES' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Patient Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLAIMS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'CLAIMS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Insurance Claims ({claims.length})</span>
        </button>
      </div>

      {/* Tab 1: Invoices Table */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <DollarSign className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No invoices generated yet</p>
              <p className="text-xs text-slate-400">Bills created for consultations, labs, pharmacy, and wards appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Invoice # / Date</th>
                    <th className="px-4 py-3">Patient / MRN</th>
                    <th className="px-4 py-3">Payment Scheme</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Paid / Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Cashier Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{inv.patientName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{inv.mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">{inv.paymentType}</span>
                        {inv.insuranceProvider && (
                          <div className="text-[10px] text-slate-500">{inv.insuranceProvider}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${inv.totalAmount}</td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className="text-emerald-700 font-bold">${inv.amountPaid}</span> / <span className="text-amber-700 font-bold">${inv.balanceDue}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {inv.status !== 'PAID' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.amountPaid > 0 && (
                              <button
                                onClick={() => openReceiptForInvoice(inv)}
                                className="px-2.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Slip</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveInvoiceForPayment(inv);
                                setPaymentAmount(inv.balanceDue.toString());
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Receive Payment
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                            <button
                              onClick={() => openReceiptForInvoice(inv)}
                              className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Receipt</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Insurance Claims */}
      {activeTab === 'CLAIMS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {claims.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Shield className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No insurance claims submitted</p>
              <p className="text-xs text-slate-400">Claims for NHIF, SHA, and Private insurers appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Claim # / Date</th>
                    <th className="px-4 py-3">Patient / MRN</th>
                    <th className="px-4 py-3">Insurance Company</th>
                    <th className="px-4 py-3">Claim Amount</th>
                    <th className="px-4 py-3">Pre-Auth Code</th>
                    <th className="px-4 py-3">Claim Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-slate-900">{c.claimNumber}</div>
                        <div className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{c.patientName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{c.mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{c.insuranceProvider}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.policyNumber}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">${c.claimAmount}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">{c.preAuthCode || 'N/A'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Invoice */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Generate Patient Medical Invoice</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Category</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="CASH">Direct Cash / Self-Pay</option>
                    <option value="INSURANCE">Insurance Coverage (100%)</option>
                    <option value="CO_PAY">Co-Pay / Corporate</option>
                  </select>
                </div>
              </div>

              {paymentType !== 'CASH' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Insurance Provider</label>
                    <input
                      type="text"
                      placeholder="e.g. Jubilee Insurance"
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Member / Policy #</label>
                    <input
                      type="text"
                      placeholder="e.g. JUB-984210"
                      value={insurancePolicyNumber}
                      onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Line Items Adder */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Invoice Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    + Add Item Row
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].description = e.target.value;
                        setLineItems(updated);
                      }}
                      className="col-span-5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].category = e.target.value as any;
                        setLineItems(updated);
                      }}
                      className="col-span-3 px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px]"
                    >
                      <option value="CONSULTATION">CONSULT</option>
                      <option value="PHARMACY">PHARMACY</option>
                      <option value="LABORATORY">LAB</option>
                      <option value="RADIOLOGY">RADIO</option>
                      <option value="WARD_BED">BED</option>
                      <option value="SURGERY">SURGERY</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].quantity = parseInt(e.target.value) || 1;
                        setLineItems(updated);
                      }}
                      className="col-span-1 px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setLineItems(updated);
                      }}
                      className="col-span-2 px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="col-span-1 text-red-500 hover:text-red-700 text-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className="text-right pt-2 border-t border-slate-200 font-bold text-slate-900">
                  Total: ${lineItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0).toFixed(2)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Cashier Payment */}
      {activeInvoiceForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Receive Cashier Payment</h3>
                <p className="text-xs text-slate-500">Invoice: <strong className="font-mono">{activeInvoiceForPayment.invoiceNumber}</strong> • Balance Due: <strong>${activeInvoiceForPayment.balanceDue}</strong></p>
              </div>
              <button onClick={() => setActiveInvoiceForPayment(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Amount to Pay ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-base text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="CASH">CASH</option>
                    <option value="MPESA">M-PESA</option>
                    <option value="CREDIT_CARD">CREDIT/DEBIT CARD</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ref # / M-Pesa Code</label>
                  <input
                    type="text"
                    placeholder="e.g. QK8723HDJ"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveInvoiceForPayment(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Record Payment & Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Insurance Claim */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Submit Insurance Claim</h3>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileClaim} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Unclaimed Invoice *</label>
                <select
                  value={claimInvoiceId}
                  onChange={(e) => setClaimInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="">Select Invoice to Claim</option>
                  {invoices.map(i => (
                    <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.patientName} (${i.totalAmount})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Pre-Authorization Code</label>
                <input
                  type="text"
                  placeholder="e.g. AUTH-SHA-8921"
                  value={preAuthCode}
                  onChange={(e) => setPreAuthCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">ICD-10 Primary Diagnosis Code</label>
                <input
                  type="text"
                  value={diagnosisCode}
                  onChange={(e) => setDiagnosisCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Filing...' : 'Submit Claim to Insurer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIVERSAL RECEIPT & THERMAL PRINT MODAL */}
      <UniversalReceiptModal
        isOpen={isReceiptModalOpen}
        receipt={selectedReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceipt(null);
        }}
        onReprint={(updated) => {
          setSelectedReceipt(updated);
        }}
      />
    </div>
  );
};
