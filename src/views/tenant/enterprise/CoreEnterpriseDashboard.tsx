import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, Users, TrendingUp, Plus, 
  RefreshCw, FileText, CheckCircle2, Shield,
  Search, Filter, Trash2, Edit, AlertTriangle,
  UserX, ShieldAlert, CheckSquare, Square, Eye,
  Building2, Phone, Mail, Award, Calendar, MoreVertical,
  Printer, ArrowUpDown, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { 
  AccountingLedgerEntry, EmployeeRecord, CrmLeadCustomer,
  StaffWarningLetter, StaffTerminationLetter 
} from '../../../types';
import { WarningLetterModal } from './components/WarningLetterModal';
import { TerminationLetterModal } from './components/TerminationLetterModal';
import { WarningLetterViewModal } from './components/WarningLetterViewModal';
import { TerminationLetterViewModal } from './components/TerminationLetterViewModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';

export const CoreEnterpriseDashboard: React.FC<{ defaultTab?: 'accounting' | 'hr' | 'crm' }> = ({
  defaultTab = 'accounting'
}) => {
  const { currentTenant, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'accounting' | 'hr' | 'crm'>(defaultTab);
  const [hrSubTab, setHrSubTab] = useState<'roster' | 'warnings' | 'terminations'>('roster');

  const [ledger, setLedger] = useState<AccountingLedgerEntry[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [warningLetters, setWarningLetters] = useState<StaffWarningLetter[]>([]);
  const [terminationLetters, setTerminationLetters] = useState<StaffTerminationLetter[]>([]);
  const [leads, setLeads] = useState<CrmLeadCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [staffSearch, setStaffSearch] = useState('');
  const [staffDeptFilter, setStaffDeptFilter] = useState('ALL');
  const [staffStatusFilter, setStaffStatusFilter] = useState('ALL');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const [warningSearch, setWarningSearch] = useState('');
  const [terminationSearch, setTerminationSearch] = useState('');

  // Modals
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningTargetEmpId, setWarningTargetEmpId] = useState<string | undefined>(undefined);

  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [terminationTargetEmpId, setTerminationTargetEmpId] = useState<string | undefined>(undefined);

  const [viewingWarningLetter, setViewingWarningLetter] = useState<StaffWarningLetter | null>(null);
  const [viewingTerminationLetter, setViewingTerminationLetter] = useState<StaffTerminationLetter | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);

  // Deletion Confirmation States
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRecord | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [warningToDelete, setWarningToDelete] = useState<StaffWarningLetter | null>(null);
  const [terminationToDelete, setTerminationToDelete] = useState<StaffTerminationLetter | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const [ledgerForm, setLedgerForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    accountCategory: 'EXPENSE' as const,
    accountName: 'Office Rent & Utilities',
    description: 'Monthly office rent payment',
    debit: 45000,
    credit: 0,
    referenceNo: `LDG-${Date.now().toString(36).toUpperCase()}`,
    paymentMethod: 'BANK_TRANSFER'
  });

  const [empForm, setEmpForm] = useState({
    employeeNo: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    fullName: '',
    nationalId: '',
    department: 'Sales & Operations',
    jobTitle: 'Store Manager',
    phone: '',
    email: '',
    hireDate: new Date().toISOString().split('T')[0],
    basicSalary: 40000,
    employmentStatus: 'FULL_TIME' as const,
    allowances: 5000,
    deductions: 2000,
    kraPin: '',
    nssfNo: '',
    nhifShifNo: '',
    bankName: '',
    bankAccountNo: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [leadForm, setLeadForm] = useState({
    fullName: '',
    companyOrOrg: '',
    phone: '',
    email: '',
    stage: 'PROSPECT' as const,
    estimatedValue: 150000,
    assignedTo: 'Lead Executive',
    source: 'WALK_IN' as const,
    lastContactDate: new Date().toISOString().split('T')[0],
    notes: 'Inquired about bulk supply contracts'
  });

  const currencySymbol = currentTenant?.branding?.currencySymbol || 'KES';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchEnterpriseData = async () => {
    setLoading(true);
    try {
      const [ldgRes, empRes, crmRes, wrnRes, trmRes] = await Promise.all([
        fetch('/api/app/accounting/ledger', { headers: authHeaders }),
        fetch('/api/app/hr/employees', { headers: authHeaders }),
        fetch('/api/app/crm/leads', { headers: authHeaders }),
        fetch('/api/app/hr/warning-letters', { headers: authHeaders }),
        fetch('/api/app/hr/termination-letters', { headers: authHeaders })
      ]);

      if (ldgRes.ok) {
        const d = await ldgRes.json();
        setLedger(d.entries || []);
      }
      if (empRes.ok) {
        const e = await empRes.json();
        setEmployees(e.employees || []);
      }
      if (crmRes.ok) {
        const c = await crmRes.json();
        setLeads(c.leads || []);
      }
      if (wrnRes.ok) {
        const w = await wrnRes.json();
        setWarningLetters(w.letters || []);
      }
      if (trmRes.ok) {
        const t = await trmRes.json();
        setTerminationLetters(t.letters || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
  }, [currentTenant?.id]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = 
        emp.fullName.toLowerCase().includes(staffSearch.toLowerCase()) ||
        emp.employeeNo.toLowerCase().includes(staffSearch.toLowerCase()) ||
        (emp.nationalId && emp.nationalId.toLowerCase().includes(staffSearch.toLowerCase())) ||
        emp.jobTitle.toLowerCase().includes(staffSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(staffSearch.toLowerCase());
      
      const matchDept = staffDeptFilter === 'ALL' || emp.department === staffDeptFilter;
      const matchStatus = staffStatusFilter === 'ALL' || emp.employmentStatus === staffStatusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, staffSearch, staffDeptFilter, staffStatusFilter]);

  // Filtered Warning Letters
  const filteredWarnings = useMemo(() => {
    return warningLetters.filter(w => {
      return (
        w.employeeName.toLowerCase().includes(warningSearch.toLowerCase()) ||
        w.letterNumber.toLowerCase().includes(warningSearch.toLowerCase()) ||
        w.employeeNo.toLowerCase().includes(warningSearch.toLowerCase()) ||
        w.warningLevel.toLowerCase().includes(warningSearch.toLowerCase()) ||
        w.infractionCategory.toLowerCase().includes(warningSearch.toLowerCase())
      );
    });
  }, [warningLetters, warningSearch]);

  // Filtered Termination Letters
  const filteredTerminations = useMemo(() => {
    return terminationLetters.filter(t => {
      return (
        t.employeeName.toLowerCase().includes(terminationSearch.toLowerCase()) ||
        t.letterNumber.toLowerCase().includes(terminationSearch.toLowerCase()) ||
        t.employeeNo.toLowerCase().includes(terminationSearch.toLowerCase()) ||
        t.terminationType.toLowerCase().includes(terminationSearch.toLowerCase())
      );
    });
  }, [terminationLetters, terminationSearch]);

  // Bulk Selection Handlers
  const handleSelectAllStaff = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStaffIds(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const handleToggleSelectStaff = (id: string) => {
    if (selectedStaffIds.includes(id)) {
      setSelectedStaffIds(selectedStaffIds.filter(i => i !== id));
    } else {
      setSelectedStaffIds([...selectedStaffIds, id]);
    }
  };

  // Delete Single Employee
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/app/hr/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showToast(`Staff member "${employeeToDelete.fullName}" deleted successfully`);
        setEmployeeToDelete(null);
        setSelectedStaffIds(selectedStaffIds.filter(id => id !== employeeToDelete.id));
        fetchEnterpriseData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to delete staff member', 'error');
      }
    } catch (err) {
      showToast('Network error deleting employee', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete Employees
  const handleBulkDeleteEmployees = async () => {
    if (selectedStaffIds.length === 0) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/app/hr/employees/bulk-delete', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ids: selectedStaffIds })
      });
      if (res.ok) {
        const d = await res.json();
        showToast(d.message || `Deleted ${selectedStaffIds.length} staff records`);
        setSelectedStaffIds([]);
        setShowBulkDeleteConfirm(false);
        fetchEnterpriseData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to bulk delete staff', 'error');
      }
    } catch (err) {
      showToast('Network error performing bulk deletion', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Warning Letter
  const handleDeleteWarningLetter = async () => {
    if (!warningToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/app/hr/warning-letters/${warningToDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showToast(`Warning letter ${warningToDelete.letterNumber} deleted`);
        setWarningToDelete(null);
        fetchEnterpriseData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to delete warning letter', 'error');
      }
    } catch (err) {
      showToast('Network error deleting warning letter', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Termination Letter
  const handleDeleteTerminationLetter = async () => {
    if (!terminationToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/app/hr/termination-letters/${terminationToDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showToast(`Termination letter ${terminationToDelete.letterNumber} deleted`);
        setTerminationToDelete(null);
        fetchEnterpriseData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to delete termination letter', 'error');
      }
    } catch (err) {
      showToast('Network error deleting termination letter', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Warning Letter Status Change
  const handleUpdateWarningStatus = async (id: string, newStatus: StaffWarningLetter['status']) => {
    try {
      const res = await fetch(`/api/app/hr/warning-letters/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Warning status changed to ${newStatus}`);
        fetchEnterpriseData();
        if (viewingWarningLetter && viewingWarningLetter.id === id) {
          setViewingWarningLetter({ ...viewingWarningLetter, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/accounting/ledger', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(ledgerForm)
      });
      if (res.ok) {
        setShowLedgerModal(false);
        showToast('Ledger transaction recorded');
        fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/hr/employees', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(empForm)
      });
      if (res.ok) {
        setShowEmployeeModal(false);
        showToast(`Staff member "${empForm.fullName}" enrolled successfully`);
        setEmpForm({
          employeeNo: `EMP-${Math.floor(100 + Math.random() * 900)}`,
          fullName: '',
          nationalId: '',
          department: 'Sales & Operations',
          jobTitle: 'Store Manager',
          phone: '',
          email: '',
          hireDate: new Date().toISOString().split('T')[0],
          basicSalary: 40000,
          employmentStatus: 'FULL_TIME' as const,
          allowances: 5000,
          deductions: 2000,
          kraPin: '',
          nssfNo: '',
          nhifShifNo: '',
          bankName: '',
          bankAccountNo: '',
          emergencyContactName: '',
          emergencyContactPhone: ''
        });
        fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/crm/leads', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(leadForm)
      });
      if (res.ok) {
        setShowLeadModal(false);
        showToast('Sales deal registered in pipeline');
        fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULL_TIME':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Full Time</span>;
      case 'CONTRACT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Contract</span>;
      case 'PROBATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Probation</span>;
      case 'ON_LEAVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">On Leave</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Suspended</span>;
      case 'TERMINATED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Terminated</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getWarningLevelBadge = (level: string) => {
    switch (level) {
      case 'FIRST_WARNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">1st Warning</span>;
      case 'SECOND_WARNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">2nd Warning</span>;
      case 'FINAL_WARNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Final Warning</span>;
      case 'PERFORMANCE_IMPROVEMENT_PLAN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">PIP Notice</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{level}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 text-white border border-slate-700' 
            : 'bg-rose-600 text-white'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-white" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Enterprise Administration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personnel records, disciplinary actions, legal termination letters, ledger & CRM pipelines
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'accounting' && (
            <button
              onClick={() => setShowLedgerModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post Ledger Entry</span>
            </button>
          )}

          {activeTab === 'hr' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll Staff</span>
              </button>
              <button
                onClick={() => {
                  setWarningTargetEmpId(undefined);
                  setShowWarningModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Issue Warning</span>
              </button>
              <button
                onClick={() => {
                  setTerminationTargetEmpId(undefined);
                  setShowTerminationModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold rounded-xl transition shadow-xs"
              >
                <UserX className="w-4 h-4" />
                <span className="hidden sm:inline">Issue Termination</span>
              </button>
            </div>
          )}

          {activeTab === 'crm' && (
            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Customer Deal</span>
            </button>
          )}

          <button
            onClick={fetchEnterpriseData}
            title="Reload Enterprise Data"
            className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl shadow-xs">
        {[
          { id: 'accounting', label: `General Ledger (${ledger.length})`, icon: DollarSign },
          { id: 'hr', label: `Human Resources & Staff (${employees.length})`, icon: Users },
          { id: 'crm', label: `CRM & Pipeline (${leads.length})`, icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-4 border-b-2 font-bold text-sm transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACCOUNTING & LEDGER */}
      {activeTab === 'accounting' && (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Debit</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {currencySymbol} {ledger.reduce((acc, l) => acc + (l.debit || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Credit</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {currencySymbol} {ledger.reduce((acc, l) => acc + (l.credit || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Ledger Balance</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {currencySymbol} {(
                  ledger.reduce((acc, l) => acc + (l.credit || 0), 0) - 
                  ledger.reduce((acc, l) => acc + (l.debit || 0), 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Ref No</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Account / Description</th>
                  <th className="px-4 py-3 text-right">Debit ({currencySymbol})</th>
                  <th className="px-4 py-3 text-right">Credit ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.transactionDate}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 text-xs">{item.referenceNo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded text-xs">
                        {item.accountCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.accountName}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {item.debit > 0 ? item.debit.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {item.credit > 0 ? item.credit.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No ledger transactions found. Post an entry above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HR & STAFF MANAGEMENT */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* HR KPI Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Total Enrolled Staff</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{employees.length}</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active Staff</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {employees.filter(e => e.employmentStatus === 'FULL_TIME' || e.employmentStatus === 'CONTRACT' || e.employmentStatus === 'PROBATION').length}
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Warning Letters On File</span>
              <p className="text-2xl font-black text-amber-900 mt-1">{warningLetters.length}</p>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Separations & Terminations</span>
              <p className="text-2xl font-black text-rose-900 mt-1">{terminationLetters.length}</p>
            </div>
          </div>

          {/* Sub-tabs for HR */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHrSubTab('roster')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  hrSubTab === 'roster'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Staff Directory ({employees.length})
              </button>
              <button
                onClick={() => setHrSubTab('warnings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  hrSubTab === 'warnings'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warning Letters ({warningLetters.length})</span>
              </button>
              <button
                onClick={() => setHrSubTab('terminations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  hrSubTab === 'terminations'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Termination Letters ({terminationLetters.length})</span>
              </button>
            </div>

            {hrSubTab === 'roster' && selectedStaffIds.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedStaffIds.length})</span>
              </button>
            )}
          </div>

          {/* SUBTAB 1: STAFF ROSTER */}
          {hrSubTab === 'roster' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, staff #, role..."
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 shrink-0">Dept:</span>
                  <select
                    value={staffDeptFilter}
                    onChange={e => setStaffDeptFilter(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
                  <select
                    value={staffStatusFilter}
                    onChange={e => setStaffStatusFilter(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PROBATION">Probation</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>

              {/* Staff Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredEmployees.length > 0 && selectedStaffIds.length === filteredEmployees.length}
                          onChange={handleSelectAllStaff}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3">Staff Details</th>
                      <th className="px-4 py-3">Department & Role</th>
                      <th className="px-4 py-3">National ID & Contact</th>
                      <th className="px-4 py-3 text-right">Basic Remuneration</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedStaffIds.includes(emp.id);
                      return (
                        <tr key={emp.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectStaff(emp.id)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{emp.fullName}</div>
                            <div className="text-xs font-mono font-semibold text-blue-600">{emp.employeeNo}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800 text-xs">{emp.jobTitle}</div>
                            <div className="text-xs text-slate-500">{emp.department}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-700 font-medium">ID: {emp.nationalId || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{emp.phone || emp.email || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-bold text-slate-900 text-xs">
                              {currencySymbol} {emp.basicSalary.toLocaleString()}
                            </div>
                            {(emp.allowances > 0 || emp.deductions > 0) && (
                              <div className="text-[11px] text-slate-500">
                                +{emp.allowances} / -{emp.deductions}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(emp.employmentStatus)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingEmployee(emp)}
                                title="Edit Staff Profile"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setWarningTargetEmpId(emp.id);
                                  setShowWarningModal(true);
                                }}
                                title="Issue Warning Letter"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setTerminationTargetEmpId(emp.id);
                                  setShowTerminationModal(true);
                                }}
                                title="Issue Termination Letter"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEmployeeToDelete(emp)}
                                title="Delete Staff Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                          No staff members found matching criteria. Click "Enroll Staff" to add.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 2: WARNING LETTERS */}
          {hrSubTab === 'warnings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search warning letters or employee..."
                    value={warningSearch}
                    onChange={e => setWarningSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={() => {
                    setWarningTargetEmpId(undefined);
                    setShowWarningModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft Warning Letter</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Letter Ref #</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Severity & Category</th>
                      <th className="px-4 py-3">Incident Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredWarnings.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-xs text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            {w.letterNumber}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">Issued: {w.incidentDate}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{w.employeeName}</div>
                          <div className="text-xs text-slate-500">{w.jobTitle} • {w.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{getWarningLevelBadge(w.warningLevel)}</div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            {w.infractionCategory.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700 font-mono">
                          {w.incidentDate}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingWarningLetter(w)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View / Print</span>
                            </button>
                            <button
                              onClick={() => setWarningToDelete(w)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredWarnings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                          No warning letters on file. Click "Draft Warning Letter" to issue one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 3: TERMINATION LETTERS */}
          {hrSubTab === 'terminations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search termination notices..."
                    value={terminationSearch}
                    onChange={e => setTerminationSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={() => {
                    setTerminationTargetEmpId(undefined);
                    setShowTerminationModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft Termination Letter</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Notice Ref #</th>
                      <th className="px-4 py-3">Separated Employee</th>
                      <th className="px-4 py-3">Termination Type</th>
                      <th className="px-4 py-3">Effective Date</th>
                      <th className="px-4 py-3">Last Working Day</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTerminations.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-xs text-rose-900 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                            {t.letterNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{t.employeeName}</div>
                          <div className="text-xs text-slate-500">{t.jobTitle} • {t.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900">
                            {t.terminationType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-700">
                          {t.effectiveDate}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-semibold text-rose-700">
                          {t.lastWorkingDate}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingTerminationLetter(t)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View / Print</span>
                            </button>
                            <button
                              onClick={() => setTerminationToDelete(t)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTerminations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                          No separation/termination records on file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CRM PIPELINE */}
      {activeTab === 'crm' && (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Deals</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{leads.length}</p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Pipeline Value</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {currencySymbol} {leads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Won Accounts</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {leads.filter(l => l.stage === 'WON_CUSTOMER').length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Lead Contact</th>
                  <th className="px-4 py-3">Company / Org</th>
                  <th className="px-4 py-3">Phone & Email</th>
                  <th className="px-4 py-3 text-right">Estimated Value ({currencySymbol})</th>
                  <th className="px-4 py-3 text-center">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{lead.fullName}</td>
                    <td className="px-4 py-3 text-slate-700">{lead.companyOrOrg || 'Individual Client'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>{lead.phone}</div>
                      <div>{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {lead.estimatedValue ? lead.estimatedValue.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        lead.stage === 'WON_CUSTOMER' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.stage === 'LOST'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.stage}
                      </span>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No CRM leads found. Click "Create Customer Deal" to add.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POST LEDGER MODAL */}
      {showLedgerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Post General Ledger Entry</h3>
            <form onSubmit={handleAddLedger} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={ledgerForm.transactionDate}
                    onChange={e => setLedgerForm({ ...ledgerForm, transactionDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Account Category</label>
                  <select
                    value={ledgerForm.accountCategory}
                    onChange={e => setLedgerForm({ ...ledgerForm, accountCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income / Revenue</option>
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Account Title</label>
                <input
                  type="text"
                  required
                  value={ledgerForm.accountName}
                  onChange={e => setLedgerForm({ ...ledgerForm, accountName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Narration / Memo</label>
                <input
                  type="text"
                  required
                  value={ledgerForm.description}
                  onChange={e => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Debit ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={ledgerForm.debit}
                    onChange={e => setLedgerForm({ ...ledgerForm, debit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Credit ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={ledgerForm.credit}
                    onChange={e => setLedgerForm({ ...ledgerForm, credit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Enroll Staff Member</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Mutua"
                    value={empForm.fullName}
                    onChange={e => setEmpForm({ ...empForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Staff / Employee # *</label>
                  <input
                    type="text"
                    required
                    value={empForm.employeeNo}
                    onChange={e => setEmpForm({ ...empForm, employeeNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">National ID / Passport #</label>
                  <input
                    type="text"
                    placeholder="e.g. 29384756"
                    value={empForm.nationalId}
                    onChange={e => setEmpForm({ ...empForm, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Employment Status</label>
                  <select
                    value={empForm.employmentStatus}
                    onChange={e => setEmpForm({ ...empForm, employmentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1 font-semibold"
                  >
                    <option value="FULL_TIME">Full Time Permanent</option>
                    <option value="CONTRACT">Fixed Term Contract</option>
                    <option value="PROBATION">Probationary Period</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Department *</label>
                  <input
                    type="text"
                    required
                    value={empForm.department}
                    onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    value={empForm.jobTitle}
                    onChange={e => setEmpForm({ ...empForm, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={empForm.email}
                    onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
              </div>

              {/* Remuneration */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Remuneration ({currencySymbol})</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Basic Salary *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={empForm.basicSalary}
                      onChange={e => setEmpForm({ ...empForm, basicSalary: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Allowances</label>
                    <input
                      type="number"
                      min={0}
                      value={empForm.allowances}
                      onChange={e => setEmpForm({ ...empForm, allowances: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deductions</label>
                    <input
                      type="number"
                      min={0}
                      value={empForm.deductions}
                      onChange={e => setEmpForm({ ...empForm, deductions: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">KRA PIN</label>
                  <input
                    type="text"
                    placeholder="A00..."
                    value={empForm.kraPin}
                    onChange={e => setEmpForm({ ...empForm, kraPin: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">NSSF #</label>
                  <input
                    type="text"
                    value={empForm.nssfNo}
                    onChange={e => setEmpForm({ ...empForm, nssfNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">SHIF / NHIF #</label>
                  <input
                    type="text"
                    value={empForm.nhifShifNo}
                    onChange={e => setEmpForm({ ...empForm, nhifShifNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs"
                >
                  Enroll Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM LEAD MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Create Pipeline Deal</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Contact / Lead Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Njoroge"
                  value={leadForm.fullName}
                  onChange={e => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Company / Organization</label>
                  <input
                    type="text"
                    value={leadForm.companyOrOrg}
                    onChange={e => setLeadForm({ ...leadForm, companyOrOrg: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={leadForm.phone}
                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Estimated Value ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={leadForm.estimatedValue}
                    onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Stage</label>
                  <select
                    value={leadForm.stage}
                    onChange={e => setLeadForm({ ...leadForm, stage: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="WON_CUSTOMER">Won Customer</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WARNING LETTER ISSUE MODAL */}
      <WarningLetterModal
        isOpen={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setWarningTargetEmpId(undefined);
        }}
        onSuccess={() => {
          showToast('Disciplinary warning letter registered');
          fetchEnterpriseData();
          setHrSubTab('warnings');
        }}
        employees={employees}
        initialEmployeeId={warningTargetEmpId}
        token={token}
      />

      {/* TERMINATION LETTER ISSUE MODAL */}
      <TerminationLetterModal
        isOpen={showTerminationModal}
        onClose={() => {
          setShowTerminationModal(false);
          setTerminationTargetEmpId(undefined);
        }}
        onSuccess={() => {
          showToast('Termination letter registered and staff record updated');
          fetchEnterpriseData();
          setHrSubTab('terminations');
        }}
        employees={employees}
        initialEmployeeId={terminationTargetEmpId}
        currencySymbol={currencySymbol}
        token={token}
      />

      {/* EDIT EMPLOYEE MODAL */}
      <EditEmployeeModal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        onSuccess={() => {
          showToast('Staff credentials updated');
          fetchEnterpriseData();
        }}
        employee={editingEmployee}
        currencySymbol={currencySymbol}
        token={token}
      />

      {/* VIEW WARNING LETTERHEAD MODAL */}
      <WarningLetterViewModal
        letter={viewingWarningLetter}
        tenant={currentTenant}
        onClose={() => setViewingWarningLetter(null)}
        onStatusChange={handleUpdateWarningStatus}
      />

      {/* VIEW TERMINATION LETTERHEAD MODAL */}
      <TerminationLetterViewModal
        letter={viewingTerminationLetter}
        tenant={currentTenant}
        onClose={() => setViewingTerminationLetter(null)}
        currencySymbol={currencySymbol}
      />

      {/* DELETE SINGLE EMPLOYEE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Staff Member</h3>
                <p className="text-xs text-slate-500">Irreversible HR personnel action</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to permanently delete the staff record for{' '}
              <span className="font-bold text-slate-900">{employeeToDelete.fullName}</span> ({employeeToDelete.employeeNo})?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteEmployee}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk Delete Staff Records</h3>
                <p className="text-xs text-slate-500">Remove multiple personnel simultaneously</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-rose-700">{selectedStaffIds.length}</span> selected staff records? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleBulkDeleteEmployees}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : `Delete ${selectedStaffIds.length} Staff`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE WARNING CONFIRMATION MODAL */}
      {warningToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Warning Letter</h3>
                <p className="text-xs text-slate-500">Remove disciplinary record from archive</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to delete warning letter{' '}
              <span className="font-bold text-slate-900">{warningToDelete.letterNumber}</span> issued to {warningToDelete.employeeName}?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setWarningToDelete(null)}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteWarningLetter}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Warning Letter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TERMINATION CONFIRMATION MODAL */}
      {terminationToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Termination Letter</h3>
                <p className="text-xs text-slate-500">Remove termination document record</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to delete termination letter{' '}
              <span className="font-bold text-slate-900">{terminationToDelete.letterNumber}</span> for {terminationToDelete.employeeName}?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setTerminationToDelete(null)}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteTerminationLetter}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Termination Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
