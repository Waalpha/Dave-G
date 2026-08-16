import React, { useState, useMemo } from 'react';
import {
  ShoppingBag, Store, Tag, Clock, MapPin, Phone, Mail,
  Search, CheckCircle2, Star, Sparkles, Send, X, Lock,
  ChevronRight, ArrowRight, ShieldCheck, Heart, CreditCard
} from 'lucide-react';
import { PublicTenantResponse, PosProduct } from '../../../types';

interface RetailWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const RetailWebsiteTemplate: React.FC<RetailWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant, products = [], categories = [], stats = {} } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#2563EB';
  const secondaryColor = branding?.secondaryColor || '#F59E0B';
  const currencySymbol = branding?.currencySymbol || 'KSh';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.authorOrBrand && p.authorOrBrand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Inquiries Modal
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState<PosProduct | null>(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleOpenInquiry = (product?: PosProduct) => {
    setInquiryProduct(product || null);
    setFeedback(null);
    if (product) {
      setInquiryMessage(`Hi, I would like to check availability or reserve: ${product.name} (Price: ${currencySymbol} ${product.sellingPrice})`);
    }
    setIsInquiryModalOpen(true);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          inquiryType: 'GENERAL',
          productOrProgramId: inquiryProduct?.id,
          targetItemName: inquiryProduct?.name,
          message: inquiryMessage
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission failed');

      setFeedback({
        success: true,
        message: json.message || 'Your inquiry has been received! Our store associate will contact you shortly.',
        refId: json.referenceId
      });
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Failed to submit inquiry. Please call the store directly.'
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
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black"
                style={{ backgroundColor: primaryColor }}
              >
                <Store className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Retail Store & Point of Sale
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#store-products" className="hover:text-blue-600 transition-colors">Products</a>
            <a href="#offers" className="hover:text-blue-600 transition-colors">Special Offers</a>
            <a href="#store-info" className="hover:text-blue-600 transition-colors">Store Location & Hours</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Customer Care</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenInquiry()}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 transition-colors"
              style={{ backgroundColor: secondaryColor }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Inquire / Reserve Item</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Store Staff Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="relative bg-slate-900 text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 bg-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to {branding?.companyName || tenant.name}</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {website?.heroTitle || `Quality Goods & Seamless Retail Shopping`}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {website?.heroDescription || `Discover our wide range of authentic products, best retail prices, and friendly customer support.`}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href="#store-products"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-900 transition-transform active:scale-95 shadow-md flex items-center space-x-2"
                style={{ backgroundColor: secondaryColor }}
              >
                <span>Browse Store Items</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#store-info"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Store Location
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Products Catalog */}
      <section id="store-products" className="py-12 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Featured Store Products</h2>
              <p className="text-xs text-slate-500">Available in store for instant pickup or local delivery.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                selectedCategory === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-slate-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No products matching your search</h3>
              <p className="text-xs text-slate-500">Check back soon or ask our store attendants directly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">{p.sku}</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {p.quantityInStock > 0 ? 'In Stock' : 'Pre-order'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{p.name}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Retail Price</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {currencySymbol} {p.sellingPrice.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenInquiry(p)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Store Info & Contact */}
      <section id="store-info" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Store Address</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {branding?.address || 'Main Street Commercial Plaza, Nairobi'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Operating Hours</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monday to Saturday: 8:00 AM – 8:00 PM<br />
                Sundays & Holidays: 10:00 AM – 6:00 PM
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Customer Helpline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Phone: {branding?.contactPhone || '+254 700 000 000'}<br />
                Email: {branding?.contactEmail || 'sales@store.co.ke'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} {branding?.companyName || tenant.name}. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <span>Powered by Davetech Cloud ERP</span>
            {onNavigateToMainPlatform && (
              <button onClick={onNavigateToMainPlatform} className="text-sky-400 hover:underline">
                Platform Home
              </button>
            )}
          </div>
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
              <h3 className="text-lg font-bold text-slate-900">Store Item Inquiry</h3>
              <p className="text-xs text-slate-500">
                {inquiryProduct ? `Inquiring about: ${inquiryProduct.name}` : 'Send a message to our sales team'}
              </p>
            </div>

            {feedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <div className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reference: {feedback.refId}</span>
                </div>
                <p>{feedback.message}</p>
                <button onClick={() => setIsInquiryModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (M-Pesa) *</label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsInquiryModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
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
