import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndustry?: string;
  initialPlan?: string;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({
  isOpen,
  onClose,
  initialIndustry = 'Education & Higher Learning',
  initialPlan
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    industry: initialIndustry,
    interestedModules: ['education', 'accounting', 'pos'],
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const industryOptions = [
    'Education & Higher Learning',
    'TVET & Technical Institute',
    'Retail & Supermarket',
    'Healthcare & Hospital',
    'Hospitality & Restaurant',
    'Wholesale & Distribution',
    'SACCO & Microfinance',
    'Church & Ministry',
    'General Business & SME'
  ];

  const availableModules = [
    { id: 'education', label: 'Education & Admissions' },
    { id: 'pos', label: 'Point of Sale (POS)' },
    { id: 'retail', label: 'Retail & Multi-Store' },
    { id: 'accounting', label: 'Accounting & Ledgers' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'hospital', label: 'Healthcare & EHR' },
    { id: 'sacco', label: 'SACCO & Micro-Loans' },
    { id: 'bar', label: 'Hospitality & KOT' },
    { id: 'church', label: 'Church Management' },
    { id: 'hr', label: 'HR & Payroll' }
  ];

  const toggleModule = (modId: string) => {
    setFormData(prev => {
      const exists = prev.interestedModules.includes(modId);
      return {
        ...prev,
        interestedModules: exists
          ? prev.interestedModules.filter(id => id !== modId)
          : [...prev.interestedModules, modId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide your name and contact email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/public/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedPlan: initialPlan || 'Custom Demonstration'
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit demo request');
      }

      setSuccessMessage('Your live demonstration request has been scheduled! A Davetech ERP specialist will contact you within 2 business hours.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {successMessage ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Demo Request Received!
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {successMessage}
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all"
              >
                Close & Return to Website
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3 h-3" />
                <span>Live Interactive Walkthrough</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Book a Davetech ERP Demo
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                See how Davetech ERP can streamline your organization&apos;s operations with a tailored demonstration.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Agnes Maina"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@organization.co.ke"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phone Number / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 700 123 456"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Organization Name
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Breakthrough College"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Primary Industry Solution
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {industryOptions.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Select Modules of Interest:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableModules.map((mod) => {
                  const checked = formData.interestedModules.includes(mod.id);
                  return (
                    <button
                      type="button"
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-2 rounded-lg text-[11px] font-semibold text-left border transition-all flex items-center justify-between ${
                        checked 
                          ? 'bg-blue-50 border-blue-400 text-blue-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{mod.label}</span>
                      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Scheduling Demo...</span>
                ) : (
                  <>
                    <span>Confirm Live Demo Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your contact info is strictly confidential and never shared.</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
