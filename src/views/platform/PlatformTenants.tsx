import React, { useState, useEffect } from 'react';
import { Tenant, ModuleId, TenantType, EducationType } from '../../types';
import { ALL_ERP_MODULES } from '../../data/modulesCatalog';
import { INITIAL_TENANTS } from '../../data/dbStore';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Plus, ShieldCheck, Check, X, Edit2, AlertCircle, RefreshCw, 
  Layers, ExternalLink, KeyRound, Users, Trash2, ShieldAlert, CheckCircle2, Globe
} from 'lucide-react';
import { EditTenantModal } from './components/EditTenantModal';
import { TenantUsersModal } from './components/TenantUsersModal';
import { GlobalUsersList } from './components/GlobalUsersList';
import { compressImageFile } from '../../lib/imageUtils';

interface PlatformTenantsProps {
  onInspectNavigate?: () => void;
  initialTab?: 'tenants' | 'users';
}

export const PlatformTenants: React.FC<PlatformTenantsProps> = ({ onInspectNavigate, initialTab = 'tenants' }) => {
  const { inspectTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'tenants' | 'users'>(initialTab);
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const cached = localStorage.getItem('erp_cached_tenants');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [...INITIAL_TENANTS];
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [selectedTenantForModules, setSelectedTenantForModules] = useState<Tenant | null>(null);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<Tenant | null>(null);
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState<Tenant | null>(null);
  const [selectedTenantForDelete, setSelectedTenantForDelete] = useState<Tenant | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Module checklist state for modal
  const [editedModules, setEditedModules] = useState<ModuleId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // New Tenant Form
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantLogoUrl, setNewTenantLogoUrl] = useState('');
  const [newTenantType, setNewTenantType] = useState<TenantType>('EDUCATION');
  const [newEducationType, setNewEducationType] = useState<EducationType>('TVET');
  const [newCurrency, setNewCurrency] = useState('KES');
  const [newCurrencySymbol, setNewCurrencySymbol] = useState('KSh');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newModules, setNewModules] = useState<ModuleId[]>(['education', 'accounting', 'hr', 'inventory', 'crm']);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/platform/tenants', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const tenantMap = new Map<string, Tenant>();
          INITIAL_TENANTS.forEach(t => tenantMap.set(t.id, t));
          data.forEach((t: Tenant) => tenantMap.set(t.id, t));
          const merged = Array.from(tenantMap.values());
          setTenants(merged);
          localStorage.setItem('erp_cached_tenants', JSON.stringify(merged));
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleOpenModuleModal = (tenant: Tenant) => {
    setSelectedTenantForModules(tenant);
    setEditedModules([...tenant.enabledModules]);
  };

  const handleToggleModuleInModal = (modId: ModuleId) => {
    if (editedModules.includes(modId)) {
      setEditedModules(editedModules.filter(m => m !== modId));
    } else {
      setEditedModules([...editedModules, modId]);
    }
  };

  const handleSaveModules = async () => {
    if (!selectedTenantForModules) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/platform/tenants/${selectedTenantForModules.id}/modules`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ enabledModules: editedModules })
      });

      if (res.ok) {
        await fetchTenants();
        setSelectedTenantForModules(null);
        setNotification(`Active modules for ${selectedTenantForModules.name} successfully updated.`);
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert('Failed to update tenant modules');
      }
    } catch (err) {
      console.error('Save modules error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTenantStatus = async (tenant: Tenant) => {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchTenants();
        setNotification(`Tenant ${tenant.name} status changed to ${nextStatus}.`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenantForDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/platform/tenants/${selectedTenantForDelete.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setNotification(`Organization "${selectedTenantForDelete.name}" and ${data.deletedUsersCount || 0} associated accounts deleted.`);
        setSelectedTenantForDelete(null);
        setDeleteConfirmText('');
        await fetchTenants();
        setTimeout(() => setNotification(null), 5000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete organization');
      }
    } catch (err) {
      console.error('Delete tenant error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newAdminEmail) {
      alert('Please fill in required tenant fields');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/platform/tenants', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newTenantName,
          logoUrl: newTenantLogoUrl,
          type: newTenantType,
          educationType: newTenantType === 'EDUCATION' ? newEducationType : undefined,
          currency: newCurrency,
          currencySymbol: newCurrencySymbol,
          adminEmail: newAdminEmail,
          adminName: newAdminName || `${newTenantName} Administrator`,
          enabledModules: newModules
        })
      });

      if (res.ok) {
        await fetchTenants();
        setIsCreateModalOpen(false);
        setNotification(`Organization "${newTenantName}" provisioned successfully with Admin account.`);
        setTimeout(() => setNotification(null), 5000);
        // Reset
        setNewTenantName('');
        setNewTenantLogoUrl('');
        setNewAdminEmail('');
        setNewAdminName('');
      } else {
        alert('Failed to provision tenant');
      }
    } catch (err) {
      console.error('Create tenant error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1F2937]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1D53D9] flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#1D53D9]" />
            <span>Platform Tenant & Credential Authority</span>
          </h2>
          <p className="text-xs text-[#777E8C] mt-1 font-medium">
            Manage customer institutions, edit settings, delete tenants, and reset passwords or emails for all tenant accounts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-[#F49C10] hover:bg-[#E08C00] text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Customer Tenant</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#14B57A] shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#D8DCEB] pb-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'tenants'
              ? 'bg-[#1D53D9] text-white shadow-xs'
              : 'bg-white text-[#777E8C] border border-[#D8DCEB] hover:text-[#1F2937] hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organizations & Subscriptions ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#1D53D9] text-white shadow-xs'
              : 'bg-white text-[#777E8C] border border-[#D8DCEB] hover:text-[#1F2937] hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#F49C10]" />
          <span>All User Accounts & Password Reset</span>
        </button>
      </div>

      {/* TAB 1: TENANTS LIST */}
      {activeTab === 'tenants' && (
        <div className="bg-white border border-[#D8DCEB] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#D8DCEB] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#777E8C]">
            <span className="font-semibold">Registered Organizations: <strong className="text-[#1D53D9]">{tenants.length}</strong></span>
            <button onClick={fetchTenants} className="hover:text-[#1D53D9] font-semibold flex items-center space-x-1 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1F2937]">
              <thead className="bg-[#F8FAFC] text-[#777E8C] uppercase font-mono text-[10px] border-b border-[#D8DCEB]">
                <tr>
                  <th className="p-4 font-bold">Organization Name</th>
                  <th className="p-4 font-bold">Type & Subtype</th>
                  <th className="p-4 font-bold">Currency</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Enabled Modules</th>
                  <th className="p-4 text-right font-bold">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DCEB]">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1F2937]">
                      <div className="flex items-center space-x-3">
                        {t.branding?.logoUrl ? (
                          <img
                            src={t.branding.logoUrl}
                            alt={t.name}
                            className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-[#D8DCEB] shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                            style={{ backgroundColor: t.branding?.primaryColor || '#1D53D9' }}
                          >
                            {t?.name ? t.name.charAt(0) : 'T'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#1D53D9] text-sm">{t?.name || 'Tenant'}</p>
                          <p className="text-[11px] text-[#777E8C] font-mono">ID: {t.id}</p>
                          {t.branding?.contactEmail && (
                            <p className="text-[10px] text-[#7CA4EF] font-mono">{t.branding.contactEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-[#F8FAFC] border border-[#D8DCEB] rounded-lg text-[11px] font-semibold text-[#1F2937]">
                        {t.type} {t.educationType ? `• ${t.educationType}` : ''}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-semibold text-[#1F2937]">
                      {t.branding?.currency || 'USD'} ({t.branding?.currencySymbol || '$'})
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'ACTIVE'
                          ? 'bg-[#14B57A]/15 text-[#14B57A] border border-[#14B57A]/30'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {t.enabledModules.map((m) => (
                          <span key={m} className="px-2.5 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded-full text-[10px] font-semibold capitalize">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Users & Password Reset Button */}
                      <button
                        onClick={() => setSelectedTenantForUsers(t)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Manage tenant users, reset passwords, change emails"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#F49C10]" />
                        <span>Users & Passwords</span>
                      </button>

                      {/* Public Website Link */}
                      <a
                        href={`/#/public/${t.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title={`Open ${t.name} public website`}
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Website</span>
                      </a>

                      {/* Edit Organization Button */}
                      <button
                        onClick={() => setSelectedTenantForEdit(t)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1D53D9] border border-blue-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Edit organization profile, branding, contacts, and currency"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Inspect Context Button */}
                      <button
                        onClick={async () => {
                          const ok = await inspectTenant(t.id);
                          if (ok && onInspectNavigate) {
                            onInspectNavigate();
                          }
                        }}
                        className="px-2.5 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#1F2937] border border-[#D8DCEB] rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Inspect workspace context"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#1D53D9]" />
                        <span>Inspect</span>
                      </button>

                      {/* Configure Modules */}
                      <button
                        onClick={() => handleOpenModuleModal(t)}
                        className="px-2.5 py-1.5 bg-[#EBE2F5] hover:bg-purple-100 text-[#1D53D9] border border-[#D8DCEB] rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Toggle active ERP modules"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Modules</span>
                      </button>

                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleTenantStatus(t)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          t.status === 'ACTIVE'
                            ? 'bg-slate-50 hover:bg-amber-50 text-[#777E8C] hover:text-amber-700 border border-[#D8DCEB]'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>

                      {/* Delete Tenant */}
                      <button
                        onClick={() => {
                          setSelectedTenantForDelete(t);
                          setDeleteConfirmText('');
                        }}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Delete organization permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL USER ACCOUNTS & PASSWORD RESET */}
      {activeTab === 'users' && (
        <GlobalUsersList tenants={tenants} />
      )}

      {/* MODAL: EDIT TENANT */}
      {selectedTenantForEdit && (
        <EditTenantModal
          tenant={selectedTenantForEdit}
          onClose={() => setSelectedTenantForEdit(null)}
          onSuccess={() => {
            fetchTenants();
            setNotification(`Organization "${selectedTenantForEdit.name}" updated successfully.`);
            setTimeout(() => setNotification(null), 4000);
          }}
        />
      )}

      {/* MODAL: TENANT USERS & CREDENTIALS */}
      {selectedTenantForUsers && (
        <TenantUsersModal
          tenant={selectedTenantForUsers}
          onClose={() => setSelectedTenantForUsers(null)}
        />
      )}

      {/* MODAL: DELETE TENANT DOUBLE CONFIRMATION */}
      {selectedTenantForDelete && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-100">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Tenant Organization</h3>
                <p className="text-xs text-red-400">Irreversible Destructive Action</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-200 space-y-2">
              <p className="font-semibold text-white">
                You are about to permanently delete:
              </p>
              <p className="font-bold text-sm text-red-300 bg-slate-950/60 p-2 rounded-lg border border-red-800/40">
                {selectedTenantForDelete.name} ({selectedTenantForDelete.id})
              </p>
              <p className="text-[11px] text-slate-300">
                This will delete the institution record, purge all enrolled user accounts associated with this tenant, and remove its data.
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold">
                To confirm deletion, please click the button below:
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTenantForDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTenant}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting Organization...' : 'Permanently Delete Organization'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE CONFIGURATION MODAL */}
      {selectedTenantForModules && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>Configure Modules for {selectedTenantForModules?.name || 'Tenant'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select which ERP modules are active for this customer.
                </p>
              </div>
              <button
                onClick={() => setSelectedTenantForModules(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
              {ALL_ERP_MODULES.map((mod) => {
                const isChecked = editedModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModuleInModal(mod.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isChecked
                        ? 'bg-purple-950/40 border-purple-500/50 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border text-xs shrink-0 ${
                      isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600 bg-slate-800'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-white">{mod.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded uppercase">
                          {mod.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Selected Modules: <strong className="text-white">{editedModules.length}</strong> / {ALL_ERP_MODULES.length}
              </span>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTenantForModules(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModules}
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center space-x-2"
                >
                  {isSaving ? 'Saving...' : 'Apply Module Configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION NEW TENANT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTenant} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>Provision New Customer Tenant</span>
              </h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Company / Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenya Medical College"
                  value={newTenantName}
                  onChange={e => setNewTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tenant Logo Image (File or URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={newTenantLogoUrl}
                    onChange={e => setNewTenantLogoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImageFile(file, 400, 400, 0.85);
                            setNewTenantLogoUrl(compressed);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tenant Domain/Type *</label>
                <select
                  value={newTenantType}
                  onChange={e => setNewTenantType(e.target.value as TenantType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="EDUCATION">Education / School ERP</option>
                  <option value="HOSPITAL">Hospital Healthcare</option>
                  <option value="POS">Point of Sale (POS)</option>
                  <option value="RETAIL">Retail Shop</option>
                  <option value="WHOLESALE">Wholesale Trade</option>
                  <option value="CHURCH">Church Management</option>
                  <option value="SACCO">Chama & SACCO</option>
                  <option value="BAR">Bar & Lounge</option>
                  <option value="GENERAL_ERP">General ERP</option>
                </select>
              </div>

              {newTenantType === 'EDUCATION' && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Education Subtype</label>
                  <select
                    value={newEducationType}
                    onChange={e => setNewEducationType(e.target.value as EducationType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="UNIVERSITY">University</option>
                    <option value="COLLEGE">College</option>
                    <option value="TVET">TVET / Vocational Training</option>
                    <option value="SECONDARY_SCHOOL">Secondary School</option>
                    <option value="PRIMARY_SCHOOL">Primary School</option>
                    <option value="TRAINING_INSTITUTE">Training Institute</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Operating Currency</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. KES or USD"
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value)}
                    className="w-2/3 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Symbol (KSh)"
                    value={newCurrencySymbol}
                    onChange={e => setNewCurrencySymbol(e.target.value)}
                    className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tenant Admin Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@institution.ac.ke"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tenant Admin Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. John Principal"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Initial Modules Selection */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Select Initial Enabled Modules
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                {ALL_ERP_MODULES.map(m => {
                  const checked = newModules.includes(m.id);
                  return (
                    <label key={m.id} className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) setNewModules(newModules.filter(id => id !== m.id));
                          else setNewModules([...newModules, m.id]);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                      />
                      <span className="truncate">{m.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg"
              >
                {isSaving ? 'Provisioning...' : 'Provision Tenant Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
