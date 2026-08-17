import React from 'react';
import { 
  CreditCard, 
  GraduationCap, 
  Package, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Receipt,
  Users,
  Building2,
  Sparkles,
  BarChart3,
  QrCode
} from 'lucide-react';

interface ProductShowcaseAlternatingProps {
  onOpenDemoModal: () => void;
}

export const ProductShowcaseAlternating: React.FC<ProductShowcaseAlternatingProps> = ({
  onOpenDemoModal
}) => {
  return (
    <section id="workflows" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Workflow Automation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
            ONE PLATFORM. MANY WORKFLOWS.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Whether reconciling millions in multi-currency tuition fees or executing split-second retail barcodes, Davetech ERP powers deep operational workflows with zero friction.
          </p>
        </div>

        {/* WORKFLOW 1: Manage Finance (Image LEFT, Text RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Image Left */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl bg-white p-2 sm:p-4 border border-slate-200 shadow-xl overflow-hidden">
              <div className="rounded-xl overflow-hidden bg-slate-900 relative">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80" 
                  alt="Finance Management Dashboard"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                
                {/* Floating Ledger Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg text-slate-900">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Double-Entry General Ledger</span>
                    <span className="text-emerald-600 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Balanced & Reconciled</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Receivables</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">KES 4.2M</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Payables</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">KES 1.1M</div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <div className="text-[10px] text-emerald-700 font-bold uppercase">Net Cash</div>
                      <div className="text-emerald-800 font-extrabold text-xs sm:text-sm">KES 8.9M</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              <span>FINANCIAL CONTROL</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Finance & Double-Entry Ledgers
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Eliminate manual bookkeeping with automated chart of accounts, multi-currency journal entries, automated tax schedules, recurring invoicing, and real-time bank reconciliation.
            </p>

            <ul className="space-y-3 text-sm text-slate-700">
              {[
                'Automated Profit & Loss, Balance Sheets, and Cash Flow Statements',
                'Instant M-Pesa STK push fee and customer payment reconciliation',
                'Multi-currency invoicing with customizable VAT and tax withholding',
                'Audit-proof debit and credit ledgers with full transaction logs'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenDemoModal}
                className="inline-flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700 group"
              >
                <span>Explore Finance Modules</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* WORKFLOW 2: Manage Education (Image RIGHT, Text LEFT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Left */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ACADEMIC OPERATIONS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Education & Campus Administration
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Empower universities, TVET colleges, and schools with paperless student lifecycles — from online application forms and biometric attendance to automated exam transcripts and fee structures.
            </p>

            <ul className="space-y-3 text-sm text-slate-700">
              {[
                'Public admissions portal with instant student ID generation',
                'Academic timetable scheduling with room & lecturer collision detection',
                'Term-by-term fee billing structures and real-time student statements',
                'Library book borrowing, hostel room allocation, and graduation rosters'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenDemoModal}
                className="inline-flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
              >
                <span>Explore Education ERP</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Image Right */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-white p-2 sm:p-4 border border-slate-200 shadow-xl overflow-hidden">
              <div className="rounded-xl overflow-hidden bg-slate-900 relative">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80" 
                  alt="Education Campus Management"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                
                {/* Floating SIS Stats Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg text-slate-900">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Active Semester Enrollment</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">TVET & University</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Registered</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">2,480 Students</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Lecturers</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">64 Faculty</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <div className="text-[10px] text-blue-700 font-bold uppercase">Fee Cleared</div>
                      <div className="text-blue-800 font-extrabold text-xs sm:text-sm">94.8%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* WORKFLOW 3: Manage Inventory (Image LEFT, Text RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Image Left */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl bg-white p-2 sm:p-4 border border-slate-200 shadow-xl overflow-hidden">
              <div className="rounded-xl overflow-hidden bg-slate-900 relative">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80" 
                  alt="Warehouse and Inventory Control"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                
                {/* Floating Stock Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg text-slate-900">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Central Warehouse Logistics</span>
                    <span className="text-amber-600 font-bold text-[11px]">Real-Time Sync</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Tracked SKUs</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">14,250</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Reorder Alerts</div>
                      <div className="text-amber-600 font-extrabold text-xs sm:text-sm">12 Items</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Branches</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">8 Depots</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              <span>SUPPLY CHAIN & LOGISTICS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Inventory, Warehouses & Purchasing
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Gain 100% visibility over physical inventory across multiple depots, branches, and retail counters with barcode scanning, batch tracking, and automatic purchase orders.
            </p>

            <ul className="space-y-3 text-sm text-slate-700">
              {[
                'Multi-location stock transfers with dispatch and receiving signatures',
                'Automated low-stock threshold triggers and supplier purchase orders',
                'Weighted average and FIFO inventory valuation calculations',
                'Loss prevention audit logs and discrepancy adjustments'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenDemoModal}
                className="inline-flex items-center space-x-2 text-sm font-bold text-amber-700 hover:text-amber-800 group"
              >
                <span>Explore Inventory Suite</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* WORKFLOW 4: Manage Sales (Image RIGHT, Text LEFT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Left */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>REVENUE & COMMERCE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Sales, Quotations & Customer Lifecycles
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Convert leads into paying customers with seamless sales pipelines, one-click quotation-to-invoice conversions, customer credit limit tracking, and thermal receipting.
            </p>

            <ul className="space-y-3 text-sm text-slate-700">
              {[
                'High-speed touch POS for counter checkouts with offline resilience',
                'B2B wholesale pricing tiers, volume discounts, and credit terms',
                'Integrated CRM for customer interaction history and payment follow-ups',
                'Real-time gross margin calculations on every transaction'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenDemoModal}
                className="inline-flex items-center space-x-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 group"
              >
                <span>Explore Sales & POS</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Image Right */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-white p-2 sm:p-4 border border-slate-200 shadow-xl overflow-hidden">
              <div className="rounded-xl overflow-hidden bg-slate-900 relative">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0a67e557b445?auto=format&fit=crop&w=1200&q=80" 
                  alt="Sales Counter and Checkout POS"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                
                {/* Floating POS Summary Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg text-slate-900">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Retail Shift Performance</span>
                    <span className="text-emerald-600 font-bold text-[10px]">Cash Drawer Balanced</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Transactions</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">412 Orders</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Ticket</div>
                      <div className="text-slate-900 font-extrabold text-xs sm:text-sm">KES 1,840</div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <div className="text-[10px] text-emerald-700 font-bold uppercase">Daily Total</div>
                      <div className="text-emerald-800 font-extrabold text-xs sm:text-sm">KES 758,080</div>
                    </div>
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
