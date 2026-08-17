import React from 'react';
import { 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  Users, 
  Building2, 
  Briefcase, 
  ShieldCheck,
  CheckCircle2,
  GitCommit,
  Workflow,
  Sparkles,
  Database,
  Lock,
  Globe2,
  Puzzle,
  TrendingDown
} from 'lucide-react';

export const HowItWorksAndWhy: React.FC = () => {
  const primaryFlow = [
    { name: 'Sales', desc: 'POS & Orders', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Inventory', desc: 'Stock Ledger', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Purchasing', desc: 'Vendor POs', icon: ShoppingCart, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Finance', desc: 'General Ledger', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Reports', desc: 'Audit & Analytics', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  const secondaryNodes = [
    { title: 'Customers', desc: 'Profiles, credit terms & CRM pipeline', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Suppliers', desc: 'Vendor directory & AP reconciliation', icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50' },
    { title: 'Employees', desc: 'Payroll, attendance & role permissions', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Management', desc: 'Executive oversight & compliance control', icon: ShieldCheck, color: 'text-blue-700', bg: 'bg-blue-50' }
  ];

  const whyReasons = [
    {
      title: 'One Platform',
      description: 'Bring operations together in a single unified ecosystem.',
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Multi-Tenant',
      description: 'Support multiple organizations with clean tenant separation.',
      icon: Building2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Flexible',
      description: 'Adapt to different industries from education to retail and healthcare.',
      icon: Globe2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      title: 'Modular',
      description: 'Use the capabilities your organization needs today and scale tomorrow.',
      icon: Puzzle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Connected',
      description: 'Reduce disconnected systems and eliminate manual double-entry.',
      icon: Workflow,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Scalable',
      description: 'Grow your platform seamlessly as your organization expands.',
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    }
  ];

  return (
    <div className="space-y-0">
      
      {/* SECTION 12: BUSINESS OPERATIONS VISUAL */}
      <section id="operations-flow" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Operational Interoperability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Connect Every Part of Your Business
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Transactions originate in one department and seamlessly flow into inventory adjustments, supplier liabilities, and the central financial ledger.
            </p>
          </div>

          {/* Sophisticated ERP Architecture Flow Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            
            {/* Primary Flow: Sales -> Inventory -> Purchasing -> Finance -> Reports */}
            <div className="mb-10">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  Primary Transaction Pipeline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                {primaryFlow.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="relative flex flex-col items-center">
                      <div className="w-full bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 text-center shadow-2xs transition-all group">
                        <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="text-sm font-bold text-slate-900">{step.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
                      </div>
                      
                      {/* Arrow between horizontal items on desktop */}
                      {idx < primaryFlow.length - 1 && (
                        <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                          <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                            →
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secondary Connectors: Customers, Suppliers, Employees, Management */}
            <div>
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  Cross-Operational Entities & Stakeholders
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {secondaryNodes.map((node, idx) => {
                  const Icon = node.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start space-x-3 shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className={`w-9 h-9 rounded-xl ${node.bg} ${node.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{node.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{node.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 15: WHY DAVETECH ERP? */}
      <section id="why" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Platform Advantages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Davetech ERP?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Engineered with clarity, modularity, and operational rigor to help organizations eliminate data silos and focus on growth.
            </p>
          </div>

          {/* Six Defined Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyReasons.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-blue-600">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    <span>Davetech Platform Standard</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
