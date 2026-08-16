import React, { useState } from 'react';
import {
  Briefcase, Building2, ShieldCheck, ArrowRight, Lock, Phone, Mail, MapPin,
  CheckCircle2, Send, X, BarChart3, Layers, Globe
} from 'lucide-react';
import { PublicTenantResponse } from '../../../types';

interface EnterpriseBusinessWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const EnterpriseBusinessWebsiteTemplate: React.FC<EnterpriseBusinessWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#1E40AF';
  const secondaryColor = branding?.secondaryColor || '#F59E0B';

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inqForm, setInqForm] = useState({ name: '', company: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqForm.name.trim() || !inqForm.phone.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inqForm.name,
          organization: inqForm.company,
          email: inqForm.email,
          phone: inqForm.phone,
          inquiryType: 'GENERAL',
          message: inqForm.message
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission failed');

      setFeedback({
        success: true,
        message: 'Your inquiry has been submitted! Our corporate account manager will reach out shortly.',
        refId: json.referenceId
      });
      setInqForm({ name: '', company: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Could not send message. Please contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Enterprise & Commercial Solutions
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-blue-700 transition-colors">Services & Solutions</a>
            <a href="#about" className="hover:text-blue-700 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-blue-700 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFeedback(null);
                setIsInquiryModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 transition-colors cursor-pointer"
              style={{ backgroundColor: secondaryColor }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Contact Sales</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Corporate Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {website?.heroTitle || 'Driving Sustainable Growth Through Enterprise Excellence'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {website?.heroDescription || 'Providing reliable consulting, project delivery, and digital solutions tailored to your operational goals.'}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => {
                  setFeedback(null);
                  setIsInquiryModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-900 transition-transform active:scale-95 shadow-md flex items-center space-x-2 cursor-pointer"
                style={{ backgroundColor: secondaryColor }}
              >
                <span>Request Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#services"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Our Solutions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="services" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              End-to-End Enterprise Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Strategic Operations</h3>
              <p className="text-xs text-slate-600">Streamline workflows, reduce operational overhead, and enhance resource allocation.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Supply & Project Delivery</h3>
              <p className="text-xs text-slate-600">Proven track record delivering mission-critical commercial supplies on time and within budget.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Regional Compliance</h3>
              <p className="text-xs text-slate-600">Ensuring regulatory compliance, transparent auditing, and dependable stakeholder reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} {branding?.companyName || tenant.name}. All rights reserved.</span>
          <span>Powered by Davetech Cloud ERP</span>
        </div>
      </footer>

      {/* Inquiry Modal */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsInquiryModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Contact Enterprise Sales</h3>
              <p className="text-xs text-slate-500">Send an inquiry to discuss your organization’s needs.</p>
            </div>

            {feedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <p className="font-bold">{feedback.message}</p>
                <button onClick={() => setIsInquiryModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inqForm.name}
                    onChange={(e) => setInqForm({ ...inqForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Samuel Mutua"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={inqForm.company}
                    onChange={(e) => setInqForm({ ...inqForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Apex Holdings"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={inqForm.phone}
                    onChange={(e) => setInqForm({ ...inqForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={inqForm.message}
                    onChange={(e) => setInqForm({ ...inqForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Describe your inquiry..."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsInquiryModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-700 text-white rounded-lg font-bold">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
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
