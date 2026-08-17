import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Building2, 
  Rocket 
} from 'lucide-react';

interface HowItWorksSectionProps {
  onOpenDemoModal: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onOpenDemoModal
}) => {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Solution',
      desc: 'Select the industry model that matches your organization — Higher Education, Retail & POS, Healthcare, SACCO, Church, or General Enterprise.',
      icon: <Building2 className="w-6 h-6 text-blue-600" />
    },
    {
      number: '02',
      title: 'Configure Your Workspace',
      desc: 'Set up your organization branding, upload your logo, establish your chart of accounts, configure user roles, and activate required modules.',
      icon: <Sliders className="w-6 h-6 text-indigo-600" />
    },
    {
      number: '03',
      title: 'Run Your Organization',
      desc: 'Start processing admissions, registering sales, issuing invoices, collecting M-Pesa payments, and generating real-time executive reports.',
      icon: <Rocket className="w-6 h-6 text-emerald-600" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Fast Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
            HOW IT WORKS
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Get your organization onboarded onto Davetech ERP in three simple, streamlined steps.
          </p>
        </div>

        {/* 3 Numbered Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all space-y-5 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl sm:text-5xl font-black text-blue-600/20 font-mono">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  {step.icon}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600">
                  <span>Step {idx + 1} of 3</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <button
            onClick={onOpenDemoModal}
            className="px-8 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center space-x-2"
          >
            <span>Request a Tailored Demonstration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
