import React, { useState, useEffect } from 'react';
import { 
  Users, PiggyBank, HandCoins, TrendingUp, Plus, Search, 
  CheckCircle2, Clock, AlertCircle, RefreshCw, Landmark, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, Filter, FileSpreadsheet, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ChamaMember, ChamaContribution, ChamaLoan, ChamaInvestment } from '../../../types';

export const SaccoDashboard: React.FC = () => {
  const { currentTenant, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'contributions' | 'loans' | 'investments'>('overview');
  
  // State data
  const [summary, setSummary] = useState<any>(null);
  const [members, setMembers] = useState<ChamaMember[]>([]);
  const [contributions, setContributions] = useState<ChamaContribution[]>([]);
  const [loans, setLoans] = useState<ChamaLoan[]>([]);
  const [investments, setInvestments] = useState<ChamaInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);

  // Form states
  const [memberForm, setMemberForm] = useState({
    memberNo: `MEM-${Math.floor(100 + Math.random() * 900)}`,
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as const,
    totalSavings: 0,
    welfareFund: 0,
    shareCapital: 0,
    activeLoansBalance: 0,
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelation: 'Spouse'
  });

  const [contribForm, setContribForm] = useState({
    memberId: '',
    memberName: '',
    memberNo: '',
    amount: 2000,
    type: 'MONTHLY_SAVINGS' as const,
    paymentMethod: 'MPESA' as const,
    reference: `MP-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    notes: 'Monthly regular savings deposit'
  });

  const [loanForm, setLoanForm] = useState({
    loanNo: `LN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    memberId: '',
    memberName: '',
    memberNo: '',
    principalAmount: 50000,
    interestRatePercent: 10,
    repaymentPeriodMonths: 6,
    purpose: 'Business expansion & stock purchase',
    guarantors: []
  });

  const [investForm, setInvestForm] = useState({
    title: '',
    category: 'LAND_REAL_ESTATE' as const,
    investedAmount: 250000,
    currentValuation: 280000,
    startDate: new Date().toISOString().split('T')[0],
    expectedYieldPercent: 12,
    dividendsEarned: 0,
    locationOrInstitution: 'Nairobi Plot 42B',
    notes: ''
  });

  const currencySymbol = currentTenant?.branding?.currencySymbol || 'KES';
  const effectiveTenantId = currentTenant?.id || user?.tenantId || localStorage.getItem('erp_tenant_id') || '';

  const getAuthHeaders = () => {
    const userId = user?.id || token || localStorage.getItem('erp_user_id') || '';
    const tId = currentTenant?.id || user?.tenantId || localStorage.getItem('erp_tenant_id') || '';
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-tenant-id': tId,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSaccoData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [sumRes, memRes, conRes, lnRes, invRes] = await Promise.all([
        fetch('/api/app/sacco/summary', { headers }),
        fetch('/api/app/sacco/members', { headers }),
        fetch('/api/app/sacco/contributions', { headers }),
        fetch('/api/app/sacco/loans', { headers }),
        fetch('/api/app/sacco/investments', { headers })
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (memRes.ok) {
        const d = await memRes.json();
        setMembers(d.members || []);
      }
      if (conRes.ok) {
        const d = await conRes.json();
        setContributions(d.contributions || []);
      }
      if (lnRes.ok) {
        const d = await lnRes.json();
        setLoans(d.loans || []);
      }
      if (invRes.ok) {
        const d = await invRes.json();
        setInvestments(d.investments || []);
      }
    } catch (e) {
      console.error('Error fetching SACCO data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaccoData();
  }, [currentTenant?.id, user?.tenantId]);

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.fullName.trim()) {
      setModalError('Please enter member full name');
      return;
    }
    setSubmitting(true);
    setModalError(null);
    try {
      const headers = getAuthHeaders();
      const targetTenantId = currentTenant?.id || user?.tenantId || '';
      const res = await fetch('/api/app/sacco/members', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...memberForm,
          tenantId: targetTenantId
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowMemberModal(false);
        showToast(`Member "${memberForm.fullName}" registered successfully!`);
        if (data.member) {
          setMembers(prev => [data.member, ...prev]);
        }
        fetchSaccoData();
        setMemberForm({
          memberNo: `MEM-${Math.floor(100 + Math.random() * 900)}`,
          fullName: '',
          idNumber: '',
          phone: '',
          email: '',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          totalSavings: 0,
          welfareFund: 0,
          shareCapital: 0,
          activeLoansBalance: 0,
          nextOfKinName: '',
          nextOfKinPhone: '',
          nextOfKinRelation: 'Spouse'
        });
      } else {
        setModalError(data.message || data.error || 'Failed to register member. Please check form fields.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Network error while registering member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      const headers = getAuthHeaders();
      const targetTenantId = currentTenant?.id || user?.tenantId || '';
      const res = await fetch('/api/app/sacco/contributions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...contribForm,
          tenantId: targetTenantId
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowContribModal(false);
        showToast(`Contribution of ${currencySymbol} ${contribForm.amount} recorded!`);
        fetchSaccoData();
      } else {
        setModalError(data.message || data.error || 'Failed to record contribution.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error recording contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      const headers = getAuthHeaders();
      const targetTenantId = currentTenant?.id || user?.tenantId || '';
      const res = await fetch('/api/app/sacco/loans', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...loanForm,
          tenantId: targetTenantId
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowLoanModal(false);
        showToast(`Loan application for ${currencySymbol} ${loanForm.principalAmount} submitted!`);
        fetchSaccoData();
      } else {
        setModalError(data.message || data.error || 'Failed to submit loan application.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error submitting loan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLoanStatus = async (loanId: string, status: string) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/app/sacco/loans/${loanId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Loan status updated to ${status}`);
        fetchSaccoData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      const headers = getAuthHeaders();
      const targetTenantId = currentTenant?.id || user?.tenantId || '';
      const res = await fetch('/api/app/sacco/investments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...investForm,
          tenantId: targetTenantId
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowInvestModal(false);
        showToast(`Investment project added successfully!`);
        fetchSaccoData();
      } else {
        setModalError(data.message || data.error || 'Failed to add investment project.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error adding investment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all animate-in fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentTenant?.name || 'Blessed to Bless SACCO'}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Chama & SACCO Live
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Cooperative shares, monthly welfare contributions, loan disbursements, and investment portfolios.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMemberModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
          <button
            onClick={() => setShowContribModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Record Deposit</span>
          </button>
          <button
            onClick={() => setShowLoanModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <HandCoins className="w-4 h-4" />
            <span>Issue Loan</span>
          </button>
          <button
            onClick={fetchSaccoData}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl">
        {[
          { id: 'overview', label: 'Executive Summary', icon: TrendingUp },
          { id: 'members', label: `Members (${members.length})`, icon: Users },
          { id: 'contributions', label: `Contributions (${contributions.length})`, icon: PiggyBank },
          { id: 'loans', label: `Loan Management (${loans.length})`, icon: HandCoins },
          { id: 'investments', label: `Investments (${investments.length})`, icon: Landmark }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Member Savings</p>
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><PiggyBank className="w-5 h-5" /></span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {currencySymbol} {(summary?.totalSavings || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">From {members.length} registered members</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Welfare & Benevolent Fund</p>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck className="w-5 h-5" /></span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {currencySymbol} {(summary?.totalWelfare || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-600 mt-1">Available for emergency aid</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Loans Portfolio</p>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><HandCoins className="w-5 h-5" /></span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {currencySymbol} {(summary?.activeLoansTotal || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{loans.filter(l => l.status === 'ACTIVE').length} loans earning interest</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Investments & Assets</p>
                <span className="p-2 rounded-lg bg-purple-50 text-purple-600"><Landmark className="w-5 h-5" /></span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {currencySymbol} {(summary?.totalInvestments || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-purple-600 mt-1">{investments.length} projects & asset holdings</p>
            </div>
          </div>

          {/* Quick Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Contributions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Recent Deposits & Contributions</h3>
                <button onClick={() => setActiveTab('contributions')} className="text-xs text-blue-600 font-medium hover:underline">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {contributions.slice(0, 5).map(c => (
                  <div key={c.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.memberName}</p>
                      <p className="text-xs text-gray-500">{c.type} • {c.paymentMethod} ({c.reference})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">+{currencySymbol} {c.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{c.date}</p>
                    </div>
                  </div>
                ))}
                {contributions.length === 0 && (
                  <p className="text-sm text-gray-500 py-4 text-center">No contributions recorded yet.</p>
                )}
              </div>
            </div>

            {/* Recent Loans */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Loan Applications & Status</h3>
                <button onClick={() => setActiveTab('loans')} className="text-xs text-blue-600 font-medium hover:underline">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {loans.slice(0, 5).map(l => (
                  <div key={l.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{l.memberName}</p>
                      <p className="text-xs text-gray-500">{l.loanNo} • {l.repaymentPeriodMonths} months @ {l.interestRatePercent}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{currencySymbol} {l.principalAmount.toLocaleString()}</p>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        l.status === 'ACTIVE' || l.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                ))}
                {loans.length === 0 && (
                  <p className="text-sm text-gray-500 py-4 text-center">No active loans found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search member by name, phone, or member #..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Member #</th>
                  <th className="px-6 py-3">Full Name & ID</th>
                  <th className="px-6 py-3">Phone & Email</th>
                  <th className="px-6 py-3">Total Savings</th>
                  <th className="px-6 py-3">Welfare Fund</th>
                  <th className="px-6 py-3">Loan Balance</th>
                  <th className="px-6 py-3">Next of Kin</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members
                  .filter(m => 
                    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.phone.includes(searchQuery)
                  )
                  .map(member => (
                    <tr key={member.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-gray-900">{member.memberNo}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{member.fullName}</div>
                        <div className="text-xs text-gray-400">ID: {member.idNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{member.phone}</div>
                        <div className="text-xs text-gray-400">{member.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        {currencySymbol} {member.totalSavings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-blue-600">
                        {currencySymbol} {member.welfareFund.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-amber-600">
                        {currencySymbol} {member.activeLoansBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>{member.nextOfKinName} ({member.nextOfKinRelation})</div>
                        <div className="text-gray-400">{member.nextOfKinPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No members registered in this Chama yet. Click "New Member" to onboard the first member.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTRIBUTIONS */}
      {activeTab === 'contributions' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Savings & Contribution Ledger</h3>
            <button
              onClick={() => setShowContribModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Contribution</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Contribution Category</th>
                  <th className="px-6 py-3">Payment Method & Ref</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contributions.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-xs font-mono">{c.date}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {c.memberName} <span className="text-xs font-normal text-gray-500 font-mono">({c.memberNo})</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{c.paymentMethod}</span>
                      <span className="text-xs text-gray-400 block font-mono">{c.reference}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {currencySymbol} {c.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{c.recordedBy}</td>
                  </tr>
                ))}
                {contributions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No contribution records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOANS */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Loan Portfolio & Repayments</h3>
            <button
              onClick={() => setShowLoanModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Loan</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Loan #</th>
                  <th className="px-6 py-3">Borrower</th>
                  <th className="px-6 py-3">Principal & Interest</th>
                  <th className="px-6 py-3">Total Payable</th>
                  <th className="px-6 py-3">Monthly Repayment</th>
                  <th className="px-6 py-3">Outstanding Balance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{l.loanNo}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {l.memberName} <span className="text-xs font-normal text-gray-400 block">{l.purpose}</span>
                    </td>
                    <td className="px-6 py-4">
                      {currencySymbol} {l.principalAmount.toLocaleString()} @ {l.interestRatePercent}%
                      <span className="text-xs text-gray-400 block">({l.repaymentPeriodMonths} months)</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {currencySymbol} {l.totalPayable.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {currencySymbol} {l.monthlyInstallment.toLocaleString()} / mo
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600">
                      {currencySymbol} {l.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        l.status === 'ACTIVE' || l.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                        l.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {l.status === 'PENDING_APPROVAL' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateLoanStatus(l.id, 'DISBURSED')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition"
                          >
                            Approve & Disburse
                          </button>
                          <button
                            onClick={() => handleUpdateLoanStatus(l.id, 'REJECTED')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {(l.status === 'ACTIVE' || l.status === 'DISBURSED') && (
                        <button
                          onClick={async () => {
                            const amt = prompt(`Enter repayment amount in ${currencySymbol}:`, String(l.monthlyInstallment));
                            if (amt) {
                              await fetch('/api/app/sacco/repayments', {
                                method: 'POST',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({
                                  loanId: l.id,
                                  loanNo: l.loanNo,
                                  memberId: l.memberId,
                                  memberName: l.memberName,
                                  amount: Number(amt),
                                  principalPortion: Number(amt) * 0.8,
                                  interestPortion: Number(amt) * 0.2,
                                  date: new Date().toISOString().split('T')[0],
                                  paymentMethod: 'MPESA',
                                  reference: `RPM-${Date.now().toString(36).toUpperCase()}`
                                })
                              });
                              fetchSaccoData();
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition"
                        >
                          Record Repayment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No loan records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Chama Asset & Investment Portfolio</h3>
            <button
              onClick={() => setShowInvestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Investment Project</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {investments.map(inv => (
              <div key={inv.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      {inv.category}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{inv.startDate}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mt-2">{inv.title}</h4>
                  <p className="text-xs text-gray-500">{inv.locationOrInstitution}</p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capital Invested:</span>
                      <span className="font-semibold text-gray-900">{currencySymbol} {inv.investedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Valuation:</span>
                      <span className="font-semibold text-emerald-600">{currencySymbol} {inv.currentValuation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Annual Yield:</span>
                      <span className="font-semibold text-blue-600">{inv.expectedYieldPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
                  <span className="text-emerald-700 font-medium">Dividends: {currencySymbol} {inv.dividendsEarned.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded">{inv.status}</span>
                </div>
              </div>
            ))}
            {investments.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No Chama investments registered. Click "Add Investment Project" to record group assets, land, or money market funds.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEMBER REGISTRATION MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-gray-900">Register Chama Member</h3>
              <button 
                onClick={() => { setShowMemberModal(false); setModalError(null); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Member Number *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.memberNo}
                    onChange={e => setMemberForm({ ...memberForm, memberNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">National ID / Passport</label>
                  <input
                    type="text"
                    placeholder="e.g. 34567890"
                    value={memberForm.idNumber}
                    onChange={e => setMemberForm({ ...memberForm, idNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mary Wanjiku Mwangi"
                  value={memberForm.fullName}
                  onChange={e => setMemberForm({ ...memberForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone (M-Pesa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+254 700 000 000"
                    value={memberForm.phone}
                    onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="mary@gmail.com"
                    value={memberForm.email}
                    onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-xs font-semibold text-gray-900 uppercase">Next of Kin Details (Optional)</h4>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600">Kin Name</label>
                    <input
                      type="text"
                      placeholder="Next of kin"
                      value={memberForm.nextOfKinName}
                      onChange={e => setMemberForm({ ...memberForm, nextOfKinName: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600">Kin Phone</label>
                    <input
                      type="text"
                      placeholder="0700..."
                      value={memberForm.nextOfKinPhone}
                      onChange={e => setMemberForm({ ...memberForm, nextOfKinPhone: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600">Relation</label>
                    <input
                      type="text"
                      placeholder="Spouse / Sibling"
                      value={memberForm.nextOfKinRelation}
                      onChange={e => setMemberForm({ ...memberForm, nextOfKinRelation: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowMemberModal(false); setModalError(null); }}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? 'Saving...' : 'Save Member Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CONTRIBUTION MODAL */}
      {showContribModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Record Deposit / Contribution</h3>
            <form onSubmit={handleRecordContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Select Member</label>
                <select
                  required
                  value={contribForm.memberId}
                  onChange={e => {
                    const sel = members.find(m => m.id === e.target.value);
                    setContribForm({
                      ...contribForm,
                      memberId: e.target.value,
                      memberName: sel ? sel.fullName : '',
                      memberNo: sel ? sel.memberNo : ''
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.memberNo})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Contribution Type</label>
                  <select
                    value={contribForm.type}
                    onChange={e => setContribForm({ ...contribForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="MONTHLY_SAVINGS">Monthly Savings</option>
                    <option value="WELFARE">Welfare Fund</option>
                    <option value="SHARE_CAPITAL">Share Capital</option>
                    <option value="DEVELOPMENT_FUND">Development Project</option>
                    <option value="FINE">Meeting Fine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={contribForm.amount}
                    onChange={e => setContribForm({ ...contribForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Payment Channel</label>
                  <select
                    value={contribForm.paymentMethod}
                    onChange={e => setContribForm({ ...contribForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Receipt / Ref #</label>
                  <input
                    type="text"
                    required
                    value={contribForm.reference}
                    onChange={e => setContribForm({ ...contribForm, reference: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowContribModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  Post Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOAN APPLICATION MODAL */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Chama Loan Application</h3>
            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Borrowing Member</label>
                <select
                  required
                  value={loanForm.memberId}
                  onChange={e => {
                    const sel = members.find(m => m.id === e.target.value);
                    setLoanForm({
                      ...loanForm,
                      memberId: e.target.value,
                      memberName: sel ? sel.fullName : '',
                      memberNo: sel ? sel.memberNo : ''
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} (Savings: {currencySymbol} {m.totalSavings.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Principal ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={loanForm.principalAmount}
                    onChange={e => setLoanForm({ ...loanForm, principalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    required
                    value={loanForm.interestRatePercent}
                    onChange={e => setLoanForm({ ...loanForm, interestRatePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Period (Months)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={36}
                    value={loanForm.repaymentPeriodMonths}
                    onChange={e => setLoanForm({ ...loanForm, repaymentPeriodMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Estimated Repayment</label>
                  <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm mt-1 font-semibold text-blue-600">
                    {currencySymbol} {Math.round((loanForm.principalAmount * (1 + loanForm.interestRatePercent / 100)) / (loanForm.repaymentPeriodMonths || 1)).toLocaleString()} / mo
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Loan Purpose</label>
                <input
                  type="text"
                  required
                  value={loanForm.purpose}
                  onChange={e => setLoanForm({ ...loanForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                >
                  Submit Loan Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVESTMENT MODAL */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Investment Project</h3>
            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Investment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2-Acre Land in Juja"
                  value={investForm.title}
                  onChange={e => setInvestForm({ ...investForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Asset Class</label>
                  <select
                    value={investForm.category}
                    onChange={e => setInvestForm({ ...investForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="LAND_REAL_ESTATE">Land & Real Estate</option>
                    <option value="MONEY_MARKET">Money Market Fund</option>
                    <option value="SHARES">NSE Stocks & Shares</option>
                    <option value="AGRIBUSINESS">Agribusiness</option>
                    <option value="FIXED_DEPOSIT">Bank Fixed Deposit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Invested Capital ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={investForm.investedAmount}
                    onChange={e => setInvestForm({ ...investForm, investedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Location / Financial Institution</label>
                <input
                  type="text"
                  required
                  value={investForm.locationOrInstitution}
                  onChange={e => setInvestForm({ ...investForm, locationOrInstitution: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
