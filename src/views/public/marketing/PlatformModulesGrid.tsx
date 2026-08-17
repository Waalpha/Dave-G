import React from 'react';
import { 
  CreditCard, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Building2, 
  Briefcase, 
  GraduationCap, 
  HeartPulse, 
  UtensilsCrossed, 
  Coins, 
  Church, 
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PlatformModulesGridProps {
  onSelectModule: (moduleKey: string) => void;
}

export const PlatformModulesGrid: React.FC<PlatformModulesGridProps> = ({ onSelectModule }) => {
  const modules = [
    {
      id: 'finance',
      name: 'Accounting & Finance',
      description: 'General ledger, charts of accounts, financial statements and automated tax workflows.',
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'hover:border-blue-300'
    },
    {
      id: 'pos',
      name: 'Point of Sale',
      description: 'High-speed counter checkout, receipt printing, cash drawer reconciliation and barcode sync.',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'hover:border-emerald-300'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      description: 'Real-time multi-warehouse stock levels, SKU tracking, reorder triggers and valuation.',
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      borderColor: 'hover:border-amber-300'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Quotations, sales orders, automated invoicing, customer credit and receivables.',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      borderColor: 'hover:border-indigo-300'
    },
    {
      id: 'purchasing',
      name: 'Purchasing',
      description: 'Vendor purchase orders, goods received notes, approval workflows and supplier bills.',
      icon: ShoppingCart,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      borderColor: 'hover:border-cyan-300'
    },
    {
      id: 'customers',
      name: 'Customers',
      description: 'Unified customer profiles, interaction histories, balances, loyalty and CRM pipeline.',
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      borderColor: 'hover:border-teal-300'
    },
    {
      id: 'suppliers',
      name: 'Suppliers',
      description: 'Vendor catalogs, payment terms, performance tracking and accounts payable reconciliation.',
      icon: Building2,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      borderColor: 'hover:border-slate-300'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      description: 'Employee profiles, automated payroll calculations, statutory deductions and leave management.',
      icon: Briefcase,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      borderColor: 'hover:border-orange-300'
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Student admissions, academic departments, courses, class units, attendance and fee billing.',
      icon: GraduationCap,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      borderColor: 'hover:border-violet-300'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Patient electronic records, doctor appointments, outpatient queue, pharmacy and billing.',
      icon: HeartPulse,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      borderColor: 'hover:border-rose-300'
    },
    {
      id: 'hospitality',
      name: 'Hospitality',
      description: 'Restaurant point of sale, Kitchen Order Tickets (KOT), recipe management and room billing.',
      icon: UtensilsCrossed,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      borderColor: 'hover:border-yellow-300'
    },
    {
      id: 'sacco',
      name: 'SACCO & Chama',
      description: 'Member share accounts, regular contributions, loan amortization and dividend distributions.',
      icon: Coins,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      borderColor: 'hover:border-emerald-300'
    },
    {
      id: 'church',
      name: 'Church',
      description: 'Congregation member management, tithes, designated giving, ministries and expense tracking.',
      icon: Church,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      borderColor: 'hover:border-purple-300'
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      description: 'Cross-module business intelligence, ledger audits, balance sheets and exportable summaries.',
      icon: BarChart3,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      borderColor: 'hover:border-blue-300'
    }
  ];

  return (
    <section id="modules" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Modular Capability Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Platform. Powerful Modules.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Activate the specific capabilities your organization requires today, with the flexibility to enable additional business modules as your needs evolve.
          </p>
        </div>

        {/* 14 Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`cursor-pointer bg-white border border-slate-200 ${mod.borderColor} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded-xl ${mod.bg} ${mod.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-slate-400 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {mod.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                  <span>View module specs</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
