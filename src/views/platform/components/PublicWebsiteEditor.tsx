import React, { useState, useEffect } from 'react';
import { 
  PlatformSettings, 
  PlatformPublicWebsiteConfig, 
  PlatformHeroSlide, 
  PlatformPricingPlanConfig,
  PublicWebsiteTypographyConfig
} from '../../../types';
import { 
  Globe, Sparkles, Plus, Trash2, Edit2, Save, 
  RefreshCw, CheckCircle2, AlertCircle, Eye, 
  ExternalLink, Layers, ArrowUp, ArrowDown, 
  Upload, Image as ImageIcon, Check, Sliders,
  MessageSquare, ShieldCheck, CreditCard, Phone, Mail, MapPin, Megaphone,
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Heading1, Palette
} from 'lucide-react';
import { compressImageFile } from '../../../lib/imageUtils';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  getFontFamilyClass,
  getHeadingSizeClass,
  getSubtitleSizeClass,
  getFontWeightClass,
  getTextAlignClass
} from '../../../lib/typography';

interface PublicWebsiteEditorProps {
  settings: PlatformSettings;
  onSave: (updated: PlatformSettings) => Promise<void>;
  saving: boolean;
}

const STOCK_HERO_PRESETS = [
  { name: 'Enterprise Cloud', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Modern University Campus', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80' },
  { name: 'SACCO & Financial Tech', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Retail Store & POS Counter', url: 'https://images.unsplash.com/photo-1556742049-0a67e557b445?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Logistics & Warehouse Hub', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Modern Hospital & Healthcare', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Business Boardroom', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80' }
];

export const PublicWebsiteEditor: React.FC<PublicWebsiteEditorProps> = ({
  settings,
  onSave,
  saving
}) => {
  const [activeSection, setActiveSection] = useState<'logo' | 'media' | 'hero' | 'typography' | 'announcement' | 'architecture' | 'pricing' | 'contact' | 'cta'>('logo');
  
  // Public website logo state
  const [publicLogoUrl, setPublicLogoUrl] = useState<string>(settings.publicWebsiteLogoUrl || settings.publicWebsite?.publicLogoUrl || '');

  // Media carousel slides state
  const [mediaSlides, setMediaSlides] = useState<any[]>(() => {
    return settings.publicWebsiteMedia || settings.publicWebsite?.mediaSlides || [
      {
        id: 'media_1',
        title: 'Davetech ERP Dashboard',
        description: 'Your organization at a glance — unified KPIs, real-time activity feeds, cash balances, and operational alerts across all departments.',
        badge: 'EXECUTIVE OVERVIEW',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore Dashboard',
        buttonLink: '#overview',
        order: 1
      },
      {
        id: 'media_2',
        title: 'Education Management',
        description: 'Manage students, staff, courses, departments, classes and fees — automated fee reconciliation, transcripts, timetables, and admissions.',
        badge: 'HIGHER ED & SCHOOLS',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore School ERP',
        buttonLink: '#education-showcase',
        order: 2
      },
      {
        id: 'media_3',
        title: 'Retail & POS',
        description: 'Connect sales, inventory and customers — high-speed touch counter checkouts, thermal receipt printing, barcode scanning, and multi-store transfers.',
        badge: 'POINT OF SALE',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b445?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore POS System',
        buttonLink: '#retail-showcase',
        order: 3
      },
      {
        id: 'media_4',
        title: 'Accounting & Finance',
        description: 'Track financial activity and business performance — multi-currency double-entry general ledger, automated P&L, balance sheets, and tax compliance.',
        badge: 'FINANCIAL CONTROL',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore Accounting',
        buttonLink: '#finance-showcase',
        order: 4
      },
      {
        id: 'media_5',
        title: 'Inventory Management',
        description: 'Manage stock, purchasing and suppliers — batch tracking, automated reorder triggers, purchase requisitions, and multi-warehouse valuation.',
        badge: 'SUPPLY CHAIN',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore Inventory',
        buttonLink: '#modules',
        order: 5
      },
      {
        id: 'media_6',
        title: 'Reports & Analytics',
        description: 'Turn operational data into useful insights — automated financial statements, sales trend analysis, student demographics, and audit logs.',
        badge: 'BUSINESS INTELLIGENCE',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore Analytics',
        buttonLink: '#reports-analytics',
        order: 6
      }
    ];
  });

  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);

  // Local Config copy
  const [websiteConfig, setWebsiteConfig] = useState<PlatformPublicWebsiteConfig>(() => {
    return settings.publicWebsite || {
      enabled: true,
      announcementBarEnabled: true,
      announcementBarText: '🚀 Davetech Cloud ERP v4.0 is Live — Enterprise Suite for Higher Ed, SACCOs, Retail POS & Corporate Supply Chains!',
      announcementBarLink: '#modules-section',
      heroSlides: [],
      autoSlideInterval: 6,
      typography: {
        fontFamily: 'sans',
        headingSize: 'lg',
        headingWeight: 'black',
        headingAlign: 'left',
        headingItalic: false,
        bodySize: 'base',
        bodyWeight: 'normal',
        bodyItalic: false
      },
      aboutHeadline: 'Engineered for Bank-Grade Isolation, Compliance & Zero Downtime',
      aboutDescription: 'Every organization on Davetech ERP operates inside a dedicated cryptographic partition with statutory double-entry compliance and native M-Pesa integration.',
      ctaHeadline: 'Ready to Modernize Your Operations with Davetech ERP?',
      ctaDescription: 'Join leading educational institutions, SACCOs, retail chains, and enterprise corporations across East Africa and beyond.',
      primaryCtaText: 'Book a 1-on-1 Demonstration',
      secondaryCtaText: 'Sign In to Your Workspace',
      contactEmail: 'admin@davetech.co.ke',
      salesEmail: 'sales@davetech.co.ke',
      contactPhone: '+254 700 000 000',
      officeAddress: 'Davetech Innovation Tower, Upper Hill, Nairobi, Kenya',
      pricingPlans: []
    };
  });

  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (settings.publicWebsite) {
      setWebsiteConfig(settings.publicWebsite);
    }
    if (settings.publicWebsiteLogoUrl) {
      setPublicLogoUrl(settings.publicWebsiteLogoUrl);
    }
    if (settings.publicWebsiteMedia) {
      setMediaSlides(settings.publicWebsiteMedia);
    }
  }, [settings]);

  const handleSaveConfig = async () => {
    const updatedSettings: PlatformSettings = {
      ...settings,
      publicWebsiteLogoUrl: publicLogoUrl,
      publicWebsiteMedia: mediaSlides,
      publicWebsite: {
        ...websiteConfig,
        publicLogoUrl: publicLogoUrl,
        mediaSlides: mediaSlides
      }
    };
    await onSave(updatedSettings);
    setNotification('Davetech Public Website configuration saved and published live!');
    setTimeout(() => setNotification(null), 4000);
  };

  // Media Slide Handlers
  const handleAddMediaSlide = () => {
    const newMedia = {
      id: `media_${Date.now()}`,
      title: 'New Feature Showcase',
      description: 'Highlight a core module or capability of Davetech ERP for prospective organizations.',
      badge: 'FEATURE HIGHLIGHT',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'Explore Capability',
      buttonLink: '#overview',
      order: mediaSlides.length + 1
    };
    setMediaSlides(prev => [...prev, newMedia]);
    setEditingMediaId(newMedia.id);
  };

  const handleUpdateMediaSlide = (id: string, updates: any) => {
    setMediaSlides(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteMediaSlide = (id: string) => {
    if (confirm('Delete this showcase slide from the public website?')) {
      setMediaSlides(prev => prev.filter(m => m.id !== id));
      if (editingMediaId === id) setEditingMediaId(null);
    }
  };

  const handleMoveMediaSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...mediaSlides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    // re-assign order numbers
    const reordered = slides.map((s, idx) => ({ ...s, order: idx + 1 }));
    setMediaSlides(reordered);
  };

  const handleMediaImageUpload = async (mediaId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1600, 900, 0.88);
        handleUpdateMediaSlide(mediaId, { imageUrl: compressed });
      } catch (err) {
        console.error('Image upload compression failed:', err);
      }
    }
  };

  // Slide CRUD Operations
  const handleAddSlide = () => {
    const newSlide: PlatformHeroSlide = {
      id: `slide_${Date.now()}`,
      badge: 'NEW FEATURE HIGHLIGHT',
      title: 'Accelerate Enterprise Workflows with Davetech Cloud',
      subtitle: 'Transform your administrative efficiency with centralized real-time reporting, automated billing, and statutory compliance.',
      imageUrl: STOCK_HERO_PRESETS[0].url,
      primaryAction: 'explore_modules',
      primaryText: 'Explore Modules',
      secondaryAction: 'book_demo',
      secondaryText: 'Request Live Demo',
      stats: [
        { label: 'Deployment Time', val: '< 24 Hours' },
        { label: 'System Uptime', val: '99.9%' },
        { label: 'Data Encryption', val: '256-Bit' }
      ]
    };

    setWebsiteConfig(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
    setEditingSlideId(newSlide.id);
  };

  const handleUpdateSlide = (id: string, updates: Partial<PlatformHeroSlide>) => {
    setWebsiteConfig(prev => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm('Delete this hero slide?')) {
      setWebsiteConfig(prev => ({
        ...prev,
        heroSlides: (prev.heroSlides || []).filter(s => s.id !== id)
      }));
      if (editingSlideId === id) setEditingSlideId(null);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...(websiteConfig.heroSlides || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    setWebsiteConfig(prev => ({ ...prev, heroSlides: slides }));
  };

  const handleSlideImageUpload = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1920, 1080, 0.85);
        handleUpdateSlide(slideId, { imageUrl: compressed });
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }
  };

  // Pricing Plan CRUD
  const handleUpdatePlan = (id: string, updates: Partial<PlatformPricingPlanConfig>) => {
    setWebsiteConfig(prev => ({
      ...prev,
      pricingPlans: (prev.pricingPlans || []).map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const handleAddFeatureToPlan = (planId: string, featureText: string) => {
    if (!featureText.trim()) return;
    setWebsiteConfig(prev => ({
      ...prev,
      pricingPlans: (prev.pricingPlans || []).map(p => {
        if (p.id === planId) {
          return { ...p, features: [...p.features, featureText.trim()] };
        }
        return p;
      })
    }));
  };

  const handleRemoveFeatureFromPlan = (planId: string, featureIdx: number) => {
    setWebsiteConfig(prev => ({
      ...prev,
      pricingPlans: (prev.pricingPlans || []).map(p => {
        if (p.id === planId) {
          const updated = [...p.features];
          updated.splice(featureIdx, 1);
          return { ...p, features: updated };
        }
        return p;
      })
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold uppercase">
              Davetech Public Website CMS
            </span>
            <span className="text-xs text-slate-500 font-medium">• Live Content Management</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-2 flex items-center space-x-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span>Customize Davetech ERP Public Website</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
            Edit and customize every section of the public-facing Davetech ERP website — hero carousel banners, top announcement banner, value propositions, pricing tiers, and contact channels.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/#/public"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>View Live Website</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Website'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'logo', label: 'Public Website Logo', icon: ImageIcon },
          { id: 'media', label: 'Public Website Media & Carousel', icon: Sliders, count: mediaSlides.length },
          { id: 'hero', label: 'Hero Banners & Slides', icon: Sparkles, count: websiteConfig.heroSlides?.length || 0 },
          { id: 'typography', label: 'Typography & Fonts', icon: Type },
          { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
          { id: 'architecture', label: 'Architecture & Highlights', icon: ShieldCheck },
          { id: 'pricing', label: 'Pricing Plans & Features', icon: CreditCard, count: websiteConfig.pricingPlans?.length || 0 },
          { id: 'cta', label: 'Call to Action Banner', icon: MessageSquare },
          { id: 'contact', label: 'Contact & Office Info', icon: Phone },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== 0A. PUBLIC WEBSITE LOGO SETTING ==================== */}
      {activeSection === 'logo' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Public Website Logo Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the primary brand logo displayed exclusively on the public-facing Davetech ERP marketing website header and footer.
                </p>
              </div>
              {publicLogoUrl && (
                <button
                  type="button"
                  onClick={() => setPublicLogoUrl('')}
                  className="text-xs text-red-500 hover:text-red-600 font-bold cursor-pointer"
                >
                  Remove Custom Logo (Use Default)
                </button>
              )}
            </div>

            {/* Logo Preview & Upload Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
              
              {/* Preview Cards: Light and Dark Header Preview */}
              <div className="md:col-span-5 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Logo Header Preview
                </div>
                
                {/* Light Mode Preview */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                  <div className="h-10 w-32 flex items-center justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <img 
                      src={publicLogoUrl || settings.logoUrl || '/davetech-logo.svg'} 
                      alt="Public Website Logo"
                      className="h-8 max-w-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/davetech-logo.svg';
                      }}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-900">Davetech ERP</span>
                </div>

                {/* Dark Mode Footer Preview */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-2xs flex items-center space-x-3 text-white">
                  <div className="h-10 w-32 flex items-center justify-center bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <img 
                      src={publicLogoUrl || settings.logoUrl || '/davetech-logo.svg'} 
                      alt="Public Website Logo"
                      className="h-8 max-w-full object-contain brightness-0 invert"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/davetech-logo.svg';
                      }}
                    />
                  </div>
                  <span className="text-sm font-black text-white">Davetech ERP</span>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Upload Logo File (PNG, JPG, SVG, WebP)
                  </label>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center space-x-2 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Choose Logo File</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file, 600, 200, 0.9);
                              setPublicLogoUrl(compressed);
                              setNotification('Public logo updated! Click "Save & Publish Website" to apply.');
                              setTimeout(() => setNotification(null), 3500);
                            } catch (err) {
                              console.error('Failed to compress logo file:', err);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <span className="text-xs text-slate-500 font-medium">
                      Recommended size: 240 × 60px (Transparent PNG or SVG)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block">
                    Or specify Direct Public Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={publicLogoUrl}
                    onChange={(e) => setPublicLogoUrl(e.target.value)}
                    placeholder="https://yourdomain.com/public-logo.png"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== 0B. PUBLIC WEBSITE MEDIA & CAROUSEL SLIDES ==================== */}
      {activeSection === 'media' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Public Website Product Showcase Media</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage high-resolution screenshots and product slides displayed in the "SEE DAVETECH ERP IN ACTION" interactive slider on the public website.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMediaSlide}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Media Slide</span>
            </button>
          </div>

          {/* Media Slides Grid */}
          <div className="space-y-4">
            {mediaSlides.map((slide, index) => {
              const isEditing = editingMediaId === slide.id;
              return (
                <div 
                  key={slide.id || index}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isEditing ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Row Summary Bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                      {/* Drag / Order controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveMediaSlide(index, 'up')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Slide Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-slate-500 font-mono w-5 text-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === mediaSlides.length - 1}
                          onClick={() => handleMoveMediaSlide(index, 'down')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Slide Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-200 shrink-0">
                        <img 
                          src={slide.imageUrl} 
                          alt={slide.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Slide Information */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            {slide.badge || 'SLIDE'}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {slide.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                          {slide.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setEditingMediaId(isEditing ? null : slide.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors ${
                          isEditing 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{isEditing ? 'Done Editing' : 'Edit Slide'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMediaSlide(slide.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  {isEditing && (
                    <div className="p-6 border-t border-slate-200 bg-white space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Slide Badge Label</label>
                          <input
                            type="text"
                            value={slide.badge || ''}
                            onChange={e => handleUpdateMediaSlide(slide.id, { badge: e.target.value })}
                            placeholder="e.g. EXECUTIVE OVERVIEW"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Slide Title</label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={e => handleUpdateMediaSlide(slide.id, { title: e.target.value })}
                            placeholder="e.g. Davetech ERP Dashboard"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Slide Description / Caption</label>
                          <textarea
                            rows={2}
                            value={slide.description || ''}
                            onChange={e => handleUpdateMediaSlide(slide.id, { description: e.target.value })}
                            placeholder="Describe what this interface screenshot demonstrates..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Button Text</label>
                          <input
                            type="text"
                            value={slide.buttonText || ''}
                            onChange={e => handleUpdateMediaSlide(slide.id, { buttonText: e.target.value })}
                            placeholder="e.g. Explore Dashboard"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Button Target / Anchor</label>
                          <input
                            type="text"
                            value={slide.buttonLink || ''}
                            onChange={e => handleUpdateMediaSlide(slide.id, { buttonLink: e.target.value })}
                            placeholder="e.g. #overview or #education-showcase"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                          <label className="text-xs font-bold text-slate-700 block">Slide Image Asset</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border border-slate-200 flex items-center space-x-1.5 transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload New Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleMediaImageUpload(slide.id, e)}
                                className="hidden"
                              />
                            </label>

                            <input
                              type="url"
                              value={slide.imageUrl || ''}
                              onChange={e => handleUpdateMediaSlide(slide.id, { imageUrl: e.target.value })}
                              placeholder="Or enter direct image URL (https://...)"
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 1. HERO CAROUSEL SLIDES ==================== */}
      {activeSection === 'hero' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hero Carousel Manager</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure full-width rotating hero slides with custom headlines, background images, typography, and action buttons.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Rotation Interval:</span>
                <select
                  value={websiteConfig.autoSlideInterval || 6}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, autoSlideInterval: Number(e.target.value) }))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value={4}>4 Seconds</option>
                  <option value={6}>6 Seconds</option>
                  <option value={8}>8 Seconds</option>
                  <option value={10}>10 Seconds</option>
                </select>
              </div>

              <button
                onClick={handleAddSlide}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>
          </div>

          {/* Slides List */}
          <div className="space-y-4">
            {(websiteConfig.heroSlides || []).map((slide, index) => {
              const isEditing = editingSlideId === slide.id;
              return (
                <div 
                  key={slide.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isEditing ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Slide Top Bar */}
                  <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="relative w-14 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">
                          {slide.badge || 'Slide'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-md">
                          {slide.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(index, 'down')}
                        disabled={index === (websiteConfig.heroSlides?.length || 0) - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSlideId(isEditing ? null : slide.id)}
                        className={`p-1.5 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer ${
                          isEditing ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Collapse' : 'Edit Slide'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Slide Editor Form */}
                  {isEditing && (
                    <div className="p-6 space-y-5 bg-white animate-in fade-in duration-150">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Top Pill / Badge Text
                          </label>
                          <input
                            type="text"
                            value={slide.badge}
                            onChange={e => handleUpdateSlide(slide.id, { badge: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. UNIFIED CLOUD ERP PLATFORM"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Main Headline Title
                          </label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={e => handleUpdateSlide(slide.id, { title: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. The Modern Multi-Industry ERP Ecosystem"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Subtitle / Paragraph Description
                        </label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={e => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                          placeholder="Comprehensive descriptive copy..."
                        />
                      </div>

                      {/* Image selector & Upload */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Slide Background Image
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            value={slide.imageUrl}
                            onChange={e => handleUpdateSlide(slide.id, { imageUrl: e.target.value })}
                            className="flex-1 min-w-[240px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                          />

                          <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer flex items-center space-x-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleSlideImageUpload(slide.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Live Photo Preview Card */}
                        {slide.imageUrl && (
                          <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group">
                            <img 
                              src={slide.imageUrl} 
                              alt="Slide preview" 
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                                <span>High-Definition Photo Active</span>
                              </span>
                              <a 
                                href={slide.imageUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-blue-300 hover:text-blue-200 underline flex items-center gap-1"
                              >
                                <span>Open Full Photo</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Presets:</span>
                          {STOCK_HERO_PRESETS.map((preset, pi) => (
                            <button
                              key={pi}
                              type="button"
                              onClick={() => handleUpdateSlide(slide.id, { imageUrl: preset.url })}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-[11px] text-slate-700 font-medium border border-slate-200 transition-colors cursor-pointer"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slide Typography & Alignment Customization */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-blue-600" />
                            <span>Slide Typography & Alignment Controls</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Font size, style, align, bold & italic</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Font Family / Style */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Font Style / Family
                            </label>
                            <select
                              value={slide.fontFamily || websiteConfig.typography?.fontFamily || 'sans'}
                              onChange={e => handleUpdateSlide(slide.id, { fontFamily: e.target.value as any })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                            >
                              {FONT_FAMILY_OPTIONS.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Title Font Size */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Title Font Size
                            </label>
                            <select
                              value={slide.titleFontSize || websiteConfig.typography?.headingSize || 'lg'}
                              onChange={e => handleUpdateSlide(slide.id, { titleFontSize: e.target.value as any })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                            >
                              {FONT_SIZE_OPTIONS.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Bold Weight */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Title Bold Weight
                            </label>
                            <select
                              value={slide.titleFontWeight || websiteConfig.typography?.headingWeight || 'black'}
                              onChange={e => handleUpdateSlide(slide.id, { titleFontWeight: e.target.value as any })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                            >
                              {FONT_WEIGHT_OPTIONS.map(w => (
                                <option key={w.id} value={w.id}>{w.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Alignment & Italic Toggles */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Align & Italic Style
                            </label>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                              {/* Left Align */}
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { textAlign: 'left' })}
                                className={`flex-1 py-1 flex items-center justify-center rounded transition-colors cursor-pointer ${
                                  (slide.textAlign || 'left') === 'left' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Align Left"
                              >
                                <AlignLeft className="w-3.5 h-3.5" />
                              </button>

                              {/* Center Align */}
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { textAlign: 'center' })}
                                className={`flex-1 py-1 flex items-center justify-center rounded transition-colors cursor-pointer ${
                                  slide.textAlign === 'center' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Align Center"
                              >
                                <AlignCenter className="w-3.5 h-3.5" />
                              </button>

                              {/* Right Align */}
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { textAlign: 'right' })}
                                className={`flex-1 py-1 flex items-center justify-center rounded transition-colors cursor-pointer ${
                                  slide.textAlign === 'right' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Align Right"
                              >
                                <AlignRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Italic Toggle */}
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { titleItalic: !slide.titleItalic })}
                                className={`px-2 py-1 flex items-center justify-center rounded border-l border-slate-200 transition-colors cursor-pointer ${
                                  slide.titleItalic ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Toggle Title Italic"
                              >
                                <Italic className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtitle font controls */}
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-600">Subtitle Size:</span>
                            <select
                              value={slide.subtitleFontSize || 'base'}
                              onChange={e => handleUpdateSlide(slide.id, { subtitleFontSize: e.target.value as any })}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            >
                              <option value="sm">Small</option>
                              <option value="base">Standard / Regular</option>
                              <option value="lg">Large</option>
                              <option value="xl">Extra Large</option>
                            </select>
                          </div>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={slide.subtitleItalic || false}
                              onChange={e => handleUpdateSlide(slide.id, { subtitleItalic: e.target.checked })}
                              className="rounded text-blue-600"
                            />
                            <span>Italicize Subtitle Description</span>
                          </label>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase">
                            Primary CTA Button
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.primaryText}
                              onChange={e => handleUpdateSlide(slide.id, { primaryText: e.target.value })}
                              placeholder="Button Label"
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                            />
                            <select
                              value={slide.primaryAction}
                              onChange={e => handleUpdateSlide(slide.id, { primaryAction: e.target.value })}
                              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                            >
                              <option value="explore_modules">Scroll to Modules</option>
                              <option value="book_demo">Open Demo Form</option>
                              <option value="view_education">Education Suite</option>
                              <option value="view_sacco">SACCO Suite</option>
                              <option value="view_pos">POS Terminal Suite</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase">
                            Secondary Button
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.secondaryText}
                              onChange={e => handleUpdateSlide(slide.id, { secondaryText: e.target.value })}
                              placeholder="Button Label"
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                            />
                            <select
                              value={slide.secondaryAction}
                              onChange={e => handleUpdateSlide(slide.id, { secondaryAction: e.target.value })}
                              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                            >
                              <option value="book_demo">Open Demo Form</option>
                              <option value="explore_modules">Explore Modules</option>
                              <option value="view_education">Education Suite</option>
                              <option value="view_sacco">SACCO Suite</option>
                              <option value="view_pos">POS Terminal Suite</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 2. TYPOGRAPHY & FONTS CUSTOMIZATION ==================== */}
      {activeSection === 'typography' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Type className="w-4 h-4 text-blue-600" />
                  <span>Public Website Typography & Styling Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control the visual voice of your public landing page: font family, headline sizes, text alignments, bold weights, and italic accents.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Presets:</span>
                {[
                  { name: 'Modern Tech', font: 'sans', size: 'lg', weight: 'black', align: 'left', italic: false },
                  { name: 'Editorial Prestige', font: 'serif', size: 'xl', weight: 'bold', align: 'left', italic: true },
                  { name: 'Contemporary Clean', font: 'outfit', size: 'lg', weight: 'bold', align: 'center', italic: false },
                  { name: 'Luxury Display', font: 'display', size: 'xl', weight: 'black', align: 'center', italic: false }
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          fontFamily: preset.font as any,
                          headingSize: preset.size as any,
                          headingWeight: preset.weight as any,
                          headingAlign: preset.align as any,
                          headingItalic: preset.italic
                        }
                      }));
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Global Font Family / Style */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Primary Font Family / Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FONT_FAMILY_OPTIONS.map(fontOpt => {
                  const isSelected = (websiteConfig.typography?.fontFamily || 'sans') === fontOpt.id;
                  return (
                    <div
                      key={fontOpt.id}
                      onClick={() => {
                        setWebsiteConfig(prev => ({
                          ...prev,
                          typography: {
                            ...prev.typography,
                            fontFamily: fontOpt.id as any
                          }
                        }));
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{fontOpt.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className={`mt-2 text-base font-bold text-slate-800 ${fontOpt.class}`}>
                        Davetech Cloud ERP
                      </div>
                      <div className={`mt-0.5 text-xs text-slate-500 ${fontOpt.class}`}>
                        {fontOpt.preview}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Headline Typography Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Headline Formatting (Size, Align, Bold Weight & Italic)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Font Size */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Headline Font Size Scale
                  </label>
                  <select
                    value={websiteConfig.typography?.headingSize || 'lg'}
                    onChange={e => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          headingSize: e.target.value as any
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {FONT_SIZE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Bold Weight */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Font Weight / Boldness
                  </label>
                  <select
                    value={websiteConfig.typography?.headingWeight || 'black'}
                    onChange={e => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          headingWeight: e.target.value as any
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {FONT_WEIGHT_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Text Alignment */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Default Alignment
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                    {[
                      { id: 'left', icon: AlignLeft, label: 'Left' },
                      { id: 'center', icon: AlignCenter, label: 'Center' },
                      { id: 'right', icon: AlignRight, label: 'Right' }
                    ].map(al => {
                      const Icon = al.icon;
                      const isSelected = (websiteConfig.typography?.headingAlign || 'left') === al.id;
                      return (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => {
                            setWebsiteConfig(prev => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                headingAlign: al.id as any
                              }
                            }));
                          }}
                          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{al.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Italic Style Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Font Style (Italic)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          headingItalic: !prev.typography?.headingItalic
                        }
                      }));
                    }}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      websiteConfig.typography?.headingItalic
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                    <span>{websiteConfig.typography?.headingItalic ? 'Italic Enabled' : 'Normal Upright'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Subtitle & Body Paragraph Typography */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Subtitle & Body Paragraphs
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Body Size */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Subtitle Size
                  </label>
                  <select
                    value={websiteConfig.typography?.bodySize || 'base'}
                    onChange={e => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          bodySize: e.target.value as any
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="sm">Small (Compact Description)</option>
                    <option value="base">Standard (Default Balanced)</option>
                    <option value="lg">Large (Spacious & Prominent)</option>
                  </select>
                </div>

                {/* Body Weight */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Subtitle Font Weight
                  </label>
                  <select
                    value={websiteConfig.typography?.bodyWeight || 'normal'}
                    onChange={e => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          bodyWeight: e.target.value as any
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="normal">Normal (400)</option>
                    <option value="medium">Medium (500)</option>
                    <option value="semibold">Semi-Bold (600)</option>
                    <option value="bold">Bold (700)</option>
                  </select>
                </div>

                {/* Body Italic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Subtitle Style (Italic)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setWebsiteConfig(prev => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          bodyItalic: !prev.typography?.bodyItalic
                        }
                      }));
                    }}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      websiteConfig.typography?.bodyItalic
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                    <span>{websiteConfig.typography?.bodyItalic ? 'Italic Enabled' : 'Normal Upright'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Live Interactive Typography Preview Sandbox */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Real-Time Typography Preview</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Live rendering with active typography rules</span>
              </div>

              {/* Preview Container */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200">
                <div className={`max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 ${getFontFamilyClass(websiteConfig.typography?.fontFamily)} ${getTextAlignClass(websiteConfig.typography?.headingAlign).container}`}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>LIVE TYPOGRAPHY PREVIEW</span>
                  </div>

                  <h2 className={`${getHeadingSizeClass(websiteConfig.typography?.headingSize)} ${getFontWeightClass(websiteConfig.typography?.headingWeight, 'font-black')} ${websiteConfig.typography?.headingItalic ? 'italic' : 'not-italic'} ${getTextAlignClass(websiteConfig.typography?.headingAlign).text} text-slate-950 tracking-tight leading-tight`}>
                    Accelerate Enterprise Workflows with Davetech Cloud
                  </h2>

                  <p className={`${getSubtitleSizeClass(websiteConfig.typography?.bodySize)} ${getFontWeightClass(websiteConfig.typography?.bodyWeight, 'font-medium')} ${websiteConfig.typography?.bodyItalic ? 'italic' : 'not-italic'} ${getTextAlignClass(websiteConfig.typography?.headingAlign).text} text-slate-700 leading-relaxed`}>
                    Transform your administrative efficiency with centralized real-time reporting, automated billing, and statutory compliance across all operations.
                  </p>

                  <div className={`flex flex-wrap items-center gap-3 pt-2 ${getTextAlignClass(websiteConfig.typography?.headingAlign).stats}`}>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md cursor-default"
                    >
                      Sample Primary Action
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-xs cursor-default"
                    >
                      Sample Secondary Action
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== 2. ANNOUNCEMENT BAR ==================== */}
      {activeSection === 'announcement' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Header Announcement Bar</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Display high-visibility promotional updates, feature releases, or event alerts at the very top of the website.
              </p>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={websiteConfig.announcementBarEnabled ?? true}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, announcementBarEnabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">Enable Announcement Bar</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Notice Text
              </label>
              <input
                type="text"
                value={websiteConfig.announcementBarText || ''}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, announcementBarText: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 🚀 Davetech Cloud ERP v4.0 is Live with Full TVET CBC & SACCO Microfinance Integration!"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Action / Anchor Link
              </label>
              <input
                type="text"
                value={websiteConfig.announcementBarLink || ''}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, announcementBarLink: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                placeholder="#modules-section or #pricing-section"
              />
            </div>

            {/* Live Banner Preview */}
            <div className="p-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-black uppercase">LIVE PREVIEW</span>
                <span className="truncate">{websiteConfig.announcementBarText || 'No announcement message set.'}</span>
              </div>
              <span className="text-[11px] font-bold text-blue-300 underline shrink-0 ml-3">Learn More →</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. ARCHITECTURE & VALUE PROPOSITIONS ==================== */}
      {activeSection === 'architecture' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enterprise Architecture & Highlights Section</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize technical copy highlighting tenant isolation, security, offline caching, and M-Pesa automated reconciliation.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Section Headline
              </label>
              <input
                type="text"
                value={websiteConfig.aboutHeadline || ''}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, aboutHeadline: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                placeholder="Engineered for Bank-Grade Isolation, Compliance & Zero Downtime"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Section Narrative / Description
              </label>
              <textarea
                rows={3}
                value={websiteConfig.aboutDescription || ''}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, aboutDescription: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                placeholder="Every organization on Davetech ERP operates inside a dedicated cryptographic partition..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. PRICING PLANS ==================== */}
      {activeSection === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subscription Plans & Feature Checklists</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize tier names, monthly pricing, annual rates, and feature bullet points shown on the website pricing calculator.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(websiteConfig.pricingPlans || []).map((plan) => (
              <div 
                key={plan.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={plan.name}
                      onChange={e => handleUpdatePlan(plan.id, { name: e.target.value })}
                      className="text-base font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plan.isPopular || false}
                        onChange={e => handleUpdatePlan(plan.id, { isPopular: e.target.checked })}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-[10px] font-bold text-slate-600">Popular</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={plan.tagline}
                    onChange={e => handleUpdatePlan(plan.id, { tagline: e.target.value })}
                    placeholder="Plan Tagline"
                    className="w-full text-xs text-slate-500 bg-transparent border-b border-slate-200 focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Price</span>
                      <input
                        type="text"
                        value={plan.priceMonthly}
                        onChange={e => handleUpdatePlan(plan.id, { priceMonthly: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 mt-1"
                        placeholder="KSh 15,000"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Price</span>
                      <input
                        type="text"
                        value={plan.priceAnnual}
                        onChange={e => handleUpdatePlan(plan.id, { priceAnnual: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 mt-1"
                        placeholder="KSh 144,000"
                      />
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Features Included:</span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {plan.features.map((feat, fi) => (
                        <div key={fi} className="flex items-center justify-between gap-1 text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <span className="text-slate-700 truncate">{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromPlan(plan.id, fi)}
                            className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Feature input */}
                    <div className="flex gap-1 pt-1">
                      <input
                        type="text"
                        id={`new-feat-${plan.id}`}
                        placeholder="Add feature..."
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            handleAddFeatureToPlan(plan.id, val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`new-feat-${plan.id}`) as HTMLInputElement;
                          if (input) {
                            handleAddFeatureToPlan(plan.id, input.value);
                            input.value = '';
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 5. CALL TO ACTION BANNER ==================== */}
      {activeSection === 'cta' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bottom Call to Action Banner</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the closing conversion banner displayed across the bottom of the public website.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CTA Main Headline
              </label>
              <input
                type="text"
                value={websiteConfig.ctaHeadline || ''}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, ctaHeadline: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                placeholder="Ready to Modernize Your Operations with Davetech ERP?"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CTA Description
              </label>
              <textarea
                rows={2}
                value={websiteConfig.ctaDescription || ''}
                onChange={e => setWebsiteConfig(prev => ({ ...prev, ctaDescription: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                placeholder="Join leading educational institutions, SACCOs, retail chains, and enterprise corporations..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={websiteConfig.primaryCtaText || ''}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, primaryCtaText: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="Book a 1-on-1 Demonstration"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={websiteConfig.secondaryCtaText || ''}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, secondaryCtaText: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="Sign In to Your Workspace"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. CONTACT & OFFICE INFO ==================== */}
      {activeSection === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Contact, Sales & Headquarters Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are displayed in the website footer, contact section, and automated email footers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sales Inquiry Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={websiteConfig.salesEmail || ''}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, salesEmail: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  placeholder="sales@davetech.co.ke"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Support Desk Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={websiteConfig.contactEmail || ''}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  placeholder="support@davetech.co.ke"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Direct Phone / WhatsApp Hotline
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={websiteConfig.contactPhone || ''}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Headquarters Physical Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={websiteConfig.officeAddress || ''}
                  onChange={e => setWebsiteConfig(prev => ({ ...prev, officeAddress: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  placeholder="Davetech Innovation Tower, Nairobi, Kenya"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
