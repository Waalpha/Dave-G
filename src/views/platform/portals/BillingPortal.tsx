import React from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { getBaseDomain } from '../../../lib/domainResolver';

interface BillingPortalProps {
  onNavigateHome?: () => void;
  onNavigateToLogin?: () => void;
}

export const BillingPortal: React.FC<BillingPortalProps> = ({
  onNavigateHome,
  onNavigateToLogin
}) => {
  const baseDomain = getBaseDomain();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-600/30">
              D
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">Davetech ERP</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                Billing Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={`https://${baseDomain}`}
              className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 transition-colors hidden sm:inline-block"
            >
              Main Website
            </a>
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              Platform Login
            </button>
          </div>
        </div>
      </header>

      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tenant Invoices, Subscriptions & Renewals</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          SaaS Subscription & Billing Management
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Manage your organization’s plan, download official tax invoices, or update your payment methods.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Access Tenant Billing Portal</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please sign into your tenant workspace or platform administrator account to view invoices and billing records.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToLogin}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign In to Organization Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`mailto:billing@${baseDomain}`}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
            >
              Contact Billing Desk
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
