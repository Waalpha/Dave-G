import React from 'react';
import { 
  GraduationCap, 
  Building2, 
  Activity, 
  Store, 
  HeartHandshake, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface IndustrySolutionsProps {
  onOpenDemoModal?: (industry?: string) => void;
  onSelectIndustry?: (industryId: string) => void;
}

export const IndustrySolutions: React.FC<IndustrySolutionsProps> = ({
  onOpenDemoModal,
  onSelectIndustry
}) => {
  const industries = [
    {
      id: 'education',
      title: 'Education',
      subtitle: 'Colleges, Universities, TVETs, & Schools',
      description: 'End-to-end student lifecycle from admission to graduation. Features automated fee collection, academic grading, timetable generation, exam cards, and student records.',
      icon: GraduationCap,
      accent: 'border-l-4 border-l-blue-600',
      badge: 'Academic Edition',
      color: 'text-blue-600',
      bgIcon: 'bg-blue-50'
    },
    {
      id: 'business',
      title: 'Business',
      subtitle: 'Commercial Enterprises & Service Companies',
      description: 'Unified commercial ERP integrating client project tracking, procurement, double-entry accounting, electronic tax invoices, expense approvals, and staff payroll.',
      icon: Building2,
      accent: 'border-l-4 border-l-cyan-600',
      badge: 'Enterprise Edition',
      color: 'text-cyan-600',
      bgIcon: 'bg-cyan-50'
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      subtitle: 'Hospitals, Medical Centres, & Clinics',
      description: 'HIPAA-grade patient electronic medical records, OPD/IPD triage, doctor scheduling, automated pharmacy dispensary, lab tests tracking, and insurance claims billing.',
      icon: Activity,
      accent: 'border-l-4 border-l-rose-600',
      badge: 'Clinical Edition',
      color: 'text-rose-600',
      bgIcon: 'bg-rose-50'
    },
    {
      id: 'retail',
      title: 'Retail & Wholesale',
      subtitle: 'Supermarkets, Distributors, & POS Outlets',
      description: 'Fast barcode counter POS, bulk wholesale pallet distribution, tiered pricing matrices, multi-warehouse stock replenishment, and automatic end-of-day cash reconciliation.',
      icon: Store,
      accent: 'border-l-4 border-l-amber-600',
      badge: 'Commerce Edition',
      color: 'text-amber-600',
      bgIcon: 'bg-amber-50'
    },
    {
      id: 'churches',
      title: 'Churches',
      subtitle: 'Ministries, Fellowships, & Faith Organizations',
      description: 'Member directory, cell group fellowships, electronic tithes and offerings collection, pledge tracking, outreach events, and automated financial accountability statements.',
      icon: HeartHandshake,
      accent: 'border-l-4 border-l-purple-600',
      badge: 'Ministry Edition',
      color: 'text-purple-600',
      bgIcon: 'bg-purple-50'
    },
    {
      id: 'chamas',
      title: 'Chamas & Organizations',
      subtitle: 'SACCOs, Investment Groups, & Associations',
      description: 'Member share capital, monthly welfare savings, loan application underwriting, interest calculators, dividend distributions, and investment portfolio tracking.',
      icon: Coins,
      accent: 'border-l-4 border-l-emerald-600',
      badge: 'Cooperative Edition',
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-50'
    }
  ];

  return (
    <section id="industries" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-18">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <span>Specialized Workflows</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Built for the Way You Work.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Whether you operate an educational institution, hospital, retail enterprise, or cooperative, Davetech ERP delivers tailored workflows out of the box.
          </p>
        </div>

        {/* 6 High-Fi Industry Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {industries.map((ind) => {
            const IconComponent = ind.icon;
            return (
              <div
                key={ind.id}
                className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${ind.accent}`}
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${ind.bgIcon} flex items-center justify-center ${ind.color} shadow-2xs`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {ind.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {ind.title}
                    </h3>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      {ind.subtitle}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {ind.description}
                  </p>

                </div>

                {/* Bottom Action: Learn More */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onOpenDemoModal) onOpenDemoModal(ind.title);
                    }}
                    className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1.5 cursor-pointer group"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Ready to Deploy
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
