import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon, Upload, Image, Key, X, Lock, Building2, Camera, Trash2, Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import { compressImageFile } from '../../lib/imageUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, tenant, refreshAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Tenant logo inline edit (for tenant admin)
  const [tenantLogoUrl, setTenantLogoUrl] = useState('');

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'organization'>('profile');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setDepartment(user.department || '');
      setAvatarUrl(user.avatarUrl || '');
    }
    if (tenant) {
      setTenantLogoUrl(tenant.branding?.logoUrl || '');
    }
    setError('');
    setSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [user, tenant, isOpen]);

  if (!isOpen || !user) return null;

  // Handle Avatar Image File Upload
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 300, 300, 0.85);
      setAvatarUrl(compressed);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to process avatar image');
    }
  };

  // Handle Tenant Logo Image Upload inside profile
  const handleTenantLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid logo image file.');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 400, 400, 0.85);
      setTenantLogoUrl(compressed);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to process logo image');
    }
  };

  // Save User Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (activeTab === 'password') {
      if (!currentPassword) {
        setError('Please enter your current password.');
        return;
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        },
        body: JSON.stringify({
          name,
          email,
          department,
          avatarUrl,
          ...(activeTab === 'password' ? { currentPassword, newPassword } : {})
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update user profile.');
      }

      // If Tenant Admin updated tenant logo in Organization tab
      if (user.role === 'TENANT_ADMIN' && tenant && activeTab === 'organization') {
        const logoRes = await fetch('/api/tenant/branding', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('erp_user_id') || ''
          },
          body: JSON.stringify({ logoUrl: tenantLogoUrl })
        });
        if (!logoRes.ok) {
          throw new Error('Profile saved, but failed to update tenant logo.');
        }
      }

      await refreshAuth();
      setSuccess('Profile & avatar settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const primaryColor = tenant?.branding?.primaryColor || '#1e3a8a';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-xs max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/20 shadow-xs"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-full text-white font-bold text-sm flex items-center justify-center border-2 border-white/20 shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {name.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>{name || 'User Settings'}</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] uppercase tracking-wider font-semibold">
                  {user.role.replace('_', ' ')}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{email} • {tenant?.name || 'Platform Administrator'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-semibold border-b-2 text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>My Profile & Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 font-semibold border-b-2 text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Security & Password</span>
          </button>

          {tenant && (
            <button
              onClick={() => setActiveTab('organization')}
              className={`px-4 py-2 font-semibold border-b-2 text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
                activeTab === 'organization'
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Organization Logo</span>
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & AVATAR LOGO */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo / Avatar Upload */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <label className="font-bold text-slate-900 text-sm block">User Profile Photo / Avatar</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-300 shadow-md"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl text-white font-bold text-2xl flex items-center justify-center border-2 border-slate-300 shadow-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {name.charAt(0) || 'U'}
                      </div>
                    )}
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs cursor-pointer"
                        title="Remove Profile Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Profile Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Or paste photo URL:</span>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={avatarUrl}
                        onChange={e => setAvatarUrl(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Department / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Finance, Academic Registrar"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Role & Access Level</label>
                  <input
                    type="text"
                    disabled
                    value={user.role.replace('_', ' ')}
                    className="w-full mt-1 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono capitalize cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-4 max-w-md">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>To change your account password, enter your current password followed by your new password.</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Current Password *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ORGANIZATION LOGO */}
          {activeTab === 'organization' && tenant && (
            <div className="space-y-5">
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">{tenant.name} Logo</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    This logo appears in the main app header, sidebar, and exported invoices/statements for {tenant.name}.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <label className="font-bold text-slate-900 text-sm block">Tenant Brand Logo</label>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Live Logo Preview Box */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center w-48 shrink-0 shadow-lg">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sidebar Preview</span>
                    {tenantLogoUrl ? (
                      <img
                        src={tenantLogoUrl}
                        alt="Tenant Logo"
                        className="max-h-12 max-w-full object-contain rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {tenant.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-white font-bold text-xs truncate max-w-full">{tenant.name}</span>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Tenant Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTenantLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {tenantLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setTenantLogoUrl('')}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Or enter Logo Image URL:</span>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={tenantLogoUrl}
                        onChange={e => setTenantLogoUrl(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
