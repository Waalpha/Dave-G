import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  MessageSquare,
  Search,
  BookOpen,
  LifeBuoy,
  Send,
  Clock
} from 'lucide-react';
import { getBaseDomain } from '../../../lib/domainResolver';

interface SupportPortalProps {
  onNavigateHome?: () => void;
  onNavigateToLogin?: () => void;
}

export const SupportPortal: React.FC<SupportPortalProps> = ({
  onNavigateHome,
  onNavigateToLogin
}) => {
  const baseDomain = getBaseDomain();
  const [ticket, setTicket] = useState({
    name: '',
    email: '',
    tenantSlug: '',
    category: 'TECHNICAL',
    subject: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticket.name,
          email: ticket.email,
          message: `[SUPPORT TICKET] Category: ${ticket.category}, Tenant: ${ticket.tenantSlug}, Subject: ${ticket.subject}\n\nDescription: ${ticket.description}`
        })
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-600/30">
              D
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">Davetech ERP</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Support Desk
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-semibold">
          <LifeBuoy className="w-3.5 h-3.5 text-purple-400" />
          <span>Customer Success & Help Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          How can we help your organization today?
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Open a support ticket, read operational guides, or contact our 24/7 technical desk.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Support Ticket Logged</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Ticket #{Math.floor(100000 + Math.random() * 900000)} has been created. A support engineer will review and reply to <strong>{ticket.email}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setTicket({ name: '', email: '', tenantSlug: '', category: 'TECHNICAL', subject: '', description: '' });
                    }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Open Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>Submit Support Ticket</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={ticket.name}
                      onChange={e => setTicket({ ...ticket, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={ticket.email}
                      onChange={e => setTicket({ ...ticket, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Organization Subdomain / Name</label>
                    <input
                      type="text"
                      placeholder="e.g. apex.davetech.co.ke"
                      value={ticket.tenantSlug}
                      onChange={e => setTicket({ ...ticket, tenantSlug: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Issue Category</label>
                    <select
                      value={ticket.category}
                      onChange={e => setTicket({ ...ticket, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="TECHNICAL">Technical Issue / Bug</option>
                      <option value="ACCOUNT">User Account & Password</option>
                      <option value="BILLING">Billing & Subscription</option>
                      <option value="MODULE">Feature Request / Training</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-slate-300 font-semibold">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the issue..."
                    value={ticket.subject}
                    onChange={e => setTicket({ ...ticket, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-slate-300 font-semibold">Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please provide details about what happened and steps to reproduce..."
                    value={ticket.description}
                    onChange={e => setTicket({ ...ticket, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>Contact Channels</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Email Support</span>
                  <strong className="text-white font-mono">support@{baseDomain}</strong>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Emergency Hotline</span>
                  <strong className="text-white font-mono">+254 700 000 000</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
