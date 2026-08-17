import React from 'react';
import { 
  Building2, 
  Layers, 
  Users, 
  Settings, 
  Database, 
  Palette, 
  Shield, 
  ArrowDown,
  CheckCircle2,
  Server,
  Lock
} from 'lucide-react';

export const MultiTenantSection: React.FC = () => {
  const tenantAttributes = [
    { label: 'Users', desc: 'Isolated user directories & staff roles', icon: Users },
    { label: 'Branding', desc: 'Custom logos, colors & domain subdomains', icon: Palette },
    { label: 'Modules', desc: 'Granular industry module activation', icon: Layers },
    { label: 'Settings', desc: 'Independent tax rules, currency & fiscal years', icon: Settings },
    { label: 'Data', desc: 'Tenant-scoped ledger, inventory & records', icon: Database }
  ];

  const sampleOrgs = [
    { name: 'Organization A', industry: 'St. Jude Academy', type: 'Education Workspace', color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900', badge: 'bg-indigo-100 text-indigo-800' },
    { name: 'Organization B', industry: 'Apex Retail Supermarket', type: 'Retail & POS Workspace', color: 'border-blue-200 bg-blue-50/40 text-blue-900', badge: 'bg-blue-100 text-blue-800' },
    { name: 'Organization C', industry: 'Metro Health Medical', type: 'Healthcare Workspace', color: 'border-rose-200 bg-rose-50/40 text-rose-900', badge: 'bg-rose-100 text-rose-800' },
    { name: 'Organization D', industry: 'Summit Sacco Society', type: 'SACCO Workspace', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' }
  ];

  return (
    <section id="architecture" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Multi-Tenant Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Platform. Separate Workspaces.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Davetech ERP is architected from the ground up as a true multi-tenant cloud solution. Each organization operates within its own dedicated, isolated workspace while running on a single, maintained core.
          </p>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          
          {/* Top Platform Core Node */}
          <div className="max-w-md mx-auto bg-white border-2 border-blue-600 rounded-2xl p-5 text-center shadow-md relative">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-bold mb-2">
              <Server className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600">Core Engine</div>
            <div className="text-xl font-extrabold text-slate-900">DAVETECH ERP</div>
            <div className="text-xs text-slate-500 mt-1">Multi-Tenant Routing, Authentication & Business Logic</div>
          </div>

          {/* Flow Indicator Downward */}
          <div className="flex flex-col items-center my-6">
            <div className="h-8 w-0.5 bg-blue-300" />
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold my-1">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
            <div className="h-8 w-0.5 bg-blue-300" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs mt-1">
              Tenant-Scoped Context & Partitioning
            </span>
          </div>

          {/* Organization Workspaces Grid (A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {sampleOrgs.map((org, idx) => (
              <div 
                key={idx}
                className={`border rounded-2xl p-4 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-slate-900">{org.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${org.badge}`}>
                      Isolated
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mb-0.5">{org.industry}</div>
                  <div className="text-[11px] text-slate-500">{org.type}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Independent Stack:</div>
                  <div className="text-[10px] text-slate-600 flex items-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 mr-1 shrink-0" />
                    Dedicated Users & Roles
                  </div>
                  <div className="text-[10px] text-slate-600 flex items-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 mr-1 shrink-0" />
                    Scoped Data & Ledger
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Each Organization Has Its Own Attributes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <div className="text-center mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Each Organization Workspace Has Its Own:
              </h4>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {tenantAttributes.map((attr, idx) => {
                const Icon = attr.icon;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mb-0.5">{attr.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{attr.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Technical Verification Note (Responsible, No fake absolute claims) */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                Tenant data is separated according to the platform's authorization and tenant-scoped database architecture.
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
