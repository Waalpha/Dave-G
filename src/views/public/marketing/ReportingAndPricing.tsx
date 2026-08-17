import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  GraduationCap, 
  Package, 
  CreditCard, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface ReportingAndPricingProps {
  onOpenDemoModal: () => void;
}

export const ReportingAndPricing: React.FC<ReportingAndPricingProps> = ({ onOpenDemoModal }) => {
  
  // Analytics Mockup metrics (Generic Sample Data treated strictly as preview data)
  const previewMetrics = [
    { label: 'Sales Activity', value: 'Active Registers', change: 'Live Stream', color: 'text-blue-600', icon: TrendingUp },
    { label: 'Operating Expenses', value: 'Recorded to GL', change: 'Audit Verified', color: 'text-amber-600', icon: DollarSign },
    { label: 'Revenue Ledger', value: 'Balanced & Reconciled', change: 'Daily Close', color: 'text-emerald-600', icon: CreditCard },
    { label: 'Inventory Valuation', value: 'Multi-Location Count', change: 'Real-Time SKUs', color: 'text-cyan-600', icon: Package },
    { label: 'Fee Collections', value: 'Term Invoicing Batch', change: 'Automated Receipts', color: 'text-indigo-600', icon: GraduationCap },
    { label: 'Customer Balances', value: 'Receivables Monitored', change: 'Statement Ready', color: 'text-teal-600', icon: Users }
  ];

  // Pricing Plans (Transparent Tiers with "Talk to Sales" / "Request Custom Quote")
  const pricingTiers = [
    {
      name: 'Starter Workspace',
      badge: 'Single Entity',
      description: 'Ideal for small retail outlets, clinics, churches, or emerging professional businesses.',
      cta: 'Talk to Sales',
      isPopular: false,
      features: [
        'Single tenant workspace',
        'Finance & General Ledger',
        'Point of Sale or Invoicing module',
        'Inventory & product catalog',
        'Up to 5 staff user accounts',
        'Daily automated cloud backups',
        'Standard email support'
      ]
    },
    {
      name: 'Business Enterprise',
      badge: 'Most Comprehensive',
      description: 'Designed for mid-sized institutions, multi-branch retail, schools, SACCOs, and healthcare centers.',
      cta: 'Talk to Sales',
      isPopular: true,
      features: [
        'Multi-location & branch support',
        'Full modular suite activation',
        'Education or Healthcare specialized modules',
        'Role-Based Access Control (RBAC)',
        'Unlimited staff user accounts',
        'Advanced financial reporting & exports',
        'Priority technical support & onboarding'
      ]
    },
    {
      name: 'Custom & Group Deployment',
      badge: 'Large Scale',
      description: 'For corporate groups, multi-campus educational networks, or large franchise chains.',
      cta: 'Talk to Sales',
      isPopular: false,
      features: [
        'Dedicated multi-organization topology',
        'Custom module development & integrations',
        'Tailored data migration assistance',
        'Custom domain setup & branded subdomains',
        'Dedicated Solutions Engineer',
        'Guaranteed enterprise onboarding schedule',
        '24/7 priority support'
      ]
    }
  ];

  return (
    <div className="space-y-0">
      
      {/* SECTION 13: REPORTING & ANALYTICS SECTION */}
      <section id="reporting" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Real-Time Business Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Know What Is Happening Across Your Organization
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Consolidated financial statements, branch performance, inventory valuation, and academic billing in one unified reporting cockpit.
            </p>
          </div>

          {/* Analytics Mockup Container (Generic Sample Interface Preview) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            
            {/* Top Bar of Analytics Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Organization Consolidated Overview</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Fiscal Period 2026
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Live operational ledger across all active modules</p>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Interface Preview Data</span>
              </div>
            </div>

            {/* Metric Blocks (Sales, Expenses, Revenue, Inventory, Fees, Payments, Customers) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {previewMetrics.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 truncate">{item.label}</span>
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {item.value}
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium mt-1">
                      {item.change}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Ledger Breakdown Table Preview */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-3">
                <span>Sample Cross-Module Summary Ledger</span>
                <span className="text-[10px] text-slate-400 font-normal">Exportable to Excel / PDF</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                      <th className="pb-2 font-bold">Module Domain</th>
                      <th className="pb-2 font-bold">Operation / Reference</th>
                      <th className="pb-2 font-bold">Ledger Status</th>
                      <th className="pb-2 font-bold text-right">Audit State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 font-bold text-slate-900">Retail & POS</td>
                      <td className="py-2.5">Terminal Daily Sales Reconciliation</td>
                      <td className="py-2.5 text-blue-600 font-semibold">Posted to GL</td>
                      <td className="py-2.5 text-right font-medium text-emerald-600">Verified</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-slate-900">Education ERP</td>
                      <td className="py-2.5">Academic Term Tuition Invoicing</td>
                      <td className="py-2.5 text-indigo-600 font-semibold">Ledger Allocated</td>
                      <td className="py-2.5 text-right font-medium text-emerald-600">Verified</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-slate-900">Inventory</td>
                      <td className="py-2.5">Warehouse Goods Received Note #4092</td>
                      <td className="py-2.5 text-amber-600 font-semibold">Valuation Updated</td>
                      <td className="py-2.5 text-right font-medium text-emerald-600">Verified</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-slate-900">Human Resources</td>
                      <td className="py-2.5">Monthly Payroll Statutory Summary</td>
                      <td className="py-2.5 text-emerald-600 font-semibold">Journal Balanced</td>
                      <td className="py-2.5 text-right font-medium text-emerald-600">Verified</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 16: PRICING SECTION */}
      <section id="pricing" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Transparent Engagement</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Flexible Deployment for Every Scale
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              We tailor your Davetech ERP deployment to your organization's exact industry modules, user seats, and operational branches.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`bg-white border rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                  tier.isPopular 
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl relative' 
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{tier.description}</p>
                  </div>

                  <div className="py-4 my-2 border-y border-slate-100">
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      Custom Quote
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-1">
                      Based on required modules and active users
                    </div>
                  </div>

                  <div className="space-y-2.5 my-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Capabilities:
                    </div>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start text-xs text-slate-700">
                        <Check className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={onOpenDemoModal}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      tier.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Talk to Sales</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-xs text-slate-500">
            Need a tailored on-premise, hybrid, or custom enterprise SLA? Contact our solutions engineering team.
          </div>

        </div>
      </section>

    </div>
  );
};
