import React, { useState } from 'react';
import { Edit2, X, AlertCircle, RefreshCw, Save, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User, Tenant } from '../../../types';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const userId = localStorage.getItem('erp_user_id') || 'usr_superadmin_01';

      const res = await fetch(`/api/platform/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'Authorization': token ? `Bearer ${token}` : `Bearer ${userId}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department: department.trim() || undefined,
          tenantId: tenantId || undefined,
          password: newPassword.trim() ? newPassword.trim() : undefined
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
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

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit User & Account Details</h3>
              <p className="text-[11px] text-slate-400">Update email, role, institution, or credentials</p>
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
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Changing this email will update the login credential immediately across all sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>System Role *</span>
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="TENANT_ADMIN">TENANT_ADMIN (Institution Admin)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Super Admin)</option>
                <option value="LECTURER">LECTURER / FACULTY</option>
                <option value="ACCOUNTANT">ACCOUNTANT / BURSAR</option>
                <option value="STUDENT">STUDENT</option>
                <option value="STAFF">GENERAL STAFF</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Department / Faculty</label>
              <input
                type="text"
                placeholder="e.g. Computing, Finance"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {tenants.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Assigned Tenant Organization</label>
              <select
                value={tenantId}
                onChange={e => setTenantId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-semibold"
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
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
