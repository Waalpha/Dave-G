import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Building2, 
  Database, 
  EyeOff, 
  CheckCircle2, 
  FileCheck2,
  Server,
  Layers
} from 'lucide-react';

export const SecurityArchitectureSection: React.FC = () => {
  const securityPillars = [
    {
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      title: 'Authentication',
      desc: 'PBKDF2 and bcrypt password hashing with automatic rate limiting and brute-force mitigation.'
    },
    {
      icon: <KeyRound className="w-5 h-5 text-indigo-600" />,
      title: 'Role-Based Access (RBAC)',
      desc: 'Granular permissions per role — Super Admin, Tenant Admin, Staff, Cashier, Registrar, and Accountant.'
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-600" />,
      title: 'Tenant-Aware Architecture',
      desc: 'Strict logical partition scoping where database queries strictly enforce tenant boundaries.'
    },
    {
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
      title: 'Organization Workspaces',
      desc: 'Dedicated configuration, custom subdomain routing, custom branding, and localized fiscal settings.'
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-purple-600" />,
      title: 'Permission Controls',
      desc: 'Module-level toggle switches allowing organizations to activate only the features they require.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-rose-600" />,
      title: 'Controlled Data Access',
      desc: 'Immutable platform and tenant audit trails recording every critical creation, update, and deletion.'
    }
  ];

  return (
    <section id="security" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Enterprise Governance</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
            SECURE BY DESIGN
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Built from the ground up to protect your sensitive institutional records, student files, accounting journals, and customer data.
          </p>
        </div>

        {/* 6 Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((pillar, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                {pillar.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
