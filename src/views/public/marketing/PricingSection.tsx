import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Building2
} from 'lucide-react';
import { PlatformPricingPlanConfig } from '../../../types';

interface PricingSectionProps {
  configuredPlans?: PlatformPricingPlanConfig[];
  onOpenDemoModal: () => void;
}

const DEFAULT_PLANS: PlatformPricingPlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter & Emerging',
    tagline: 'Ideal for single-campus schools, retail shops & growing chamas',
    priceMonthly: 'Talk to Sales',
    priceAnnual: 'Custom Quote',
    features: [
      'Up to 3 Core Industry Modules',
      'Unlimited Registered Students / Members / Products',
      'Double-Entry Accounting & Ledger',
      'Automated M-Pesa STK Push Integration',
      'Up to 5 Administrator & Staff Accounts',
      'Standard Email & Ticket Support'
    ]
  },
  {
    id: 'professional',
    name: 'Growth & Professional',
    tagline: 'Perfect for established colleges, tier-2 SACCOs & retail chains',
    priceMonthly: 'Talk to Sales',
    priceAnnual: 'Custom Quote',
    isPopular: true,
    features: [
      'Up to 8 Integrated ERP Modules',
      'Multi-Campus / Multi-Branch Synchronization',
      'Advanced Payroll, PAYE, SHIF & NSSF Compliance',
      'Touchscreen POS with Thermal Receipt Printing',
      'Guarantor & Loan Scoring Engine',
      'Dedicated Account Manager'
    ]
  },
  {
    id: 'enterprise',
    name: 'Corporate & Enterprise',
    tagline: 'For chartered universities, regulated SACCOs & healthcare networks',
    priceMonthly: 'Talk to Sales',
    priceAnnual: 'Custom Quote',
    features: [
      'All 14+ Modular ERP Suites Unlocked',
      'Dedicated Database Partition & Custom Domain',
      'Unlimited Branches, Warehouses & User Accounts',
      'Full REST API & Webhook Automations',
      'Custom Regulatory & Statutory Tax Integrations',
      '24/7 Priority SLA & On-Site Deployment'
    ]
  }
];

export const PricingSection: React.FC<PricingSectionProps> = ({
  configuredPlans,
  onOpenDemoModal
}) => {
  const plans = (configuredPlans && configuredPlans.length > 0) ? configuredPlans : DEFAULT_PLANS;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="pricing" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Transparent Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
            PLANS & PRICING
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Scalable plans structured for your organization's exact size and module requirements.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.isPopular;
            return (
              <div 
                key={plan.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all relative ${
                  isPopular 
                    ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10' 
                    : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-3xl font-black text-slate-900">
                      {billingCycle === 'annual' && plan.priceAnnual ? plan.priceAnnual : plan.priceMonthly || 'Talk to Sales'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {plan.priceMonthly?.includes('KSh') || plan.priceMonthly?.includes('$') 
                        ? (billingCycle === 'annual' ? 'Billed annually per organization' : 'Billed monthly per organization')
                        : 'Custom enterprise consultation'}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Included Capabilities
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-700">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={onOpenDemoModal}
                    className={`w-full py-3.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Book a Live Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Notice Strip */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Need Custom Government or Multi-Campus Licensing?</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                We provide custom on-premise deployments, private cloud VPC setups, and custom SLA agreements.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="px-6 py-3 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
          >
            Talk to Sales
          </button>
        </div>

      </div>
    </section>
  );
};
