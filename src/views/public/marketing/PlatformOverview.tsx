import React from 'react';
import { 
  ArrowRight, 
  Layers, 
  Database, 
  ShieldCheck, 
  Zap, 
  Workflow,
  Sparkles,
  BarChart3,
  Users,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Building,
  CreditCard
} from 'lucide-react';

interface PlatformOverviewProps {
  onExploreClick?: () => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({ onExploreClick }) => {
  const handleScrollToModules = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const el = document.getElementById('modules');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="overview" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Unified Platform Architecture</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Everything Your Organization Needs. <br className="hidden sm:inline" />
              <span className="text-blue-600">Connected.</span>
            </h2>

            <p className="text-slate-500 text-sm">
              Say goodbye to fragmented point solutions and disjointed spreadsheets. Experience seamless data flow across departments in real time.
            </p>
          </div>

          {/* Right Column: Narrative & Action */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              Davetech ERP is a multi-tenant cloud platform that brings essential business operations together in one system. Organizations can manage finance, sales, inventory, people, customers, education, healthcare and more from their own secure workspace.
            </p>

            <div className="pt-2">
              <button
                onClick={handleScrollToModules}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Subtle Visual Showing Interconnected ERP Modules */}
        <div className="mt-14 pt-10 border-t border-slate-200/80">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Native Interoperability Matrix
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { name: 'Finance & Ledger', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', note: 'Central Ledger' },
                { name: 'POS & Retail', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50', note: 'Instant Sync' },
                { name: 'Education ERP', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', note: 'Fee Accounting' },
                { name: 'Healthcare', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', note: 'Billing & Records' },
                { name: 'Human Capital', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', note: 'Payroll Engine' },
                { name: 'Analytics Hub', icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', note: 'Audit Logs' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200/60">
                      {item.note}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
