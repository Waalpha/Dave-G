import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Cpu, 
  Smartphone
} from 'lucide-react';

export const TrustBar: React.FC = () => {
  const valuePoints = [
    {
      icon: ShieldCheck,
      title: 'SECURE CLOUD',
      description: "Protect your organization's data.",
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      icon: Zap,
      title: 'REAL-TIME',
      description: "See what's happening as it happens.",
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-100'
    },
    {
      icon: TrendingUp,
      title: 'SCALABLE',
      description: 'Grow without replacing your system.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      icon: Cpu,
      title: 'SMART AUTOMATION',
      description: 'Reduce repetitive work.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      icon: Smartphone,
      title: 'ANYWHERE ACCESS',
      description: 'Work from desktop, tablet or mobile.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    }
  ];

  return (
    <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need. Connected in One Platform.
          </h2>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-3"></div>
        </div>

        {/* 5 Value Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {valuePoints.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-200 group text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
