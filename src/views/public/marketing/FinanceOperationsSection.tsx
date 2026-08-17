import React from 'react';
import { 
  CreditCard, 
  FileText, 
  Receipt, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

interface FinanceOperationsSectionProps {
  onOpenDemoModal: () => void;
}

export const FinanceOperationsSection: React.FC<FinanceOperationsSectionProps> = ({
  onOpenDemoModal
}) => {
  const financePillars = [
    { title: 'Invoices', desc: 'Create and dispatch branded PDF invoices with automated due-date reminders.' },
    { title: 'Payments', desc: 'Accept bank transfers, checks, and instant M-Pesa STK push with auto-matching.' },
    { title: 'Expenses', desc: 'Track petty cash, vendor bills, and departmental budgets with approval tiers.' },
    { title: 'Chart of Accounts', desc: 'Standardized hierarchical general ledger structure for assets, liabilities, and equity.' },
    { title: 'Financial Reports', desc: 'One-click Profit & Loss statements, balance sheets, and cash flow analysis.' },
    { title: 'Receivables & Payables', desc: 'Ageing reports (30, 60, 90+ days) and vendor credit term management.' }
  ];

  return (
    <section id="finance-showcase" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Double-Entry General Ledger</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
              CONNECTED FINANCE
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Statutory accounting compliance, automated tax calculations, real-time double-entry general ledgers, and seamless fee and invoice reconciliation in one place.
            </p>
          </div>

          <div>
            <button
              onClick={onOpenDemoModal}
              className="px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-2 whitespace-nowrap"
            >
              <span>Explore Financial Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Finance Grid + Visual Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: 6 Financial Pillars */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {financePillars.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-9">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Financial Statement Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-slate-900 p-4 sm:p-6 border border-slate-800 shadow-2xl text-white space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-white">Executive Profit & Loss Statement</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">FY 2026 Q2</span>
              </div>

              {/* P&L Line Items */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-300 font-sans font-bold">Gross Operating Revenue</span>
                  <span className="text-emerald-400 font-bold">KES 18,450,200.00</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-400">
                  <span className="text-slate-400 font-sans pl-3">• Tuition & Academic Fees</span>
                  <span>KES 12,300,000.00</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-400">
                  <span className="text-slate-400 font-sans pl-3">• Retail & Counter Sales</span>
                  <span>KES 4,850,200.00</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-400">
                  <span className="text-slate-400 font-sans pl-3">• Consulting & Services</span>
                  <span>KES 1,300,000.00</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800 pt-3">
                  <span className="text-slate-300 font-sans font-bold">Cost of Goods & Operations</span>
                  <span className="text-rose-400 font-bold">(KES 6,120,400.00)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-300 font-sans font-bold">Payroll & Statutory Deductions</span>
                  <span className="text-rose-400 font-bold">(KES 4,200,000.00)</span>
                </div>

                {/* Net Operating Surplus */}
                <div className="flex justify-between py-2.5 bg-blue-950/80 p-3 rounded-lg border border-blue-800/60 mt-2">
                  <span className="text-blue-300 font-sans font-black uppercase text-xs">Net Operating Surplus</span>
                  <span className="text-blue-300 font-black text-sm sm:text-base">KES 8,129,800.00</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Statutory Double-Entry Audit Trail Compliant</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px]">Auto-Balanced</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
