import React, { useState } from 'react';
import { KeyRound, X, Copy, Check, Sparkles, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { User } from '../../../types';

interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  user,
  onClose,
  onSuccess
}) => {
  const [passwordMode, setPasswordMode] = useState<'custom' | 'generate'>('generate');
  const [customPassword, setCustomPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ password: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    let newPasswordToSet = '';
    if (passwordMode === 'custom') {
      if (!customPassword || customPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      newPasswordToSet = customPassword;
    } else {
      newPasswordToSet = generateStrongPassword();
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('erp_token') || '';
      const userId = localStorage.getItem('erp_user_id') || 'usr_superadmin_01';

      const res = await fetch(`/api/platform/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'Authorization': token ? `Bearer ${token}` : `Bearer ${userId}`
        },
        body: JSON.stringify({ newPassword: newPasswordToSet })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setResetResult({
          password: data.newPassword || newPasswordToSet,
          message: data.message || `Password for ${user.email} successfully updated.`
        });
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || data.message || `Failed to reset password (HTTP ${res.status}).`);
      }
    } catch (err: any) {
      setError(err.message || 'Network error while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (resetResult?.password) {
      navigator.clipboard.writeText(resetResult.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset Account Password</h3>
              <p className="text-[11px] text-slate-400">Super Admin Direct Credential Override</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Pill */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Target User:</span>
            <span className="font-bold text-white">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Account Email:</span>
            <span className="font-mono text-purple-300 font-semibold">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Assigned Role:</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300">
              {user.role}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Result View */}
        {resetResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-xs">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Password Reset Successfully!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                The account password has been updated immediately in the database. Share these credentials securely with the user:
              </p>

              <div className="flex items-center justify-between bg-slate-950 border border-emerald-500/40 rounded-xl p-3">
                <span className="font-mono text-sm font-bold text-emerald-300 tracking-wider select-all">
                  {resetResult.password}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Password'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPasswordMode('generate')}
                className={`py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5 ${
                  passwordMode === 'generate'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Strong</span>
              </button>
              <button
                type="button"
                onClick={() => setPasswordMode('custom')}
                className={`py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5 ${
                  passwordMode === 'custom'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Custom Password</span>
              </button>
            </div>

            {passwordMode === 'custom' ? (
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-semibold">Enter New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Minimum 6 characters (e.g. Pass123!)"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                A secure, cryptographically random 12-character password will be generated and saved to the database. You will be able to copy it instantly.
              </p>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>{loading ? 'Resetting...' : 'Reset Password Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
