import React from 'react';
import { 
  ArrowRight, 
  Calendar, 
  TrendingUp, 
  Users, 
  Layers, 
  Building2, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  CreditCard,
  GraduationCap,
  Package,
  FileSpreadsheet,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface MarketingHeroProps {
  onGetStarted: () => void;
  onOpenDemoModal: () => void;
}

export const MarketingHero: React.FC<MarketingHeroProps> = ({
  onGetStarted,
  onOpenDemoModal
}) => {
  const handleScrollToPlatform = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('platform');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/80">
      {/* Subtle Background Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Multi-Tenant Cloud ERP</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              One Platform. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                Every Business.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Run your entire organization from one unified cloud ERP — connecting finance, sales, inventory, human resources, education, healthcare, retail, hospitality and operations.
            </p>

            {/* CTA Group */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onGetStarted}
                className="px-7 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDemoModal}
                className="px-6 py-3.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs hover:border-slate-400 transition-all flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Book a Live Demo</span>
              </button>
            </div>

            {/* Core Architectural Indicators (No fake stats) */}
            <div className="pt-5 border-t border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Core Platform Architecture
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Multi-Tenant',
                  '15+ Business Modules',
                  'Cloud-Based',
                  'Role-Based Access',
                  'Industry Ready'
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Complete ERP Dashboard Promotional Mockup */}
          <div className="lg:col-span-7 relative">
            
            {/* Main Light ERP Dashboard Mockup Frame */}
            <div className="relative mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-300/40 p-4 sm:p-6 transition-all">
              
              {/* Mockup Top Navigation Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Davetech Enterprise Command Center
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    Unified Operations
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Sample Preview</span>
                </div>
              </div>

              {/* Multi-Domain Metric Grid (Balanced across Finance, Sales, Fees, Operations) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                
                {/* 1. Finance Overview */}
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                    <span>Finance Overview</span>
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">General Ledger</div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                    Balanced & Reconciled
                  </div>
                </div>

                {/* 2. Sales & Orders */}
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                    <span>Sales & Orders</span>
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">POS & Invoices</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Real-time checkout sync
                  </div>
                </div>

                {/* 3. Outstanding Fees / Receivables */}
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                    <span>Fees & Receivables</span>
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">Billing Radar</div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                    Automated Statements
                  </div>
                </div>

                {/* 4. Inventory & Stock */}
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                    <span>Inventory & Stock</span>
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">Multi-Warehouse</div>
                  <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                    Automated reorders
                  </div>
                </div>

              </div>

              {/* Chart & Department Health Area */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800">Cross-Department Activity & Performance Flow</span>
                  <span className="text-slate-500 text-[10px]">Real-Time Ledger Engine</span>
                </div>
                
                {/* Visual Flow Indicator */}
                <div className="h-16 flex items-end justify-between gap-2 pt-1">
                  {[
                    { label: 'Sales & POS', level: '70%', color: 'bg-blue-500' },
                    { label: 'Admissions/Fees', level: '85%', color: 'bg-indigo-500' },
                    { label: 'Procurement', level: '60%', color: 'bg-teal-500' },
                    { label: 'Inventory', level: '90%', color: 'bg-emerald-500' },
                    { label: 'Payroll & HR', level: '75%', color: 'bg-amber-500' },
                    { label: 'Accounting', level: '95%', color: 'bg-blue-600' }
                  ].map((dept) => (
                    <div key={dept.label} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={`w-full rounded-t-md ${dept.color} transition-all`}
                        style={{ height: dept.level }}
                      />
                      <span className="text-[9px] font-semibold text-slate-500 truncate w-full text-center">
                        {dept.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interconnected Recent Activity Feed */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Recent Interconnected Operations</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Live System Events</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Student fee ledger updated & receipt issued</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Counter POS sale posted to General Ledger</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Subtle Floating UI Context Badges */}
            <div className="hidden sm:flex items-center space-x-2.5 absolute -top-4 -right-4 bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Architecture</div>
                <div className="text-xs font-bold text-slate-900">Separate Workspaces</div>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2.5 absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Security</div>
                <div className="text-xs font-bold text-slate-900">Role-Based Access</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
