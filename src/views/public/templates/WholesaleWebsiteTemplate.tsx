import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Truck, ShieldCheck, Phone, Mail, MapPin, Search,
  ArrowRight, CheckCircle2, ChevronRight, ChevronLeft,
  Building2, Percent, Clock, DollarSign, FileText, Send, X,
  Layers, ShoppingBag, BarChart3, Lock, Sparkles, Check
} from 'lucide-react';
import { PublicTenantResponse, PosProduct, TenantHeroSlide } from '../../../types';

interface WholesaleWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const WholesaleWebsiteTemplate: React.FC<WholesaleWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant, products = [], categories = [], stats = {} } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#0284C7';
  const secondaryColor = branding?.secondaryColor || '#F59E0B';
  const currencySymbol = branding?.currencySymbol || 'KSh';

  // Active hero slides
  const defaultSlides: TenantHeroSlide[] = [
    {
      id: 'ws_slide_1',
      title: 'Direct Factory Wholesale Distribution & FMCG Supply',
      subtitle: 'Supplying supermarkets, retail shops, institutions, and bulk distributors across East Africa with guaranteed manufacturer-direct rates.',
      tagline: 'Direct Sourcing • Guaranteed Lowest Wholesale Pricing',
      badgeText: '📦 B2B WHOLESALE & BULK PALLET SUPPLY',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
      primaryBtnText: 'Request Wholesale Quote',
      primaryBtnAction: 'apply',
      secondaryBtnText: 'Browse Product Catalog',
      secondaryBtnAction: 'programs',
      alignment: 'center',
      overlayOpacity: 75
    },
    {
      id: 'ws_slide_2',
      title: 'Tiered Volume Discounts & 30-Day Verified Trade Credit',
      subtitle: 'Unlock substantial commercial rebates on high-turnover commodities, grains, beverages, and hardware supplies.',
      tagline: 'Reliable Supply Chain • Fast Logistics Fleet Dispatch',
      badgeText: '💼 TRADE CREDIT & VOLUME INCENTIVES',
      imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80',
      primaryBtnText: 'Open Wholesale Account',
      primaryBtnAction: 'apply',
      secondaryBtnText: 'Explore Categories',
      secondaryBtnAction: 'departments',
      alignment: 'left',
      overlayOpacity: 75
    }
  ];

  const heroSlides = website?.heroSlides && website.heroSlides.length > 0 ? website.heroSlides : defaultSlides;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, (website?.autoSlideInterval || 6) * 1000);
    return () => clearInterval(interval);
  }, [heroSlides.length, website?.autoSlideInterval]);

  // Catalog Filtering & Search
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

  // Quote / Bulk Order Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedQuoteProduct, setSelectedQuoteProduct] = useState<PosProduct | null>(null);

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    quantity: '10',
    deliveryLocation: '',
    notes: ''
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteFeedback, setQuoteFeedback] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const handleOpenQuoteModal = (product?: PosProduct) => {
    setSelectedQuoteProduct(product || null);
    setQuoteFeedback(null);
    if (product) {
      setQuoteForm(prev => ({
        ...prev,
        notes: `Inquiry for wholesale order of: ${product.name} (SKU: ${product.sku}, Unit: ${product.unit || 'Standard'})`
      }));
    }
    setIsQuoteModalOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.contactPerson.trim() || !quoteForm.phone.trim()) return;

    setIsSubmittingQuote(true);
    setQuoteFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quoteForm.contactPerson,
          organization: quoteForm.businessName,
          email: quoteForm.email,
          phone: quoteForm.phone,
          inquiryType: 'WHOLESALE_QUOTE',
          productOrProgramId: selectedQuoteProduct?.id,
          targetItemName: selectedQuoteProduct?.name || 'Bulk Wholesale Order',
          quantity: Number(quoteForm.quantity) || 1,
          location: quoteForm.deliveryLocation,
          message: `${quoteForm.notes} | Requested Quantity: ${quoteForm.quantity} | Delivery To: ${quoteForm.deliveryLocation}`
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit wholesale inquiry.');
      }

      setQuoteFeedback({
        success: true,
        message: json.message || 'Your wholesale quotation request has been submitted successfully.',
        refId: json.referenceId
      });
      // Reset form
      setQuoteForm({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        quantity: '10',
        deliveryLocation: '',
        notes: ''
      });
    } catch (err: any) {
      setQuoteFeedback({
        success: false,
        message: err.message || 'An error occurred while submitting your inquiry.'
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const activeSlide = heroSlides[activeSlideIndex] || heroSlides[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Name */}
          <div className="flex items-center space-x-3">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName || tenant.name} className="h-9 w-auto rounded object-contain" />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-base shadow-inner"
                style={{ backgroundColor: primaryColor }}
              >
                <Package className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight block text-white">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase block">
                B2B Wholesale & Bulk Distribution
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#catalog" className="hover:text-white transition-colors">Product Catalog</a>
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#trade-terms" className="hover:text-white transition-colors">Trade Credit Terms</a>
            <a href="#logistics" className="hover:text-white transition-colors">Warehouse & Logistics</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact Wholesale</a>
          </nav>

          {/* Action Zone */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenQuoteModal()}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 transition-all shadow-sm cursor-pointer"
              style={{ backgroundColor: secondaryColor }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Bulk Quote</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Wholesale Portal Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SLIDER */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[480px] lg:min-h-[540px] flex items-center">
        {/* Background Image with Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{
            backgroundImage: `url(${activeSlide.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80'})`
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70"
            style={{ opacity: (activeSlide.overlayOpacity ?? 75) / 100 }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-5">
            {/* Badge */}
            {activeSlide.badgeText && (
              <span
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm"
                style={{ backgroundColor: secondaryColor }}
              >
                <span>{activeSlide.badgeText}</span>
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {activeSlide.subtitle || website?.heroDescription || 'Supplying verified bulk commodities with same-day loading bay dispatches.'}
            </p>

            {/* Tagline bullet points */}
            {activeSlide.tagline && (
              <div className="flex items-center space-x-2 text-xs font-medium text-sky-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeSlide.tagline}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenQuoteModal()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-900 transition-transform active:scale-95 shadow-md flex items-center space-x-2 cursor-pointer"
                style={{ backgroundColor: secondaryColor }}
              >
                <span>{activeSlide.primaryBtnText || 'Request Wholesale Quote'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#catalog"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>{activeSlide.secondaryBtnText || 'View Product Catalog'}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-2">
            <button
              onClick={() => setActiveSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400">
              {activeSlideIndex + 1} / {heroSlides.length}
            </span>
            <button
              onClick={() => setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length)}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 3. VALUE PROPOSITIONS / WHOLESALE ADVANTAGES */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Factory-Direct Pricing</h4>
                <p className="text-[11px] text-slate-500 mt-1">Guaranteed volume margins by sourcing straight from certified manufacturing plants.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Fleet Pallet Logistics</h4>
                <p className="text-[11px] text-slate-500 mt-1">Same-day loading bay dispatches and scheduled container deliveries to your warehouse.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Trade Credit Facilities</h4>
                <p className="text-[11px] text-slate-500 mt-1">Flexible 14 to 30-day net credit terms for verified retailers and corporate accounts.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Quality Certified Packaging</h4>
                <p className="text-[11px] text-slate-500 mt-1">Tamper-proof shrink wrapping, barcode tracking, and batch inspection certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHOLESALE PRODUCT CATALOG SECTION */}
      <section id="catalog" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                <ShoppingBag className="w-4 h-4" />
                <span>Live Inventory & Wholesale Rates</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Wholesale Product Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Browse our real-time stock levels, tiered wholesale prices, and minimum order quantities.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Total Items</span>
                <span className="text-sm font-extrabold text-slate-900">{products.length} Products</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Fulfillment</span>
                <span className="text-sm font-extrabold text-emerald-600">99.8% Active</span>
              </div>
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name, SKU or brand..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <span className="text-xs text-slate-500 self-end sm:self-center">
                Showing <strong>{filteredProducts.length}</strong> of {products.length} items
              </span>
            </div>

            {/* Category Filter Pills */}
            <div id="categories" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching wholesale products found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn't find items matching your search or category filter. Try clearing the search term or contact our sales desk for custom sourcing.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((p) => {
                const inStock = p.quantityInStock > 0;
                const wholesalePrice = p.wholesalePrice || p.sellingPrice;
                const margin = p.sellingPrice > wholesalePrice
                  ? Math.round(((p.sellingPrice - wholesalePrice) / wholesalePrice) * 100)
                  : 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top row: SKU & Stock Status */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {p.sku}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                            inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{inStock ? `${p.quantityInStock} ${p.unit || 'units'} in stock` : 'Order on Demand'}</span>
                        </span>
                      </div>

                      {/* Title & Brand */}
                      <div>
                        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5 group-hover:text-sky-700 transition-colors line-clamp-2">
                          {p.name}
                        </h4>
                        {p.authorOrBrand && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Brand: <strong>{p.authorOrBrand}</strong>
                          </span>
                        )}
                      </div>

                      {/* Pricing Box */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Wholesale Rate:</span>
                          <span className="text-base font-extrabold text-slate-900">
                            {currencySymbol} {wholesalePrice.toLocaleString()}
                          </span>
                        </div>
                        {p.sellingPrice > wholesalePrice && (
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Retail M.R.P:</span>
                            <span className="line-through">{currencySymbol} {p.sellingPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {margin > 0 && (
                          <div className="text-[10px] text-emerald-600 font-bold text-right">
                            Est. Retail Markup: ~{margin}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        Unit: <strong>{p.unit || 'Standard'}</strong>
                      </span>
                      <button
                        onClick={() => handleOpenQuoteModal(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 flex items-center space-x-1 cursor-pointer shrink-0 shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span>Request Quote</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. TRADE CREDIT & VOLUME TIERS */}
      <section id="trade-terms" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Commercial Partnerships</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trade Credit & Volume Pricing Tiers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We empower retail stores, supermarkets, mini-marts, and institutions with commercial payment facilities tailored to your cashflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 text-[10px] font-bold rounded uppercase">
                  Tier 1: Spot Wholesale
                </span>
                <h3 className="text-lg font-bold text-slate-900">Cash & M-Pesa Dispatches</h3>
                <p className="text-xs text-slate-600">Ideal for small shops, kiosks, and instant collection from our warehouse.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant loading bay collection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Low minimum order quantities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>M-Pesa Till & Bank Transfer payment</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenQuoteModal()}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Inquire Rates
              </button>
            </div>

            {/* Tier 2 */}
            <div className="bg-sky-50/60 rounded-2xl p-6 border-2 border-sky-600 space-y-4 flex flex-col justify-between relative shadow-sm">
              <div className="absolute -top-3 right-6 bg-sky-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-3">
                <span className="px-2.5 py-1 bg-sky-200 text-sky-900 text-[10px] font-bold rounded uppercase">
                  Tier 2: Retailer Account
                </span>
                <h3 className="text-lg font-bold text-slate-900">14-Day Trade Credit</h3>
                <p className="text-xs text-slate-600">For established supermarkets, mini-marts, and institutions with regular weekly restocking.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>14-day rolling credit balance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>5% additional pallet volume discount</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>Scheduled free truck delivery</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenQuoteModal()}
                className="w-full py-2 bg-sky-700 text-white rounded-xl text-xs font-bold hover:bg-sky-800 transition-colors cursor-pointer shadow-xs"
              >
                Apply for Retailer Credit
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 text-[10px] font-bold rounded uppercase">
                  Tier 3: Master Distributor
                </span>
                <h3 className="text-lg font-bold text-slate-900">30-Day Net Commercial</h3>
                <p className="text-xs text-slate-600">For regional distributors, hotel chains, universities, and commercial contractors.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>30-day corporate trade credit</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10-15% container volume pricing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated wholesale account officer</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenQuoteModal()}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Open Corporate Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WAREHOUSE & LOGISTICS SECTION */}
      <section id="logistics" className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Supply Chain & Dispatch Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Centralized Godown Dispatch & Cold-Chain Logistics
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Operating from our multi-acre commercial warehouse complex, we feature 12 automated loading bays, temperature-controlled storage for perishables, and a dedicated fleet of distribution trucks delivering across the region daily.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <Clock className="w-4 h-4 text-sky-400 mb-1" />
                  <div className="font-bold text-xs text-white">Dispatch Hours</div>
                  <div className="text-[11px] text-slate-400">Mon - Sat: 7:00 AM – 6:00 PM</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <Truck className="w-4 h-4 text-emerald-400 mb-1" />
                  <div className="font-bold text-xs text-white">Fleet Capacity</div>
                  <div className="text-[11px] text-slate-400">3-Ton to 28-Ton Pallet Trucks</div>
                </div>
              </div>
            </div>

            {/* Warehouse image card */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80"
                alt="Warehouse & Logistics Hub"
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs font-mono font-bold text-sky-400">
                  {branding?.address || 'Industrial Area Logistics Park, Nairobi'}
                </span>
                <span className="text-white text-sm font-bold mt-1">
                  Automated Pallet Barcoding & Same-Day Turnaround
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & INQUIRY FOOTER */}
      <footer id="contact" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: About */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-sky-600 flex items-center justify-center text-white font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">{branding?.companyName || tenant.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {website?.aboutText || 'Leading wholesale distributor and bulk supply partner providing FMCG, groceries, beverages, and hardware.'}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Wholesale Supply</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#catalog" className="hover:text-white transition-colors">Grains & Foodstuffs</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">FMCG & Groceries</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Beverages & Bottled Water</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Detergents & Household</a></li>
                <li><a href="#catalog" className="hover:text-white transition-colors">Building Hardware</a></li>
              </ul>
            </div>

            {/* Col 3: Contact details */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Sales & Order Desk</h4>
              <div className="space-y-2 text-[11px]">
                {branding?.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{branding.contactPhone}</span>
                  </div>
                )}
                {branding?.contactEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{branding.contactEmail}</span>
                  </div>
                )}
                {branding?.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{branding.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Col 4: ERP Portal Access */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Portal & Management</h4>
              <p className="text-[11px] text-slate-400">
                Authorized wholesale staff, sales representatives, and verified client accounts sign in below:
              </p>
              <button
                onClick={onPortalLogin}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign In to ERP Portal</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <span>
              © {new Date().getFullYear()} {branding?.companyName || tenant.name}. All rights reserved.
            </span>
            <div className="flex items-center space-x-4">
              <span>Powered by Davetech Cloud ERP</span>
              {onNavigateToMainPlatform && (
                <button
                  onClick={onNavigateToMainPlatform}
                  className="text-sky-400 hover:underline cursor-pointer"
                >
                  Platform Home
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* 8. INTERACTIVE BULK QUOTE / ORDER MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 mb-5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase text-sky-700">
                <FileText className="w-4 h-4" />
                <span>Wholesale Quotation Request</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {selectedQuoteProduct ? `Order Quote: ${selectedQuoteProduct.name}` : 'Request Wholesale Bulk Quotation'}
              </h3>
              <p className="text-xs text-slate-500">
                Fill out the details below. Our corporate sales team will generate a formal proforma invoice within 30 minutes.
              </p>
            </div>

            {quoteFeedback ? (
              <div
                className={`p-4 rounded-xl space-y-3 ${
                  quoteFeedback.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Quotation Reference: {quoteFeedback.refId}</span>
                </div>
                <p className="text-xs leading-relaxed">{quoteFeedback.message}</p>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Business / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QuickMart Supermarket Ltd / Apex Contractors"
                    value={quoteForm.businessName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mary Wanjiku"
                      value={quoteForm.contactPerson}
                      onChange={(e) => setQuoteForm({ ...quoteForm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Phone Number (M-Pesa) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +254 712 345 678"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@company.co.ke"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estimated Volume / Quantity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50 Bags / 2 Pallets"
                      value={quoteForm.quantity}
                      onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Delivery Destination / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mombasa Road Branch / Direct Warehouse Collection"
                    value={quoteForm.deliveryLocation}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Additional Items / Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specify other items, batch requirements, or trade credit terms..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="px-5 py-2 text-slate-900 rounded-lg font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {isSubmittingQuote ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Quote Request</span>
                      </>
                    )}
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
