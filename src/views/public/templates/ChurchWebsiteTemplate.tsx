import React, { useState } from 'react';
import {
  Church, Heart, Users, Calendar, MapPin, Phone, Mail,
  CheckCircle2, Lock, ArrowRight, X, Send, BookOpen, Music
} from 'lucide-react';
import { PublicTenantResponse } from '../../../types';

interface ChurchWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const ChurchWebsiteTemplate: React.FC<ChurchWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#7C3AED';

  // Prayer Request Modal
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [prayerForm, setPrayerForm] = useState({ name: '', phone: '', email: '', request: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerForm.name.trim() || !prayerForm.phone.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prayerForm.name,
          email: prayerForm.email,
          phone: prayerForm.phone,
          inquiryType: 'PRAYER_REQUEST',
          targetItemName: 'Prayer & Pastoral Care Request',
          message: prayerForm.request
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission failed');

      setFeedback({
        success: true,
        message: 'Your prayer request has been submitted to the pastoral intercessory team. May God bless you.',
        refId: json.referenceId
      });
      setPrayerForm({ name: '', phone: '', email: '', request: '' });
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Could not send prayer request. Please reach out to our church office directly.'
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
              <Church className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-purple-700 font-semibold uppercase tracking-wider block">
                Worship, Fellowship & Ministry
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-purple-700 transition-colors">Service Times</a>
            <a href="#ministries" className="hover:text-purple-700 transition-colors">Ministries</a>
            <a href="#giving" className="hover:text-purple-700 transition-colors">Tithe & Giving</a>
            <a href="#contact" className="hover:text-purple-700 transition-colors">Contact Church</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFeedback(null);
                setIsPrayerModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Send Prayer Request</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Ministry Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-200 bg-purple-900/80 border border-purple-700">
              <Church className="w-3.5 h-3.5" />
              <span>A Place of Worship & Grace</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {website?.heroTitle || 'Growing Together in Faith, Fellowship, and Love'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {website?.heroDescription || 'Join us this Sunday for transformative praise, biblical teaching, and community outreach.'}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href="#services"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-transform active:scale-95 shadow-md flex items-center space-x-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span>View Sunday Services</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  setFeedback(null);
                  setIsPrayerModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Request Prayer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Schedule */}
      <section id="services" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Weekly Gatherings</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Worship Services & Fellowship
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Music className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1st Sunday Service</h3>
              <p className="text-xs text-slate-500 font-bold text-purple-700">8:30 AM – 10:30 AM</p>
              <p className="text-xs text-slate-600">Early morning celebration, praise, and communion service.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">2nd Main Service & Youth</h3>
              <p className="text-xs text-slate-500 font-bold text-purple-700">11:00 AM – 1:00 PM</p>
              <p className="text-xs text-slate-600">Contemporary worship, teens church, and children Sunday school.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Midweek Bible Study</h3>
              <p className="text-xs text-slate-500 font-bold text-purple-700">Wednesdays: 5:30 PM – 7:00 PM</p>
              <p className="text-xs text-slate-600">In-depth expository bible teachings and intercessory prayer fellowship.</p>
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

      {/* Prayer Request Modal */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsPrayerModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Send Prayer Request</h3>
              <p className="text-xs text-slate-500">Our pastoral prayer team is standing with you in prayer.</p>
            </div>

            {feedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <p className="font-bold">{feedback.message}</p>
                <button onClick={() => setIsPrayerModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPrayer} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={prayerForm.name}
                    onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Grace Njeri"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={prayerForm.phone}
                    onChange={(e) => setPrayerForm({ ...prayerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prayer Request / Praise Report</label>
                  <textarea
                    rows={3}
                    required
                    value={prayerForm.request}
                    onChange={(e) => setPrayerForm({ ...prayerForm, request: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Share your prayer need or thanksgiving..."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsPrayerModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold">
                    {isSubmitting ? 'Sending...' : 'Send Request'}
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
