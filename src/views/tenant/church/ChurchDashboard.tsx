import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Users, Plus, DollarSign, 
  Calendar, CheckCircle2, RefreshCw, Church
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ChurchMemberRecord, ChurchGivingRecord } from '../../../types';

export const ChurchDashboard: React.FC = () => {
  const { currentTenant, token, user } = useAuth();
  const [members, setMembers] = useState<ChurchMemberRecord[]>([]);
  const [givings, setGivings] = useState<ChurchGivingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'givings'>('givings');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showGivingModal, setShowGivingModal] = useState(false);

  const [memberForm, setMemberForm] = useState({
    memberNo: `CH-${Math.floor(100 + Math.random() * 900)}`,
    fullName: '',
    phone: '',
    email: '',
    ministryOrFellowship: 'Men Fellowship',
    membershipStatus: 'COMMUNICANT' as const,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [givingForm, setGivingForm] = useState({
    giverName: '',
    amount: 1000,
    category: 'TITHE' as const,
    paymentMethod: 'MPESA' as const,
    reference: `MP-${Date.now().toString(36).toUpperCase()}`,
    serviceName: 'Sunday Main Service',
    date: new Date().toISOString().split('T')[0]
  });

  const currencySymbol = currentTenant?.branding?.currencySymbol || 'KES';

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

  const fetchChurchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [memRes, givRes] = await Promise.all([
        fetch('/api/app/church/members', { headers }),
        fetch('/api/app/church/givings', { headers })
      ]);
      if (memRes.ok) {
        const d = await memRes.json();
        setMembers(d.members || []);
      }
      if (givRes.ok) {
        const g = await givRes.json();
        setGivings(g.givings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurchData();
  }, [currentTenant?.id, user?.tenantId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.fullName.trim()) {
      setErrorMsg('Please provide member full name');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const headers = getAuthHeaders();
      const targetTenantId = currentTenant?.id || user?.tenantId || '';
      const res = await fetch('/api/app/church/members', {
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
        if (data.member) {
          setMembers(prev => [data.member, ...prev]);
        }
        fetchChurchData();
        setMemberForm({
          memberNo: `CH-${Math.floor(100 + Math.random() * 900)}`,
          fullName: '',
          phone: '',
          email: '',
          ministryOrFellowship: 'Men Fellowship',
          membershipStatus: 'COMMUNICANT',
          joinDate: new Date().toISOString().split('T')[0]
        });
      } else {
        setErrorMsg(data.message || data.error || 'Failed to add church member');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registering member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordGiving = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const headers = getAuthHeaders();
      const targetTenantId = currentTenant?.id || user?.tenantId || '';
      const res = await fetch('/api/app/church/givings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...givingForm,
          tenantId: targetTenantId
        })
      });
      if (res.ok) {
        setShowGivingModal(false);
        fetchChurchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalTithes = givings.filter(g => g.category === 'TITHE').reduce((s, g) => s + g.amount, 0);
  const totalOfferings = givings.filter(g => g.category === 'OFFERING').reduce((s, g) => s + g.amount, 0);
  const totalBuilding = givings.filter(g => g.category === 'BUILDING_PROJECT').reduce((s, g) => s + g.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Operations & Giving</h1>
          <p className="text-sm text-gray-500 mt-1">Tithes, offerings, building projects & ministry fellowships</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGivingModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Tithe / Offering</span>
          </button>
          <button
            onClick={() => setShowMemberModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
          <button
            onClick={fetchChurchData}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase">Tithes Collected</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{currencySymbol} {totalTithes.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase">Sunday Offerings</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{currencySymbol} {totalOfferings.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase">Building & Missions</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-1">{currencySymbol} {totalBuilding.toLocaleString()}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl">
        <button
          onClick={() => setActiveTab('givings')}
          className={`py-4 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'givings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'
          }`}
        >
          Giving Records ({givings.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`py-4 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Congregants ({members.length})
        </button>
      </div>

      {/* TAB: GIVINGS */}
      {activeTab === 'givings' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Giver / Member</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Payment Channel</th>
                <th className="px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {givings.map(g => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{g.date}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{g.giverName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">
                      {g.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{g.serviceName}</td>
                  <td className="px-6 py-4 text-xs">{g.paymentMethod} ({g.reference})</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{currencySymbol} {g.amount.toLocaleString()}</td>
                </tr>
              ))}
              {givings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No giving records yet. Click "Record Tithe / Offering" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: RECORD GIVING */}
      {showGivingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Record Giving</h3>
            <form onSubmit={handleRecordGiving} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Giver Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Kamau / Anonymous"
                  value={givingForm.giverName}
                  onChange={e => setGivingForm({ ...givingForm, giverName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Category</label>
                  <select
                    value={givingForm.category}
                    onChange={e => setGivingForm({ ...givingForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="TITHE">Tithe</option>
                    <option value="OFFERING">Offering</option>
                    <option value="BUILDING_PROJECT">Building Project</option>
                    <option value="MISSIONS">Missions</option>
                    <option value="THANKSGIVING">Thanksgiving</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={givingForm.amount}
                    onChange={e => setGivingForm({ ...givingForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Payment Channel</label>
                  <select
                    value={givingForm.paymentMethod}
                    onChange={e => setGivingForm({ ...givingForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Ref Code</label>
                  <input
                    type="text"
                    required
                    value={givingForm.reference}
                    onChange={e => setGivingForm({ ...givingForm, reference: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowGivingModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                >
                  Post Giving
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
