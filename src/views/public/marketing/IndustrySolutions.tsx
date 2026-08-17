import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShoppingBag, 
  HeartPulse, 
  UtensilsCrossed, 
  Truck, 
  Coins, 
  Church, 
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Users,
  CreditCard,
  Building,
  BarChart,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface IndustrySolutionsProps {
  onSelectIndustry?: (industryId: string) => void;
  onOpenDemoModal?: () => void;
}

export const IndustrySolutions: React.FC<IndustrySolutionsProps> = ({ 
  onSelectIndustry,
  onOpenDemoModal
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const industries = [
    {
      id: 'education',
      title: 'Education',
      subtitle: 'Schools, Colleges & Universities',
      description: 'Students, staff, courses, departments, classes, admissions and fees.',
      icon: GraduationCap,
      color: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderColor: 'hover:border-indigo-300',
      features: ['Student Admissions & Bio', 'Timetable & Class Units', 'Automated Fee Billing', 'Exam & Grade Ledger'],
      previewLabel: 'School Workspace',
      previewMetrics: [
        { label: 'Enrolled Students', value: 'Active Roster' },
        { label: 'Fee Collections', value: 'Receipt Generated' }
      ]
    },
    {
      id: 'retail',
      title: 'Retail',
      subtitle: 'Supermarkets, Boutiques & Stores',
      description: 'POS, inventory, sales, purchasing and customers.',
      icon: ShoppingBag,
      color: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      borderColor: 'hover:border-blue-300',
      features: ['High-Speed Counter POS', 'Barcode Scanner Sync', 'Stock Reorder Alerts', 'Customer Loyalty Ledger'],
      previewLabel: 'Retail Outlet',
      previewMetrics: [
        { label: 'Cashier Terminal', value: 'Syncing Register' },
        { label: 'Inventory Level', value: 'Multi-Location' }
      ]
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      subtitle: 'Clinics, Medical Centers & Labs',
      description: 'Patients, appointments, billing and operations.',
      icon: HeartPulse,
      color: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      borderColor: 'hover:border-rose-300',
      features: ['Patient Electronic Records', 'Doctor Schedules', 'Pharmacy Dispensary', 'Insurance & Cash Billing'],
      previewLabel: 'Clinic Portal',
      previewMetrics: [
        { label: 'Appointments', value: 'Queue Managed' },
        { label: 'Pharmacy Rx', value: 'Dispensed' }
      ]
    },
    {
      id: 'hospitality',
      title: 'Hospitality',
      subtitle: 'Restaurants, Cafés, Bars & Hotels',
      description: 'Restaurant POS, KOT, inventory and finance.',
      icon: UtensilsCrossed,
      color: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderColor: 'hover:border-amber-300',
      features: ['Kitchen Order Tickets (KOT)', 'Table Status Map', 'Recipe & Ingredient Usage', 'Daily Shift Cash-Up'],
      previewLabel: 'Restaurant Floor',
      previewMetrics: [
        { label: 'Table Orders', value: 'Kitchen Dispatched' },
        { label: 'Bar Register', value: 'Active Bill' }
      ]
    },
    {
      id: 'wholesale',
      title: 'Wholesale & Distribution',
      subtitle: 'Distributors, Importers & Warehouses',
      description: 'Distribution, inventory, suppliers and sales.',
      icon: Truck,
      color: 'text-cyan-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      borderColor: 'hover:border-cyan-300',
      features: ['Bulk Pricing Tiers', 'Fleet Delivery Tracking', 'Vendor Purchase Orders', 'Multi-Warehouse Transfer'],
      previewLabel: 'Distribution Hub',
      previewMetrics: [
        { label: 'Dispatch Orders', value: 'En Route' },
        { label: 'Pallet Stock', value: 'Audited' }
      ]
    },
    {
      id: 'sacco',
      title: 'SACCO & Chama',
      subtitle: 'Credit Unions & Investment Groups',
      description: 'Members, contributions, loans and reporting.',
      icon: Coins,
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderColor: 'hover:border-emerald-300',
      features: ['Member Share Capital', 'Contribution Schedules', 'Loan Amortization', 'Dividend Calculations'],
      previewLabel: 'SACCO Ledger',
      previewMetrics: [
        { label: 'Member Deposits', value: 'Direct Bank Sync' },
        { label: 'Loan Repayments', value: 'Schedule Active' }
      ]
    },
    {
      id: 'church',
      title: 'Church & Ministry',
      subtitle: 'Churches, Parishes & Faith Ministries',
      description: 'Members, contributions, expenses and administration.',
      icon: Church,
      color: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      borderColor: 'hover:border-purple-300',
      features: ['Congregation Directory', 'Tithe & Offering Ledger', 'Department Budgets', 'Events & Welfare Records'],
      previewLabel: 'Ministry Portal',
      previewMetrics: [
        { label: 'Offering Records', value: 'Designated Fund' },
        { label: 'Member Roster', value: 'Updated' }
      ]
    },
    {
      id: 'business',
      title: 'General Business & Services',
      subtitle: 'Professional Firms, Agencies & SMEs',
      description: 'Finance, HR, CRM, inventory and operations.',
      icon: Briefcase,
      color: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      borderColor: 'hover:border-slate-300',
      features: ['Accounts Payable & Receivable', 'Staff Payroll & Contracts', 'Client Pipeline CRM', 'Asset Management'],
      previewLabel: 'Corporate Office',
      previewMetrics: [
        { label: 'Invoicing & P&L', value: 'Export Ready' },
        { label: 'Payroll Run', value: 'Compliant' }
      ]
    }
  ];

  return (
    <section id="solutions" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Tailored Industry Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Solutions for the Way You Work
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Davetech ERP adapts to the unique operational workflows of your sector while maintaining a unified accounting and administrative engine.
          </p>
        </div>

        {/* 8 Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.id}
                className={`bg-white border border-slate-200 ${ind.borderColor} rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group`}
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 ${ind.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ind.badgeBg}`}>
                      {ind.title}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">
                    {ind.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-medium mb-2.5">
                    {ind.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {ind.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                    {ind.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center text-[11px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 mr-1.5 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Interface Preview Block */}
                <div className="mt-2 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/50">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                    <span>{ind.previewLabel}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ind.previewMetrics.map((metric, mIdx) => (
                      <div key={mIdx} className="bg-white rounded-lg p-1.5 border border-slate-200/80 text-left">
                        <div className="text-[9px] text-slate-400 font-medium truncate">{metric.label}</div>
                        <div className="text-[10px] font-bold text-slate-800 truncate">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500">
            Need a specialized combination of modules for your enterprise?
          </p>
          <button
            onClick={onOpenDemoModal}
            className="mt-2 inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>Request an industry-specific walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
