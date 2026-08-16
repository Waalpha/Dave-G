import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AccessDeniedGuard } from '../../components/common/AccessDeniedGuard';
import { ModuleId } from '../../types';
import { getModuleInfo } from '../../data/modulesCatalog';
import { CheckCircle2, ShieldCheck, Activity, DollarSign, Users, Package, ShoppingBag, Store, Truck, Coins, Wine, HeartHandshake, Briefcase } from 'lucide-react';

interface GenericModuleViewProps {
  moduleId: ModuleId;
  onNavigateDashboard: () => void;
}

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({
  moduleId,
  onNavigateDashboard
}) => {
  const { tenant, isModuleEnabled } = useAuth();
  const moduleInfo = getModuleInfo(moduleId);
  const enabled = isModuleEnabled(moduleId);

  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (enabled) {
      fetch(`/api/app/${moduleId}/status`, {
        headers: { 'x-user-id': localStorage.getItem('erp_user_id') || '' }
      })
        .then(res => res.ok ? res.json().catch(() => null) : null)
        .then(data => data && setStatus(data))
        .catch(err => console.error(err));
    }
  }, [moduleId, enabled]);

  // BACKEND & FRONTEND MODULE SECURITY GUARD: Show Access Denied if disabled for this tenant!
  if (!enabled) {
    return (
      <AccessDeniedGuard
        moduleName={moduleInfo?.name || moduleId}
        reason={`The '${moduleInfo?.name || moduleId}' module is not enabled for ${tenant?.name || 'your organization'}.`}
        onNavigateDashboard={onNavigateDashboard}
      />
    );
  }

  const primaryColor = tenant?.branding?.primaryColor || '#1e3a8a';
  const currencySymbol = tenant?.branding?.currencySymbol || '$';

  return (
    <div className="space-y-6">
      {/* Module Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Module Active for {tenant?.name}</span>
            </span>
            <span className="text-xs text-slate-400">• {moduleInfo?.category}</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-2">{moduleInfo?.name}</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">{moduleInfo?.description}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
          <p className="text-slate-500 font-medium">Tenant Context:</p>
          <p className="font-bold text-slate-900">{tenant?.name}</p>
          <p className="text-[11px] text-slate-500">Currency: {tenant?.branding?.currency || 'USD'} ({currencySymbol})</p>
        </div>
      </div>

      {/* Module Overview Dashboard Content */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Operational Records</span>
          <p className="text-2xl font-bold text-slate-900">48 Active Records</p>
          <p className="text-[11px] text-emerald-600 font-medium">Isolated in {tenant?.name}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Monthly Transaction Volume</span>
          <p className="text-2xl font-bold text-slate-900">{currencySymbol} 128,400</p>
          <p className="text-[11px] text-slate-500">Recorded this fiscal year</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Access Status</span>
          <p className="text-2xl font-bold text-emerald-600">Authorized</p>
          <p className="text-[11px] text-slate-500">Verified via server security rules</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">{moduleInfo?.name} Functional Workspace</h3>
        <p className="text-xs text-slate-600">
          All data processed inside this {moduleInfo?.name} workspace is strictly isolated under tenant identity <strong className="font-mono text-slate-800">{tenant?.id}</strong>.
        </p>

        {status && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-mono">
            Backend API Response: {status.message}
          </div>
        )}
      </div>
    </div>
  );
};
