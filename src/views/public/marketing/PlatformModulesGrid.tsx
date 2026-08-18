import React from 'react';
import { 
  Calculator, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  Store, 
  Users, 
  CreditCard, 
  UserCheck, 
  Briefcase, 
  Receipt, 
  BarChart3, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface PlatformModulesGridProps {
  onSelectModule?: (moduleId: string) => void;
}

export const PlatformModulesGrid: React.FC<PlatformModulesGridProps> = ({ onSelectModule }) => {
  const modules = [
    {
      id: 'finance',
      name: 'Finance & Accounting',
      desc: 'Chart of accounts, general ledger, journal entries, balance sheets, and tax compliance.',
      icon: Calculator,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 'sales',
      name: 'Sales',
      desc: 'Quotations, proforma invoices, sales orders, automated delivery notes, and receipting.',
      icon: ShoppingCart,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      id: 'purchases',
      name: 'Purchases',
      desc: 'Vendor management, purchase orders, goods received notes (GRN), and bills payable.',
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      desc: 'Multi-warehouse stock tracking, SKU barcodes, automated reorder thresholds, and valuations.',
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      id: 'pos',
      name: 'POS',
      desc: 'Touch-optimized cashier terminal, thermal receipt printing, shift reconciliation, and barcode scanning.',
      icon: Store,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      desc: 'Staff directory, biometric attendance syncing, leave applications, and performance reviews.',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      id: 'payroll',
      name: 'Payroll',
      desc: 'Automated salary calculations, statutory deductions (PAYE/NSSF/NHIF), and one-click payslips.',
      icon: CreditCard,
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
    {
      id: 'crm',
      name: 'CRM',
      desc: 'Lead tracking, deal pipeline stages, communication logs, and customer relationship history.',
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      id: 'projects',
      name: 'Projects',
      desc: 'Task delegation, milestone schedules, team time-tracking, and project expenditure budgets.',
      icon: Briefcase,
      color: 'text-sky-600',
      bg: 'bg-sky-50'
    },
    {
      id: 'expenses',
      name: 'Expenses',
      desc: 'Multi-level expense approval workflows, petty cash management, and receipt uploads.',
      icon: Receipt,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      desc: 'Real-time profit & loss, departmental performance scorecards, and custom CSV/PDF exports.',
      icon: BarChart3,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      id: 'users',
      name: 'User Management',
      desc: 'Granular role-based access control (RBAC), multi-factor security, and complete audit trails.',
      icon: ShieldCheck,
      color: 'text-slate-700',
      bg: 'bg-slate-100'
    }
  ];

  return (
    <section id="modules" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-18">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span>Modular Enterprise Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Powerful Modules. One Connected System.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Activate the exact modules your business needs today, and scale seamlessly as your operations expand.
          </p>
        </div>

        {/* 12 Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => {
                  if (onSelectModule) onSelectModule(mod.id);
                }}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl ${mod.bg} flex items-center justify-center ${mod.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-normal">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Interactive Module</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA: Explore All Modules */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              if (onSelectModule) onSelectModule('finance');
            }}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Explore All Modules</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

      </div>
    </section>
  );
};
