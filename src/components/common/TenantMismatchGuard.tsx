import React from 'react';
import { ShieldX, AlertTriangle, ArrowRight, LogOut, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { buildTenantUrl } from '../../lib/domainResolver';

interface TenantMismatchGuardProps {
  currentSubdomainSlug: string;
  userTenantName?: string;
  userTenantSlug?: string;
  onNavigateCorrectTenant?: () => void;
}

export const TenantMismatchGuard: React.FC<TenantMismatchGuardProps> = ({
  currentSubdomainSlug,
  userTenantName,
  userTenantSlug,
  onNavigateCorrectTenant
}) => {
  const { user, logout } = useAuth();

  const handleSwitchWorkspace = () => {
    if (onNavigateCorrectTenant) {
      onNavigateCorrectTenant();
    } else if (userTenantSlug) {
      window.location.href = buildTenantUrl(userTenantSlug);
    } else {
      window.location.hash = '/app/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-lg w-full bg-slate-900 border border-rose-900/40 rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-8 h-8 text-rose-500" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Strict Tenant Isolation Security Enforced</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tenant Access Denied
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Your account (<span className="text-slate-200 font-medium">{user?.email}</span>) is assigned to{' '}
            <strong className="text-white">{userTenantName || 'a different organization'}</strong> and cannot view data belonging to{' '}
            <strong className="text-rose-400">{currentSubdomainSlug}</strong>.
          </p>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Security Policy:</span>
          </div>
          <p>
            Davetech Cloud ERP enforces zero-cross-tenant data leakage. Users are cryptographically restricted to their home workspace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSwitchWorkspace}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go to My Organization Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
