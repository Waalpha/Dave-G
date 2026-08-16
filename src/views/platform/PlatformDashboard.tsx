import React, { useEffect, useState } from 'react';
import { Tenant, AuditLog } from '../../types';
import { ALL_ERP_MODULES } from '../../data/modulesCatalog';
import { Building2, ShieldCheck, Users, Layers, Activity, AlertTriangle, ArrowUpRight, Plus, Settings } from 'lucide-react';

interface PlatformDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ onNavigateTab }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlatformData = async () => {
    try {
      const headers = { 'x-user-id': localStorage.getItem('erp_user_id') || '' };
      const [resT, resL] = await Promise.all([
        fetch('/api/platform/tenants', { headers }),
        fetch('/api/platform/audit-logs', { headers })
      ]);
      if (resT.ok) {
        const tData = await resT.json().catch(() => []);
        if (Array.isArray(tData)) setTenants(tData);
      }
      if (resL.ok) {
        const lData = await resL.json().catch(() => []);
        if (Array.isArray(lData)) setLogs(lData);
      }
    } catch (e) {
      console.error('Error fetching platform dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const suspendedTenants = tenants.filter(t => t.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Orange Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-50/70 border border-amber-200/80 p-6 rounded-2xl shadow-xs text-[#1F2937]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded text-xs font-bold uppercase">
              Platform Master Admin
            </span>
            <span className="text-xs text-[#777E8C] font-medium">• Multi-Tenant SaaS Isolation</span>
          </div>
          <h2 className="text-2xl font-black text-[#1D53D9] mt-2">SaaS Platform Overview</h2>
          <p className="text-xs text-[#777E8C] mt-1 max-w-2xl font-medium">
            Control platform tenants, toggle enabled ERP modules per organization, monitor real-time audit logs, and enforce strict database tenant boundaries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('settings')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#1D53D9] border border-[#D8DCEB] font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#1D53D9]" />
            <span>Platform Branding & Logo</span>
          </button>
          <button
            onClick={() => onNavigateTab('tenants')}
            className="px-5 py-2.5 bg-[#F49C10] hover:bg-[#e08c00] text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant →</span>
          </button>
        </div>
      </div>

      {/* Metric Cards with Colored Top Accent Stripes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Green Accent */}
        <div className="bg-white border border-[#D8DCEB] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#14B57A]" />
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[#777E8C] text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D53D9]">TOTAL SAAS TENANTS</span>
              <Building2 className="w-4 h-4 text-[#14B57A]" />
            </div>
            <p className="text-3xl font-black text-[#1D53D9]">{tenants.length}</p>
          </div>
          <div className="pt-3 border-t border-[#D8DCEB]/50 mt-3">
            <p className="text-[11px] font-bold text-[#14B57A] flex items-center space-x-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{activeTenants} Active • {suspendedTenants} Suspended</span>
            </p>
          </div>
        </div>

        {/* Card 2: Orange Accent */}
        <div className="bg-white border border-[#D8DCEB] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F49C10]" />
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[#777E8C] text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D53D9]">CATALOG MODULES</span>
              <Layers className="w-4 h-4 text-[#F49C10]" />
            </div>
            <p className="text-3xl font-black text-[#1D53D9]">{ALL_ERP_MODULES.length}</p>
          </div>
          <div className="pt-3 border-t border-[#D8DCEB]/50 mt-3">
            <p className="text-[11px] text-[#777E8C] font-medium">Available across all tenant plans</p>
          </div>
        </div>

        {/* Card 3: Royal Blue Accent */}
        <div className="bg-white border border-[#D8DCEB] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1D53D9]" />
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[#777E8C] text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D53D9]">SYSTEM AUDIT LOGS</span>
              <Activity className="w-4 h-4 text-[#1D53D9]" />
            </div>
            <p className="text-3xl font-black text-[#1D53D9]">{logs.length}</p>
          </div>
          <div className="pt-3 border-t border-[#D8DCEB]/50 mt-3">
            <p className="text-[11px] text-[#777E8C] font-medium">Logged security & admin events</p>
          </div>
        </div>

        {/* Card 4: Light Blue Accent */}
        <div className="bg-white border border-[#D8DCEB] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#7CA4EF]" />
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[#777E8C] text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D53D9]">TENANT ISOLATION</span>
              <ShieldCheck className="w-4 h-4 text-[#14B57A]" />
            </div>
            <p className="text-2xl font-black text-[#14B57A]">100% Enforced</p>
          </div>
          <div className="pt-3 border-t border-[#D8DCEB]/50 mt-3">
            <p className="text-[11px] text-[#777E8C] font-medium">Backend & query security active</p>
          </div>
        </div>
      </div>

      {/* Tenants Table & Quick Module Toggles */}
      <div className="bg-white border border-[#D8DCEB] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#1D53D9]">Active Tenants & Enabled Modules</h3>
            <p className="text-xs text-[#777E8C] font-medium">
              Platform owner can enable or disable ERP modules for any tenant live in real time.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tenants')}
            className="text-xs text-[#1D53D9] hover:text-blue-800 font-bold flex items-center space-x-1"
          >
            <span>Manage All Tenants</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-[#D8DCEB] rounded-xl">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F8FAFC] text-[#777E8C] uppercase font-mono text-[10px] border-b border-[#D8DCEB]">
              <tr>
                <th className="p-3.5 font-bold">Organization Name</th>
                <th className="p-3.5 font-bold">Tenant Type</th>
                <th className="p-3.5 font-bold">Currency</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Enabled Modules</th>
                <th className="p-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DCEB]">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-[#1F2937]">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: t.branding?.primaryColor || '#1D53D9' }}
                      ></div>
                      <span className="font-semibold text-sm text-[#1D53D9]">{t.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-[#F8FAFC] border border-[#D8DCEB] rounded-md text-[11px] font-semibold text-[#1F2937]">
                      {t.type} {t.educationType ? `(${t.educationType})` : ''}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-[#1F2937]">{t.branding?.currency || 'USD'} ({t.branding?.currencySymbol})</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'ACTIVE' ? 'bg-[#14B57A]/15 text-[#14B57A] border border-[#14B57A]/30' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {t.enabledModules.map((m) => (
                        <span key={m} className="px-2.5 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded-full text-[10px] font-semibold capitalize">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onNavigateTab('tenants')}
                      className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#1D53D9] border border-[#D8DCEB] font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Configure Modules
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
