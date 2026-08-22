import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, Building2, Palette, DollarSign, Save, CheckCircle2, Upload, 
  Image as ImageIcon, Trash2, Globe, ExternalLink, Sparkles, BookOpen, 
  Calendar, RefreshCw, Layers, Users, KeyRound, Edit2, Plus, Search,
  Shield, AlertTriangle, AlertCircle, Mail, UserPlus, Sliders,
  MoveUp, MoveDown, Eye, Copy, ArrowRight, Layout
} from 'lucide-react';
import { Tenant, User, TenantDomain } from '../../types';
import { ResetPasswordModal } from '../platform/components/ResetPasswordModal';
import { EditUserModal } from '../platform/components/EditUserModal';
import { compressImageFile } from '../../lib/imageUtils';
import { TenantPublicWebsiteEditor } from './components/TenantPublicWebsiteEditor';

interface TenantSettingsProps {
  initialTab?: 'website' | 'branding' | 'users';
}

export const TenantSettings: React.FC<TenantSettingsProps> = ({ initialTab = 'website' }) => {
  const { tenant, user, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'website' | 'branding' | 'users'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('users')) return 'users';
      if (hash.includes('branding')) return 'branding';
      if (hash.includes('website') || hash.includes('cms')) return 'website';
    }
    return initialTab || 'website';
  });

  useEffect(() => {
    if (initialTab) {
      if ((initialTab as string) === 'public_website' || (initialTab as string) === 'website') {
        setActiveTab('website');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenant?.id || '');

  // Read-only domain info state
  const [tenantDomains, setTenantDomains] = useState<TenantDomain[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Users state for Tenant User Management
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  // New user creation state
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('STAFF');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [userActionNotice, setUserActionNotice] = useState<string | null>(null);

  // Branding state
  const [companyName, setCompanyName] = useState(tenant?.branding?.companyName || tenant?.name || '');
  const [logoUrl, setLogoUrl] = useState(tenant?.branding?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.branding?.primaryColor || '#1D53D9');
  const [currency, setCurrency] = useState(tenant?.branding?.currency || 'KES');
  const [currencySymbol, setCurrencySymbol] = useState(tenant?.branding?.currencySymbol || 'KSh');
  const [contactEmail, setContactEmail] = useState(tenant?.branding?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(tenant?.branding?.contactPhone || '');
  const [address, setAddress] = useState(tenant?.branding?.address || '');

  // UI state
  const [saved, setSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState('Configuration saved successfully!');
  const [saving, setSaving] = useState(false);

  const populateFromTenant = (t: any) => {
    if (!t) return;
    setCompanyName(t.branding?.companyName || t.name || '');
    setLogoUrl(t.branding?.logoUrl || '');
    setPrimaryColor(t.branding?.primaryColor || '#1e3a8a');
    setCurrency(t.branding?.currency || 'KES');
    setCurrencySymbol(t.branding?.currencySymbol || 'KSh');
    setContactEmail(t.branding?.contactEmail || '');
    setContactPhone(t.branding?.contactPhone || '');
    setAddress(t.branding?.address || '');
  };

  // Load tenant list for Super Admin ONLY
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetch('/api/platform/tenants', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAllTenants(data);
          }
        })
        .catch(console.error);
    } else {
      setAllTenants([]);
    }
  }, [user]);

  // Load selected tenant data
  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      if (tenant) {
        setSelectedTenantId(tenant.id);
        populateFromTenant(tenant);
      }
      return;
    }

    const fetchInfo = async () => {
      try {
        const targetId = selectedTenantId || tenant?.id || '';
        if (!targetId) return;
        const res = await fetch(`/api/tenant/info?tenantId=${targetId}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('erp_user_id') || '',
            'x-tenant-id': targetId
          }
        });
        if (res.ok) {
          const t = await res.json();
          if (t && (t.name || t.branding)) {
            populateFromTenant(t);
          }
        } else if (tenant) {
          populateFromTenant(tenant);
        }
      } catch (e) {
        console.error('Failed to load tenant info:', e);
        if (tenant) populateFromTenant(tenant);
      }
    };

    const fetchDomains = async () => {
      try {
        const targetId = (user?.role === 'SUPER_ADMIN' ? selectedTenantId : tenant?.id) || tenant?.id || '';
        if (!targetId) return;
        const res = await fetch(`/api/tenant/domains`, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('erp_user_id') || '',
            'x-tenant-id': targetId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setTenantDomains(data.domains || []);
        }
      } catch (e) {
        console.error('Failed to load tenant domains:', e);
      }
    };

    fetchInfo();
    fetchDomains();
  }, [selectedTenantId, tenant, user]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle Logo File Upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 400, 400, 0.85);
      setLogoUrl(compressed);
    } catch (err: any) {
      alert(err.message || 'Failed to compress image');
    }
  };

  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const targetTenantId = selectedTenantId || tenant?.id || '';
      if (!targetTenantId) {
        alert('Please select or specify a valid tenant');
        return;
      }
      const res = await fetch('/api/tenant/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': targetTenantId
        },
        body: JSON.stringify({
          tenantId: targetTenantId,
          companyName,
          logoUrl,
          primaryColor,
          currency,
          currencySymbol,
          contactEmail,
          contactPhone,
          address
        })
      });

      if (res.ok) {
        const updated = await res.json();
        if (updated) {
          populateFromTenant(updated);
        }
        await refreshAuth();
        setSavedMessage('Organization & Branding settings saved successfully!');
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || errData.error || 'Failed to save branding settings');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network error saving branding settings');
    } finally {
      setSaving(false);
    }
  };

  // User Management Functions
  const fetchTenantUsers = async () => {
    try {
      setLoadingUsers(true);
      const targetId = user?.role === 'SUPER_ADMIN' ? (selectedTenantId || tenant?.id || '') : (tenant?.id || '');
      if (!targetId) {
        setTenantUsers([]);
        return;
      }
      const endpoint = user?.role === 'SUPER_ADMIN'
        ? `/api/platform/tenants/${targetId}/users`
        : `/api/tenant/users`;
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': targetId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTenantUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch tenant users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchTenantUsers();
    }
  }, [activeTab, selectedTenantId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const targetId = user?.role === 'SUPER_ADMIN' ? (selectedTenantId || tenant?.id || '') : (tenant?.id || '');
      if (!targetId) {
        throw new Error('Please select a valid tenant first');
      }
      const endpoint = user?.role === 'SUPER_ADMIN'
        ? `/api/platform/tenants/${targetId}/users`
        : `/api/tenant/users`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': targetId
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          department: newUserDepartment,
          password: newUserPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create user account');
      }

      setIsCreatingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserDepartment('');
      setNewUserPassword('password123');
      setUserActionNotice(`User "${newUserName}" created successfully! Default password is set to: ${newUserPassword}`);
      fetchTenantUsers();
      setTimeout(() => setUserActionNotice(null), 6000);
    } catch (err: any) {
      setCreateError(err.message || 'Error creating user account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeletingUser(true);
      setDeleteUserError(null);
      const endpoint = user?.role === 'SUPER_ADMIN'
        ? `/api/platform/users/${userToDelete.id}`
        : `/api/tenant/users/${userToDelete.id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to delete user account');
      }

      const deletedName = userToDelete.name;
      setUserToDelete(null);
      setUserActionNotice(`User account "${deletedName}" has been successfully deleted.`);
      fetchTenantUsers();
      setTimeout(() => setUserActionNotice(null), 4000);
    } catch (err: any) {
      setDeleteUserError(err.message || 'Failed to delete user account');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const filteredUsers = tenantUsers.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header with Navigation and Live Website Preview Link */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Organization & Public Portal Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure your institutional branding, ERP preferences, and public-facing modern landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Save Header Button */}
          <button
            type="button"
            onClick={() => handleSaveBranding()}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Organization Scope / Identity Banner */}
      {user?.role !== 'SUPER_ADMIN' ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Organization</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {tenant?.status === 'ACTIVE' ? 'Active Account' : (tenant?.status || 'Active')}
                </span>
                {tenant?.type && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                    Type: {tenant.type}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {tenant?.name || companyName || 'Organization Workspace'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium self-start sm:self-auto shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Tenant Administrator Scope &bull; Isolated Workspace</span>
          </div>
        </div>
      ) : (
        /* Super Admin Platform Context & Switcher */
        allTenants.length > 0 && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Platform Super Admin</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900">
                    Global Oversight
                  </span>
                </div>
                <p className="text-xs font-semibold text-purple-800 mt-0.5">
                  Viewing Tenant: <span className="font-bold underline">{allTenants.find(t => t.id === selectedTenantId)?.name || tenant?.name || 'Select Tenant'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-purple-900 whitespace-nowrap">Switch Tenant Context:</label>
              <select
                value={selectedTenantId}
                onChange={e => setSelectedTenantId(e.target.value)}
                className="bg-white border border-purple-300 text-purple-950 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs cursor-pointer text-xs"
              >
                {allTenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      )}

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('website')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'website'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Public Website &amp; CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'branding'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>ERP Branding &amp; Currency</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team &amp; User Accounts</span>
        </button>
      </div>

      {/* TAB: PUBLIC WEBSITE & CMS */}
      {activeTab === 'website' && tenant && (
        <TenantPublicWebsiteEditor
          tenant={tenant}
          onSaved={async () => {
            await refreshAuth();
            setSavedMessage('Public website settings and hero slides saved and published successfully!');
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
          }}
        />
      )}

      {/* TAB 1: BRANDING */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          {/* Company Profile */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Company / Institution Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Display Institution Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Official Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Official Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Physical Address / Campus Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Organization Logo & Visual Identity */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Institutional Logo & Visual Identity</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Logo Preview box */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 text-center w-48 shrink-0 shadow-md">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sidebar Logo Preview</span>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={companyName || 'Logo'}
                      className="max-h-12 max-w-full object-contain rounded"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {(companyName || 'O').charAt(0)}
                    </div>
                  )}
                  <span className="text-white font-bold text-xs truncate max-w-full">{companyName || 'Organization'}</span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors text-xs">
                      <Upload className="w-4 h-4" />
                      <span>Upload Logo Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Or enter Logo Image URL:</span>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branding & Visuals */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Theme & Primary Accent Color</span>
            </h3>

            <div className="flex items-center space-x-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Accent Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-28 p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <span className="text-slate-500 block text-[10px]">Color Preview:</span>
                <div
                  className="px-4 py-1.5 rounded-lg text-white font-bold text-xs mt-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  {companyName || 'Sample Logo Branding'}
                </div>
              </div>
            </div>
          </div>

          {/* Currency & Financials */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Currency Settings</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="font-semibold text-slate-700">Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Organization Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: TEAM & USER ACCOUNTS */}

      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Organization Staff &amp; User Accounts</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Manage logins, assigned roles, password resets, and user access permissions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fetchTenantUsers()}
                disabled={loadingUsers}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  setIsCreatingUser(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            </div>
          </div>

          {/* Action notification */}
          {userActionNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 animate-fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{userActionNotice}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user by name, email, role, or department..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Users Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Loading user accounts...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No user accounts found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'TENANT_ADMIN' ? 'bg-blue-100 text-blue-700' :
                            u.role === 'LECTURER' ? 'bg-emerald-100 text-emerald-700' :
                            u.role === 'STUDENT' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{u.department || 'General'}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedUserForReset(u)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span className="hidden sm:inline">Password</span>
                            </button>
                            <button
                              onClick={() => setSelectedUserForEdit(u)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                              title="Edit User Details"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            {u.id !== 'user_super_admin' && (
                              <button
                                onClick={() => {
                                  setDeleteUserError(null);
                                  setUserToDelete(u);
                                }}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
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
      )}

      {/* CREATE USER MODAL */}
      {isCreatingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-900 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
                <UserPlus className="w-5 h-5" />
                <span>Create New User Account</span>
              </div>
              <button
                onClick={() => setIsCreatingUser(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Catherine Wangari"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. catherine@breakthrough.ac.ke"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Role *</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="STAFF">Staff / General</option>
                    <option value="LECTURER">Lecturer / Faculty</option>
                    <option value="ACCOUNTANT">Accountant / Bursar</option>
                    <option value="TENANT_ADMIN">Tenant Admin</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={newUserDepartment}
                    onChange={e => setNewUserDepartment(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">The user can change their password after logging in.</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingUser(false)}
                  disabled={createLoading}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER IN-APP CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-900 text-xs">
          <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500">Permanent account removal</p>
              </div>
            </div>

            {deleteUserError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{deleteUserError}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">User Name:</span>
                <span className="font-bold text-slate-900">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-blue-600 select-all">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Role:</span>
                <span className="font-mono text-amber-700 font-bold">{userToDelete.role}</span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this user account? All login sessions will be immediately invalidated.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingUser ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      {selectedUserForReset && (
        <ResetPasswordModal
          user={selectedUserForReset}
          onClose={() => setSelectedUserForReset(null)}
          onSuccess={fetchTenantUsers}
        />
      )}

      {selectedUserForEdit && (
        <EditUserModal
          user={selectedUserForEdit}
          tenants={allTenants.length > 0 ? allTenants : tenant ? [tenant] : []}
          onClose={() => setSelectedUserForEdit(null)}
          onSuccess={fetchTenantUsers}
        />
      )}

    </div>
  );
};
