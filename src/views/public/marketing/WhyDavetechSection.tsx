import React from 'react';
import { 
  Layers, 
  Building2, 
  Briefcase, 
  Blocks, 
  Cloud, 
  TrendingUp, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const WhyDavetechSection: React.FC = () => {
  const whyCards = [
    {
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      title: 'One Platform',
      desc: 'No more maintaining 5 disconnected systems. Finance, sales, inventory, education, HR, and reports live in one cohesive database.'
    },
    {
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      title: 'Multi-Tenant',
      desc: 'Each organization operates in its own dedicated, isolated workspace with independent users, data, and custom branding.'
    },
    {
      icon: <Briefcase className="w-6 h-6 text-emerald-600" />,
      title: 'Industry Ready',
      desc: 'Tailored workflows out-of-the-box for Higher Ed, SACCOs, Retail, Healthcare, Hospitality, Churches, and Wholesale distributors.'
    },
    {
      icon: <Blocks className="w-6 h-6 text-amber-600" />,
      title: 'Modular',
      desc: 'Activate only the modules your organization requires today. Turn on additional business suites as your operational needs grow.'
    },
    {
      icon: <Cloud className="w-6 h-6 text-sky-600" />,
      title: 'Cloud-Based',
      desc: 'Access your ERP anywhere from any modern web browser or mobile tablet with zero complex server installations on-premise.'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: 'Scalable',
      desc: 'Engineered for seamless scaling from a single retail counter or academy up to multi-campus universities and multi-branch supermarket chains.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Core Advantages</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
            WHY DAVETECH ERP
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Designed specifically for modern enterprises, institutions, and cooperative organizations requiring bank-grade reliability without bloated complexity.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyCards.map((card, idx) => (
            <div 
              key={idx}
              className="p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all space-y-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-200 flex items-center justify-center transition-colors">
                {card.icon}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
