import React, { useState } from 'react';
import {
  Activity, Heart, ShieldCheck, Clock, MapPin, Phone, Mail,
  Calendar, CheckCircle2, Stethoscope, Lock, ArrowRight, X, Send,
  UserCheck, AlertCircle, PlusCircle
} from 'lucide-react';
import { PublicTenantResponse } from '../../../types';

interface HealthcareWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const HealthcareWebsiteTemplate: React.FC<HealthcareWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant, departments = [], stats = {} } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#0D9488';
  const secondaryColor = branding?.secondaryColor || '#0284C7';

  // Appointment Modal
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [apptForm, setApptForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    department: departments[0]?.name || 'General Outpatient',
    preferredDate: '',
    symptoms: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleSubmitAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptForm.patientName.trim() || !apptForm.phone.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: apptForm.patientName,
          email: apptForm.email,
          phone: apptForm.phone,
          inquiryType: 'APPOINTMENT',
          targetItemName: apptForm.department,
          message: `Clinical Consultation Booking for ${apptForm.department}. Date: ${apptForm.preferredDate || 'Earliest available'}. Symptoms: ${apptForm.symptoms || 'General Checkup'}`
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Booking failed');

      setFeedback({
        success: true,
        message: json.message || 'Your appointment request has been scheduled! Our triage nurse will call to confirm.',
        refId: json.referenceId
      });
      setApptForm({
        patientName: '',
        phone: '',
        email: '',
        department: departments[0]?.name || 'General Outpatient',
        preferredDate: '',
        symptoms: ''
      });
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Could not complete booking. Please call our 24/7 casualty line.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Top Emergency Banner */}
      <div className="bg-teal-900 text-teal-100 text-xs px-4 py-2 flex items-center justify-between border-b border-teal-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase animate-pulse">
              24/7 Casualty
            </span>
            <span>Emergency Hotline: <strong>{branding?.contactPhone || '+254 700 911 911'}</strong></span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px]">
            <span>Ambulance Dispatch Active</span>
            <span>•</span>
            <span>Accredited Healthcare Facility</span>
          </div>
        </div>
      </div>

      {/* 2. Main Nav */}
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
                <Activity className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-teal-600 font-semibold block uppercase">
                Healthcare & Medical Center
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#specialties" className="hover:text-teal-700 transition-colors">Clinical Specialties</a>
            <a href="#emergency" className="hover:text-teal-700 transition-colors">Emergency & ICU</a>
            <a href="#diagnostics" className="hover:text-teal-700 transition-colors">Diagnostics & Lab</a>
            <a href="#contact" className="hover:text-teal-700 transition-colors">Contact Hospital</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFeedback(null);
                setIsApptModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-xs cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Hospital Staff Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative bg-slate-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-teal-200 bg-teal-800/80 border border-teal-600">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>World-Class Clinical Care</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {website?.heroTitle || 'Compassionate Healthcare Excellence & 24/7 Patient Safety'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {website?.heroDescription || 'Providing comprehensive inpatient, outpatient, diagnostic radiology, specialized surgery, and pediatric care.'}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => {
                  setFeedback(null);
                  setIsApptModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-transform active:scale-95 shadow-md flex items-center space-x-2 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Book Doctor Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#specialties"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Explore Specialties
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Clinical Specialties */}
      <section id="specialties" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Departments & Specialties</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Comprehensive Medical Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Led by board-certified consultants and dedicated healthcare practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{dept.code}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                </div>

                <button
                  onClick={() => {
                    setApptForm(prev => ({ ...prev, department: dept.name }));
                    setFeedback(null);
                    setIsApptModalOpen(true);
                  }}
                  className="w-full py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer text-center"
                >
                  Consult Specialist
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-white font-bold text-sm block">{branding?.companyName || tenant.name}</span>
              <p className="text-[11px] leading-relaxed">
                {branding?.address || 'Medical Plaza, Main Highway, Nairobi, Kenya'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-white font-bold text-sm block">Casualty & Inquiries</span>
              <p className="text-[11px] leading-relaxed">
                Emergency: {branding?.contactPhone || '+254 700 911 911'}<br />
                Email: {branding?.contactEmail || 'info@hospital.org'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-white font-bold text-sm block">Healthcare Portal</span>
              <button
                onClick={onPortalLogin}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 border border-slate-700"
              >
                Sign In to Hospital EHR / ERP
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px]">
            <span>© {new Date().getFullYear()} {branding?.companyName || tenant.name}. All rights reserved.</span>
            <span>Powered by Davetech Cloud ERP</span>
          </div>
        </div>
      </footer>

      {/* Appointment Modal */}
      {isApptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsApptModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Book Medical Consultation</h3>
              <p className="text-xs text-slate-500">Request an outpatient appointment with our clinical specialists.</p>
            </div>

            {feedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <div className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Booking Reference: {feedback.refId}</span>
                </div>
                <p>{feedback.message}</p>
                <button onClick={() => setIsApptModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAppt} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={apptForm.patientName}
                    onChange={(e) => setApptForm({ ...apptForm, patientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. John Kamau"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={apptForm.phone}
                    onChange={(e) => setApptForm({ ...apptForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialty Department</label>
                  <select
                    value={apptForm.department}
                    onChange={(e) => setApptForm({ ...apptForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    {departments.length === 0 && <option value="General Outpatient">General Outpatient</option>}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Symptoms</label>
                  <textarea
                    rows={2}
                    value={apptForm.symptoms}
                    onChange={(e) => setApptForm({ ...apptForm, symptoms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Brief description of consultation reason..."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsApptModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-teal-700 text-white rounded-lg font-bold">
                    {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
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
