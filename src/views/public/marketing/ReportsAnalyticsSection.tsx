import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  FileSpreadsheet,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';

interface ReportsAnalyticsSectionProps {
  onOpenDemoModal: () => void;
}

export const ReportsAnalyticsSection: React.FC<ReportsAnalyticsSectionProps> = ({
  onOpenDemoModal
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'academic' | 'inventory'>('financial');

  return (
    <section id="reports-analytics" className="py-24 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Real-Time Business Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
              TURN DATA INTO DECISIONS
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Transform raw transactional records into actionable management dashboards, automated compliance reports, and instant departmental drill-downs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'financial'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Financial Analytics
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'academic'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Academic Analytics
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Inventory Velocity
            </button>
          </div>
        </div>

        {/* Dynamic Analytics Visual Card */}
        <div className="rounded-2xl bg-slate-950 p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          
          {/* Top Bar with Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-extrabold text-white">Live Analytical Engine</span>
              <span className="text-slate-400 font-mono text-[11px]">(Showing Sample Enterprise Metrics)</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last 30 Days</span>
              </span>
              <span className="flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Consolidated</span>
              </span>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
              <div className="text-2xl font-black text-white mt-1">KES 24.8M</div>
              <div className="text-xs text-emerald-400 font-bold mt-1 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% vs last quarter</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fee Collection Rate</div>
              <div className="text-2xl font-black text-white mt-1">94.2%</div>
              <div className="text-xs text-blue-400 font-bold mt-1">KES 1.4M pending clearance</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</div>
              <div className="text-2xl font-black text-white mt-1">KES 9.1M</div>
              <div className="text-xs text-slate-400 font-bold mt-1">Within allocated budget</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inventory Turnover</div>
              <div className="text-2xl font-black text-white mt-1">4.8x</div>
              <div className="text-xs text-emerald-400 font-bold mt-1">Optimal stock health</div>
            </div>
          </div>

          {/* Graphical Representation (Visual Bar Chart Layout) */}
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Monthly Revenue & Departmental Distribution</span>
              <span className="text-blue-400 font-mono text-[11px]">Aggregated Ledger</span>
            </div>

            {/* CSS Horizontal Bar Chart */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-300">Higher Education Tuition & Campus Fees</span>
                  <span className="text-blue-400 font-mono font-bold">KES 14,200,000 (57%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '57%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-300">Retail Counters & POS Cashflow</span>
                  <span className="text-emerald-400 font-mono font-bold">KES 6,100,000 (25%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-300">SACCO & Cooperative Interest Returns</span>
                  <span className="text-amber-400 font-mono font-bold">KES 2,900,000 (12%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-300">Wholesale & Enterprise Contracts</span>
                  <span className="text-indigo-400 font-mono font-bold">KES 1,600,000 (6%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Export & Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="text-slate-400">
              <span>* Displayed metrics are promotional interface simulations and not live client financial disclosures.</span>
            </div>
            <button
              onClick={onOpenDemoModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 whitespace-nowrap self-start sm:self-auto"
            >
              <span>Schedule Live Analytics Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
