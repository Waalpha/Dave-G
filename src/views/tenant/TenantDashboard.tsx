import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ALL_ERP_MODULES } from '../../data/modulesCatalog';
import {
  GraduationCap, Activity, ShoppingBag, Store, Truck, HeartHandshake,
  Coins, Wine, Briefcase, Calculator, Users, Package, UserCheck,
  Building2, ShieldCheck, ArrowRight, Settings, CheckCircle2, Lock
} from 'lucide-react';
import { ModuleId } from '../../types';

interface TenantDashboardProps {
  onNavigate: (route: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap, Activity, ShoppingBag, Store, Truck, HeartHandshake,
  Coins, Wine, Briefcase, Calculator, Users, Package, UserCheck
};

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ onNavigate }) => {
  const { tenant, user, enabledModules } = useAuth();

  const companyName = tenant?.branding?.companyName || tenant?.name || 'Workspace';
  const primaryColor = tenant?.branding?.primaryColor || '#1e3a8a';
  const currency = tenant?.branding?.currency || 'USD';

  // Filter modules
  const activeModules = ALL_ERP_MODULES.filter(m => enabledModules.includes(m.id));
  const disabledModules = ALL_ERP_MODULES.filter(m => !enabledModules.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 text-white shadow-sm space-y-3"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center space-x-2 text-xs text-white/80">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Tenant Isolated Environment</span>
          <span>•</span>
          <span className="font-semibold">{tenant?.type || 'Enterprise'}</span>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome to {companyName}
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Your organization workspace is configured with {activeModules.length} active ERP business modules. All company records are isolated and secure.
          </p>
        </div>

        <div className="pt-2 flex items-center space-x-4 text-xs">
          <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
            Operating Currency: <strong>{currency} ({tenant?.branding?.currencySymbol})</strong>
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
            Current User: <strong>{user?.name}</strong> ({user?.role})
          </span>
        </div>
      </div>

      {/* Active Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Organization Modules</h3>
            <p className="text-xs text-slate-500">Modules enabled by your platform administrator for {companyName}.</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeModules.length} Active Modules</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeModules.map((mod) => {
            const Icon = ICON_MAP[mod.icon] || Briefcase;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.defaultPath)}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {mod.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Open Module Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disabled Catalog Modules Summary */}
      {disabledModules.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Additional ERP Modules (Disabled for your plan)</span>
          </div>
          <p className="text-xs text-slate-500">
            The following catalog modules are currently disabled for {companyName}. Request your platform administrator in Platform Management to activate them:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {disabledModules.map(m => (
              <span key={m.id} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-[11px] font-medium flex items-center space-x-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>{m.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
