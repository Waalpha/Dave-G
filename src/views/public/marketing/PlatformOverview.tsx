import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  GraduationCap, 
  Activity, 
  UserCheck, 
  BarChart3, 
  Cpu,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

interface PlatformOverviewProps {
  onExploreClick?: () => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({ onExploreClick }) => {
  const [selectedNode, setSelectedNode] = useState<string>('finance');

  const connectedModules = [
    {
      id: 'finance',
      title: 'Finance & Accounts',
      desc: 'General ledger, double-entry bookkeeping, cashflow tracking, tax compliance, and automated balance sheets.',
      icon: DollarSign,
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-600',
      badge: 'Core Ledger'
    },
    {
      id: 'sales',
      title: 'Sales & Invoicing',
      desc: 'Quotations, proforma invoices, e-TIMS compliant electronic invoicing, customer credit limits, and receipting.',
      icon: ShoppingCart,
      color: 'from-cyan-600 to-cyan-700',
      textColor: 'text-cyan-600',
      badge: 'Revenue Engine'
    },
    {
      id: 'inventory',
      title: 'Inventory & Stock',
      desc: 'Multi-warehouse management, SKU barcode scanning, reorder alerts, stock valuation, and batch tracking.',
      icon: Package,
      color: 'from-amber-600 to-amber-700',
      textColor: 'text-amber-600',
      badge: 'Supply Chain'
    },
    {
      id: 'hr',
      title: 'Human Resources',
      desc: 'Employee directory, attendance logging, leave approvals, statutory deductions, and automated payroll runs.',
      icon: Users,
      color: 'from-emerald-600 to-emerald-700',
      textColor: 'text-emerald-600',
      badge: 'People Ops'
    },
    {
      id: 'education',
      title: 'Education ERP',
      desc: 'Student admissions, academic semesters, class timetables, fee invoicing, exams grading, and report cards.',
      icon: GraduationCap,
      color: 'from-indigo-600 to-indigo-700',
      textColor: 'text-indigo-600',
      badge: 'Academia'
    },
    {
      id: 'healthcare',
      title: 'Healthcare & Clinical',
      desc: 'Patient electronic records, doctor appointments, triage, pharmacy dispensary, and insurance billing.',
      icon: Activity,
      color: 'from-rose-600 to-rose-700',
      textColor: 'text-rose-600',
      badge: 'Patient Care'
    },
    {
      id: 'crm',
      title: 'CRM & Pipeline',
      desc: 'Lead tracking, deal stages, communication history, customer retention, and automated follow-up tasks.',
      icon: UserCheck,
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-600',
      badge: 'Client Relations'
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      desc: 'Executive summaries, departmental KPI scorecards, profit & loss statements, and exportable data tables.',
      icon: BarChart3,
      color: 'from-teal-600 to-teal-700',
      textColor: 'text-teal-600',
      badge: 'Intelligence'
    },
    {
      id: 'operations',
      title: 'Operations & Workflow',
      desc: 'Approval workflows, document vaults, task delegation, departmental audit trails, and multi-branch control.',
      icon: Cpu,
      color: 'from-slate-700 to-slate-800',
      textColor: 'text-slate-700',
      badge: 'Governance'
    }
  ];

  const currentModule = connectedModules.find(m => m.id === selectedNode) || connectedModules[0];

  return (
    <section id="solutions" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-20">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <span>Unified Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            One ERP. Every Part of Your Organization.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Stop managing disconnected systems. Davetech ERP connects the people, processes and information that keep your organization moving.
          </p>
        </div>

        {/* Interactive Connected Architecture Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Center Visual: Original Connected Modules Hub */}
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative shadow-2xl">
            
            {/* Top Bar descriptor */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Interconnected Enterprise Hub
              </span>
              <span>Click a module to inspect data flow</span>
            </div>

            {/* Hub Visual Layout */}
            <div className="py-6 sm:py-8">
              
              {/* Center Davetech ERP Core Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-center shadow-xl shadow-blue-600/30 border border-blue-400/40 max-w-xs mx-auto mb-8">
                <div className="text-[10px] font-bold text-blue-200 tracking-wider uppercase">Central Neural Core</div>
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">DAVETECH ERP</div>
                <div className="text-xs text-blue-100 mt-0.5">Single Source of Operational Truth</div>
              </div>

              {/* Connected Orbit Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {connectedModules.map((mod) => {
                  const Icon = mod.icon;
                  const isSelected = selectedNode === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedNode(mod.id)}
                      className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                          {mod.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold truncate text-slate-200">
                        {mod.title}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Zero Data Duplication
              </span>
              <span>All 9 Pillars Natively Synced</span>
            </div>

          </div>

          {/* Right Column: Selected Module Deep Dive Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Selected Module Pillar</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentModule.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentModule.desc}
              </p>
            </div>

            {/* Pillar Key Features */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Integrated Capabilities
              </div>
              {[
                'Instant bi-directional synchronization with Central General Ledger',
                'Granular role-based permissions and user audit logs',
                'Exportable spreadsheets, PDF statements, and live reports'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={onExploreClick}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-700"
              >
                <span>View All Platform Modules</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
