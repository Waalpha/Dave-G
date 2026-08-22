import React, { useState, useEffect, useMemo } from 'react';
import {
  FeePayment, StudentInvoice, FeeStructure, Student, Program, SchoolClass,
  SchoolGrade, GradeStream, StudentFeeStatement, UniversalReceipt
} from '../../../types';
import {
  DollarSign, FileText, Plus, Search, Filter, CheckCircle2, AlertCircle,
  Receipt, Download, Printer, Layers, Clock, Check, X, Eye, Edit, Trash2,
  Send, Users, ChevronRight, ArrowUpDown, Calendar, HelpCircle, FileCheck, Copy,
  PieChart, RefreshCw, AlertTriangle, Zap
} from 'lucide-react';
import { UniversalReceiptModal } from '../../../components/receipts/UniversalReceiptModal';
import { printService } from '../../../lib/printService';
import { FeesPieChart } from './components/FeesPieChart';
import { SchoolFeesReportModal } from './components/SchoolFeesReportModal';
import { MonthlyFeesAutomation } from './components/MonthlyFeesAutomation';

interface FeesFinanceManagementProps {
  currencySymbol?: string;
}

// Number to Words converter for receipts (e.g. 15000 -> Fifteen Thousand Kenya Shillings Only)
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Shillings Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToStr = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToStr(n % 100) : '');
    if (n < 1000000) return numToStr(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToStr(n % 1000) : '');
    if (n < 1000000000) return numToStr(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + numToStr(n % 1000000) : '');
    return n.toString();
  };

  const whole = Math.floor(Math.abs(num));
  return `${numToStr(whole)} Shillings Only`;
}

export const FeesFinanceManagement: React.FC<FeesFinanceManagementProps> = ({
  currencySymbol = 'KSh'
}) => {
  const [subTab, setSubTab] = useState<'payments' | 'invoices' | 'structures' | 'statements' | 'reports' | 'monthly_automation'>('payments');

  // Core Data
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [grades, setGrades] = useState<SchoolGrade[]>([]);
  const [streams, setStreams] = useState<GradeStream[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Universal Receipt Modal
  const [selectedUniversalReceipt, setSelectedUniversalReceipt] = useState<UniversalReceipt | null>(null);
  const [isUniversalReceiptModalOpen, setIsUniversalReceiptModalOpen] = useState(false);

  // Filters State
  const [paySearch, setPaySearch] = useState('');
  const [payMethodFilter, setPayMethodFilter] = useState('ALL');
  const [payGradeFilter, setPayGradeFilter] = useState('ALL');
  const [payDateFrom, setPayDateFrom] = useState('');
  const [payDateTo, setPayDateTo] = useState('');

  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('ALL');
  const [invGradeFilter, setInvGradeFilter] = useState('ALL');
  const [invTermFilter, setInvTermFilter] = useState('ALL');
  const [invYearFilter, setInvYearFilter] = useState('ALL');

  // Modals Open State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<FeePayment | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FeePayment | null>(null);
  const [deletePaymentCandidate, setDeletePaymentCandidate] = useState<FeePayment | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<StudentInvoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<StudentInvoice | null>(null);
  const [deleteInvoiceCandidate, setDeleteInvoiceCandidate] = useState<StudentInvoice | null>(null);

  const [isBatchInvoiceModalOpen, setIsBatchInvoiceModalOpen] = useState(false);

  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [deleteStructureCandidate, setDeleteStructureCandidate] = useState<FeeStructure | null>(null);

  // Statement Tab State
  const [statementStudentId, setStatementStudentId] = useState('');
  const [studentStatement, setStudentStatement] = useState<StudentFeeStatement | null>(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementYearFilter, setStatementYearFilter] = useState('ALL');
  const [statementTermFilter, setStatementTermFilter] = useState('ALL');

  // Reports Tab State
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportYearFilter, setReportYearFilter] = useState('ALL');
  const [reportTermFilter, setReportTermFilter] = useState('ALL');
  const [reportGradeFilter, setReportGradeFilter] = useState('ALL');
  const [reportStatusFilter, setReportStatusFilter] = useState<'ALL' | 'SETTLED' | 'PARTIAL' | 'ARREARS'>('ALL');
  const [reportSearch, setReportSearch] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fee Structure Filters State
  const [fsSearch, setFsSearch] = useState('');
  const [fsGradeFilter, setFsGradeFilter] = useState('ALL');
  const [fsYearFilter, setFsYearFilter] = useState('ALL');
  const [fsTermFilter, setFsTermFilter] = useState('ALL');

  // Form: Payment
  const [payStudentId, setPayStudentId] = useState('');
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('15000');
  const [payMethod, setPayMethod] = useState<'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'CASH'>('M-PESA');
  const [payRef, setPayRef] = useState('');
  const [payReceivedBy, setPayReceivedBy] = useState('Bursar / Finance');
  const [payBankName, setPayBankName] = useState('');
  const [payChequeNo, setPayChequeNo] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Form: Single Invoice
  const [invStudentId, setInvStudentId] = useState('');
  const [invAcademicYear, setInvAcademicYear] = useState('2025/2026');
  const [invTerm, setInvTerm] = useState('Term 1');
  const [invDueDate, setInvDueDate] = useState('2026-03-31');
  const [invIssueDate, setInvIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [invItems, setInvItems] = useState<Array<{ description: string; amount: number }>>([
    { description: 'Tuition Fee', amount: 20000 },
    { description: 'Activity & Co-Curricular', amount: 2500 },
    { description: 'Assessment / Exam Fee', amount: 2500 }
  ]);
  const [invDiscount, setInvDiscount] = useState('0');
  const [invDiscountReason, setInvDiscountReason] = useState('');
  const [invNotes, setInvNotes] = useState('');

  // Form: Batch Invoices
  const [batchTargetType, setBatchTargetType] = useState<'GRADE' | 'STREAM' | 'CLASS' | 'PROGRAM'>('GRADE');
  const [batchTargetId, setBatchTargetId] = useState('');
  const [batchStructureId, setBatchStructureId] = useState('');
  const [batchAcademicYear, setBatchAcademicYear] = useState('2025/2026');
  const [batchTerm, setBatchTerm] = useState('Term 1');
  const [batchDueDate, setBatchDueDate] = useState('2026-03-31');

  // Form: Fee Structure
  const [fsName, setFsName] = useState('');
  const [fsTargetType, setFsTargetType] = useState<'GRADE' | 'PROGRAM' | 'CLASS' | 'ALL'>('GRADE');
  const [fsTargetId, setFsTargetId] = useState('');
  const [fsAcademicYear, setFsAcademicYear] = useState('2025/2026');
  const [fsTerm, setFsTerm] = useState('Term 1');
  const [fsBillingFrequency, setFsBillingFrequency] = useState<'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_OFF'>('TERM');
  const [fsBillingDayOfMonth, setFsBillingDayOfMonth] = useState('1');
  const [fsIsMonthlyRecurring, setFsIsMonthlyRecurring] = useState(false);
  const [fsItems, setFsItems] = useState<Array<{ name: string; amount: number; isMandatory: boolean }>>([
    { name: 'Tuition Fee', amount: 20000, isMandatory: true },
    { name: 'Exam & Assessment', amount: 2500, isMandatory: true },
    { name: 'Library & Learning Materials', amount: 1500, isMandatory: false },
    { name: 'Activity & Sports', amount: 2000, isMandatory: false }
  ]);
  const [fsDescription, setFsDescription] = useState('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-tenant-id': localStorage.getItem('erp_tenant_id') || '',
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    Authorization: `Bearer ${localStorage.getItem('erp_token') || ''}`
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getHeaders();
      const [pRes, iRes, fsRes, sRes, prRes, cRes, gRes, stRes] = await Promise.all([
        fetch('/api/app/education/payments', { headers }),
        fetch('/api/app/education/invoices', { headers }),
        fetch('/api/app/education/fee-structures', { headers }),
        fetch('/api/app/education/students', { headers }),
        fetch('/api/app/education/programs', { headers }),
        fetch('/api/app/education/classes', { headers }),
        fetch('/api/app/education/grades', { headers }),
        fetch('/api/app/education/streams', { headers })
      ]);

      if (pRes.ok) setPayments(await pRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
      if (fsRes.ok) setFeeStructures(await fsRes.json());
      if (sRes.ok) {
        const studData = await sRes.json();
        setStudents(studData);
        if (studData.length > 0 && !statementStudentId) {
          setStatementStudentId(studData[0].id);
        }
      }
      if (prRes.ok) setPrograms(await prRes.json());
      if (cRes.ok) setClasses(await cRes.json());
      if (gRes.ok) setGrades(await gRes.json());
      if (stRes.ok) setStreams(await stRes.json());
    } catch (err: any) {
      setErrorMsg('Failed to load fee finance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch student fee statement when selected
  const fetchStudentStatement = async (studId: string) => {
    if (!studId) return;
    try {
      setStatementLoading(true);
      const res = await fetch(`/api/app/education/students/${studId}/fee-statement`, { headers: getHeaders() });
      if (res.ok) {
        const stmt = await res.json();
        setStudentStatement(stmt);
      }
    } catch (err) {
      console.warn('Error fetching fee statement', err);
    } finally {
      setStatementLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'statements' && statementStudentId) {
      fetchStudentStatement(statementStudentId);
    }
  }, [subTab, statementStudentId]);

  // Fetch Report summary
  const fetchReports = async () => {
    try {
      setReportLoading(true);
      const params = new URLSearchParams();
      if (reportYearFilter && reportYearFilter !== 'ALL') params.append('academicYear', reportYearFilter);
      if (reportTermFilter && reportTermFilter !== 'ALL') params.append('academicTerm', reportTermFilter);
      if (reportGradeFilter && reportGradeFilter !== 'ALL') params.append('gradeId', reportGradeFilter);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/app/education/fee-reports/summary${qs}`, { headers: getHeaders() });
      if (res.ok) {
        setReportSummary(await res.json());
      }
    } catch (err) {
      console.warn('Error fetching fee report summary', err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'reports') {
      fetchReports();
    }
  }, [subTab, reportYearFilter, reportTermFilter, reportGradeFilter]);

  // Universal Receipt Launcher
  const openUniversalReceipt = async (payment: FeePayment) => {
    try {
      const res = await fetch(`/api/app/receipts?search=${payment.receiptNo}`, { headers: getHeaders() });
      if (res.ok) {
        const d = await res.json();
        const r = d.receipts?.[0];
        if (r) {
          setSelectedUniversalReceipt(r);
          setIsUniversalReceiptModalOpen(true);
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
      businessName: 'Davetech Academy / Institution Accounts',
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

  // Record / Edit Fee Payment
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId || !payAmount) return;

    try {
      setSubmitting(true);
      const url = editingPayment ? `/api/app/education/payments/${editingPayment.id}` : '/api/app/education/payments';
      const method = editingPayment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: payStudentId,
          invoiceId: payInvoiceId || undefined,
          amount: Number(payAmount) || 0,
          paymentMethod: payMethod,
          referenceNo: payRef.trim() || `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
          receivedBy: payReceivedBy,
          bankName: payBankName,
          chequeNo: payChequeNo,
          notes: payNotes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save payment receipt');
      }

      const payment = await res.json();
      setSuccessMsg(editingPayment ? 'Payment receipt updated successfully.' : `Payment of ${currencySymbol} ${Number(payAmount).toLocaleString()} recorded successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsPaymentModalOpen(false);
      setEditingPayment(null);
      fetchData();
      if (!editingPayment && payment) {
        setViewingReceipt(payment);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing fee payment');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Payment
  const handleDeletePayment = async () => {
    if (!deletePaymentCandidate) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/app/education/payments/${deletePaymentCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete payment receipt');
      setSuccessMsg('Payment receipt reversed and deleted.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setDeletePaymentCandidate(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Create / Edit Single Invoice
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invStudentId) return;

    try {
      setSubmitting(true);
      const validItems = invItems.filter(i => (Number(i.amount) || 0) > 0);
      if (validItems.length === 0) {
        throw new Error('Please specify at least one valid fee line item.');
      }

      const url = editingInvoice ? `/api/app/education/invoices/${editingInvoice.id}` : '/api/app/education/invoices';
      const method = editingInvoice ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: invStudentId,
          academicYear: invAcademicYear,
          academicTerm: invTerm,
          term: invTerm,
          issueDate: invIssueDate,
          dueDate: invDueDate,
          items: validItems,
          discountAmount: Number(invDiscount) || 0,
          discountReason: invDiscountReason,
          notes: invNotes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save student invoice');
      }

      setSuccessMsg(editingInvoice ? 'Student invoice updated successfully.' : 'Student fee invoice generated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsInvoiceModalOpen(false);
      setEditingInvoice(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating invoice');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async () => {
    if (!deleteInvoiceCandidate) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/app/education/invoices/${deleteInvoiceCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete invoice');
      setSuccessMsg('Invoice record deleted and student balance updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setDeleteInvoiceCandidate(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Batch Generate Invoices
  const handleBatchGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const payload: any = {
        academicYear: batchAcademicYear,
        academicTerm: batchTerm,
        dueDate: batchDueDate,
        feeStructureId: batchStructureId || undefined
      };

      if (batchTargetType === 'GRADE') payload.gradeId = batchTargetId;
      else if (batchTargetType === 'STREAM') payload.streamId = batchTargetId;
      else if (batchTargetType === 'CLASS') payload.classId = batchTargetId;
      else if (batchTargetType === 'PROGRAM') payload.programId = batchTargetId;

      const res = await fetch('/api/app/education/invoices/batch-generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate batch invoices');
      }

      const data = await res.json();
      setSuccessMsg(`Successfully generated and posted ${data.count || 0} student invoices.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsBatchInvoiceModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running batch invoice generator');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Create / Edit Fee Structure
  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const validItems = fsItems.filter(i => (Number(i.amount) || 0) > 0);
      if (validItems.length === 0) {
        throw new Error('Please add at least one fee tariff item.');
      }

      const payload: any = {
        name: fsName.trim(),
        targetType: fsTargetType,
        academicYear: fsAcademicYear,
        academicTerm: fsTerm,
        term: fsTerm,
        billingFrequency: fsBillingFrequency,
        billingDayOfMonth: Number(fsBillingDayOfMonth) || 1,
        isMonthlyRecurring: fsIsMonthlyRecurring || fsBillingFrequency === 'MONTHLY',
        items: validItems.map(i => ({ feeType: i.name, name: i.name, amount: Number(i.amount) || 0, isMandatory: i.isMandatory })),
        description: fsDescription
      };

      if (fsTargetType === 'GRADE') payload.gradeId = fsTargetId;
      else if (fsTargetType === 'PROGRAM') payload.programId = fsTargetId;
      else if (fsTargetType === 'CLASS') payload.classId = fsTargetId;

      const url = editingStructure ? `/api/app/education/fee-structures/${editingStructure.id}` : '/api/app/education/fee-structures';
      const method = editingStructure ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save fee structure');
      }

      setSuccessMsg(editingStructure ? 'Fee structure updated successfully.' : 'New fee structure tariff created successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsStructureModalOpen(false);
      setEditingStructure(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving fee structure');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Fee Structure
  const handleDeleteFeeStructure = async () => {
    if (!deleteStructureCandidate) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/app/education/fee-structures/${deleteStructureCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete fee structure');
      setSuccessMsg('Fee structure template deleted.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setDeleteStructureCandidate(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (paySearch) {
        const q = paySearch.toLowerCase();
        const matches = (
          p.receiptNo.toLowerCase().includes(q) ||
          p.studentName.toLowerCase().includes(q) ||
          p.admissionNo.toLowerCase().includes(q) ||
          p.referenceNo.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      if (payMethodFilter !== 'ALL' && p.paymentMethod !== payMethodFilter) return false;
      if (payGradeFilter !== 'ALL' && p.gradeId !== payGradeFilter) return false;
      if (payDateFrom && new Date(p.paidAt).getTime() < new Date(payDateFrom).getTime()) return false;
      if (payDateTo && new Date(p.paidAt).getTime() > new Date(`${payDateTo}T23:59:59`).getTime()) return false;
      return true;
    });
  }, [payments, paySearch, payMethodFilter, payGradeFilter, payDateFrom, payDateTo]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (invSearch) {
        const q = invSearch.toLowerCase();
        const matches = (
          inv.invoiceNo.toLowerCase().includes(q) ||
          inv.studentName.toLowerCase().includes(q) ||
          inv.admissionNo.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      if (invStatusFilter !== 'ALL' && inv.status !== invStatusFilter) return false;
      if (invGradeFilter !== 'ALL' && inv.gradeId !== invGradeFilter) return false;
      if (invTermFilter !== 'ALL' && inv.academicTerm !== invTermFilter && inv.term !== invTermFilter) return false;
      if (invYearFilter !== 'ALL' && inv.academicYear !== invYearFilter) return false;
      return true;
    });
  }, [invoices, invSearch, invStatusFilter, invGradeFilter, invTermFilter, invYearFilter]);

  // Filtered Fee Structures
  const filteredFeeStructures = useMemo(() => {
    return feeStructures.filter(fs => {
      if (fsSearch) {
        const q = fsSearch.toLowerCase();
        const matches = (
          (fs.name && fs.name.toLowerCase().includes(q)) ||
          (fs.gradeName && fs.gradeName.toLowerCase().includes(q)) ||
          (fs.programName && fs.programName.toLowerCase().includes(q)) ||
          (fs.className && fs.className.toLowerCase().includes(q))
        );
        if (!matches) return false;
      }
      if (fsGradeFilter !== 'ALL') {
        if (fs.gradeId !== fsGradeFilter && fs.programId !== fsGradeFilter) return false;
      }
      if (fsTermFilter !== 'ALL') {
        if (fs.academicTerm !== fsTermFilter && fs.term !== fsTermFilter) return false;
      }
      if (fsYearFilter !== 'ALL') {
        if (fs.academicYear !== fsYearFilter) return false;
      }
      return true;
    });
  }, [feeStructures, fsSearch, fsGradeFilter, fsTermFilter, fsYearFilter]);

  // Calculations for stats
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
  const totalOutstanding = students.reduce((sum, s) => sum + (Number(s.feeBalance) || 0), 0);
  const collectionPercentage = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Selected student for quick balance preview in Payment Modal
  const selectedPaymentStudent = students.find(s => s.id === payStudentId);
  const studentUnpaidInvoices = invoices.filter(i => i.studentId === payStudentId && i.balance > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Core Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Fee Collections</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700 font-mono">
              {currencySymbol} {totalCollected.toLocaleString()}
            </span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-500">{payments.length} Processed Receipts</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Invoiced Debits</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 font-mono">
              {currencySymbol} {totalBilled.toLocaleString()}
            </span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-[11px] text-slate-500">{invoices.length} Active Invoices</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Debtors & Arrears Balance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-600 font-mono">
              {currencySymbol} {totalOutstanding.toLocaleString()}
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-[11px] text-slate-500">
            {students.filter(s => (s.feeBalance || 0) > 0).length} Students in Arrears
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Collection Efficiency</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-indigo-700 font-mono">
              {collectionPercentage}%
            </span>
            <FileCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, collectionPercentage)}%` }} />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-3 rounded-xl shadow-2xs gap-1 py-1 text-xs font-medium text-slate-600 overflow-x-auto">
        {[
          { id: 'monthly_automation', label: 'Monthly Auto-Fees & Billing', icon: Zap, highlight: true },
          { id: 'payments', label: `Payment Receipts (${payments.length})`, icon: Receipt },
          { id: 'invoices', label: `Student Invoices (${invoices.length})`, icon: FileText },
          { id: 'structures', label: `Fee Structures (${feeStructures.length})`, icon: Layers },
          { id: 'statements', label: 'Student Fee Statements', icon: FileCheck },
          { id: 'reports', label: 'School Fees & Financial Reports', icon: PieChart }
        ].map(t => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${t.highlight && !isActive ? 'text-amber-600' : ''}`} />
              <span>{t.label}</span>
              {t.highlight && !isActive && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold">
                  AUTO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAYMENTS & RECEIPTS                                               */}
      {/* ========================================================================= */}
      {subTab === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fee Payments & Receipts Ledger</h3>
              <p className="text-xs text-slate-500">Official cash, M-Pesa, bank slips, and cheque collections.</p>
            </div>

            <button
              onClick={() => {
                setEditingPayment(null);
                setPayStudentId(students[0]?.id || '');
                setPayInvoiceId('');
                setPayAmount('10000');
                setPayMethod('M-PESA');
                setPayRef(`TXN${Math.floor(100000 + Math.random() * 900000)}`);
                setPayReceivedBy('Accounts Bursar');
                setPayBankName('');
                setPayChequeNo('');
                setPayNotes('');
                setIsPaymentModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Record Fee Payment</span>
            </button>
          </div>

          {/* Payment Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Receipt / Student / Ref..."
                value={paySearch}
                onChange={e => setPaySearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <select
                value={payMethodFilter}
                onChange={e => setPayMethodFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="M-PESA">M-PESA</option>
                <option value="BANK_TRANSFER">Bank Direct Deposit</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="CASH">Cash Office</option>
                <option value="CARD">Card / POS</option>
              </select>
            </div>

            <div>
              <select
                value={payGradeFilter}
                onChange={e => setPayGradeFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Grades / Classes</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="date"
                placeholder="From Date"
                value={payDateFrom}
                onChange={e => setPayDateFrom(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <input
                type="date"
                placeholder="To Date"
                value={payDateTo}
                onChange={e => setPayDateTo(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Adm No / Class</th>
                  <th className="p-3">Channel & Ref</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Received By</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      No payment receipts match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-700">{p.receiptNo}</td>
                      <td className="p-3 font-mono text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.studentName}</td>
                      <td className="p-3">
                        <div className="font-mono text-slate-800">{p.admissionNo}</div>
                        <div className="text-[10px] text-slate-400">{p.gradeName || p.className || p.programName || 'Enrolled'}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                        <div className="font-mono text-[10px] text-slate-500">{p.referenceNo}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                        {currencySymbol} {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500">{p.receivedBy}</td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => setViewingReceipt(p)}
                            title="Print Official Slip Receipt"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openUniversalReceipt(p)}
                            title="Thermal POS Print"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPayment(p);
                              setPayStudentId(p.studentId);
                              setPayInvoiceId(p.invoiceId || '');
                              setPayAmount(p.amount.toString());
                              setPayMethod(p.paymentMethod);
                              setPayRef(p.referenceNo);
                              setPayReceivedBy(p.receivedBy);
                              setPayBankName(p.bankName || '');
                              setPayChequeNo(p.chequeNo || '');
                              setPayNotes(p.notes || '');
                              setIsPaymentModalOpen(true);
                            }}
                            title="Edit Payment"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletePaymentCandidate(p)}
                            title="Delete / Reverse Payment"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INVOICES                                                          */}
      {/* ========================================================================= */}
      {subTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Invoices & Term Billing</h3>
              <p className="text-xs text-slate-500">Official tuition invoices, debits, and demand notices.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSubTab('monthly_automation')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Monthly Auto-Billing</span>
              </button>
              <button
                onClick={() => {
                  setBatchTargetType('GRADE');
                  setBatchTargetId(grades[0]?.id || '');
                  setBatchStructureId(feeStructures[0]?.id || '');
                  setIsBatchInvoiceModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Batch Invoice Cohort</span>
              </button>
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setInvStudentId(students[0]?.id || '');
                  setInvItems([
                    { description: 'Tuition Fee', amount: 20000 },
                    { description: 'Activity & Co-Curricular', amount: 2500 }
                  ]);
                  setInvDiscount('0');
                  setInvDiscountReason('');
                  setInvNotes('');
                  setIsInvoiceModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Student Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoice Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Invoice / Student..."
                value={invSearch}
                onChange={e => setInvSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <select
                value={invStatusFilter}
                onChange={e => setInvStatusFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">PAID (Settled)</option>
                <option value="PARTIAL">PARTIAL (Partially Paid)</option>
                <option value="UNPAID">UNPAID (Pending)</option>
                <option value="OVERDUE">OVERDUE (Past Due Date)</option>
              </select>
            </div>

            <div>
              <select
                value={invGradeFilter}
                onChange={e => setInvGradeFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Grades / Programs</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={invTermFilter}
                onChange={e => setInvTermFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Academic Terms</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>

            <div>
              <select
                value={invYearFilter}
                onChange={e => setInvYearFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
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
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400">
                      No student invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{inv.studentName}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {inv.admissionNo} • {inv.gradeName || inv.className || inv.programName || 'Enrolled'}
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{inv.academicTerm || inv.term}</div>
                        <div className="font-mono text-[10px] text-slate-400">{inv.academicYear}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{inv.dueDate}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {currencySymbol} {Number(inv.totalAmount).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">
                        {currencySymbol} {Number(inv.amountPaid).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-600">
                        {currencySymbol} {Number(inv.balance).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'PARTIAL'
                            ? 'bg-blue-100 text-blue-800'
                            : inv.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            title="Print / View Invoice"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingInvoice(inv);
                              setInvStudentId(inv.studentId);
                              setInvAcademicYear(inv.academicYear);
                              setInvTerm(inv.academicTerm || inv.term || 'Term 1');
                              setInvDueDate(inv.dueDate);
                              setInvIssueDate(inv.issueDate);
                              setInvItems(inv.items || [{ description: 'Tuition Fee', amount: inv.totalAmount }]);
                              setInvDiscount((inv.discountAmount || 0).toString());
                              setInvDiscountReason(inv.discountReason || '');
                              setInvNotes(inv.notes || '');
                              setIsInvoiceModalOpen(true);
                            }}
                            title="Edit Invoice"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteInvoiceCandidate(inv)}
                            title="Delete Invoice"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FEE STRUCTURE TEMPLATES                                           */}
      {/* ========================================================================= */}
      {subTab === 'structures' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Standard Fee Structure Tariffs</h3>
              <p className="text-xs text-slate-500">Official fee tariffs configured by Grade, Stream, or Program cohort.</p>
            </div>

            <button
              onClick={() => {
                setEditingStructure(null);
                setFsName('');
                setFsTargetType('GRADE');
                setFsTargetId(grades[0]?.id || '');
                setFsAcademicYear('2025/2026');
                setFsTerm('Term 1');
                setFsItems([
                  { name: 'Tuition Fee', amount: 20000, isMandatory: true },
                  { name: 'Exam & Assessment', amount: 2500, isMandatory: true },
                  { name: 'Library & Learning Materials', amount: 1500, isMandatory: false },
                  { name: 'Activity & Co-Curricular', amount: 2000, isMandatory: false }
                ]);
                setFsDescription('');
                setIsStructureModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Fee Structure</span>
            </button>
          </div>

          {/* Fee Structure Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Fee Structure..."
                value={fsSearch}
                onChange={e => setFsSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <select
                value={fsGradeFilter}
                onChange={e => setFsGradeFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Grades / Programs</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={fsTermFilter}
                onChange={e => setFsTermFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Terms</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>

            <div>
              <select
                value={fsYearFilter}
                onChange={e => setFsYearFilter(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeeStructures.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-sm">No fee structure templates found.</p>
                <p className="text-xs text-slate-400 mt-0.5">Click "Create Fee Structure" to build standardized fee schedules or adjust search filters.</p>
              </div>
            ) : (
              filteredFeeStructures.map(fs => (
                <div key={fs.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{fs.name || fs.programName || fs.gradeName}</span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {fs.gradeName || fs.programName || fs.className || 'General All-Institution'} • {fs.academicYear}
                        </span>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                          {fs.academicTerm || fs.term}
                        </span>
                        {(fs.isMonthlyRecurring || fs.billingFrequency === 'MONTHLY') && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[9px] flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span>Monthly (Day {fs.billingDayOfMonth || 1})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 py-3 my-2 border-y border-slate-200 text-xs">
                      {fs.items && fs.items.length > 0 ? (
                        fs.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600">
                            <span className="truncate pr-2">
                              {it.feeType || it.name}
                              {it.isMandatory === false && <span className="text-[10px] text-slate-400 ml-1">(Optional)</span>}
                            </span>
                            <span className="font-mono font-bold text-slate-800 shrink-0">
                              {currencySymbol} {Number(it.amount).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex justify-between text-slate-600">
                            <span>Tuition Fee</span>
                            <span className="font-mono font-bold">{currencySymbol} {(fs.tuitionFee || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Exam Assessment</span>
                            <span className="font-mono font-bold">{currencySymbol} {(fs.examFee || 0).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {fs.description && (
                      <p className="text-[11px] text-slate-500 italic pb-2">{fs.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-xs text-slate-900">Total Standard Tariff:</span>
                      <span className="font-mono font-bold text-base text-blue-700">
                        {currencySymbol} {Number(fs.totalFee).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setBatchTargetType(fs.gradeId ? 'GRADE' : fs.programId ? 'PROGRAM' : 'ALL');
                        setBatchTargetId(fs.gradeId || fs.programId || fs.classId || '');
                        setBatchStructureId(fs.id);
                        setBatchTerm(fs.academicTerm || fs.term || 'Term 1');
                        setBatchAcademicYear(fs.academicYear || '2025/2026');
                        setIsBatchInvoiceModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Apply Cohort</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingStructure(fs);
                          setFsName(fs.name || '');
                          setFsTargetType(fs.targetType || (fs.gradeId ? 'GRADE' : fs.programId ? 'PROGRAM' : fs.classId ? 'CLASS' : 'ALL'));
                          setFsTargetId(fs.gradeId || fs.programId || fs.classId || '');
                          setFsAcademicYear(fs.academicYear || '2025/2026');
                          setFsTerm(fs.academicTerm || fs.term || 'Term 1');
                          setFsBillingFrequency(fs.billingFrequency || (fs.isMonthlyRecurring ? 'MONTHLY' : 'TERM'));
                          setFsBillingDayOfMonth(String(fs.billingDayOfMonth || 1));
                          setFsIsMonthlyRecurring(fs.isMonthlyRecurring || fs.billingFrequency === 'MONTHLY');
                          setFsItems(fs.items?.map(i => ({ name: i.feeType || i.name || 'Fee', amount: i.amount, isMandatory: i.isMandatory !== false })) || [
                            { name: 'Tuition Fee', amount: fs.tuitionFee || 0, isMandatory: true }
                          ]);
                          setFsDescription(fs.description || '');
                          setIsStructureModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                        title="Edit Fee Structure"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingStructure(null);
                          setFsName(`${fs.name || fs.gradeName || 'Tariff'} (Copy)`);
                          setFsTargetType(fs.targetType || (fs.gradeId ? 'GRADE' : fs.programId ? 'PROGRAM' : 'ALL'));
                          setFsTargetId(fs.gradeId || fs.programId || fs.classId || '');
                          setFsAcademicYear(fs.academicYear || '2025/2026');
                          setFsTerm(fs.academicTerm || fs.term || 'Term 1');
                          setFsBillingFrequency(fs.billingFrequency || (fs.isMonthlyRecurring ? 'MONTHLY' : 'TERM'));
                          setFsBillingDayOfMonth(String(fs.billingDayOfMonth || 1));
                          setFsIsMonthlyRecurring(fs.isMonthlyRecurring || fs.billingFrequency === 'MONTHLY');
                          setFsItems(fs.items?.map(i => ({ name: i.feeType || i.name || 'Fee', amount: i.amount, isMandatory: i.isMandatory !== false })) || [
                            { name: 'Tuition Fee', amount: fs.tuitionFee || 0, isMandatory: true }
                          ]);
                          setFsDescription(fs.description || '');
                          setIsStructureModalOpen(true);
                        }}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                        title="Duplicate Structure"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteStructureCandidate(fs)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                        title="Delete Fee Structure"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT FEE STATEMENTS                                            */}
      {/* ========================================================================= */}
      {subTab === 'statements' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Individual Student Fee Statements</h3>
              <p className="text-xs text-slate-500">Comprehensive debit and credit chronological transaction ledger.</p>
            </div>

            {studentStatement && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Statement</span>
              </button>
            )}
          </div>

          {/* Student Selector Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="text-xs font-bold text-slate-700">Select Enrolled Student to View Statement</label>
            <select
              value={statementStudentId}
              onChange={e => {
                setStatementStudentId(e.target.value);
                fetchStudentStatement(e.target.value);
              }}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNo}) — {s.gradeName || s.className || s.programName || 'Active'} — Outstanding Balance: {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Statement Content */}
          {statementLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading official statement ledger...
            </div>
          ) : studentStatement ? (
            <div className="space-y-4">
              {/* Student Statement Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-blue-50/60 border border-blue-200 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Total Invoiced:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {currencySymbol} {studentStatement.summary.totalInvoiced.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Payments:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {currencySymbol} {studentStatement.summary.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-amber-700 text-base">
                    {currencySymbol} {studentStatement.summary.currentBalance.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Account Status:</span>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded font-bold text-[11px] ${
                    studentStatement.summary.status === 'SETTLED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : studentStatement.summary.status === 'PARTIAL'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {studentStatement.summary.status}
                  </span>
                </div>
              </div>

              {/* Transaction Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Ref No</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Debit ({currencySymbol})</th>
                      <th className="p-3 text-right">Credit ({currencySymbol})</th>
                      <th className="p-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentStatement.entries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          No financial transactions recorded for this student account.
                        </td>
                      </tr>
                    ) : (
                      studentStatement.entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.type === 'INVOICE'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">{entry.referenceNo}</td>
                          <td className="p-3 text-slate-700">{entry.description}</td>
                          <td className="p-3 font-mono text-right text-slate-900">
                            {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                          </td>
                          <td className="p-3 font-mono text-right text-emerald-700 font-semibold">
                            {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                          </td>
                          <td className="p-3 font-mono text-right font-bold text-slate-900">
                            {currencySymbol} {entry.runningBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SCHOOL FEES & FINANCIAL REPORTS (WITH PIE CHARTS)                   */}
      {/* ========================================================================= */}
      {subTab === 'reports' && (() => {
        const totalInv = reportSummary?.totalInvoiced ?? totalBilled;
        const totalCol = reportSummary?.totalCollected ?? totalCollected;
        const totalOut = reportSummary?.totalOutstanding ?? totalOutstanding;
        const colRate = reportSummary?.collectionRate ?? collectionPercentage;
        const fullyPaid = reportSummary?.statusBreakdown?.fullyPaidStudents ?? students.filter(s => (s.feeBalance || 0) <= 0).length;
        const partialPaid = reportSummary?.statusBreakdown?.partialPaidStudents ?? students.filter(s => (s.feeBalance || 0) > 0 && payments.some(p => p.studentId === s.id)).length;
        const zeroPaid = reportSummary?.statusBreakdown?.zeroPaidStudents ?? students.filter(s => (s.feeBalance || 0) > 0 && !payments.some(p => p.studentId === s.id)).length;

        // Pie Chart 1: Revenue Collection & Outstanding Arrears
        const revenueSlices = [
          {
            label: 'Fees Collected',
            value: totalCol,
            color: '#10B981',
            sublabel: `${payments.length} receipts processed`
          },
          {
            label: 'Outstanding Balances',
            value: totalOut,
            color: '#EF4444',
            sublabel: `${students.filter(s => (s.feeBalance || 0) > 0).length} student balances`
          }
        ];
        if (reportSummary?.totalDiscounts > 0) {
          revenueSlices.push({
            label: 'Waivers / Discounts',
            value: reportSummary.totalDiscounts,
            color: '#F59E0B',
            sublabel: 'Granted fee concessions'
          });
        }

        // Pie Chart 2: Payment Methods Allocation
        const pmBreakdown = reportSummary?.paymentMethodBreakdown || {
          'M-PESA': payments.filter(p => p.paymentMethod === 'M-PESA').reduce((s, p) => s + p.amount, 0),
          'BANK_TRANSFER': payments.filter(p => p.paymentMethod === 'BANK_TRANSFER').reduce((s, p) => s + p.amount, 0),
          'CASH': payments.filter(p => p.paymentMethod === 'CASH').reduce((s, p) => s + p.amount, 0),
          'CHEQUE': payments.filter(p => p.paymentMethod === 'CHEQUE').reduce((s, p) => s + p.amount, 0),
          'CARD': payments.filter(p => p.paymentMethod === 'CARD').reduce((s, p) => s + p.amount, 0)
        };

        const paymentMethodSlices = [
          { label: 'M-PESA Express', value: pmBreakdown['M-PESA'] || 0, color: '#10B981', sublabel: 'Mobile Money' },
          { label: 'Bank Transfer', value: pmBreakdown['BANK_TRANSFER'] || 0, color: '#3B82F6', sublabel: 'Direct EFT/RTGS' },
          { label: 'Cash at Bursary', value: pmBreakdown['CASH'] || 0, color: '#8B5CF6', sublabel: 'Direct Cash' },
          { label: 'Cheque Deposit', value: pmBreakdown['CHEQUE'] || 0, color: '#F59E0B', sublabel: 'Bank Cheque' },
          { label: 'Credit/Debit Card', value: pmBreakdown['CARD'] || 0, color: '#EC4899', sublabel: 'POS Card' }
        ].filter(s => s.value > 0);

        // Pie Chart 3: Student Settlement Status Distribution
        const settlementSlices = [
          { label: 'Fully Cleared', value: fullyPaid, color: '#10B981', sublabel: 'Zero Balance' },
          { label: 'Partial Installment', value: partialPaid, color: '#3B82F6', sublabel: 'Paying in tranches' },
          { label: 'In Severe Arrears', value: zeroPaid, color: '#EF4444', sublabel: 'Zero payment received' }
        ];

        // All student fee records with search & status filters
        const allStudentsList = (reportSummary?.allStudentReports || students.map(s => {
          const bal = Number(s.feeBalance) || 0;
          const sPayments = payments.filter(p => p.studentId === s.id);
          const sInvoices = invoices.filter(i => i.studentId === s.id);
          const sPaidSum = sPayments.reduce((sum, p) => sum + p.amount, 0);
          const sInvoicedSum = sInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0) || (sPaidSum + bal);
          const status: 'SETTLED' | 'PARTIAL' | 'ARREARS' = bal <= 0 ? 'SETTLED' : (sPaidSum > 0 ? 'PARTIAL' : 'ARREARS');
          const lastP = sPayments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];
          return {
            studentId: s.id,
            studentName: s.fullName,
            admissionNo: s.admissionNo,
            gradeId: s.gradeId,
            gradeName: s.gradeName || s.className || s.programName || 'General',
            streamName: s.streamName || '',
            className: s.className || '',
            programName: s.programName || '',
            guardianName: s.guardianName || '',
            guardianPhone: s.guardianPhone || '',
            totalInvoiced: sInvoicedSum,
            totalPaid: sPaidSum,
            feeBalance: bal,
            status,
            lastPaymentDate: lastP?.paidAt || null,
            lastPaymentAmount: lastP?.amount || null,
            lastPaymentMethod: lastP?.paymentMethod || null,
            lastReceiptNo: lastP?.receiptNo || null
          };
        })).filter((st: any) => {
          if (reportSearch) {
            const q = reportSearch.toLowerCase();
            const matches = (
              st.studentName?.toLowerCase().includes(q) ||
              st.admissionNo?.toLowerCase().includes(q) ||
              st.gradeName?.toLowerCase().includes(q) ||
              st.guardianName?.toLowerCase().includes(q) ||
              st.guardianPhone?.toLowerCase().includes(q)
            );
            if (!matches) return false;
          }
          if (reportStatusFilter !== 'ALL' && st.status !== reportStatusFilter) return false;
          if (reportGradeFilter !== 'ALL' && st.gradeId !== reportGradeFilter) return false;
          return true;
        });

        // Cohort breakdown
        const cohorts = reportSummary?.cohortBreakdown || [];

        return (
          <div className="space-y-6">
            
            {/* Top Control Bar with Filters & Action Buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                      <PieChart className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      School Fees & Financial Performance Report
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time visual revenue analytics, payment distribution pie charts, and complete student fee balances register.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Report</span>
                  </button>

                  <button
                    onClick={() => {
                      const csvRows = [
                        ['Admission No', 'Student Name', 'Grade/Stream', 'Class', 'Total Invoiced', 'Fees Paid', 'Fee Balance', 'Status', 'Last Payment Date', 'Guardian Name', 'Guardian Phone'],
                        ...allStudentsList.map((st: any) => [
                          `"${st.admissionNo || ''}"`,
                          `"${st.studentName || ''}"`,
                          `"${st.gradeName || ''}"`,
                          `"${st.className || ''}"`,
                          st.totalInvoiced || 0,
                          st.totalPaid || 0,
                          st.feeBalance || 0,
                          `"${st.status || ''}"`,
                          `"${st.lastPaymentDate ? new Date(st.lastPaymentDate).toLocaleDateString() : 'None'}"`,
                          `"${st.guardianName || ''}"`,
                          `"${st.guardianPhone || ''}"`
                        ])
                      ];
                      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `School_Fees_Report_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={fetchReports}
                    disabled={reportLoading}
                    title="Refresh Report Data"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filter controls row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Academic Year</label>
                  <select
                    value={reportYearFilter}
                    onChange={e => setReportYearFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Academic Years</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Term / Semester</label>
                  <select
                    value={reportTermFilter}
                    onChange={e => setReportTermFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Terms</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Grade / Stream / Level</label>
                  <select
                    value={reportGradeFilter}
                    onChange={e => setReportGradeFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Grades & Cohorts</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Fee Settlement Status</label>
                  <select
                    value={reportStatusFilter}
                    onChange={e => setReportStatusFilter(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Statuses ({allStudentsList.length})</option>
                    <option value="SETTLED">Cleared / Fully Paid</option>
                    <option value="PARTIAL">Partial Payment (Installments)</option>
                    <option value="ARREARS">Zero Paid / Severe Arrears</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Summary Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Total Fees Invoiced</span>
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {currencySymbol} {totalInv.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 block">Total gross billed amount</span>
              </div>

              <div className="bg-white border border-emerald-200 bg-emerald-50/20 p-4 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                  <span>Fees Collected</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-800">
                  {currencySymbol} {totalCol.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium block">
                  {payments.length} verified receipts
                </span>
              </div>

              <div className="bg-white border border-rose-200 bg-rose-50/20 p-4 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
                  <span>Outstanding Arrears</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xl font-bold font-mono text-rose-800">
                  {currencySymbol} {totalOut.toLocaleString()}
                </div>
                <span className="text-[11px] text-rose-600 font-medium block">
                  {students.filter(s => (s.feeBalance || 0) > 0).length} student accounts
                </span>
              </div>

              <div className="bg-white border border-indigo-200 bg-indigo-50/20 p-4 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center justify-between text-indigo-700 text-xs font-semibold">
                  <span>Collection Efficiency</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold font-mono text-indigo-900">
                  {colRate}%
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, colRate)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* VISUAL PIE CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Pie Chart Card 1: Revenue Allocation & Clearance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        Revenue Realization & Collection Pie Chart
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {colRate}% Collected
                    </span>
                  </div>

                  <FeesPieChart
                    data={revenueSlices}
                    currencySymbol={currencySymbol}
                    centerLabel={`${colRate}%`}
                    centerSublabel="Collected"
                    size={190}
                    donutWidth={38}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Realized</span>
                    <span className="font-bold font-mono text-sm">{currencySymbol} {totalCol.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800">
                    <span className="text-[10px] uppercase font-bold text-rose-600 block">Total Unpaid</span>
                    <span className="font-bold font-mono text-sm">{currencySymbol} {totalOut.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart Card 2: Student Settlement Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        Student Fee Clearance Distribution
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {students.length} Total Cohort
                    </span>
                  </div>

                  <FeesPieChart
                    data={settlementSlices}
                    currencySymbol=""
                    centerLabel={`${fullyPaid}`}
                    centerSublabel="Cleared"
                    size={190}
                    donutWidth={38}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Cleared</span>
                    <span className="font-bold font-mono text-sm">{fullyPaid}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-800">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Partial</span>
                    <span className="font-bold font-mono text-sm">{partialPaid}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800">
                    <span className="text-[10px] uppercase font-bold text-rose-600 block">Severe Arrears</span>
                    <span className="font-bold font-mono text-sm">{zeroPaid}</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart Card 3: Payment Methods Allocation */}
              {paymentMethodSlices.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          Payment Channels & Gateways Pie Chart
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 font-mono">
                        {paymentMethodSlices.length} Methods
                      </span>
                    </div>

                    <FeesPieChart
                      data={paymentMethodSlices}
                      currencySymbol={currencySymbol}
                      centerLabel={`${paymentMethodSlices.length}`}
                      centerSublabel="Channels"
                      size={180}
                      donutWidth={36}
                    />
                  </div>
                </div>
              )}

              {/* Fee Categories / Allocation Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        Fee Component Tariff Breakdown
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      Line Items
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {reportSummary?.feeCategoryBreakdown ? (
                      Object.entries(reportSummary.feeCategoryBreakdown as Record<string, { invoiced: number; count: number }>)
                        .filter(([_, val]) => val.invoiced > 0)
                        .map(([category, val]) => {
                          const pct = totalInv > 0 ? Math.round((val.invoiced / totalInv) * 100) : 0;
                          return (
                            <div key={category} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-800 block">{category}</span>
                                <span className="text-[10px] text-slate-400">{val.count} invoice components</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold font-mono text-slate-900 block">
                                  {currencySymbol} {val.invoiced.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {pct}% share
                                </span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        Category breakdown will appear as invoices are billed.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Cohort / Grade Level Performance Table */}
            {cohorts.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Fee Collection Efficiency by Grade & Cohort
                    </h4>
                    <p className="text-xs text-slate-500">Comparative revenue breakdown per class / stream level.</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="p-3">Grade / Cohort</th>
                        <th className="p-3 text-center">Headcount</th>
                        <th className="p-3 text-right">Total Invoiced</th>
                        <th className="p-3 text-right">Total Collected</th>
                        <th className="p-3 text-right">Outstanding Arrears</th>
                        <th className="p-3 text-center">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {cohorts.map((c: any) => (
                        <tr key={c.name} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{c.name}</td>
                          <td className="p-3 text-center font-mono">{c.studentCount}</td>
                          <td className="p-3 text-right font-mono">{currencySymbol} {c.totalInvoiced.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">{currencySymbol} {c.totalCollected.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-700">{currencySymbol} {c.totalBalance.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              c.collectionRate >= 80 ? 'bg-emerald-100 text-emerald-800' : (c.collectionRate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                            }`}>
                              {c.collectionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Full Student School Fees & Balances Register */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Master Student School Fees & Balances Register ({allStudentsList.length} Students)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Comprehensive student-by-student ledger showing invoiced debits, total fees paid, live balances, and quick actions.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, adm no, grade..."
                    value={reportSearch}
                    onChange={e => setReportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {reportSearch && (
                    <button onClick={() => setReportSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Adm No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Grade / Stream</th>
                      <th className="p-3 text-right">Invoiced</th>
                      <th className="p-3 text-right">Fees Paid</th>
                      <th className="p-3 text-right">Live Balance</th>
                      <th className="p-3 text-center">Settlement</th>
                      <th className="p-3">Last Payment</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {allStudentsList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-10 text-slate-400">
                          No student fee records found matching the active filters.
                        </td>
                      </tr>
                    ) : (
                      allStudentsList.map((st: any) => (
                        <tr key={st.studentId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-700">{st.admissionNo}</td>
                          <td className="p-3 font-bold text-slate-900">{st.studentName}</td>
                          <td className="p-3 text-slate-600">{st.gradeName}</td>
                          <td className="p-3 text-right font-mono">{currencySymbol} {(st.totalInvoiced || 0).toLocaleString()}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">
                            {currencySymbol} {(st.totalPaid || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold">
                            <span className={st.feeBalance > 0 ? 'text-rose-700' : 'text-slate-400'}>
                              {currencySymbol} {(st.feeBalance || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              st.status === 'SETTLED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : (st.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800')
                            }`}>
                              {st.status === 'SETTLED' ? 'Cleared' : (st.status === 'PARTIAL' ? 'Partial' : 'Arrears')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {st.lastPaymentDate ? (
                              <div>
                                <span className="font-bold text-slate-700">{new Date(st.lastPaymentDate).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-400 block">{currencySymbol} {(st.lastPaymentAmount || 0).toLocaleString()} ({st.lastPaymentMethod || 'Paid'})</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => {
                                  setStatementStudentId(st.studentId);
                                  setSubTab('statements');
                                }}
                                title="View Complete Fee Statement Ledger"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <FileCheck className="w-3 h-3 text-slate-500" />
                                <span>Statement</span>
                              </button>

                              {st.feeBalance > 0 && (
                                <>
                                  <button
                                    onClick={() => {
                                      const text = `Dear Parent, please note that ${st.studentName} (${st.admissionNo}) has an outstanding school fee balance of ${currencySymbol} ${(st.feeBalance || 0).toLocaleString()}. Kindly settle promptly via our official accounts. Thank you.`;
                                      navigator.clipboard.writeText(text);
                                      setSuccessMsg(`Reminder notice copied to clipboard for ${st.studentName}!`);
                                      setTimeout(() => setSuccessMsg(''), 4000);
                                    }}
                                    title="Copy Reminder Notice / SMS"
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>SMS</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setPayStudentId(st.studentId);
                                      setPayInvoiceId('');
                                      setPayAmount(Math.min(st.feeBalance, 10000).toString());
                                      setPayRef(`TXN${Math.floor(100000 + Math.random() * 900000)}`);
                                      setIsPaymentModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                                  >
                                    Pay
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB 6: MONTHLY AUTOMATION & RECURRING BILLING ENGINE                       */}
      {/* ========================================================================= */}
      {subTab === 'monthly_automation' && (
        <MonthlyFeesAutomation
          currencySymbol={currencySymbol}
          grades={grades}
          classes={classes}
          programs={programs}
          feeStructures={feeStructures}
          students={students}
          onInvoicesGenerated={() => {
            fetchData();
          }}
          onNavigateToInvoices={(monthFilter) => {
            if (monthFilter) {
              setInvSearch(monthFilter);
            }
            setSubTab('invoices');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD / EDIT PAYMENT                                             */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form onSubmit={handleSavePayment} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPayment ? 'Edit Fee Payment Receipt' : 'Record Official Fee Payment'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setEditingPayment(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-semibold text-slate-700">Select Student *</label>
                <select
                  value={payStudentId}
                  onChange={e => setPayStudentId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo}) — Current Balance: {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Balance Pill */}
              {selectedPaymentStudent && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-amber-800 font-semibold block">Outstanding Student Balance</span>
                    <span className="text-slate-600 text-[11px]">
                      {selectedPaymentStudent.gradeName || selectedPaymentStudent.className || selectedPaymentStudent.programName || 'Active'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-900 text-sm">
                    {currencySymbol} {(selectedPaymentStudent.feeBalance || 0).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Link to specific invoice if exists */}
              {studentUnpaidInvoices.length > 0 && (
                <div>
                  <label className="font-semibold text-slate-700">Allocate to Specific Invoice (Optional)</label>
                  <select
                    value={payInvoiceId}
                    onChange={e => setPayInvoiceId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">Auto Allocate (FIFO Across Outstanding Invoices)</option>
                    {studentUnpaidInvoices.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNo} ({i.academicTerm}) — Total: {currencySymbol} {i.totalAmount} (Due: {currencySymbol} {i.balance})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                    <option value="BANK_TRANSFER">Bank Direct Deposit / EFT</option>
                    <option value="CHEQUE">Banker's Cheque</option>
                    <option value="CASH">Cash at Accounts Office</option>
                    <option value="CARD">Card / POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Transaction Reference No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QKH9201481 / Slip No"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Bank Name (If applicable)</label>
                  <input
                    type="text"
                    placeholder="e.g. Equity Bank, KCB"
                    value={payBankName}
                    onChange={e => setPayBankName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Cheque No (If cheque)</label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ004921"
                    value={payChequeNo}
                    onChange={e => setPayChequeNo(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Receiving Bursar / Cashier</label>
                <input
                  type="text"
                  value={payReceivedBy}
                  onChange={e => setPayReceivedBy(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Remarks / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Term 1 installment payment"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setEditingPayment(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                {submitting ? 'Processing...' : editingPayment ? 'Update Receipt' : 'Confirm Payment & Issue Receipt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE OFFICIAL FEE RECEIPT                                     */}
      {/* ========================================================================= */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs print:p-0 print:border-none print:shadow-none">
            {/* Header letterhead */}
            <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
              <h2 className="font-black text-slate-900 text-lg uppercase tracking-wider">Davetech Academy & Institutions</h2>
              <p className="text-[11px] text-slate-500">Directorate of Finance & Student Accounts • Official Receipt</p>
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-full font-mono text-xs font-bold text-slate-800 mt-1">
                RECEIPT NO: {viewingReceipt.receiptNo}
              </div>
            </div>

            <div className="space-y-2 py-2 text-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Full Name:</span>
                <strong className="text-slate-900">{viewingReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Admission Number:</span>
                <strong className="text-slate-900">{viewingReceipt.admissionNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grade / Stream / Program:</span>
                <span className="text-slate-800 font-semibold">
                  {viewingReceipt.gradeName || viewingReceipt.className || viewingReceipt.programName || 'Active Student'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Date:</span>
                <span className="font-mono text-slate-800">{new Date(viewingReceipt.paidAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-bold text-slate-900">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Reference / M-Pesa Code:</span>
                <strong className="text-slate-900">{viewingReceipt.referenceNo}</strong>
              </div>

              {/* Amount Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 my-2">
                <div className="flex justify-between text-base font-bold text-emerald-800">
                  <span>AMOUNT PAID:</span>
                  <span className="font-mono">{currencySymbol} {Number(viewingReceipt.amount).toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-emerald-900 font-medium italic">
                  Amount in words: {numberToWords(Number(viewingReceipt.amount))}
                </div>
              </div>

              <div className="flex justify-between text-slate-700 font-mono">
                <span className="text-slate-500">Outstanding Balance After Payment:</span>
                <span className="font-bold text-amber-700">
                  {currencySymbol} {(viewingReceipt.balanceAfterPayment !== undefined ? viewingReceipt.balanceAfterPayment : 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <span>Received By: <strong>{viewingReceipt.receivedBy}</strong></span>
                <span>Authorized Official Stamp</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINGLE STUDENT INVOICE                                            */}
      {/* ========================================================================= */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form onSubmit={handleSaveInvoice} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingInvoice ? 'Edit Student Invoice' : 'Generate Student Term Invoice'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsInvoiceModalOpen(false);
                  setEditingInvoice(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-semibold text-slate-700">Select Student *</label>
                <select
                  value={invStudentId}
                  onChange={e => setInvStudentId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo}) — {s.gradeName || s.className || s.programName || 'Enrolled'}
                    </option>
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
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Academic Term</label>
                  <select
                    value={invTerm}
                    onChange={e => setInvTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Issue Date</label>
                  <input
                    type="date"
                    value={invIssueDate}
                    onChange={e => setInvIssueDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Payment Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={e => setInvDueDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Fee Breakdown Items</label>
                  <button
                    type="button"
                    onClick={() => setInvItems([...invItems, { description: '', amount: 0 }])}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {invItems.map((it, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Fee Item (e.g. Tuition, Transport)"
                      value={it.description}
                      onChange={e => {
                        const next = [...invItems];
                        next[idx].description = e.target.value;
                        setInvItems(next);
                      }}
                      className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={it.amount || ''}
                      onChange={e => {
                        const next = [...invItems];
                        next[idx].amount = Number(e.target.value) || 0;
                        setInvItems(next);
                      }}
                      className="w-28 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                    {invItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Discount / Bursary Waiver */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700">Scholarship / Bursary Discount ({currencySymbol})</label>
                  <input
                    type="number"
                    value={invDiscount}
                    onChange={e => setInvDiscount(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Waiver Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Academic Merit / Sibling"
                    value={invDiscountReason}
                    onChange={e => setInvDiscountReason(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Net Invoice Total:</span>
                <span className="font-mono text-sm text-blue-700">
                  {currencySymbol} {Math.max(0, invItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0) - (Number(invDiscount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsInvoiceModalOpen(false);
                  setEditingInvoice(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                {submitting ? 'Posting...' : editingInvoice ? 'Update Invoice' : 'Issue Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH INVOICE COHORT                                              */}
      {/* ========================================================================= */}
      {isBatchInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form onSubmit={handleBatchGenerateInvoices} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Batch Generate Invoices for Cohort</h3>
              <button type="button" onClick={() => setIsBatchInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-500 text-[11px]">
              Instantly creates and posts individualized fee invoices to all active students in the selected grade, stream, or program.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Target Cohort Type</label>
                  <select
                    value={batchTargetType}
                    onChange={e => {
                      const t = e.target.value as any;
                      setBatchTargetType(t);
                      if (t === 'GRADE') setBatchTargetId(grades[0]?.id || '');
                      else if (t === 'STREAM') setBatchTargetId(streams[0]?.id || '');
                      else if (t === 'CLASS') setBatchTargetId(classes[0]?.id || '');
                      else if (t === 'PROGRAM') setBatchTargetId(programs[0]?.id || '');
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="GRADE">School Grade (Basic/Primary)</option>
                    <option value="STREAM">Grade Stream</option>
                    <option value="CLASS">School Class</option>
                    <option value="PROGRAM">Academic Program (Higher Ed)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Select Specific Group</label>
                  <select
                    value={batchTargetId}
                    onChange={e => setBatchTargetId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    {batchTargetType === 'GRADE' && grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                    {batchTargetType === 'STREAM' && streams.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.gradeName})</option>
                    ))}
                    {batchTargetType === 'CLASS' && classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {batchTargetType === 'PROGRAM' && programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Apply Fee Structure Template</label>
                <select
                  value={batchStructureId}
                  onChange={e => setBatchStructureId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="">Default Standard Flat Fee (KSh 25,000)</option>
                  {feeStructures.map(fs => (
                    <option key={fs.id} value={fs.id}>
                      {fs.name || fs.programName || fs.gradeName} — Total: {currencySymbol} {fs.totalFee.toLocaleString()}
                    </option>
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
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Academic Term</label>
                  <select
                    value={batchTerm}
                    onChange={e => setBatchTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Payment Due Date</label>
                <input
                  type="date"
                  value={batchDueDate}
                  onChange={e => setBatchDueDate(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBatchInvoiceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                {submitting ? 'Generating...' : 'Run Batch Generation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FEE STRUCTURE TARIFF                                              */}
      {/* ========================================================================= */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form onSubmit={handleSaveFeeStructure} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStructure ? 'Edit Fee Structure Tariff' : 'Create Fee Structure Tariff'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsStructureModalOpen(false);
                  setEditingStructure(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-semibold text-slate-700">Fee Structure Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 4 Term 1 2026 Tariff"
                  value={fsName}
                  onChange={e => setFsName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Target Type</label>
                  <select
                    value={fsTargetType}
                    onChange={e => {
                      const t = e.target.value as any;
                      setFsTargetType(t);
                      if (t === 'GRADE') setFsTargetId(grades[0]?.id || '');
                      else if (t === 'PROGRAM') setFsTargetId(programs[0]?.id || '');
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="GRADE">Academic Level (Playgroup → Grade 9)</option>
                    <option value="PROGRAM">Academic Program (College / Higher)</option>
                    <option value="ALL">All General Students</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Target Cohort</label>
                  <select
                    value={fsTargetId}
                    onChange={e => setFsTargetId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {fsTargetType === 'GRADE' && grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                    {fsTargetType === 'PROGRAM' && programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    {fsTargetType === 'ALL' && <option value="">All Institution</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Academic Year</label>
                  <input
                    type="text"
                    value={fsAcademicYear}
                    onChange={e => setFsAcademicYear(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Academic Term</label>
                  <select
                    value={fsTerm}
                    onChange={e => setFsTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              {/* Billing Frequency & Recurring Automation Settings */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                    Billing Cycle / Frequency
                  </label>
                  <select
                    value={fsBillingFrequency}
                    onChange={e => {
                      const val = e.target.value as any;
                      setFsBillingFrequency(val);
                      if (val === 'MONTHLY') setFsIsMonthlyRecurring(true);
                    }}
                    className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="TERM">Termly / Per Semester</option>
                    <option value="MONTHLY">Monthly Recurring (Automated)</option>
                    <option value="ANNUAL">Annual / Per School Year</option>
                    <option value="ONE_OFF">One-Off / Ad-hoc Fee</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                    Billing Day of Month (1 - 28)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={fsBillingDayOfMonth}
                    onChange={e => setFsBillingDayOfMonth(e.target.value)}
                    disabled={fsBillingFrequency !== 'MONTHLY'}
                    className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="fsIsMonthly"
                    checked={fsIsMonthlyRecurring || fsBillingFrequency === 'MONTHLY'}
                    onChange={e => {
                      setFsIsMonthlyRecurring(e.target.checked);
                      if (e.target.checked) setFsBillingFrequency('MONTHLY');
                    }}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="fsIsMonthly" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Enable for Monthly Automated Invoicing Engine
                  </label>
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Tariff Breakdown Items</label>
                  <button
                    type="button"
                    onClick={() => setFsItems([...fsItems, { name: '', amount: 0, isMandatory: true }])}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {fsItems.map((it, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Tuition, Transport, Lab"
                      value={it.name}
                      onChange={e => {
                        const next = [...fsItems];
                        next[idx].name = e.target.value;
                        setFsItems(next);
                      }}
                      className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={it.amount || ''}
                      onChange={e => {
                        const next = [...fsItems];
                        next[idx].amount = Number(e.target.value) || 0;
                        setFsItems(next);
                      }}
                      className="w-28 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                    <label className="flex items-center space-x-1 cursor-pointer text-slate-600 shrink-0 text-[11px]" title="Is this fee mandatory for all students?">
                      <input
                        type="checkbox"
                        checked={it.isMandatory !== false}
                        onChange={e => {
                          const next = [...fsItems];
                          next[idx].isMandatory = e.target.checked;
                          setFsItems(next);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="hidden sm:inline">Req</span>
                    </label>
                    {fsItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFsItems(fsItems.filter((_, i) => i !== idx))}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Description / Notes */}
              <div>
                <label className="font-semibold text-slate-700">Description / Fee Policy Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Applicable to all day and boarding students for Term 1. Includes examination and lunch charges."
                  value={fsDescription}
                  onChange={e => setFsDescription(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between font-bold text-slate-900">
                <span>Calculated Term Total:</span>
                <span className="font-mono text-sm text-blue-700">
                  {currencySymbol} {fsItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsStructureModalOpen(false);
                  setEditingStructure(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                {submitting ? 'Saving...' : editingStructure ? 'Update Fee Structure' : 'Save Fee Structure'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW / PRINT INVOICE                                              */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs print:p-0 print:border-none print:shadow-none">
            <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
              <h2 className="font-black text-slate-900 text-lg uppercase tracking-wider">Davetech Academy & Institutions</h2>
              <p className="text-[11px] text-slate-500">Official Student Fee Invoice & Demand Note</p>
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded-full font-mono text-xs font-bold mt-1">
                INVOICE: {viewingInvoice.invoiceNo}
              </div>
            </div>

            <div className="space-y-2 py-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-slate-900">{viewingInvoice.studentName}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Admission No:</span>
                <strong className="text-slate-900">{viewingInvoice.admissionNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Term & Year:</span>
                <span className="font-semibold text-slate-800">
                  {viewingInvoice.academicTerm || viewingInvoice.term} ({viewingInvoice.academicYear})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-mono text-red-600 font-bold">{viewingInvoice.dueDate}</span>
              </div>

              {/* Line Items Table */}
              <div className="py-2 border-y border-slate-200 space-y-1.5 my-2">
                <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                  <span>Description</span>
                  <span>Amount ({currencySymbol})</span>
                </div>
                {viewingInvoice.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{it.description}</span>
                    <span className="font-mono font-semibold">{Number(it.amount).toLocaleString()}</span>
                  </div>
                ))}
                {(viewingInvoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                    <span>Less Waiver: {viewingInvoice.discountReason || 'Discount'}</span>
                    <span className="font-mono">- {viewingInvoice.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-1 font-mono">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Invoiced:</span>
                  <span>{currencySymbol} {Number(viewingInvoice.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Amount Paid:</span>
                  <span>{currencySymbol} {Number(viewingInvoice.amountPaid).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-700 text-base pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{currencySymbol} {Number(viewingInvoice.balance).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Details notice */}
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1 mt-2">
                <strong className="text-slate-900 block font-bold">Payment Instructions:</strong>
                <p>• M-PESA Paybill: <strong>247247</strong> • Account: <strong>{viewingInvoice.admissionNo}</strong></p>
                <p>• Bank Deposit: <strong>Equity Bank • A/C: 0123456789012</strong></p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODALS                                                */}
      {/* ========================================================================= */}
      {deletePaymentCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-red-600">Delete Payment Receipt?</h3>
            <p className="text-slate-600">
              Are you sure you want to reverse payment receipt <strong>{deletePaymentCandidate.receiptNo}</strong> of {currencySymbol} {deletePaymentCandidate.amount.toLocaleString()} for student <strong>{deletePaymentCandidate.studentName}</strong>?
            </p>
            <p className="text-[11px] text-slate-500">
              This will automatically restore the student's outstanding fee balance and revert any linked invoice.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setDeletePaymentCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePayment}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                {submitting ? 'Reversing...' : 'Yes, Delete & Reverse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteInvoiceCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-red-600">Delete Student Invoice?</h3>
            <p className="text-slate-600">
              Are you sure you want to delete invoice <strong>{deleteInvoiceCandidate.invoiceNo}</strong> of {currencySymbol} {deleteInvoiceCandidate.totalAmount.toLocaleString()} for <strong>{deleteInvoiceCandidate.studentName}</strong>?
            </p>
            <p className="text-[11px] text-slate-500">
              The invoice balance will be deducted from the student's fee account.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setDeleteInvoiceCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteStructureCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-red-600">Delete Fee Structure Tariff?</h3>
            <p className="text-slate-600">
              Are you sure you want to delete the fee structure tariff <strong>"{deleteStructureCandidate.name || deleteStructureCandidate.id}"</strong>?
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600 font-mono">
              <div className="flex justify-between">
                <span>Target Cohort:</span>
                <strong className="text-slate-800">{deleteStructureCandidate.gradeName || deleteStructureCandidate.programName || deleteStructureCandidate.className || 'General'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Term / Year:</span>
                <strong className="text-slate-800">{deleteStructureCandidate.academicTerm || deleteStructureCandidate.term} ({deleteStructureCandidate.academicYear})</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Standard Fee:</span>
                <strong className="text-blue-700">{currencySymbol} {Number(deleteStructureCandidate.totalFee).toLocaleString()}</strong>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setDeleteStructureCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFeeStructure}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Structure'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable School Fees & Financial Report Modal */}
      <SchoolFeesReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={reportSummary || {
          totalInvoiced: totalBilled,
          totalCollected: totalCollected,
          totalOutstanding: totalOutstanding,
          collectionRate: collectionPercentage,
          invoicesCount: invoices.length,
          paymentsCount: payments.length,
          debtorsCount: students.filter(s => (s.feeBalance || 0) > 0).length,
          statusBreakdown: {
            fullyPaidStudents: students.filter(s => (s.feeBalance || 0) <= 0).length,
            partialPaidStudents: students.filter(s => (s.feeBalance || 0) > 0 && payments.some(p => p.studentId === s.id)).length,
            zeroPaidStudents: students.filter(s => (s.feeBalance || 0) > 0 && !payments.some(p => p.studentId === s.id)).length
          },
          allStudentReports: students.map(s => {
            const bal = Number(s.feeBalance) || 0;
            const sPayments = payments.filter(p => p.studentId === s.id);
            const sInvoices = invoices.filter(i => i.studentId === s.id);
            const sPaidSum = sPayments.reduce((sum, p) => sum + p.amount, 0);
            const sInvoicedSum = sInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0) || (sPaidSum + bal);
            const status: 'SETTLED' | 'PARTIAL' | 'ARREARS' = bal <= 0 ? 'SETTLED' : (sPaidSum > 0 ? 'PARTIAL' : 'ARREARS');
            const lastP = sPayments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];
            return {
              studentId: s.id,
              studentName: s.fullName,
              admissionNo: s.admissionNo,
              gradeName: s.gradeName || s.className || s.programName || 'General',
              className: s.className || '',
              totalInvoiced: sInvoicedSum,
              totalPaid: sPaidSum,
              feeBalance: bal,
              status,
              lastPaymentDate: lastP?.paidAt || null,
              guardianName: s.guardianName || '',
              guardianPhone: s.guardianPhone || ''
            };
          })
        }}
        tenantName="Academic Institution & Bursary"
        currencySymbol={currencySymbol}
        selectedYear={reportYearFilter === 'ALL' ? 'All Years' : reportYearFilter}
        selectedTerm={reportTermFilter === 'ALL' ? 'All Terms' : reportTermFilter}
        selectedGradeName={reportGradeFilter === 'ALL' ? 'All Grades & Streams' : (grades.find(g => g.id === reportGradeFilter)?.name || 'Selected Cohort')}
      />

      {/* Physical Thermal Printer Modal */}
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
