import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Sparkles, 
  Check, 
  GraduationCap, 
  ShoppingBag, 
  Building2, 
  ArrowRight,
  CreditCard,
  Users,
  BookOpen,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

interface ShowcasesSectionProps {
  onOpenDemoModal?: () => void;
  onExploreModule?: (moduleKey: string) => void;
}

export const ShowcasesSection: React.FC<ShowcasesSectionProps> = ({
  onOpenDemoModal,
  onExploreModule
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'education'>('branding');

  // Promotional tenant subdomain examples
  const sampleWebsites = [
    {
      type: 'Education',
      subdomain: 'school.davetech.co.ke',
      title: 'Academy & Campus Portal',
      description: 'Public admissions portal, course catalogs, student noticeboard, and fee payment gateway.',
      accent: 'text-indigo-600',
      tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      preview: {
        banner: 'St. Jude International Academy',
        heroTag: 'Admissions Open 2026/2027',
        features: ['Online Student Registration', 'Fee Portal & Receipt Verification', 'Department Units Directory']
      }
    },
    {
      type: 'Retail',
      subdomain: 'shop.davetech.co.ke',
      title: 'Retail Storefront & Catalog',
      description: 'Real-time inventory showcase, customer loyalty lookup, click-and-collect orders, and store promotions.',
      accent: 'text-blue-600',
      tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
      preview: {
        banner: 'Apex Electronics & Supplies',
        heroTag: 'Live Store Inventory',
        features: ['Real-Time Stock Availability', 'POS Linked Customer Loyalty', 'Digital Receipt Delivery']
      }
    },
    {
      type: 'Business',
      subdomain: 'business.davetech.co.ke',
      title: 'Corporate Firm & Services',
      description: 'Client consultation booking, corporate service offerings, invoice payment links, and vendor onboarding.',
      accent: 'text-emerald-600',
      tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      preview: {
        banner: 'Vertex Strategic Consulting Ltd',
        heroTag: 'Corporate Services Hub',
        features: ['Client Invoice Settlement', 'Vendor Procurement Portal', 'Service Level Tracking']
      }
    }
  ];

  // Education management operational units
  const educationUnits = [
    { name: 'Students', desc: 'Comprehensive student registry & demographics' },
    { name: 'Staff', desc: 'Faculty & non-teaching staff management' },
    { name: 'Departments', desc: 'Faculty & administrative hierarchy' },
    { name: 'Courses', desc: 'Academic degree & diploma programs' },
    { name: 'Units', desc: 'Curriculum subjects & credit hours' },
    { name: 'Classes', desc: 'Stream scheduling & lecture allocations' },
    { name: 'Admissions', desc: 'Application pipeline & onboarding' },
    { name: 'Attendance', desc: 'Digital roll call & lesson logs' },
    { name: 'Timetable', desc: 'Automated conflict-free schedules' },
    { name: 'Fees', desc: 'Fee structures & installment plans' },
    { name: 'Invoices', desc: 'Automated term invoicing batches' },
    { name: 'Payments', desc: 'Bank & mobile money receipting' },
    { name: 'Reports', desc: 'Transcripts, performance & ledger audits' }
  ];

  return (
    <div className="space-y-0">
      
      {/* SECTION 10: TENANT BRANDING */}
      <section id="branding" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Dedicated Public Identity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Workspace. Your Brand.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Each organization can have its own identity and public presence while using the Davetech ERP platform underneath.
            </p>
          </div>

          {/* 3 Sample Tenant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleWebsites.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Subdomain Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.tagBg}`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Promotional Example
                    </span>
                  </div>

                  {/* Subdomain URL Badge */}
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-slate-800 font-mono text-xs mb-3.5 font-bold">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.subdomain}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Visual Preview Box */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>{item.preview.banner}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">
                      {item.preview.heroTag}
                    </div>
                    <div className="space-y-1 pt-1.5 border-t border-slate-200/60">
                      {item.preview.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center text-[10px] text-slate-600">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 mr-1.5 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Isolated Tenant Data</span>
                  <span className="text-blue-600 font-bold">Powered by Davetech</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            * Subdomains and organizational names above are illustrative examples showcasing the platform's multi-tenant capabilities.
          </div>

        </div>
      </section>

      {/* SECTION 11: EDUCATION SHOWCASE */}
      <section id="education-showcase" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Education Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <GraduationCap className="w-4 h-4" />
                <span>Specialized Industry Module</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Powerful Education Management
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Experience an end-to-end academic management engine that links student enrollment, course timetabling, and faculty assignments directly into your institution's general ledger and fee billing.
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onExploreModule) {
                      onExploreModule('education');
                    } else if (onOpenDemoModal) {
                      onOpenDemoModal();
                    }
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <span>Explore Education ERP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                * Promotional section highlighting Davetech Education ERP architecture.
              </div>
            </div>

            {/* Right Column: Promotional School ERP Interface Preview */}
            <div className="lg:col-span-7">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-md">
                
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Education Workspace Hub</div>
                      <div className="text-[10px] text-slate-500">Curriculum, Students & Fee Automation</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Sample Academic Ledger
                  </span>
                </div>

                {/* 13 Key Components Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                  {educationUnits.map((unit, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-left"
                    >
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>{unit.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                        {unit.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Process Sample Bar */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="font-bold text-indigo-950">Automated Term Fee Billing Engine</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700">Invoices Generated Instantly</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
