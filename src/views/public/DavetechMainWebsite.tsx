import React, { useState, useEffect, useMemo } from 'react';
import { 
  DAVETECH_MODULES_DETAILS, 
  DAVETECH_INDUSTRIES, 
  DAVETECH_PLATFORM_PLANS,
  DavetechModuleDetail 
} from '../../data/davetechModulesDetails';
import {
  getFontFamilyClass,
  getHeadingSizeClass,
  getSubtitleSizeClass,
  getFontWeightClass,
  getTextAlignClass
} from '../../lib/typography';
import { 
  GraduationCap, 
  Coins, 
  HeartHandshake, 
  ShoppingBag, 
  Wine, 
  Store, 
  Truck, 
  Activity, 
  BookOpen, 
  Calculator, 
  Users, 
  Package, 
  UserCheck, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Smartphone, 
  Search, 
  Building2, 
  Lock, 
  Clock, 
  X, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink,
  ChevronDown,
  Maximize2,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';

interface DavetechMainWebsiteProps {
  onNavigateToLogin: () => void;
  onNavigateToTenant: (tenantSlug: string) => void;
  onNavigateToModuleDemo?: (moduleId: string) => void;
}

interface PublicTenantSummary {
  id: string;
  name: string;
  slug: string;
  type: string;
  branding?: {
    companyName?: string;
    primaryColor?: string;
    currencySymbol?: string;
  };
  publicWebsite?: {
    enabled?: boolean;
    heroTitle?: string;
    tagline?: string;
  };
  enabledModulesCount?: number;
}

// Dynamic Icon Resolver
const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Coins,
  HeartHandshake,
  ShoppingBag,
  Wine,
  Store,
  Truck,
  Activity,
  BookOpen,
  Calculator,
  Users,
  Package,
  UserCheck,
  Briefcase
};

export const DavetechMainWebsite: React.FC<DavetechMainWebsiteProps> = ({
  onNavigateToLogin,
  onNavigateToTenant
}) => {
  // State
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<DavetechModuleDetail | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [selectedPlanForDemo, setSelectedPlanForDemo] = useState<string>('Growth & Professional');
  const [prefilledModuleForDemo, setPrefilledModuleForDemo] = useState<string[]>([]);
  
  // Hero Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // State for Fullscreen Photo Lightbox
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Billing Cycle Toggle (Monthly vs Annual)
  const [isAnnualBilling, setIsAnnualBilling] = useState<boolean>(true);

  // Platform Website Settings State
  const [platformSettings, setPlatformSettings] = useState<any>(null);

  // Demo Request Form State
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    industry: 'Education & Higher Learning',
    interestedModules: ['education', 'accounting', 'pos'],
    message: ''
  });
  const [demoSubmitting, setDemoSubmitting] = useState<boolean>(false);
  const [demoSuccessMsg, setDemoSuccessMsg] = useState<string | null>(null);
  const [demoErrorMsg, setDemoErrorMsg] = useState<string | null>(null);

  // Fetch Public Platform Settings (CMS)
  useEffect(() => {
    fetch('/api/public/platform-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.platformName) {
          setPlatformSettings(data);
        }
      })
      .catch(err => console.error('Failed to load platform settings:', err));
  }, []);

  // Default Hero Slides Fallback
  const DEFAULT_HERO_SLIDES = [
    {
      id: 'slide_1',
      badge: 'UNIFIED CLOUD ERP PLATFORM',
      title: 'The Modern Multi-Industry ERP Ecosystem for Africa & Beyond',
      subtitle: 'Seamlessly automate Universities, SACCOs, Churches, Retail Supermarkets, Hospitality Chains, and Healthcare facilities from one central command.',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80',
      primaryAction: 'explore_modules',
      primaryText: 'Explore 14+ Modules',
      secondaryAction: 'book_demo',
      secondaryText: 'Request Live Demo',
      stats: [
        { label: 'Integrated Modules', val: '14+' },
        { label: 'Multi-Tenant Scale', val: '100% Isolated' },
        { label: 'Uptime SLA', val: '99.9%' }
      ]
    },
    {
      id: 'slide_2',
      badge: 'HIGHER ED & TVET SUITE',
      title: 'Comprehensive Campus Administration & Automated Admissions',
      subtitle: 'From public online application portals and CBC/TVET KNEC grading to real-time M-Pesa fee reconciliation, automated timetables, and multi-campus sync.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
      primaryAction: 'view_education',
      primaryText: 'Explore Education ERP',
      secondaryAction: 'book_demo',
      secondaryText: 'Request College Demo',
      stats: [
        { label: 'Paperless Admissions', val: 'Instant' },
        { label: 'Fee Reconciliation', val: '100% Automated' },
        { label: 'Transcripts & SIS', val: 'Complete' }
      ]
    },
    {
      id: 'slide_3',
      badge: 'FINANCIAL COOPERATIVES & CHAMAS',
      title: 'Autonomous SACCOs, Chamas & Microfinance Operations',
      subtitle: 'Automate member share capital, monthly voluntary savings ledgers, micro-loan eligibility, guarantor sign-offs, and annual dividend distributions.',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80',
      primaryAction: 'view_sacco',
      primaryText: 'Explore SACCO & Chama ERP',
      secondaryAction: 'book_demo',
      secondaryText: 'Request SACCO Demo',
      stats: [
        { label: 'Loan Processing', val: '< 2 Mins' },
        { label: 'Dividend Computation', val: '1-Click' },
        { label: 'Audit Trail', val: 'Tamper-Proof' }
      ]
    },
    {
      id: 'slide_4',
      badge: 'RETAIL, RESTAURANT & POS',
      title: 'High-Speed Touchscreen POS, Multi-Store Inventory & KOT',
      subtitle: 'Lightning-fast counter checkouts, thermal receipt printing, kitchen order tickets (KOT), bottle recipe costing, and multi-branch stock transfers.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b445?auto=format&fit=crop&w=1920&q=80',
      primaryAction: 'view_pos',
      primaryText: 'Explore POS & Retail',
      secondaryAction: 'book_demo',
      secondaryText: 'Book POS Terminal Demo',
      stats: [
        { label: 'Checkout Speed', val: '< 3 Sec' },
        { label: 'Offline Resilience', val: '100% Ready' },
        { label: 'Shift Balancing', val: 'Automated' }
      ]
    }
  ];

  const heroSlides = useMemo(() => {
    if (platformSettings?.publicWebsite?.heroSlides && platformSettings.publicWebsite.heroSlides.length > 0) {
      return platformSettings.publicWebsite.heroSlides;
    }
    return DEFAULT_HERO_SLIDES;
  }, [platformSettings]);

  const pricingPlans = useMemo(() => {
    if (platformSettings?.publicWebsite?.pricingPlans && platformSettings.publicWebsite.pricingPlans.length > 0) {
      return platformSettings.publicWebsite.pricingPlans;
    }
    return DAVETECH_PLATFORM_PLANS;
  }, [platformSettings]);

  // Auto slide rotation
  useEffect(() => {
    if (isPaused) return;
    const intervalSec = (platformSettings?.publicWebsite?.autoSlideInterval || 6) * 1000;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, intervalSec);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length, platformSettings?.publicWebsite?.autoSlideInterval]);

  // Filter Modules
  const filteredModules = useMemo(() => {
    return DAVETECH_MODULES_DETAILS.filter(mod => {
      const matchesCategory = 
        activeCategory === 'ALL' ||
        (activeCategory === 'INDUSTRY' && mod.category === 'Industry Specific') ||
        (activeCategory === 'ENTERPRISE' && mod.category === 'Core Enterprise') ||
        (activeCategory === 'FINANCE_POS' && ['sacco', 'accounting', 'pos', 'retail', 'wholesale', 'bar'].includes(mod.id)) ||
        (activeCategory === 'INSTITUTION' && ['education', 'church', 'hospital', 'bookshop'].includes(mod.id));

      const matchesSearch = 
        searchQuery.trim() === '' ||
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.keyFeatures.some(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        mod.targetAudience.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleHeroAction = (action: string) => {
    if (action === 'explore_modules') {
      const el = document.getElementById('modules-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'book_demo') {
      setIsDemoModalOpen(true);
    } else if (action === 'view_education') {
      const eduMod = DAVETECH_MODULES_DETAILS.find(m => m.id === 'education');
      if (eduMod) setSelectedModule(eduMod);
    } else if (action === 'view_sacco') {
      const saccoMod = DAVETECH_MODULES_DETAILS.find(m => m.id === 'sacco');
      if (saccoMod) setSelectedModule(saccoMod);
    } else if (action === 'view_pos') {
      const posMod = DAVETECH_MODULES_DETAILS.find(m => m.id === 'pos');
      if (posMod) setSelectedModule(posMod);
    }
  };

  const handleOpenDemoForModule = (module: DavetechModuleDetail) => {
    setPrefilledModuleForDemo([module.id]);
    setDemoForm(prev => ({
      ...prev,
      interestedModules: [module.id],
      industry: module.industry
    }));
    setSelectedModule(null);
    setIsDemoModalOpen(true);
  };

  const handleOpenDemoForPlan = (planName: string) => {
    setSelectedPlanForDemo(planName);
    setIsDemoModalOpen(true);
  };

  const handleSubmitDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name.trim() || !demoForm.email.trim()) {
      setDemoErrorMsg('Please provide your full name and official email address.');
      return;
    }

    setDemoSubmitting(true);
    setDemoErrorMsg(null);
    setDemoSuccessMsg(null);

    try {
      const res = await fetch('/api/public/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...demoForm,
          selectedPlan: selectedPlanForDemo
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit demo request');
      }

      setDemoSuccessMsg(data.message || 'Demonstration scheduled successfully! Our engineers will contact you shortly.');
      setDemoForm({
        name: '',
        email: '',
        phone: '',
        organization: '',
        industry: 'Education & Higher Learning',
        interestedModules: ['education', 'accounting', 'pos'],
        message: ''
      });
    } catch (err: any) {
      setDemoErrorMsg(err.message || 'Could not send demo request. Please try again.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  const toggleInterestedModule = (id: string) => {
    setDemoForm(prev => {
      const exists = prev.interestedModules.includes(id);
      return {
        ...prev,
        interestedModules: exists 
          ? prev.interestedModules.filter(m => m !== id)
          : [...prev.interestedModules, id]
      };
    });
  };

  const activeSlide = heroSlides[currentSlideIndex] || DEFAULT_HERO_SLIDES[0];

  const announcementEnabled = platformSettings?.publicWebsite?.announcementBarEnabled ?? true;
  const announcementText = platformSettings?.publicWebsite?.announcementBarText || '🚀 Davetech Cloud ERP v4.0 is Live — Enterprise Suite for Higher Ed, SACCOs, Retail POS & Corporate Supply Chains!';
  const announcementLink = platformSettings?.publicWebsite?.announcementBarLink || '#modules-section';

  // Resolved Global Typography & Slide Overrides
  const globalTypography = platformSettings?.publicWebsite?.typography || {};
  const globalFontClass = getFontFamilyClass(globalTypography.fontFamily);

  // Active Slide Typography
  const slideFontClass = getFontFamilyClass(activeSlide.fontFamily || globalTypography.fontFamily);
  const slideHeadingSizeClass = getHeadingSizeClass(activeSlide.titleFontSize || globalTypography.headingSize);
  const slideHeadingWeightClass = getFontWeightClass(activeSlide.titleFontWeight || globalTypography.headingWeight, 'font-black');
  const slideHeadingItalicClass = (activeSlide.titleItalic ?? globalTypography.headingItalic) ? 'italic' : 'not-italic';
  const slideAlign = getTextAlignClass(activeSlide.textAlign || globalTypography.headingAlign || 'left');
  
  const slideSubtitleSizeClass = getSubtitleSizeClass(activeSlide.subtitleFontSize || globalTypography.bodySize);
  const slideSubtitleWeightClass = getFontWeightClass(globalTypography.bodyWeight, 'font-medium');
  const slideSubtitleItalicClass = (activeSlide.subtitleItalic ?? globalTypography.bodyItalic) ? 'italic' : 'not-italic';

  return (
    <div className={`min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white ${globalFontClass}`}>
      
      {/* ==================== 0. ANNOUNCEMENT TOP BAR ==================== */}
      {announcementEnabled && announcementText && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-semibold py-2 px-4 border-b border-blue-500 flex items-center justify-center text-center shadow-xs">
          <a href={announcementLink} className="hover:underline flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase shrink-0">
              UPDATE
            </span>
            <span className="truncate">{announcementText}</span>
            <span className="text-blue-100 font-bold ml-1 shrink-0">Learn More →</span>
          </a>
        </div>
      )}

      {/* ==================== 1. TOP BAR NAVIGATION (3-Zone Contract) ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            {platformSettings?.logoUrl ? (
              <img 
                src={platformSettings.logoUrl} 
                alt={platformSettings.platformName || 'Davetech ERP'} 
                className="w-9 h-9 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-xs" 
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg">
                {(platformSettings?.platformName || 'D')[0]}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                {platformSettings?.platformName || 'Davetech ERP'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Multi-Tenant Cloud
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (4-6 links, single line) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-slate-600">
            <a 
              href="#modules-section" 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              All Modules ({DAVETECH_MODULES_DETAILS.length})
            </a>
            <a 
              href="#industries-section" 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Industry Solutions
            </a>
            <a 
              href="#architecture-section" 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Architecture & Security
            </a>
            <a 
              href="#pricing-section" 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Pricing
            </a>
            <a 
              href="#contact-section" 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: Primary Actions (1-2 buttons) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 whitespace-nowrap cursor-pointer"
            >
              Book Live Demo
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Portal Login</span>
            </button>
          </div>

        </div>
      </header>

      {/* ==================== 2. HERO CAROUSEL BANNER ==================== */}
      <section 
        className="relative overflow-hidden bg-slate-900 border-b border-slate-200"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ambient Blurred Atmosphere Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={activeSlide.imageUrl} 
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center filter blur-3xl scale-125 opacity-25 brightness-75 transition-all duration-1000"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>

        {/* Hero Slide Main Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Headline & Typography & Action Controls */}
            <div className={`lg:col-span-7 space-y-6 ${slideFontClass} ${slideAlign.container}`}>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-blue-950/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeSlide.badge}</span>
              </div>

              {/* Title with customizable size, style, align, bold, and italic */}
              <h1 className={`${slideHeadingSizeClass} ${slideHeadingWeightClass} ${slideHeadingItalicClass} ${slideAlign.text} text-white tracking-tight leading-[1.15] drop-shadow-md`}>
                {activeSlide.title}
              </h1>

              {/* Subtitle with customizable size, weight, italic, and align */}
              <p className={`${slideSubtitleSizeClass} ${slideSubtitleWeightClass} ${slideSubtitleItalicClass} ${slideAlign.text} text-slate-300 leading-relaxed max-w-2xl font-normal drop-shadow-sm`}>
                {activeSlide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className={`flex flex-wrap items-center gap-3 pt-2 ${slideAlign.stats}`}>
                <button
                  onClick={() => handleHeroAction(activeSlide.primaryAction)}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <span>{activeSlide.primaryText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleHeroAction(activeSlide.secondaryAction)}
                  className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 backdrop-blur-md"
                >
                  <span>{activeSlide.secondaryText}</span>
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              {/* Slide Quick Stats */}
              <div className={`pt-4 grid grid-cols-3 gap-3 border-t border-slate-800/80 max-w-xl ${slideAlign.stats} w-full`}>
                {activeSlide.stats.map((st, i) => (
                  <div key={i} className={`bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 shadow-sm backdrop-blur-sm ${slideAlign.text}`}>
                    <div className="text-base sm:text-lg font-black text-blue-400">{st.val}</div>
                    <div className="text-[11px] text-slate-400 font-medium truncate">{st.label}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT COLUMN: PROMINENT HIGH-DEFINITION PHOTO SHOWCASE FRAME */}
            <div className="lg:col-span-5 w-full">
              <div className="relative group rounded-3xl overflow-hidden border-2 border-white/20 bg-slate-800/80 shadow-2xl shadow-black/60 backdrop-blur-md transition-all duration-500 hover:border-blue-400/50">
                
                {/* Photo Header Pill with Category Tag & Zoom Trigger */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 text-white text-[11px] font-bold backdrop-blur-md shadow-lg pointer-events-auto">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[200px]">{activeSlide.badge}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLightboxImageUrl(activeSlide.imageUrl)}
                    className="p-1.5 rounded-full bg-slate-950/80 hover:bg-blue-600 border border-white/20 text-white transition-all shadow-lg pointer-events-auto cursor-pointer"
                    title="View Photo in High Resolution"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Main High-Definition Photograph */}
                <div 
                  className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => setLightboxImageUrl(activeSlide.imageUrl)}
                >
                  <img 
                    src={activeSlide.imageUrl} 
                    alt={activeSlide.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 filter brightness-100 contrast-100"
                    onError={(e) => {
                      // High-res reliable fallback if custom URL is broken
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('unsplash')) {
                        img.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80';
                      }
                    }}
                  />
                  
                  {/* Subtle Gradient Rim for Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom Photo Caption */}
                  <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                    <p className="text-xs font-bold line-clamp-1 drop-shadow-md text-slate-100">
                      {activeSlide.title}
                    </p>
                    <p className="text-[10px] text-slate-300 line-clamp-1 opacity-90">
                      Click to expand high-resolution photo
                    </p>
                  </div>
                </div>

                {/* Slide Thumbnail Strip Navigation */}
                <div className="p-3 bg-slate-900/90 border-t border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {heroSlides.map((slide, sIdx) => {
                      const isCurrent = currentSlideIndex === sIdx;
                      return (
                        <button
                          key={slide.id || sIdx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(sIdx)}
                          className={`relative w-12 h-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                            isCurrent 
                              ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30' 
                              : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                          title={slide.title}
                        >
                          <img 
                            src={slide.imageUrl} 
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setCurrentSlideIndex(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
                      aria-label="Previous Hero Slide"
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentSlideIndex(prev => (prev + 1) % heroSlides.length)}
                      aria-label="Next Hero Slide"
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ==================== PHOTO LIGHTBOX MODAL ==================== */}
      {lightboxImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{activeSlide.badge}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lightbox Main Image */}
            <div className="p-2 bg-black flex items-center justify-center max-h-[75vh]">
              <img 
                src={lightboxImageUrl} 
                alt="Davetech High-Definition Preview" 
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Lightbox Caption */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
              <h4 className="text-sm font-bold text-white">{activeSlide.title}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl mx-auto">{activeSlide.subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. PLATFORM VALUE TICKER ==================== */}
      <section className="bg-slate-50 border-b border-slate-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs text-slate-700 font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Multi-Tenant High Isolation Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
            <span>M-Pesa STK & Instant Mobile Money Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 shrink-0" />
            <span>14+ Fully Modular Industry Solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Real-time Cloud & Offline POS Resilient</span>
          </div>
        </div>
      </section>

      {/* ==================== 3.5 CHOOSE YOUR ERP SOLUTION ==================== */}
      <section id="choose-solution" className="bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CHOOSE YOUR ERP SOLUTION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Tailored Multi-Tenant Cloud ERP For Every Industry
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Each solution includes a custom public portal, isolated database partition, double-entry financial compliance, and localized M-Pesa billing.
            </p>
          </div>

          {/* The 6 Core Industry Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Education */}
            <div className="group bg-slate-900/90 border border-slate-800 hover:border-blue-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase tracking-wider">
                    Education Suite
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    Education & Higher Learning
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Universities, TVET Colleges, Polytechnics & K-12 Academies
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Online Admissions & Student Self-Service Portal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Automated M-Pesa Fee Billing & Reconciliation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>KNEC / CBC Grading & Official Transcripts</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTenant('apex-institute')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Public Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>ERP Login</span>
                </button>
              </div>
            </div>

            {/* 2. Healthcare */}
            <div className="group bg-slate-900/90 border border-slate-800 hover:border-teal-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-inner">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase tracking-wider">
                    Healthcare Suite
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                    Healthcare & Medical
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Level 4/5 Hospitals, Specialist Clinics & Diagnostic Centers
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>24/7 Outpatient Triage & Doctor Consultation Desk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Pharmacy Dispensing POS & Real-Time Drug Stock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Laboratory Orders, Digital Radiology & Inpatient EMR</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTenant('st-jude-hospital')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Public Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>ERP Login</span>
                </button>
              </div>
            </div>

            {/* 3. Wholesale */}
            <div className="group bg-slate-900/90 border border-slate-800 hover:border-sky-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-inner">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 uppercase tracking-wider">
                    Wholesale B2B
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                    Wholesale & Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Master FMCG Merchants, Grain Traders & Bulk Distributors
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Tiered Pallet & Carton Volume Discount Pricing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>30-Day Customer Trade Credit Limits & Statements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Warehouse Dispatch & Logistics Fleet Tracking</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTenant('dreamline-shop')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Public Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>ERP Login</span>
                </button>
              </div>
            </div>

            {/* 4. Retail / POS */}
            <div className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
                    Retail & POS
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Retail & Modern POS
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supermarkets, Boutiques, Bookshops & Retail Chains
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>High-Speed Barcode Checkout & Split M-Pesa Payments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Reorder Alerts, Multi-Store Inventory & Expiries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Customer Loyalty Points, Discounts & Cashier Shifts</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTenant('dreamline-shop')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Public Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ERP Login</span>
                </button>
              </div>
            </div>

            {/* 5. SACCO / Chama */}
            <div className="group bg-slate-900/90 border border-slate-800 hover:border-amber-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                    <Coins className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
                    SACCO / Microfinance
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    SACCO & Chama Microfinance
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Credit Unions, Investment Chamas & Community Funds
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Member Share Capital & Monthly Savings Ledgers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Loan Multiplier Scoring, Guarantors & Repayments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>1-Click Annual Dividend Computations & Audits</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTenant('blessed-sacco')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Public Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ERP Login</span>
                </button>
              </div>
            </div>

            {/* 6. Church */}
            <div className="group bg-slate-900/90 border border-slate-800 hover:border-purple-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider">
                    Church & Faith
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    Church & Faith Ministries
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cathedrals, Parishes, Fellowships & Faith NGOs
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Member & Family Registers, Cell Groups & Pledges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Transparent Tithe, Offering & Building Fund Ledgers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Service Timetables, Pastoral Care & Prayer Requests</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTenant('grace-cathedral')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Public Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>ERP Login</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================== 4. COMPLETE MODULE SHOWCASE & ADVERTISING ENGINE ==================== */}
      <section id="modules-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span>MODULAR ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Advertise, Deploy & Scale 14+ Specialized ERP Modules
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Activate only the modules your organization requires today, and unlock additional industry suites as your operations expand.
          </p>
        </div>

        {/* Category Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'ALL', label: `All Modules (${DAVETECH_MODULES_DETAILS.length})` },
              { id: 'INDUSTRY', label: 'Industry Specific (8)' },
              { id: 'ENTERPRISE', label: 'Core Enterprise (6)' },
              { id: 'FINANCE_POS', label: 'Finance & POS' },
              { id: 'INSTITUTION', label: 'Institutions & Faith' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search module or feature..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map(mod => {
            const IconComp = ICON_MAP[mod.iconName] || Briefcase;
            return (
              <div 
                key={mod.id}
                className="group relative bg-white hover:bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/10 shadow-xs"
              >
                {/* Top Card Info */}
                <div className="space-y-4">
                  
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: mod.color }}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                      {mod.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">
                      {mod.tagline}
                    </p>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mod.shortDescription}
                  </p>

                  {/* Key Feature Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Core Capabilities</div>
                    <div className="space-y-1.5">
                      {mod.keyFeatures.slice(0, 3).map((feat, fi) => (
                        <div key={fi} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            <strong className="text-slate-900">{feat.title.split('&')[0]}:</strong> {feat.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {mod.metrics.map((m, mi) => (
                      <div key={mi} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                        <div className="text-xs font-black text-slate-900">{m.value}</div>
                        <div className="text-[9px] text-slate-500 font-medium truncate">{m.label}</div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Actions */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedModule(mod)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Full Details</span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleOpenDemoForModule(mod)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Request Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* ==================== 5. INDUSTRY SOLUTIONS PACKAGES ==================== */}
      <section id="industries-section" className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <span>TAILORED INDUSTRY SUITES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Pre-Configured Bundles for Your Specific Vertical
            </h2>
            <p className="text-sm text-slate-600">
              Davetech ERP comes with ready-to-run business workflows tailored to your sector's regulatory standards and operational realities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAVETECH_INDUSTRIES.map(ind => (
              <div 
                key={ind.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all flex flex-col justify-between shadow-xs"
              >
                {/* Image Banner */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={ind.image} 
                    alt={ind.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow">
                      {ind.tagline}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">{ind.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{ind.description}</p>
                    
                    {/* Included Modules Badges */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Pre-Packaged Modules:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ind.modules.map(modId => {
                          const mInfo = DAVETECH_MODULES_DETAILS.find(m => m.id === modId);
                          return (
                            <span 
                              key={modId}
                              className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700"
                            >
                              {mInfo?.name.split('/')[0] || modId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setDemoForm(prev => ({
                          ...prev,
                          industry: ind.name,
                          interestedModules: ind.modules
                        }));
                        setIsDemoModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
                    >
                      Request {ind.name} Solution
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==================== 6. ARCHITECTURE & SECURITY HIGHLIGHTS ==================== */}
      <section id="architecture-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <span>ENTERPRISE BACKBONE</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {platformSettings?.publicWebsite?.aboutHeadline || 'Engineered for Bank-Grade Isolation, Compliance & Zero Downtime'}
            </h2>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              {platformSettings?.publicWebsite?.aboutDescription || 'Every organization on Davetech ERP operates inside a dedicated cryptographic partition. No cross-tenant data leakage, full audit trail immutability, and native mobile payment gateways.'}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Strict Multi-Tenant Database Isolation</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Automated tenant header validation at the routing proxy ensures complete organizational data quarantine.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <Smartphone className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Native M-Pesa STK Push & Multi-Tender Gateways</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Collect school fees, tithes, POS sales, and SACCO loan repayments directly into your paybill/till with automated reconciliation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <Globe className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Private White-Label Portals for Every Tenant</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Every tenant creates and manages their own public website, student portal, and custom logo styling inside the platform.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Architecture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">davetech-erp-core.sys</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE • ALL CLUSTERS ONLINE
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-blue-400 font-bold mb-1">▶ Isolated Tenant Data Engine</div>
                <div className="text-slate-400 text-[11px] font-sans">Strict organizational boundaries ensuring complete privacy for education, SACCOs, retail, and corporate data.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">▶ Double-Entry Ledger & Statutory Engine</div>
                <div className="text-slate-400 text-[11px] font-sans">Automated PAYE, NSSF, SHIF, Housing Levy, and real-time Balance Sheets with zero rounding error.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1">▶ Offline POS Cache & Thermal Printer Driver</div>
                <div className="text-slate-400 text-[11px] font-sans">Seamless local sales caching during internet drops; automated background sync upon reconnection.</div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Schedule Technical Architecture Walkthrough
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== 7. TRANSPARENT PRICING PLANS ==================== */}
      <section id="pricing-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 bg-slate-50">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span>TRANSPARENT SUBSCRIPTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Predictable Pricing for Growing Enterprises
          </h2>
          <p className="text-sm text-slate-600">
            No hidden costs. Scale your module capacity as your student body, member count, or store transactions grow.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-300 rounded-2xl gap-2 mt-4 shadow-xs">
            <button
              onClick={() => setIsAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isAnnualBilling ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnualBilling ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-extrabold uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan: any) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-2xl p-8 flex flex-col justify-between border transition-all ${
                plan.isPopular 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' 
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow">
                  MOST POPULAR
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                </div>

                <div className="pt-2">
                  <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {isAnnualBilling ? plan.priceAnnual : plan.priceMonthly}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {isAnnualBilling ? 'per year (billed annually)' : 'per month'}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Highlights:</div>
                  {plan.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100">
                <button
                  onClick={() => handleOpenDemoForPlan(plan.name)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    plan.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Select {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ==================== 8. CALL TO ACTION BANNER ==================== */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 border-t border-blue-500 py-16 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {platformSettings?.publicWebsite?.ctaHeadline || 'Ready to Modernize Your Operations with Davetech ERP?'}
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            {platformSettings?.publicWebsite?.ctaDescription || 'Join leading educational institutions, SACCOs, retail chains, and enterprise corporations across East Africa and beyond.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl cursor-pointer"
            >
              {platformSettings?.publicWebsite?.primaryCtaText || 'Book a 1-on-1 Demonstration'}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl cursor-pointer border border-blue-400/30"
            >
              {platformSettings?.publicWebsite?.secondaryCtaText || 'Sign In to Your Workspace'}
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 9. ENTERPRISE FOOTER & CONTACT ==================== */}
      <footer id="contact-section" className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200">
            
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {platformSettings?.logoUrl ? (
                  <img 
                    src={platformSettings.logoUrl} 
                    alt={platformSettings.platformName || 'Davetech ERP'} 
                    className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200 shadow-xs" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
                    {(platformSettings?.platformName || 'D')[0]}
                  </div>
                )}
                <span className="text-base font-black text-slate-900 tracking-tight">
                  {platformSettings?.platformName || 'Davetech ERP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Next-generation multi-tenant cloud enterprise resource planning ecosystem for education, financial cooperatives, retail, hospitality, and corporate operations.
              </p>
            </div>

            {/* Column 2: Key Modules */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Featured Suites</div>
              <div><a href="#modules-section" className="hover:text-blue-600 transition-colors">Education & TVET ERP</a></div>
              <div><a href="#modules-section" className="hover:text-blue-600 transition-colors">SACCO & Chama ERP</a></div>
              <div><a href="#modules-section" className="hover:text-blue-600 transition-colors">Church & Ministry Suite</a></div>
              <div><a href="#modules-section" className="hover:text-blue-600 transition-colors">Point of Sale & Retail Chains</a></div>
              <div><a href="#modules-section" className="hover:text-blue-600 transition-colors">Core Financial Accounting</a></div>
            </div>

            {/* Column 3: Solutions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Industry Solutions</div>
              <div><a href="#industries-section" className="hover:text-blue-600 transition-colors">Universities & Colleges</a></div>
              <div><a href="#industries-section" className="hover:text-blue-600 transition-colors">Cooperative SACCOs</a></div>
              <div><a href="#industries-section" className="hover:text-blue-600 transition-colors">Supermarkets & Retailers</a></div>
              <div><a href="#industries-section" className="hover:text-blue-600 transition-colors">Bars, Restaurants & Hotels</a></div>
              <div><a href="#industries-section" className="hover:text-blue-600 transition-colors">Hospitals & Clinics</a></div>
            </div>

            {/* Column 4: Contact & Access */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Direct Contact & Support</div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{platformSettings?.publicWebsite?.salesEmail || platformSettings?.supportEmail || 'sales@davetech.co.ke'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{platformSettings?.publicWebsite?.contactPhone || platformSettings?.supportPhone || '+254 700 000 000'}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                {platformSettings?.publicWebsite?.officeAddress || 'Nairobi, Kenya'}
              </div>
              <div className="pt-2">
                <button
                  onClick={onNavigateToLogin}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Super Admin & Tenant Login
                </button>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              {platformSettings?.copyrightText || `© ${new Date().getFullYear()} Davetech Solutions. All rights reserved.`}
            </div>
            <div className="flex items-center gap-4">
              <a href="#modules-section" className="hover:text-blue-600">Modules</a>
              <a href="#pricing-section" className="hover:text-blue-600">Pricing</a>
              <a href="#architecture-section" className="hover:text-blue-600">Architecture</a>
            </div>
          </div>

        </div>
      </footer>

      {/* ==================== 11. INTERACTIVE MODULE DEEP-DIVE MODAL ==================== */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                style={{ backgroundColor: selectedModule.color }}
              >
                {React.createElement(ICON_MAP[selectedModule.iconName] || Briefcase, { className: 'w-7 h-7' })}
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {selectedModule.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedModule.name}
                </h3>
                <p className="text-xs text-blue-600 font-semibold">{selectedModule.tagline}</p>
              </div>
            </div>

            {/* Long Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedModule.longDescription}
            </p>

            {/* Key Features Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Functional Modules & Workflows</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {selectedModule.keyFeatures.map((kf, ki) => (
                  <div key={ki} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{kf.title}</span>
                      {kf.highlight && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {kf.highlight}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{kf.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Users & Sectors</h4>
              <div className="flex flex-wrap gap-2">
                {selectedModule.targetAudience.map((ta, ti) => (
                  <span key={ti} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                    {ta}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenDemoForModule(selectedModule)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Request {selectedModule.name.split('/')[0]} Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== 12. DEMO REQUEST & TRIAL MODAL ==================== */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setIsDemoModalOpen(false);
                setDemoSuccessMsg(null);
                setDemoErrorMsg(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                SCHEDULE DEMO / 14-DAY TRIAL
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Experience Davetech ERP in Action
              </h3>
              <p className="text-xs text-slate-500">
                Selected Plan: <strong className="text-blue-600">{selectedPlanForDemo}</strong>
              </p>
            </div>

            {demoSuccessMsg ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Demonstration Confirmed!</h4>
                <p className="text-xs text-emerald-700">{demoSuccessMsg}</p>
                <button
                  onClick={() => setIsDemoModalOpen(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitDemoRequest} className="space-y-4">
                
                {demoErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {demoErrorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Kamau"
                      value={demoForm.name}
                      onChange={e => setDemoForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@institution.ac.ke"
                      value={demoForm.email}
                      onChange={e => setDemoForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+254 712 345 678"
                      value={demoForm.phone}
                      onChange={e => setDemoForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Organization / School Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi Apex College"
                      value={demoForm.organization}
                      onChange={e => setDemoForm(p => ({ ...p, organization: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Industry Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Primary Industry</label>
                  <select
                    value={demoForm.industry}
                    onChange={e => setDemoForm(p => ({ ...p, industry: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Education & Higher Learning">Education (Universities, TVETs & Schools)</option>
                    <option value="Financial Cooperatives & Micro-Credit">Financial Cooperatives & SACCOs / Chamas</option>
                    <option value="Faith-Based & Community Organizations">Churches & Ministries</option>
                    <option value="Retail & Commerce">Retail, Supermarkets & Hardware</option>
                    <option value="Food & Beverage Hospitality">Bars, Restaurants & Hospitality</option>
                    <option value="Supply Chain & Bulk Trade">Wholesale & FMCG Distribution</option>
                    <option value="Healthcare & Medical Services">Hospitals, Clinics & Labs</option>
                    <option value="General Enterprise">General Corporate Enterprise</option>
                  </select>
                </div>

                {/* Interested Modules Checkbox Grid */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Select Modules of Interest</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {DAVETECH_MODULES_DETAILS.map(m => {
                      const checked = demoForm.interestedModules.includes(m.id);
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => toggleInterestedModule(m.id)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] text-left font-medium border transition-all cursor-pointer truncate ${
                            checked 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {checked ? '✓ ' : ''}{m.name.split('/')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Additional Requirements / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Describe your current student/member count, current systems, or migration questions..."
                    value={demoForm.message}
                    onChange={e => setDemoForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={demoSubmitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {demoSubmitting ? 'Submitting...' : 'Confirm Demo Booking'}
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
