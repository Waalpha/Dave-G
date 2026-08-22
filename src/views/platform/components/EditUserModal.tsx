import React, { useState, useEffect } from 'react';
import { 
  Edit2, X, AlertCircle, RefreshCw, Save, Mail, User as UserIcon, 
  ShieldCheck, KeyRound, ChevronDown, ChevronUp, CheckSquare, Square, 
  Sliders, Sparkles, Lock
} from 'lucide-react';
import { User, Tenant, RoleDefinition, PermissionDefinition } from '../../../types';
import { SYSTEM_PERMISSIONS, DEFAULT_SYSTEM_ROLES, getPermissionsForRole } from '../../../data/rolesPermissions';

interface EditUserModalProps {
  user: User;
  tenants?: Tenant[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  tenants = [],
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState(user.role || 'STAFF');
  const [department, setDepartment] = useState(user.department || '');
  const [tenantId, setTenantId] = useState(user.tenantId || '');
  const [newPassword, setNewPassword] = useState('');
  const [availableRoles, setAvailableRoles] = useState<RoleDefinition[]>(DEFAULT_SYSTEM_ROLES);
  const [permissions, setPermissions] = useState<string[]>(() => {
    if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
      return user.permissions.includes('*') ? SYSTEM_PERMISSIONS.map(p => p.code) : user.permissions;
    }
    return getPermissionsForRole(user.role || 'STAFF');
  });
  const [showCustomPermissions, setShowCustomPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant custom roles if available
  useEffect(() => {
    const targetTenant = tenantId || user.tenantId;
    if (targetTenant && targetTenant !== 'platform_super_admin') {
      fetch(`/api/tenant/roles?tenantId=${targetTenant}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': targetTenant
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setAvailableRoles(data);
          }
        })
        .catch(console.error);
    }
  }, [tenantId, user.tenantId]);

  // When role changes, update permissions if user hasn't explicitly customized
  const handleRoleChange = (newRole: string) => {
    setRole(newRole as any);
    const defaultPerms = getPermissionsForRole(newRole, availableRoles);
    setPermissions(defaultPerms.includes('*') ? SYSTEM_PERMISSIONS.map(p => p.code) : defaultPerms);
  };

  const handleTogglePermission = (permCode: string) => {
    setPermissions(prev => {
      if (prev.includes(permCode)) {
        return prev.filter(p => p !== permCode);
      } else {
        return [...prev, permCode];
      }
    });
  };

  const handleToggleCategory = (categoryName: string) => {
    const catPerms = SYSTEM_PERMISSIONS.filter(p => p.category === categoryName).map(p => p.code);
    const allSelected = catPerms.every(p => permissions.includes(p));

    if (allSelected) {
      setPermissions(prev => prev.filter(p => !catPerms.includes(p)));
    } else {
      setPermissions(prev => [...prev, ...catPerms.filter(p => !prev.includes(p))]);
    }
  };

  const handleSelectAll = () => {
    setPermissions(SYSTEM_PERMISSIONS.map(p => p.code));
  };

  const handleResetToRoleDefault = () => {
    const defaultPerms = getPermissionsForRole(role, availableRoles);
    setPermissions(defaultPerms.includes('*') ? SYSTEM_PERMISSIONS.map(p => p.code) : defaultPerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('erp_token') || '';
      const currentUserId = localStorage.getItem('erp_user_id') || 'usr_superadmin_01';
      const effectiveTenantId = tenantId || user.tenantId || '';

      // Determine appropriate endpoint (tenant vs platform)
      const endpoint = user.tenantId && user.tenantId !== 'platform_super_admin'
        ? `/api/tenant/users/${user.id}`
        : `/api/platform/users/${user.id}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
          'x-tenant-id': effectiveTenantId,
          'Authorization': token ? `Bearer ${token}` : `Bearer ${currentUserId}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department: department.trim() || undefined,
          tenantId: tenantId || undefined,
          permissions: permissions.length === SYSTEM_PERMISSIONS.length ? ['*'] : permissions,
          password: newPassword.trim() ? newPassword.trim() : undefined
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.user)) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || data.message || `Failed to update user profile (HTTP ${res.status}).`);
      }
    } catch (err: any) {
      setError(err.message || 'Error updating user.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Settings & Branding',
    'Users & Access',
    'Academics & Classes',
    'Students & Admissions',
    'Fees & Finance',
    'Exams & Grading',
    'HR & Payroll',
    'Inventory & POS',
    'Security & Audit'
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit User Profile &amp; Role Permissions</h3>
              <p className="text-[11px] text-slate-400">Configure account credentials, system role, and granular access rights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address (Login Identity) *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Updating this email changes the login credential across all ERP portals immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned System Role *</span>
              </label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
              >
                {availableRoles.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Department / Faculty</label>
              <input
                type="text"
                placeholder="e.g. Finance, Academic Affairs, ICT"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {tenants.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Assigned Organization / Tenant</label>
              <select
                value={tenantId}
                onChange={e => setTenantId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
              >
                <option value="platform_super_admin">Platform Root (platform_super_admin)</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Granular Permissions Collapsible Section */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <button
              type="button"
              onClick={() => setShowCustomPermissions(!showCustomPermissions)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">Granular Role Permissions</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  {permissions.length} Enabled
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                <span>{showCustomPermissions ? 'Hide Matrix' : 'Customize Permissions'}</span>
                {showCustomPermissions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showCustomPermissions && (
              <div className="p-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Configure exact privileges granted to this specific account:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={handleResetToRoleDefault}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Reset to Role Default
                    </button>
                  </div>
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1 text-xs">
                  {categories.map(cat => {
                    const catPerms = SYSTEM_PERMISSIONS.filter(p => p.category === cat);
                    if (catPerms.length === 0) return null;

                    const allInCat = catPerms.every(p => permissions.includes(p.code));

                    return (
                      <div key={cat} className="border border-slate-800 rounded-lg p-2.5 bg-slate-900/80 space-y-1.5">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">{cat}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            {allInCat ? 'Deselect Category' : 'Select Category'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {catPerms.map(perm => {
                            const isChecked = permissions.includes(perm.code);
                            return (
                              <label
                                key={perm.code}
                                className={`flex items-center space-x-2 p-1.5 rounded-lg border transition-colors cursor-pointer text-[11px] ${
                                  isChecked
                                    ? 'bg-blue-950/40 border-blue-600/40 text-blue-200'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.code)}
                                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="truncate font-medium">{perm.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            <label className="text-slate-300 font-semibold">
              Set New Password Directly (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank to keep existing password unchanged"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl font-bold shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{loading ? 'Saving...' : 'Save User Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

