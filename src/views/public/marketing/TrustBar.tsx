import React from 'react';
import { 
  Building2, 
  Cloud, 
  Puzzle, 
  ShieldCheck, 
  TrendingUp,
  Server,
  Layers,
  KeyRound
} from 'lucide-react';

export const TrustBar: React.FC = () => {
  const corePillars = [
    {
      icon: Building2,
      title: 'Multi-Tenant',
      description: 'Separate workspaces for independent organizations.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Cloud,
      title: 'Cloud-Based',
      description: 'Access your ERP from anywhere.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      icon: Puzzle,
      title: 'Modular',
      description: 'Enable the tools your organization needs.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      icon: KeyRound,
      title: 'Role-Based',
      description: 'Control what each user can access.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: TrendingUp,
      title: 'Scalable',
      description: 'Designed to grow with your organization.',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Engineered for Modern Operations
          </h2>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            A resilient foundation for every type of organization
          </p>
        </div>

        {/* Five Elegant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
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
