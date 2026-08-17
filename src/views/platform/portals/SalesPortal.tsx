import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Send, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Users, 
  BarChart3, 
  Globe,
  Clock,
  MessageSquare
} from 'lucide-react';
import { getBaseDomain } from '../../../lib/domainResolver';

interface SalesPortalProps {
  onNavigateHome?: () => void;
  onNavigateToLogin?: () => void;
}

export const SalesPortal: React.FC<SalesPortalProps> = ({
  onNavigateHome,
  onNavigateToLogin
}) => {
  const baseDomain = getBaseDomain();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organizationName: '',
    organizationType: 'EDUCATION',
    estimatedUsers: '10-50',
    requirements: '',
    preferredDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Post lead to platform CRM endpoint
      await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.organizationName,
          type: formData.organizationType,
          message: `[SALES PORTAL INQUIRY] Org: ${formData.organizationName} (${formData.organizationType}), Users: ${formData.estimatedUsers}. Preferred Demo Date: ${formData.preferredDate || 'ASAP'}. Notes: ${formData.requirements}`
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission error:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30">
              D
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">Davetech ERP</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                Sales Portal
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

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Enterprise Multi-Tenant Cloud Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Schedule an Executive Demo with our Solutions Team
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Discover how Davetech Cloud ERP automates operations for Schools, TVETs, SACCOs, Hospitals, Wholesale Distributors, Retailers, and Churches with strict tenant isolation.
          </p>
        </div>
      </section>

      {/* Main Grid: Form & Sales Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Demo Request Received!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Davetech Sales. An Enterprise Solutions Architect will reach out to <strong>{formData.email}</strong> within 2 business hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        organizationName: '',
                        organizationType: 'EDUCATION',
                        estimatedUsers: '10-50',
                        requirements: '',
                        preferredDate: ''
                      });
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>Request Custom Demo & Pricing Proposal</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill out the parameters below to connect with a certified sector consultant.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Mwangi"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Work / Business Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@institution.ac.ke"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Tech Academy"
                      value={formData.organizationName}
                      onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Industry Sector *</label>
                    <select
                      value={formData.organizationType}
                      onChange={e => setFormData({ ...formData, organizationType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="EDUCATION">Education / School / TVET</option>
                      <option value="WHOLESALE">Wholesale & FMCG Distribution</option>
                      <option value="RETAIL">Retail & Supermarket</option>
                      <option value="HOSPITAL">Hospital & Healthcare</option>
                      <option value="SACCO">SACCO & Chama Microfinance</option>
                      <option value="CHURCH">Church & Religious Ministry</option>
                      <option value="BAR">Hospitality / Bar & Lounge</option>
                      <option value="GENERAL_ERP">General Enterprise</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Estimated System Users</label>
                    <select
                      value={formData.estimatedUsers}
                      onChange={e => setFormData({ ...formData, estimatedUsers: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="1-10">1 - 10 Users (Starter)</option>
                      <option value="10-50">10 - 50 Users (Growth)</option>
                      <option value="50-200">50 - 200 Users (Professional)</option>
                      <option value="200+">200+ Users (Enterprise Tier)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-semibold">Key Requirements / Current Challenges</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what modules you need (e.g., student fee tracking, barcode POS, member loans, multi-store stock, accounting)..."
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <span>Submit Demo Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Sales Contacts & Features */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Direct Sales Desk</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kenya / East Africa Inquiries</span>
                    <strong className="text-white font-mono text-xs">+254 700 000 000</strong>
                  </div>
                  <span className="px-2 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800 rounded-md text-[10px] font-semibold">
                    Mon - Sat (8am - 6pm)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sales Team Email</span>
                    <strong className="text-white font-mono text-xs">sales@{baseDomain}</strong>
                  </div>
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enterprise Guarantee</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Cloudflare SSL & Custom Wildcard Subdomains Included</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Strict Multi-Tenant Database Isolation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Free Data Migration from Legacy Excel / Systems</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>On-Site Staff Training & Dedicated Account Manager</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Davetech Cloud ERP • Platform Sales & Solutions Division</p>
      </footer>
    </div>
  );
};
