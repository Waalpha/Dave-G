import React, { useState } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Layers, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  CreditCard,
  GraduationCap,
  Package,
  FileSpreadsheet,
  Building2,
  DollarSign,
  ArrowUpRight,
  Bell,
  Check,
  Zap,
  Globe
} from 'lucide-react';

interface MarketingHeroProps {
  onGetStarted: () => void;
  onOpenDemoModal?: () => void;
}

export const MarketingHero: React.FC<MarketingHeroProps> = ({
  onGetStarted,
  onOpenDemoModal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'sales' | 'inventory' | 'hr' | 'education'>('overview');

  const scrollToSolutions = () => {
    const el = document.getElementById('solutions');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative pt-8 pb-16 lg:pt-14 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-[#0B192C] to-slate-950 text-white"
    >
      {/* Background Soft Accents and Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-12 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header Zone */}
        <div className="max-w-4xl mx-auto text-center space-y-6 pt-4 sm:pt-8">
          
          {/* Positioning Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>An all-in-one cloud ERP platform for modern organizations</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.12] sm:leading-[1.1]">
            Run Your Entire Organization From{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200">
              One Powerful ERP.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Davetech ERP brings finance, sales, inventory, HR, education, healthcare and business operations together in one intelligent cloud platform.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-extrabold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-xl shadow-xl shadow-blue-600/35 hover:shadow-blue-500/45 transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={scrollToSolutions}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer backdrop-blur-sm"
            >
              <span>Explore Solutions</span>
            </button>
          </div>

          {/* Small Trust Statement beneath buttons */}
          <div className="pt-1 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Secure Cloud</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Real-Time Data</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Built to Scale</span>
            </span>
          </div>

        </div>

        {/* Hero Product Visualization: Sophisticated ERP Command Center / Dashboard Frame */}
        <div className="mt-12 sm:mt-16 lg:mt-20 relative max-w-6xl mx-auto">
          
          {/* Floating Information Cards around the Command Center (Desktop Only) */}
          {/* Card 1: Revenue (Top Left) */}
          <div className="hidden lg:flex absolute -top-8 -left-8 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-slate-950/80 items-center space-x-3.5 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</div>
              <div className="text-lg font-black text-white">KSh 2.45M</div>
            </div>
          </div>

          {/* Card 2: Payments Growth (Top Right) */}
          <div className="hidden lg:flex absolute -top-8 -right-8 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-slate-950/80 items-center space-x-3.5 transform rotate-1 hover:rotate-0 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payments</div>
              <div className="text-lg font-black text-emerald-400">+18.4%</div>
            </div>
          </div>

          {/* Card 3: Active Users (Bottom Left) */}
          <div className="hidden lg:flex absolute -bottom-6 -left-6 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-slate-950/80 items-center space-x-3.5 transform rotate-1 hover:rotate-0 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Users</div>
              <div className="text-lg font-black text-white">1,248</div>
            </div>
          </div>

          {/* Card 4: Inventory Health (Bottom Right) */}
          <div className="hidden lg:flex absolute -bottom-6 -right-6 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-slate-950/80 items-center space-x-3.5 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inventory</div>
              <div className="text-lg font-black text-white">92% Healthy</div>
            </div>
          </div>

          {/* Main Command Center Browser Frame */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900/95 border border-slate-700/90 shadow-2xl shadow-blue-950/50 backdrop-blur-xl overflow-hidden">
            
            {/* Command Center Top Chrome / Window Controls */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-px bg-slate-800 hidden sm:block" />
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>DAVETECH ERP Command Center</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium hidden sm:inline-block">
                  Live Unified System
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  99.9% UPTIME
                </span>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-semibold">
              {[
                { id: 'overview', label: 'Command Center' },
                { id: 'finance', label: 'Finance & Accounting' },
                { id: 'sales', label: 'Sales & Invoicing' },
                { id: 'inventory', label: 'Inventory & POS' },
                { id: 'hr', label: 'HR & Staffing' },
                { id: 'education', label: 'Education ERP' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Interactive Dashboard Viewport */}
            <div className="p-4 sm:p-6 lg:p-8 bg-slate-950/60 space-y-6">
              
              {/* Primary Metric Ribbons (Revenue, Sales, Expenses, Inventory, Payments, Employees, Students) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-400">Total Revenue</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">KSh 4,890,200</div>
                  <div className="text-[10px] font-semibold text-emerald-400 mt-0.5 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2% MoM
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-400">Total Sales</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">1,482 Orders</div>
                  <div className="text-[10px] font-semibold text-cyan-400 mt-0.5">99.4% Fulfilled</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-400">Operating Expenses</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">KSh 1,120,400</div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Within Budget</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-400">Stock Inventory</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">18,400 Items</div>
                  <div className="text-[10px] font-semibold text-emerald-400 mt-0.5">94% Optimum</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-400">Workforce & Staff</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">146 Active</div>
                  <div className="text-[10px] font-semibold text-blue-400 mt-0.5">100% Payroll Done</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-400">Students / Members</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">3,420 Enrolled</div>
                  <div className="text-[10px] font-semibold text-purple-400 mt-0.5">Active Academic Term</div>
                </div>
              </div>

              {/* Middle Section: Chart and Operations Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Visual Chart / Flow Visualizer */}
                <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Consolidated Cashflow & Departmental Performance</div>
                      <div className="text-xs text-slate-400">Real-time ledger entries across all operating units</div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30">
                        Monthly
                      </span>
                    </div>
                  </div>

                  {/* High-Fi Minimal Chart Bars */}
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                    {[
                      { month: 'Jan', val: 55, income: '3.2M', exp: '1.1M' },
                      { month: 'Feb', val: 68, income: '3.8M', exp: '1.2M' },
                      { month: 'Mar', val: 72, income: '4.1M', exp: '1.0M' },
                      { month: 'Apr', val: 60, income: '3.5M', exp: '1.3M' },
                      { month: 'May', val: 84, income: '4.7M', exp: '1.1M' },
                      { month: 'Jun', val: 95, income: '5.2M', exp: '1.2M' },
                      { month: 'Jul', val: 88, income: '4.9M', exp: '1.1M' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full relative flex items-end justify-center h-32 bg-slate-800/40 rounded-lg p-1">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 rounded-md transition-all group-hover:opacity-90 shadow-md shadow-blue-500/20"
                            style={{ height: `${item.val}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations & Real-Time Activity Feed */}
                <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      Live System Events
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">● ACTIVE</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { title: 'Electronic Invoice #8921 Settled', time: '2m ago', type: 'Finance', badge: 'bg-emerald-500/20 text-emerald-300' },
                      { title: 'Central Warehouse Restock Dispatch', time: '14m ago', type: 'Inventory', badge: 'bg-blue-500/20 text-blue-300' },
                      { title: 'Academic Fee Receipt Generated', time: '28m ago', type: 'Education', badge: 'bg-purple-500/20 text-purple-300' },
                      { title: 'Automated Monthly Statutory Filing', time: '1h ago', type: 'Payroll', badge: 'bg-cyan-500/20 text-cyan-300' }
                    ].map((ev, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="text-slate-200 font-medium text-[11px]">{ev.title}</div>
                          <div className="text-[10px] text-slate-500">{ev.time}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ev.badge}`}>
                          {ev.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
