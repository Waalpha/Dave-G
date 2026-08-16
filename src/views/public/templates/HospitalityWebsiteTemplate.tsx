import React, { useState } from 'react';
import {
  Utensils, Coffee, Wine, Clock, MapPin, Phone, Mail,
  CheckCircle2, Lock, ArrowRight, X, Send, Calendar, Users
} from 'lucide-react';
import { PublicTenantResponse } from '../../../types';

interface HospitalityWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const HospitalityWebsiteTemplate: React.FC<HospitalityWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#D97706';

  // Reservation Modal
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [resForm, setResForm] = useState({ name: '', phone: '', email: '', guests: '2', date: '', time: '19:00' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleSubmitRes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.name.trim() || !resForm.phone.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resForm.name,
          email: resForm.email,
          phone: resForm.phone,
          inquiryType: 'GENERAL',
          targetItemName: `Table Reservation for ${resForm.guests} Guests (${resForm.date} at ${resForm.time})`,
          message: `Dining Reservation for ${resForm.guests} guests on ${resForm.date} at ${resForm.time}.`
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Reservation submission failed');

      setFeedback({
        success: true,
        message: 'Your table reservation has been received! Our host team will confirm availability shortly.',
        refId: json.referenceId
      });
      setResForm({ name: '', phone: '', email: '', guests: '2', date: '', time: '19:00' });
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Could not reserve table. Please call our restaurant directly.'
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
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider block">
                Restaurant, Dining & Lounge
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#menu" className="hover:text-amber-700 transition-colors">Dining Menu</a>
            <a href="#dining" className="hover:text-amber-700 transition-colors">Experience</a>
            <a href="#location" className="hover:text-amber-700 transition-colors">Location & Hours</a>
            <a href="#contact" className="hover:text-amber-700 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFeedback(null);
                setIsResModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Table</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurant Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-900/80 border border-amber-700">
              <Utensils className="w-3.5 h-3.5" />
              <span>Exquisite Culinary Experience</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {website?.heroTitle || 'Authentic Flavors, Craft Drinks & Memorable Hospitality'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {website?.heroDescription || 'Enjoy artisan cuisine prepared with freshly sourced local ingredients in a sophisticated and vibrant ambiance.'}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => {
                  setFeedback(null);
                  setIsResModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-transform active:scale-95 shadow-md flex items-center space-x-2 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Book a Table</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#menu"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                View Menu Highlights
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section id="menu" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Chef Recommendations</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Signature Dishes & Refreshments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Char-Grilled Steaks & BBQ</h3>
              <p className="text-xs text-slate-600">Prime aged meats grilled to perfection with secret dry rubs and herbal bastings.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Artisan Coffee & Bakery</h3>
              <p className="text-xs text-slate-600">Single-origin roasted coffee beans paired with fresh morning pastries and desserts.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Wine className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Mixology Cocktails & Wine</h3>
              <p className="text-xs text-slate-600">Hand-crafted signature cocktails, vintage wine pairings, and chilled tap beers.</p>
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

      {/* Reservation Modal */}
      {isResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsResModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Reserve a Table</h3>
              <p className="text-xs text-slate-500">Book your dining experience in advance.</p>
            </div>

            {feedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <p className="font-bold">{feedback.message}</p>
                <button onClick={() => setIsResModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRes} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={resForm.name}
                    onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. David Kimani"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={resForm.phone}
                    onChange={(e) => setResForm({ ...resForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Number of Guests</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={resForm.guests}
                      onChange={(e) => setResForm({ ...resForm, guests: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reservation Date</label>
                    <input
                      type="date"
                      value={resForm.date}
                      onChange={(e) => setResForm({ ...resForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsResModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold">
                    {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
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
