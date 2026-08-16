import React from 'react';
import { CreditCard, Check, Shield } from 'lucide-react';

export const PlatformPlans: React.FC = () => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter Davetech Plan',
      price: 'Ksh1000',
      period: '/month',
      description: 'Ideal for small retail shops, churches, or SACCOs starting with ERP.',
      features: ['Up to 10 Users', 'Choose Any 3 Modules', 'Standard Tenant Isolation', 'Email Support']
    },
    {
      id: 'professional',
      name: 'Professional Enterprise',
      price: 'Ksh1500',
      period: '/month',
      description: 'Built for TVET colleges, hospitals, and medium institutions.',
      features: ['Up to 50 Users', 'Choose Any 6 Modules', 'Full Custom Branding & Domain', 'Priority SLA & Audit Trail']
    },
    {
      id: 'enterprise',
      name: 'Unlimited Platform Tier',
      price: 'Ksh2000',
      period: '/month',
      description: 'Unlimited capacity for Universities, Hospitals, and Large Chains.',
      features: ['Unlimited Users', 'All 13 Catalog Modules Included', 'Dedicated Database Replication', '24/7 Dedicated Support']
    }
  ];

  return (
    <div className="space-y-6 text-[#1F2937]">
      <div>
        <h2 className="text-xl font-black text-[#1D53D9] flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-[#1D53D9]" />
          <span>SaaS Subscription Plans & Pricing Tiers</span>
        </h2>
        <p className="text-xs text-[#777E8C] mt-1 font-medium">
          Configure subscription limits, bundled modules, and user seat capacities for platform billing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div key={p.id} className="bg-white border border-[#D8DCEB] rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${idx === 0 ? 'bg-[#14B57A]' : idx === 1 ? 'bg-[#F49C10]' : 'bg-[#1D53D9]'}`} />
            <div className="space-y-3 pt-2">
              <span className="px-2.5 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded-full text-xs font-bold uppercase">
                {p.name}
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-[#1D53D9]">{p.price}</span>
                <span className="text-xs text-[#777E8C] font-semibold">{p.period}</span>
              </div>
              <p className="text-xs text-[#777E8C] font-medium leading-relaxed">{p.description}</p>

              <div className="pt-4 border-t border-[#D8DCEB] space-y-2 text-xs">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center space-x-2 text-[#1F2937]">
                    <Check className="w-4 h-4 text-[#14B57A] shrink-0" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-2.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#1D53D9] border border-[#D8DCEB] rounded-xl text-xs font-bold transition-colors cursor-pointer">
              Configure Tier Limits
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
