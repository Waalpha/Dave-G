import React from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  UserCheck, 
  Database, 
  FileKey,
  Layers,
  Server,
  CheckCircle2
} from 'lucide-react';

export const SecurityAndDashboard: React.FC = () => {
  const securityPillars = [
    {
      title: 'Tenant-Aware Architecture',
      description: 'Platform queries and transactions are strictly scoped to the active tenant workspace context.',
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Role-Based Access (RBAC)',
      description: 'Define granular permissions per role: administrator, cashier, teacher, doctor, accountant, and auditor.',
      icon: UserCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Robust Authentication',
      description: 'Secure session management, credential protection, and centralized user directory verification.',
      icon: KeyRound,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      title: 'Permission Management',
      description: 'Control read, write, export, and delete actions for specific modules, financial ledgers, and reports.',
      icon: FileKey,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Separate Organization Workspaces',
      description: 'Each customer organization operates within its own workspace with distinct configurations and catalogs.',
      icon: Server,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Controlled Access to Business Data',
      description: 'Protect sensitive payroll records, student records, patient charts, and financial statements with audit trails.',
      icon: Lock,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    }
  ];

  return (
    <section id="security" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Enterprise Governance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built With Control and Security in Mind
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Davetech ERP is engineered with strict authorization boundaries, tenant isolation policies, and comprehensive role control across all modules.
          </p>
        </div>

        {/* Six Pillar Security Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  <span>Platform Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Architecture Statement */}
        <div className="mt-12 max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-center text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900">Architecture Notice: </span>
          All data operations are validated against tenant identity and assigned role tokens before execution. Davetech ERP enforces authorization checks at both API proxy and database layers.
        </div>

      </div>
    </section>
  );
};
