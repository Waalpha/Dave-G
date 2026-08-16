import React, { useState } from 'react';
import {
  Coins, HeartHandshake, ShieldCheck, DollarSign, Calculator,
  Users, CheckCircle2, Lock, ArrowRight, X, Send, Phone, Mail, MapPin,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { PublicTenantResponse } from '../../../types';

interface SaccoChamaWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const SaccoChamaWebsiteTemplate: React.FC<SaccoChamaWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant, stats = {} } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#059669';
  const secondaryColor = branding?.secondaryColor || '#10B981';
  const currencySymbol = branding?.currencySymbol || 'KSh';

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanMonths, setLoanMonths] = useState(12);
  const [interestRate, setInterestRate] = useState(12); // 12% p.a.

  const calculatedMonthly = Math.round((loanAmount * (1 + (interestRate / 100) * (loanMonths / 12))) / loanMonths);
  const calculatedTotal = calculatedMonthly * loanMonths;

  // Membership Modal
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    occupation: '',
    monthlySavings: '5000'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.name.trim() || !joinForm.phone.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: joinForm.name,
          email: joinForm.email,
          phone: joinForm.phone,
          inquiryType: 'MEMBERSHIP',
          targetItemName: `New SACCO Member Application (Monthly Target: ${currencySymbol} ${joinForm.monthlySavings})`,
          message: `SACCO Membership Application. ID Number: ${joinForm.idNumber || 'N/A'}. Occupation: ${joinForm.occupation || 'N/A'}. Target Monthly Savings: ${currencySymbol} ${joinForm.monthlySavings}`
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Application submission failed');

      setFeedback({
        success: true,
        message: json.message || 'Your membership application has been received! Our membership committee will review and issue your account number.',
        refId: json.referenceId
      });
      setJoinForm({
        name: '',
        phone: '',
        email: '',
        idNumber: '',
        occupation: '',
        monthlySavings: '5000'
      });
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Failed to submit application. Please visit our offices.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName || tenant.name} className="h-9 w-auto rounded" />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                <Coins className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
                Registered Savings & Credit Cooperative
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#savings" className="hover:text-emerald-700 transition-colors">Savings Schemes</a>
            <a href="#loans" className="hover:text-emerald-700 transition-colors">Credit & Loans</a>
            <a href="#calculator" className="hover:text-emerald-700 transition-colors">Loan Calculator</a>
            <a href="#contact" className="hover:text-emerald-700 transition-colors">Contact SACCO</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFeedback(null);
                setIsJoinModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Join SACCO</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Member Portal Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero */}
      <section className="relative bg-slate-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/80 border border-emerald-700">
              <Award className="w-3.5 h-3.5" />
              <span>Annual Dividend Yields Up To 14%</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {website?.heroTitle || 'Empowering Member Prosperity Through Cooperative Finance'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {website?.heroDescription || 'Grow wealth through secure monthly shares, flexible low-interest asset development loans, and democratic member governance.'}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => {
                  setFeedback(null);
                  setIsJoinModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-transform active:scale-95 shadow-md flex items-center space-x-2 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Open Member Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#calculator"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Calculate Loan Repayment
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Loan Products & Calculator */}
      <section id="calculator" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Products overview */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Credit Solutions</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Affordable Member Credit Schemes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enjoy transparent terms with 3x your share savings multiplier and quick 24-hour loan disbursements.
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>Development & Asset Finance Loan</span>
                    <span className="text-emerald-700">12% p.a.</span>
                  </div>
                  <p className="text-xs text-slate-500">Up to 36 months repayment period for property, vehicles, and commercial projects.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>Emergency & Medical Quick Credit</span>
                    <span className="text-emerald-700">Instant</span>
                  </div>
                  <p className="text-xs text-slate-500">Same-day M-Pesa disbursement for urgent medical or household emergencies.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>School Fees & Education Advance</span>
                    <span className="text-emerald-700">10% p.a.</span>
                  </div>
                  <p className="text-xs text-slate-500">Disbursed directly to primary, secondary, or university institutions.</p>
                </div>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-5">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <Calculator className="w-5 h-5" />
                <span>Interactive Loan Repayment Calculator</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Loan Amount:</span>
                    <span className="text-emerald-700 text-sm font-extrabold">{currencySymbol} {loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={2000000}
                    step={10000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Repayment Period:</span>
                    <span className="text-emerald-700 text-sm font-extrabold">{loanMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={48}
                    step={1}
                    value={loanMonths}
                    onChange={(e) => setLoanMonths(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Estimated Monthly Installment:</span>
                    <span className="font-extrabold text-emerald-900 text-sm">{currencySymbol} {calculatedMonthly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Total Amount Payable:</span>
                    <span>{currencySymbol} {calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFeedback(null);
                    setIsJoinModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Apply For This Loan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} {branding?.companyName || tenant.name}. All rights reserved.</span>
          <span>Powered by Davetech Cloud ERP</span>
        </div>
      </footer>

      {/* Join SACCO Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsJoinModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">SACCO Membership Application</h3>
              <p className="text-xs text-slate-500">Join our cooperative society and begin accumulating shares.</p>
            </div>

            {feedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <div className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reference: {feedback.refId}</span>
                </div>
                <p>{feedback.message}</p>
                <button onClick={() => setIsJoinModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitJoin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.name}
                    onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Samuel Mutiso"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone (M-Pesa) *</label>
                    <input
                      type="tel"
                      required
                      value={joinForm.phone}
                      onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">National ID / Passport</label>
                    <input
                      type="text"
                      value={joinForm.idNumber}
                      onChange={(e) => setJoinForm({ ...joinForm, idNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="e.g. 29384756"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Monthly Savings Contribution</label>
                  <input
                    type="text"
                    value={joinForm.monthlySavings}
                    onChange={(e) => setJoinForm({ ...joinForm, monthlySavings: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. 5,000"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsJoinModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold">
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
