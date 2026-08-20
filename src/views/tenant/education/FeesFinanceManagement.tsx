import React, { useState, useEffect } from 'react';
import { FeePayment, StudentInvoice, FeeStructure, Student, Program, SchoolClass, UniversalReceipt } from '../../../types';
import {
  DollarSign, FileText, Plus, Search, Filter, CheckCircle2, AlertCircle,
  Receipt, Download, Printer, Layers, Clock, Check, X, Building, Eye
} from 'lucide-react';
import { UniversalReceiptModal } from '../../../components/receipts/UniversalReceiptModal';
import { printService } from '../../../lib/printService';

interface FeesFinanceManagementProps {
  currencySymbol?: string;
}

export const FeesFinanceManagement: React.FC<FeesFinanceManagementProps> = ({
  currencySymbol = 'KSh'
}) => {
  const [subTab, setSubTab] = useState<'payments' | 'invoices' | 'structures' | 'debtors'>('payments');

  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBatchInvoiceModalOpen, setIsBatchInvoiceModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<FeePayment | null>(null);
  const [selectedUniversalReceipt, setSelectedUniversalReceipt] = useState<UniversalReceipt | null>(null);
  const [isUniversalReceiptModalOpen, setIsUniversalReceiptModalOpen] = useState(false);

  // Payment Form
  const [payStudentId, setPayStudentId] = useState('');
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('15000');
  const [payMethod, setPayMethod] = useState<'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH'>('M-PESA');
  const [payRef, setPayRef] = useState('');
  const [payReceivedBy, setPayReceivedBy] = useState('Bursar / Cashier');

  // Single Invoice Form
  const [invStudentId, setInvStudentId] = useState('');
  const [invAcademicYear, setInvAcademicYear] = useState('2025/2026');
  const [invTerm, setInvTerm] = useState('Semester 1');
  const [invDueDate, setInvDueDate] = useState('2026-03-31');
  const [invTuition, setInvTuition] = useState('25000');
  const [invRegistration, setInvRegistration] = useState('2000');
  const [invExam, setInvExam] = useState('3000');
  const [invLab, setInvLab] = useState('2000');

  // Batch Invoice Form
  const [batchClassId, setBatchClassId] = useState('');
  const [batchAcademicYear, setBatchAcademicYear] = useState('2025/2026');
  const [batchTerm, setBatchTerm] = useState('Semester 1');
  const [batchDueDate, setBatchDueDate] = useState('2026-03-31');

  // Fee Structure Form
  const [fsProgramId, setFsProgramId] = useState('');
  const [fsAcademicYear, setFsAcademicYear] = useState('2025/2026');
  const [fsTerm, setFsTerm] = useState('Semester 1');
  const [fsTuition, setFsTuition] = useState('30000');
  const [fsReg, setFsReg] = useState('2500');
  const [fsLibrary, setFsLibrary] = useState('1500');
  const [fsActivity, setFsActivity] = useState('1000');
  const [fsLab, setFsLab] = useState('2000');
  const [fsExam, setFsExam] = useState('3000');

  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resPay, resInv, resFS, resStud, resAcad, resCls] = await Promise.all([
        fetch('/api/app/education/payments', { headers: getHeaders() }),
        fetch('/api/app/education/invoices', { headers: getHeaders() }),
        fetch('/api/app/education/fee-structures', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/classes', { headers: getHeaders() })
      ]);

      if (resPay.ok) setPayments(await resPay.json());
      if (resInv.ok) setInvoices(await resInv.json());
      if (resFS.ok) setFeeStructures(await resFS.json());
      if (resStud.ok) {
        const sData = await resStud.json();
        setStudents(sData);
        if (sData.length > 0) {
          setPayStudentId(sData[0].id);
          setInvStudentId(sData[0].id);
        }
      }
      if (resAcad.ok) {
        const acad = await resAcad.json();
        setPrograms(acad.programs || []);
        if (acad.programs?.length > 0) setFsProgramId(acad.programs[0].id);
      }
      if (resCls.ok) {
        const cls = await resCls.json();
        setClasses(cls);
        if (cls.length > 0) setBatchClassId(cls[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching finance records:', err);
      setErrorMsg('Failed to load fee ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId || !payAmount) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/app/education/payments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: payStudentId,
          invoiceId: payInvoiceId || undefined,
          amount: Number(payAmount) || 0,
          paymentMethod: payMethod,
          referenceNo: payRef.trim() || `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
          receivedBy: payReceivedBy
        })
      });

      if (!res.ok) throw new Error('Failed to record payment receipt');

      const payment = await res.json();
      setSuccessMsg(`Payment of ${currencySymbol} ${payAmount} recorded successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsPaymentModalOpen(false);
      fetchData();
      if (payment) {
        openUniversalReceipt(payment);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  const openUniversalReceipt = async (payment: FeePayment) => {
    try {
      const res = await fetch(`/api/app/receipts?search=${payment.receiptNo}`, { headers: getHeaders() });
      if (res.ok) {
        const d = await res.json();
        const r = d.receipts?.[0];
        if (r) {
          setSelectedUniversalReceipt(r);
          setIsUniversalReceiptModalOpen(true);
          // Auto dispatch thermal printer
          printService.printReceipt(r).catch(() => {});
          return;
        }
      }
    } catch {}

    const fb: UniversalReceipt = {
      id: `rcpt_${payment.id}`,
      tenantId: localStorage.getItem('erp_tenant_id') || '',
      sourceModule: 'EDUCATION_FEES',
      sourceReferenceId: payment.id,
      receiptNumber: payment.receiptNo,
      businessName: 'Institution Fees Department',
      currency: 'KES',
      currencySymbol: currencySymbol,
      customerName: payment.studentName,
      studentAdmissionNo: payment.admissionNo,
      items: [{
        name: `Academic Fee Payment (${payment.invoiceNo || 'General Fee Account'})`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount,
        notes: payment.notes
      }],
      subtotal: payment.amount,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: payment.amount,
      paymentMethod: (payment.paymentMethod as any) || 'CASH',
      paymentReference: payment.referenceNo,
      cashierName: payment.receivedBy || 'Finance Bursar',
      issuedAt: payment.paidAt,
      isReprint: false,
      reprintCount: 0,
      status: 'ISSUED',
      createdAt: payment.paidAt || new Date().toISOString()
    };
    setSelectedUniversalReceipt(fb);
    setIsUniversalReceiptModalOpen(true);
  };

  // Create Single Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invStudentId) return;

    try {
      setSubmitting(true);
      const items = [
        { description: 'Tuition Fee', amount: Number(invTuition) || 0 },
        { description: 'Registration Fee', amount: Number(invRegistration) || 0 },
        { description: 'Exam & Assessment Fee', amount: Number(invExam) || 0 },
        { description: 'Lab & Practical Fee', amount: Number(invLab) || 0 }
      ].filter(i => i.amount > 0);

      const res = await fetch('/api/app/education/invoices', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: invStudentId,
          academicYear: invAcademicYear,
          term: invTerm,
          dueDate: invDueDate,
          items
        })
      });

      if (!res.ok) throw new Error('Failed to create invoice');

      setSuccessMsg('Student invoice generated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsInvoiceModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Batch Generate Invoices
  const handleBatchGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchClassId) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/app/education/invoices/batch-generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          classId: batchClassId,
          academicYear: batchAcademicYear,
          term: batchTerm,
          dueDate: batchDueDate
        })
      });

      if (!res.ok) throw new Error('Failed to generate batch invoices');
      const data = await res.json();

      setSuccessMsg(`Generated ${data.invoicesCount || 0} invoices for this class cohort.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsBatchInvoiceModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running batch invoice generator');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Fee Structure
  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fsProgramId) return;

    try {
      setSubmitting(true);
      const items = [
        { feeType: 'Tuition Fee', amount: Number(fsTuition) || 0, isMandatory: true },
        { feeType: 'Registration', amount: Number(fsReg) || 0, isMandatory: true },
        { feeType: 'Library & Online Resources', amount: Number(fsLibrary) || 0, isMandatory: false },
        { feeType: 'Student Activity & Union', amount: Number(fsActivity) || 0, isMandatory: false },
        { feeType: 'Lab & Workshop', amount: Number(fsLab) || 0, isMandatory: false },
        { feeType: 'Examination & Assessment', amount: Number(fsExam) || 0, isMandatory: true }
      ].filter(i => i.amount > 0);

      const res = await fetch('/api/app/education/fee-structures', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          programId: fsProgramId,
          academicYear: fsAcademicYear,
          term: fsTerm,
          items
        })
      });

      if (!res.ok) throw new Error('Failed to save fee structure');

      setSuccessMsg('Fee structure template saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsStructureModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalOutstanding = students.reduce((sum, s) => sum + (s.feeBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Fee Collections</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {currencySymbol} {totalCollected.toLocaleString()}
            </span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-500">{payments.length} Processed Receipts</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Billed Invoices</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {currencySymbol} {totalBilled.toLocaleString()}
            </span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-[11px] text-slate-500">{invoices.length} Active Invoices</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Outstanding Debtors Balance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 font-mono">
              {currencySymbol} {totalOutstanding.toLocaleString()}
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-[11px] text-slate-500">Uncollected Student Balances</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs gap-2 py-1 text-xs font-medium text-slate-600">
        {[
          { id: 'payments', label: `Payment Receipts (${payments.length})`, icon: Receipt },
          { id: 'invoices', label: `Student Invoices (${invoices.length})`, icon: FileText },
          { id: 'structures', label: `Fee Structures (${feeStructures.length})`, icon: Layers },
          { id: 'debtors', label: 'Debtors & Balances', icon: DollarSign }
        ].map(t => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: PAYMENTS */}
      {subTab === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fee Payments & Receipts Ledger</h3>
              <p className="text-xs text-slate-500">Official cash, M-Pesa, bank slip, and cheque payments.</p>
            </div>

            <button
              onClick={() => {
                setPayRef(`REF${Math.floor(100000 + Math.random() * 900000)}`);
                setIsPaymentModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Record Payment Receipt</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Method & Ref</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Cashier</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No payment receipts recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-700">{p.receiptNo}</td>
                      <td className="p-3 font-mono text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.studentName}</td>
                      <td className="p-3 font-mono">{p.admissionNo}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                        <div className="font-mono text-[11px] text-slate-400">{p.referenceNo}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                        {currencySymbol} {p.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500">{p.receivedBy}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openUniversalReceipt(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INVOICES */}
      {subTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Invoices & Term Billing</h3>
              <p className="text-xs text-slate-500">Termly tuition fee debits and fee demand notices.</p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsBatchInvoiceModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Batch Invoice Class</span>
              </button>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Student Invoice</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Term & Year</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Balance Due</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No invoices created yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{inv.studentName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{inv.admissionNo}</div>
                      </td>
                      <td className="p-3 text-slate-600">{inv.term} ({inv.academicYear})</td>
                      <td className="p-3 font-mono text-slate-500">{inv.dueDate}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {currencySymbol} {inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">
                        {currencySymbol} {inv.paidAmount.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-600">
                        {currencySymbol} {inv.balance.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'PARTIAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: FEE STRUCTURES */}
      {subTab === 'structures' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Program Fee Structure Templates</h3>
              <p className="text-xs text-slate-500">Standardized itemized billing tariffs per qualification and semester.</p>
            </div>

            <button
              onClick={() => setIsStructureModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fee Structure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map(fs => (
              <div key={fs.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{fs.programName}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                    {fs.term}
                  </span>
                </div>
                <div className="space-y-1.5 py-2 border-y border-slate-200 text-xs">
                  {fs.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>{it.feeType}</span>
                      <span className="font-mono font-bold text-slate-800">
                        {currencySymbol} {it.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-xs text-slate-900">Total Term Fee:</span>
                  <span className="font-mono font-bold text-sm text-blue-700">
                    {currencySymbol} {fs.totalFee.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DEBTORS */}
      {subTab === 'debtors' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Fee Debtors & Balance Statement</h3>
              <p className="text-xs text-slate-500">Students with outstanding fees requiring collection.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Guardian Contact</th>
                  <th className="p-3">Outstanding Fee Balance</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.filter(s => (s.feeBalance || 0) > 0).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      All student fee accounts are fully settled!
                    </td>
                  </tr>
                ) : (
                  students.filter(s => (s.feeBalance || 0) > 0).map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="p-3 text-slate-600">{s.programName}</td>
                      <td className="p-3 text-slate-500">
                        <div>{s.guardianName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{s.guardianPhone}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-600 text-sm">
                        {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setPayStudentId(s.id);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Record Fee
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRecordPayment} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Record Official Fee Receipt</h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Student *</label>
                <select
                  value={payStudentId}
                  onChange={e => setPayStudentId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo}) - Balance: {currencySymbol} {s.feeBalance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Amount Paid ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Payment Channel</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="M-PESA">M-PESA Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Direct Deposit</option>
                    <option value="CHEQUE">Banker's Cheque</option>
                    <option value="CASH">Cash at Accounts Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Transaction Reference No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QKH9201481"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Receiving Cashier / Bursar</label>
                <input
                  type="text"
                  value={payReceivedBy}
                  onChange={e => setPayReceivedBy(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Processing...' : 'Confirm Receipt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OFFICIAL RECEIPT VIEW MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="border-b border-dashed border-slate-300 pb-4 text-center space-y-1">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">OFFICIAL FEE PAYMENT RECEIPT</h3>
              <p className="font-mono text-emerald-700 font-bold">{viewingReceipt.receiptNo}</p>
            </div>

            <div className="space-y-2 py-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-slate-900">{viewingReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Admission No:</span>
                <strong>{viewingReceipt.admissionNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-mono">{new Date(viewingReceipt.paidAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-bold">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Reference No:</span>
                <span>{viewingReceipt.referenceNo}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-emerald-700 pt-2 border-t border-slate-200">
                <span>Amount Paid:</span>
                <span>{currencySymbol} {viewingReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Received By:</span>
                <span>{viewingReceipt.receivedBy}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SINGLE INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateInvoice} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Create Student Term Invoice</h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Student *</label>
                <select
                  value={invStudentId}
                  onChange={e => setInvStudentId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNo})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Academic Year</label>
                  <input
                    type="text"
                    value={invAcademicYear}
                    onChange={e => setInvAcademicYear(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Term / Semester</label>
                  <input
                    type="text"
                    value={invTerm}
                    onChange={e => setInvTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Tuition Fee ({currencySymbol})</label>
                  <input
                    type="number"
                    value={invTuition}
                    onChange={e => setInvTuition(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Registration Fee</label>
                  <input
                    type="number"
                    value={invRegistration}
                    onChange={e => setInvRegistration(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Exam Fee</label>
                  <input
                    type="number"
                    value={invExam}
                    onChange={e => setInvExam(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={e => setInvDueDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Generating...' : 'Issue Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BATCH INVOICE MODAL */}
      {isBatchInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBatchGenerateInvoices} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Batch Generate Invoices for Class</h3>
            <p className="text-slate-500 text-[11px]">
              Automatically generates and posts fee invoices to every enrolled student in this class cohort.
            </p>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Class Cohort *</label>
                <select
                  value={batchClassId}
                  onChange={e => setBatchClassId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Academic Year</label>
                  <input
                    type="text"
                    value={batchAcademicYear}
                    onChange={e => setBatchAcademicYear(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Term / Semester</label>
                  <input
                    type="text"
                    value={batchTerm}
                    onChange={e => setBatchTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Payment Due Date</label>
                <input
                  type="date"
                  value={batchDueDate}
                  onChange={e => setBatchDueDate(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBatchInvoiceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Generating...' : 'Run Batch Generation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FEE STRUCTURE MODAL */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveFeeStructure} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Define Program Fee Tariff</h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Academic Program *</label>
                <select
                  value={fsProgramId}
                  onChange={e => setFsProgramId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Academic Year</label>
                  <input
                    type="text"
                    value={fsAcademicYear}
                    onChange={e => setFsAcademicYear(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Term / Semester</label>
                  <input
                    type="text"
                    value={fsTerm}
                    onChange={e => setFsTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Tuition Fee ({currencySymbol})</label>
                  <input
                    type="number"
                    value={fsTuition}
                    onChange={e => setFsTuition(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Registration</label>
                  <input
                    type="number"
                    value={fsReg}
                    onChange={e => setFsReg(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Library & E-Resources</label>
                  <input
                    type="number"
                    value={fsLibrary}
                    onChange={e => setFsLibrary(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Exam Assessment</label>
                  <input
                    type="number"
                    value={fsExam}
                    onChange={e => setFsExam(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsStructureModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Structure'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UNIVERSAL RECEIPT MODAL FOR PHYSICAL THERMAL PRINTING */}
      <UniversalReceiptModal
        isOpen={isUniversalReceiptModalOpen}
        receipt={selectedUniversalReceipt}
        onClose={() => {
          setIsUniversalReceiptModalOpen(false);
          setSelectedUniversalReceipt(null);
        }}
        onReprint={(updated) => {
          setSelectedUniversalReceipt(updated);
        }}
      />
    </div>
  );
};
