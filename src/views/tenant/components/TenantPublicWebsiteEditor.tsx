import React, { useState, useEffect } from 'react';
import {
  Tenant,
  TenantPublicWebsiteConfig,
  TenantHeroSlide,
  PublicWebsiteTypographyConfig
} from '../../../types';
import {
  Globe, Sparkles, Plus, Trash2, Edit2, Save,
  RefreshCw, CheckCircle2, AlertCircle, Eye,
  ExternalLink, Layers, ArrowUp, ArrowDown,
  Upload, Image as ImageIcon, Check, Sliders,
  MessageSquare, ShieldCheck, Phone, Mail, MapPin, Megaphone,
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Palette,
  Copy, ArrowRight, Play, Compass, ChevronLeft, ChevronRight
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

interface TenantPublicWebsiteEditorProps {
  tenant: Tenant;
  onSaved?: (updatedTenant: Tenant) => void;
}

const STOCK_PHOTO_PRESETS = [
  { category: 'Education & TVET', name: 'University Campus Library', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Education & TVET', name: 'Students Studying Together', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Education & TVET', name: 'Science & Computer Laboratory', url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Wholesale & B2B', name: 'Modern Warehouse Logistics', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Wholesale & B2B', name: 'Distribution Center & Pallets', url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Retail & POS', name: 'Retail Store & Checkout Counter', url: 'https://images.unsplash.com/photo-1556742049-0a67e557b445?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Retail & POS', name: 'Supermarket Aisles & Fresh Stock', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Healthcare & Hospital', name: 'Modern Medical Center & Clinic', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Healthcare & Hospital', name: 'Doctors Consultation & Care', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1920&q=80' },
  { category: 'SACCO & Financial Tech', name: 'Financial Planning & Growth', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Church & Ministry', name: 'Worship Service & Sanctuary', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Hospitality & Dining', name: 'Restaurant Dining & Lounge', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80' },
  { category: 'Corporate Enterprise', name: 'Executive Boardroom Meeting', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80' }
];

const BADGE_PRESETS = [
  '🎓 ADMISSIONS OPEN • APPLY ONLINE',
  '📦 B2B WHOLESALE & BULK PALLET SUPPLY',
  '✨ SPECIAL OFFER • DISCOUNTS ACTIVE',
  '🏥 24/7 EMERGENCY & CLINICAL CARE',
  '💰 GROW YOUR SAVINGS & DIVIDENDS',
  '🙏 JOIN US FOR WORSHIP & FELLOWSHIP',
  '🍽️ PREMIUM DINING & RESERVATIONS',
  '🚀 ENTERPRISE SOLUTIONS & RELIABILITY'
];

export const TenantPublicWebsiteEditor: React.FC<TenantPublicWebsiteEditorProps> = ({
  tenant,
  onSaved
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'typography' | 'announcement' | 'about' | 'contact' | 'seo'>('hero');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fallback defaults tailored by tenant type
  const defaultHeroTitle = tenant.type === 'WHOLESALE'
    ? 'Direct Factory Wholesale Distribution & FMCG Supply'
    : tenant.type === 'RETAIL' || tenant.type === 'POS' || tenant.type === 'BOOKSHOP'
    ? `Welcome to ${tenant.name}`
    : tenant.type === 'HOSPITAL'
    ? 'Excellence in Healthcare, Diagnostics & Patient Safety'
    : tenant.type === 'SACCO'
    ? 'Financial Empowerment, Savings & Low-Interest Credit'
    : tenant.type === 'CHURCH'
    ? 'Worship, Fellowship, Prayer & Spiritual Growth'
    : tenant.type === 'EDUCATION'
    ? 'Empowering Minds, Shaping Tomorrow'
    : `Welcome to ${tenant.name}`;

  const defaultHeroDesc = tenant.type === 'WHOLESALE'
    ? 'Supplying supermarkets, retail shops, institutions, and bulk distributors with certified products at guaranteed wholesale rates.'
    : tenant.type === 'HOSPITAL'
    ? 'Comprehensive clinical specialties, diagnostic pathology, and 24/7 emergency response.'
    : tenant.type === 'SACCO'
    ? 'Grow your savings, access low-interest credit facilities, and earn annual dividend payouts.'
    : tenant.type === 'CHURCH'
    ? 'Join our vibrant community for worship services, prayer ministry, and outreach fellowships.'
    : tenant.type === 'EDUCATION'
    ? 'Join our vibrant academic community with accredited programs, modern facilities, and expert faculty.'
    : 'Delivering enterprise-grade solutions, client satisfaction, and operational efficiency.';

  // Local state for Public Website Config
  const [config, setConfig] = useState<TenantPublicWebsiteConfig>(() => {
    const existing = tenant.publicWebsite || {};
    const defaultSlides: TenantHeroSlide[] = [
      {
        id: `slide_${Date.now()}_1`,
        title: existing.heroTitle || defaultHeroTitle,
        subtitle: existing.heroDescription || defaultHeroDesc,
        tagline: tenant.branding?.companyName || tenant.name,
        badgeText: tenant.type === 'EDUCATION' ? '🎓 ADMISSIONS OPEN • APPLY ONLINE'
          : tenant.type === 'WHOLESALE' ? '📦 B2B WHOLESALE & BULK SUPPLY'
          : tenant.type === 'HOSPITAL' ? '🏥 24/7 EMERGENCY & CLINICAL CARE'
          : tenant.type === 'SACCO' ? '💰 FINANCIAL EMPOWERMENT'
          : tenant.type === 'CHURCH' ? '🙏 JOIN US FOR WORSHIP'
          : '✨ WELCOME TO OUR PLATFORM',
        imageUrl: existing.heroImage || (tenant.type === 'WHOLESALE'
          ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80'
          : tenant.type === 'EDUCATION'
          ? 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80'
          : tenant.type === 'HOSPITAL'
          ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80'
          : tenant.type === 'SACCO'
          ? 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80'
          : tenant.type === 'CHURCH'
          ? 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80'
          : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80'),
        primaryBtnText: tenant.type === 'EDUCATION' ? 'Apply for Admission'
          : tenant.type === 'WHOLESALE' ? 'Request Wholesale Quote'
          : tenant.type === 'HOSPITAL' ? 'Book Appointment'
          : tenant.type === 'SACCO' ? 'Join SACCO / Chama'
          : tenant.type === 'CHURCH' ? 'Join Us This Sunday'
          : 'Explore Services',
        primaryBtnAction: 'apply',
        secondaryBtnText: tenant.type === 'EDUCATION' ? 'Academic Programs'
          : tenant.type === 'WHOLESALE' ? 'Browse Catalog'
          : tenant.type === 'HOSPITAL' ? 'Clinical Specialties'
          : 'Learn More',
        secondaryBtnAction: 'programs',
        alignment: 'center',
        overlayOpacity: 75,
        fontFamily: 'sans',
        titleFontSize: 'lg',
        titleFontWeight: 'black',
        titleItalic: false,
        subtitleFontSize: 'base',
        subtitleItalic: false
      }
    ];

    return {
      enabled: existing.enabled ?? true,
      heroTitle: existing.heroTitle || defaultHeroTitle,
      heroDescription: existing.heroDescription || defaultHeroDesc,
      heroImage: existing.heroImage || defaultSlides[0].imageUrl,
      heroSlides: (existing.heroSlides && existing.heroSlides.length > 0) ? existing.heroSlides : defaultSlides,
      autoSlideInterval: existing.autoSlideInterval || 6,
      announcementBarEnabled: existing.announcementBarEnabled ?? true,
      announcementBarText: existing.announcementBarText || `Welcome to ${tenant.branding?.companyName || tenant.name}! Explore our verified services and offerings.`,
      announcementBarLink: existing.announcementBarLink || '#',
      aboutHeadline: existing.aboutHeadline || `About ${tenant.branding?.companyName || tenant.name}`,
      aboutText: existing.aboutText || `We are committed to delivering top-tier operational excellence, transparent services, and customer satisfaction across all our departments.`,
      aboutImage: existing.aboutImage || '',
      mission: existing.mission || 'To provide dependable, accessible, and high-standard services that empower our community.',
      vision: existing.vision || 'To be the recognized leader in our industry through continuous innovation and integrity.',
      coreValues: existing.coreValues || ['Excellence', 'Integrity', 'Community', 'Innovation', 'Transparency'],
      tagline: existing.tagline || tenant.branding?.companyName || tenant.name,
      contactEmail: existing.contactEmail || tenant.branding?.contactEmail || '',
      contactPhone: existing.contactPhone || tenant.branding?.contactPhone || '',
      contactAddress: existing.contactAddress || tenant.branding?.address || '',
      operatingHours: existing.operatingHours || 'Monday – Friday: 8:00 AM – 5:00 PM | Saturday: 9:00 AM – 1:00 PM',
      facebookUrl: existing.facebookUrl || '',
      twitterUrl: existing.twitterUrl || '',
      linkedinUrl: existing.linkedinUrl || '',
      instagramUrl: existing.instagramUrl || '',
      whatsappPhone: existing.whatsappPhone || '',
      customMetaTitle: existing.customMetaTitle || `${tenant.name} | Official Website`,
      customMetaDescription: existing.customMetaDescription || `${tenant.name} official web portal and enterprise services.`,
      typography: existing.typography || {
        fontFamily: 'sans',
        headingSize: 'lg',
        headingWeight: 'black',
        headingAlign: 'center',
        headingItalic: false,
        bodySize: 'base',
        bodyWeight: 'normal',
        bodyItalic: false
      }
    };
  });

  // Current editing slide ID
  const [editingSlideId, setEditingSlideId] = useState<string | null>(() => {
    return config.heroSlides && config.heroSlides.length > 0 ? config.heroSlides[0].id : null;
  });

  // Live preview active slide index
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [newCoreValue, setNewCoreValue] = useState('');

  // Synchronize active editing slide when slides change
  useEffect(() => {
    if (config.heroSlides && config.heroSlides.length > 0) {
      if (!editingSlideId || !config.heroSlides.some(s => s.id === editingSlideId)) {
        setEditingSlideId(config.heroSlides[0].id);
      }
    }
  }, [config.heroSlides]);

  // Synchronize config when tenant changes (e.g. switching tenants in Super Admin)
  useEffect(() => {
    if (tenant) {
      const existing = tenant.publicWebsite || {};
      const defaultSlides: TenantHeroSlide[] = [
        {
          id: `slide_${Date.now()}_1`,
          title: existing.heroTitle || defaultHeroTitle,
          subtitle: existing.heroDescription || defaultHeroDesc,
          tagline: tenant.branding?.companyName || tenant.name,
          badgeText: tenant.type === 'EDUCATION' ? '🎓 ADMISSIONS OPEN • APPLY ONLINE'
            : tenant.type === 'WHOLESALE' ? '📦 B2B WHOLESALE & BULK SUPPLY'
            : tenant.type === 'HOSPITAL' ? '🏥 24/7 EMERGENCY & CLINICAL CARE'
            : tenant.type === 'SACCO' ? '💰 FINANCIAL EMPOWERMENT'
            : tenant.type === 'CHURCH' ? '🙏 JOIN US FOR WORSHIP'
            : '✨ WELCOME TO OUR PLATFORM',
          imageUrl: existing.heroImage || (tenant.type === 'WHOLESALE'
            ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80'
            : tenant.type === 'EDUCATION'
            ? 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80'
            : tenant.type === 'HOSPITAL'
            ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80'
            : tenant.type === 'SACCO'
            ? 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80'
            : tenant.type === 'CHURCH'
            ? 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80'
            : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80'),
          primaryBtnText: tenant.type === 'EDUCATION' ? 'Apply for Admission'
            : tenant.type === 'WHOLESALE' ? 'Request Wholesale Quote'
            : tenant.type === 'HOSPITAL' ? 'Book Appointment'
            : tenant.type === 'SACCO' ? 'Join SACCO / Chama'
            : tenant.type === 'CHURCH' ? 'Join Us This Sunday'
            : 'Explore Services',
          primaryBtnAction: 'apply',
          secondaryBtnText: tenant.type === 'EDUCATION' ? 'Academic Programs'
            : tenant.type === 'WHOLESALE' ? 'Browse Catalog'
            : tenant.type === 'HOSPITAL' ? 'Clinical Specialties'
            : 'Learn More',
          secondaryBtnAction: 'programs',
          alignment: 'center',
          overlayOpacity: 75,
          fontFamily: 'sans',
          titleFontSize: 'lg',
          titleFontWeight: 'black',
          titleItalic: false,
          subtitleFontSize: 'base',
          subtitleItalic: false
        }
      ];

      setConfig({
        enabled: existing.enabled ?? true,
        heroTitle: existing.heroTitle || defaultHeroTitle,
        heroDescription: existing.heroDescription || defaultHeroDesc,
        heroImage: existing.heroImage || defaultSlides[0].imageUrl,
        heroSlides: (existing.heroSlides && existing.heroSlides.length > 0) ? existing.heroSlides : defaultSlides,
        autoSlideInterval: existing.autoSlideInterval || 6,
        announcementBarEnabled: existing.announcementBarEnabled ?? true,
        announcementBarText: existing.announcementBarText || `Welcome to ${tenant.branding?.companyName || tenant.name}! Explore our verified services and offerings.`,
        announcementBarLink: existing.announcementBarLink || '#',
        aboutHeadline: existing.aboutHeadline || `About ${tenant.branding?.companyName || tenant.name}`,
        aboutText: existing.aboutText || `We are committed to delivering top-tier operational excellence, transparent services, and customer satisfaction across all our departments.`,
        aboutImage: existing.aboutImage || '',
        mission: existing.mission || 'To provide dependable, accessible, and high-standard services that empower our community.',
        vision: existing.vision || 'To be the recognized leader in our industry through continuous innovation and integrity.',
        coreValues: existing.coreValues || ['Excellence', 'Integrity', 'Community', 'Innovation', 'Transparency'],
        tagline: existing.tagline || tenant.branding?.companyName || tenant.name,
        contactEmail: existing.contactEmail || tenant.branding?.contactEmail || '',
        contactPhone: existing.contactPhone || tenant.branding?.contactPhone || '',
        contactAddress: existing.contactAddress || tenant.branding?.address || '',
        operatingHours: existing.operatingHours || 'Monday – Friday: 8:00 AM – 5:00 PM | Saturday: 9:00 AM – 1:00 PM',
        facebookUrl: existing.facebookUrl || '',
        twitterUrl: existing.twitterUrl || '',
        linkedinUrl: existing.linkedinUrl || '',
        instagramUrl: existing.instagramUrl || '',
        whatsappPhone: existing.whatsappPhone || '',
        customMetaTitle: existing.customMetaTitle || `${tenant.name} | Official Website`,
        customMetaDescription: existing.customMetaDescription || `${tenant.name} official web portal and enterprise services.`,
        typography: existing.typography || {
          fontFamily: 'sans',
          headingSize: 'lg',
          headingWeight: 'black',
          headingAlign: 'center',
          headingItalic: false,
          bodySize: 'base',
          bodyWeight: 'normal',
          bodyItalic: false
        }
      });
    }
  }, [tenant.id, tenant.updatedAt]);

  const activeSlide = config.heroSlides?.find(s => s.id === editingSlideId) || config.heroSlides?.[0];

  const publicWebsiteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${tenant.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicWebsiteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSlideChange = (id: string, updates: Partial<TenantHeroSlide>) => {
    setConfig(prev => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map(s => (s.id === id ? { ...s, ...updates } : s))
    }));
  };

  const handleAddSlide = () => {
    const newSlideId = `slide_${Date.now()}`;
    const newSlide: TenantHeroSlide = {
      id: newSlideId,
      title: 'New Featured Showcase Banner',
      subtitle: 'Highlight your top products, academic programs, or special institutional notices right here.',
      badgeText: '✨ FEATURED HIGHLIGHT',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
      primaryBtnText: 'Get Started',
      primaryBtnAction: 'apply',
      secondaryBtnText: 'Learn More',
      secondaryBtnAction: 'programs',
      alignment: 'center',
      overlayOpacity: 75,
      fontFamily: config.typography?.fontFamily || 'sans',
      titleFontSize: 'lg',
      titleFontWeight: 'black',
      titleItalic: false,
      subtitleFontSize: 'base',
      subtitleItalic: false
    };

    setConfig(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
    setEditingSlideId(newSlideId);
  };

  const handleDeleteSlide = (id: string) => {
    if ((config.heroSlides || []).length <= 1) {
      alert('You must have at least one hero slide on your public website.');
      return;
    }
    setConfig(prev => {
      const remaining = (prev.heroSlides || []).filter(s => s.id !== id);
      return { ...prev, heroSlides: remaining };
    });
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...(config.heroSlides || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    setConfig(prev => ({ ...prev, heroSlides: slides }));
  };

  // Direct image upload & compression for hero slide photo
  const handleUploadHeroPhoto = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 1920, 1080, 0.85);
      handleSlideChange(slideId, { imageUrl: compressed });
    } catch (err: any) {
      alert(err.message || 'Failed to compress and upload photo.');
    }
  };

  // Direct image upload for About section
  const handleUploadAboutPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 1200, 800, 0.85);
      setConfig(prev => ({ ...prev, aboutImage: compressed }));
    } catch (err: any) {
      alert(err.message || 'Failed to compress photo.');
    }
  };

  // Add / remove core values
  const handleAddCoreValue = () => {
    if (!newCoreValue.trim()) return;
    if (!config.coreValues?.includes(newCoreValue.trim())) {
      setConfig(prev => ({
        ...prev,
        coreValues: [...(prev.coreValues || []), newCoreValue.trim()]
      }));
    }
    setNewCoreValue('');
  };

  const handleRemoveCoreValue = (val: string) => {
    setConfig(prev => ({
      ...prev,
      coreValues: (prev.coreValues || []).filter(v => v !== val)
    }));
  };

  // Save Website Settings
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // Keep heroTitle & heroDescription in sync with first slide
      const payload: TenantPublicWebsiteConfig = {
        ...config,
        heroTitle: config.heroSlides?.[0]?.title || config.heroTitle,
        heroDescription: config.heroSlides?.[0]?.subtitle || config.heroDescription,
        heroImage: config.heroSlides?.[0]?.imageUrl || config.heroImage
      };

      const res = await fetch('/api/tenant/public-website', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': tenant.id
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to save public website configuration');
      }

      setSaveSuccess('Public website and hero slide settings saved and published successfully!');
      if (onSaved) onSaved(data);
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Network error saving public website.');
    } finally {
      setSaving(false);
    }
  };

  const previewSlide = config.heroSlides?.[previewSlideIdx] || config.heroSlides?.[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Globe className="w-3 h-3 mr-1" />
              {config.enabled ? 'Live Public Website Active' : 'Website Disabled / Offline'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Slug: /{tenant.slug}</span>
          </div>

          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Public Website &amp; Landing Page Studio</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize your hero carousel, alignments, fonts, photos, and public institution portal in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Public URL'}</span>
          </button>

          <a
            href={publicWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Save Alerts */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Interactive Hero Slide Live Preview Box */}
      {previewSlide && (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md relative group">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">Live Hero Preview</span>
              <span className="text-slate-500">|</span>
              <span>Slide {previewSlideIdx + 1} of {(config.heroSlides || []).length}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              {(config.heroSlides || []).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewSlideIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    previewSlideIdx === idx ? 'bg-blue-500 w-5' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            className="relative min-h-[280px] sm:min-h-[340px] flex items-center p-6 sm:p-10 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${previewSlide.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80'})`
            }}
          >
            {/* Dynamic Overlay */}
            <div
              className="absolute inset-0 bg-slate-950"
              style={{ opacity: (previewSlide.overlayOpacity ?? 75) / 100 }}
            />

            <div
              className={`relative z-10 w-full max-w-4xl space-y-3 ${
                previewSlide.alignment === 'center'
                  ? 'mx-auto text-center items-center flex flex-col'
                  : previewSlide.alignment === 'right'
                  ? 'ml-auto text-right items-end flex flex-col'
                  : 'text-left items-start flex flex-col'
              }`}
            >
              {previewSlide.badgeText && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-slate-900 shadow-sm"
                  style={{ backgroundColor: tenant.branding?.secondaryColor || '#F49C10' }}
                >
                  {previewSlide.badgeText}
                </span>
              )}

              <h1
                className={`text-white leading-tight ${getFontFamilyClass(previewSlide.fontFamily || config.typography?.fontFamily)} ${getHeadingSizeClass(previewSlide.titleFontSize || config.typography?.headingSize)} ${getFontWeightClass(previewSlide.titleFontWeight || config.typography?.headingWeight)} ${previewSlide.titleItalic ? 'italic' : ''}`}
              >
                {previewSlide.title || 'Your Hero Headline Goes Here'}
              </h1>

              <p
                className={`text-slate-200 max-w-2xl leading-relaxed ${getSubtitleSizeClass(previewSlide.subtitleFontSize || config.typography?.bodySize)} ${previewSlide.subtitleItalic ? 'italic' : ''}`}
              >
                {previewSlide.subtitle || 'Your hero subtitle and promotional description appears here.'}
              </p>

              <div
                className={`pt-2 flex flex-wrap items-center gap-3 ${
                  previewSlide.alignment === 'center'
                    ? 'justify-center'
                    : previewSlide.alignment === 'right'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {previewSlide.primaryBtnText && (
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-900 shadow-md flex items-center space-x-1.5 pointer-events-none"
                    style={{ backgroundColor: tenant.branding?.secondaryColor || '#F49C10' }}
                  >
                    <span>{previewSlide.primaryBtnText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {previewSlide.secondaryBtnText && (
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800/80 border border-slate-700/80 pointer-events-none"
                  >
                    <span>{previewSlide.secondaryBtnText}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Slide Navigation arrows for preview */}
            {(config.heroSlides || []).length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx(prev => (prev === 0 ? (config.heroSlides || []).length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx(prev => (prev + 1) % (config.heroSlides || []).length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor Sub-Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 pb-0">
        <button
          type="button"
          onClick={() => setActiveSection('hero')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'hero'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Slides &amp; Alignment ({(config.heroSlides || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('typography')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'typography'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Font Style &amp; Typography</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('announcement')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'announcement'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcement Top Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('about')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'about'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>About Us &amp; Mission</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('contact')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'contact'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Contact &amp; Social Links</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('seo')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'seo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>SEO &amp; Meta Title</span>
        </button>
      </div>

      {/* SECTION 1: HERO SLIDES & ALIGNMENT */}
      {activeSection === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Slide List & Order */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Hero Carousel Slides</h4>
                  <p className="text-[11px] text-slate-500">{(config.heroSlides || []).length} active banner slides</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {(config.heroSlides || []).map((slide, idx) => (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setEditingSlideId(slide.id);
                      setPreviewSlideIdx(idx);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      editingSlideId === slide.id
                        ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {/* Thumbnail */}
                      <div className="w-12 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-300 relative">
                        <img
                          src={slide.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80'}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-slate-900/80 text-[9px] font-bold text-white px-1 rounded-tl">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="truncate text-left">
                        <p className="font-bold text-slate-900 truncate">{slide.title || `Slide #${idx + 1}`}</p>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className="capitalize">{slide.alignment || 'Center'} Align</span>
                          <span>•</span>
                          <span className="capitalize">{slide.fontFamily || 'Sans'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (config.heroSlides || []).length - 1}
                        onClick={() => handleMoveSlide(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={(config.heroSlides || []).length <= 1}
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto slide interval setting */}
              <div className="pt-3 border-t border-slate-100">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Auto-Transition Interval:</span>
                  <span className="text-blue-600 font-extrabold">{config.autoSlideInterval || 6} Seconds</span>
                </label>
                <select
                  value={config.autoSlideInterval || 6}
                  onChange={e => setConfig(prev => ({ ...prev, autoSlideInterval: Number(e.target.value) }))}
                  className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer"
                >
                  <option value={3}>3 Seconds (Fast)</option>
                  <option value={5}>5 Seconds</option>
                  <option value={6}>6 Seconds (Standard Recommended)</option>
                  <option value={8}>8 Seconds</option>
                  <option value={10}>10 Seconds (Relaxed)</option>
                  <option value={15}>15 Seconds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Active Slide Details & Controls */}
          {activeSlide ? (
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(config.heroSlides || []).findIndex(s => s.id === activeSlide.id) + 1}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Editing Slide Settings</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-medium text-slate-500">Alignment:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                    {activeSlide.alignment || 'center'}
                  </span>
                </div>
              </div>

              {/* 1. Alignment & Centering Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                    <AlignLeft className="w-4 h-4 text-blue-600" />
                    <span>Hero Content Alignment &amp; Centering</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Controls layout for this slide</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSlideChange(activeSlide.id, { alignment: 'left' })}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      activeSlide.alignment === 'left'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span>Align Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSlideChange(activeSlide.id, { alignment: 'center' })}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      activeSlide.alignment === 'center' || !activeSlide.alignment
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                    <span>Center Align</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSlideChange(activeSlide.id, { alignment: 'right' })}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      activeSlide.alignment === 'right'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                    <span>Align Right</span>
                  </button>
                </div>
              </div>

              {/* 2. Photo Management (Upload / Stock Presets / URL) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Hero Slide Background Photo</span>
                  </label>
                  <label className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo From Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleUploadHeroPhoto(activeSlide.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="font-semibold text-slate-600 text-[11px]">Image Web URL:</label>
                    <input
                      type="url"
                      value={activeSlide.imageUrl}
                      onChange={e => handleSlideChange(activeSlide.id, { imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 text-[11px]">
                      Overlay Darkness ({activeSlide.overlayOpacity ?? 75}%):
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={95}
                      step={5}
                      value={activeSlide.overlayOpacity ?? 75}
                      onChange={e => handleSlideChange(activeSlide.id, { overlayOpacity: Number(e.target.value) })}
                      className="w-full mt-2 accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Curated Stock Photo Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Or Choose High-Resolution Preset Photo:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STOCK_PHOTO_PRESETS.slice(0, 8).map((preset, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => handleSlideChange(activeSlide.id, { imageUrl: preset.url })}
                        className={`relative rounded-lg overflow-hidden border cursor-pointer group h-14 transition-all ${
                          activeSlide.imageUrl === preset.url
                            ? 'border-blue-600 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/60 p-1 flex items-end">
                          <span className="text-[9px] font-bold text-white leading-tight truncate">
                            {preset.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Text Content (Headline, Subtitle, Badge) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-800">Badge / Tagline Pill Text</label>
                  <input
                    type="text"
                    value={activeSlide.badgeText || ''}
                    onChange={e => handleSlideChange(activeSlide.id, { badgeText: e.target.value })}
                    placeholder="e.g. 🎓 ADMISSIONS OPEN • APPLY ONLINE"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                  {/* Preset Badges */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {BADGE_PRESETS.map((badge, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={() => handleSlideChange(activeSlide.id, { badgeText: badge })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Slide Main Headline *</label>
                  <textarea
                    rows={2}
                    value={activeSlide.title}
                    onChange={e => handleSlideChange(activeSlide.id, { title: e.target.value })}
                    placeholder="Enter inspiring hero headline..."
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-extrabold text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800">Slide Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={activeSlide.subtitle}
                    onChange={e => handleSlideChange(activeSlide.id, { subtitle: e.target.value })}
                    placeholder="Brief description of key offerings, admissions, or institutional excellence..."
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* 4. Font Style & Typography Specifics for This Slide */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h5 className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                  <Type className="w-4 h-4 text-blue-600" />
                  <span>Typography Styling for This Slide</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 text-[11px]">Font Family:</label>
                    <select
                      value={activeSlide.fontFamily || config.typography?.fontFamily || 'sans'}
                      onChange={e => handleSlideChange(activeSlide.id, { fontFamily: e.target.value as any })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer"
                    >
                      {FONT_FAMILY_OPTIONS.map(font => (
                        <option key={font.id} value={font.id}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 text-[11px]">Headline Size:</label>
                    <select
                      value={activeSlide.titleFontSize || 'lg'}
                      onChange={e => handleSlideChange(activeSlide.id, { titleFontSize: e.target.value as any })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer"
                    >
                      {FONT_SIZE_OPTIONS.map(size => (
                        <option key={size.id} value={size.id}>{size.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 text-[11px]">Headline Weight:</label>
                    <select
                      value={activeSlide.titleFontWeight || 'black'}
                      onChange={e => handleSlideChange(activeSlide.id, { titleFontWeight: e.target.value as any })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer"
                    >
                      {FONT_WEIGHT_OPTIONS.map(weight => (
                        <option key={weight.id} value={weight.id}>{weight.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeSlide.titleItalic || false}
                      onChange={e => handleSlideChange(activeSlide.id, { titleItalic: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-700">Italic Headline</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeSlide.subtitleItalic || false}
                      onChange={e => handleSlideChange(activeSlide.id, { subtitleItalic: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-700">Italic Subtitle</span>
                  </label>
                </div>
              </div>

              {/* 5. Call-to-Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-800">Primary Button Text</label>
                  <input
                    type="text"
                    value={activeSlide.primaryBtnText || ''}
                    onChange={e => handleSlideChange(activeSlide.id, { primaryBtnText: e.target.value })}
                    placeholder="e.g. Apply for Admission"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800">Secondary Button Text</label>
                  <input
                    type="text"
                    value={activeSlide.secondaryBtnText || ''}
                    onChange={e => handleSlideChange(activeSlide.id, { secondaryBtnText: e.target.value })}
                    placeholder="e.g. Explore Programs"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <p className="text-slate-500">Select or add a slide to edit.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: GLOBAL TYPOGRAPHY & DESIGN */}
      {activeSection === 'typography' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Type className="w-4 h-4 text-blue-600" />
              <span>Global Website Typography &amp; Font Styling</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Select the primary font family, heading hierarchy, and typography styling applied across your public website.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FONT_FAMILY_OPTIONS.map(font => (
              <div
                key={font.id}
                onClick={() => setConfig(prev => ({
                  ...prev,
                  typography: { ...(prev.typography || {}), fontFamily: font.id as any }
                }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  (config.typography?.fontFamily || 'sans') === font.id
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{font.name}</span>
                  {(config.typography?.fontFamily || 'sans') === font.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className={`mt-2 text-slate-600 text-sm ${getFontFamilyClass(font.id)}`}>
                  {font.preview}
                </p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">font-{font.id}</span>
              </div>
            ))}
          </div>

          {/* Heading Scale & Align */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h5 className="font-bold text-slate-900">Default Global Heading Layout</h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Global Heading Size:</label>
                <select
                  value={config.typography?.headingSize || 'lg'}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    typography: { ...(prev.typography || {}), headingSize: e.target.value as any }
                  }))}
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {FONT_SIZE_OPTIONS.map(size => (
                    <option key={size.id} value={size.id}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Global Heading Weight:</label>
                <select
                  value={config.typography?.headingWeight || 'black'}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    typography: { ...(prev.typography || {}), headingWeight: e.target.value as any }
                  }))}
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {FONT_WEIGHT_OPTIONS.map(weight => (
                    <option key={weight.id} value={weight.id}>{weight.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Default Text Alignment:</label>
                <select
                  value={config.typography?.headingAlign || 'center'}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    typography: { ...(prev.typography || {}), headingAlign: e.target.value as any }
                  }))}
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {TEXT_ALIGN_OPTIONS.map(align => (
                    <option key={align.id} value={align.id}>{align.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ANNOUNCEMENT BAR */}
      {activeSection === 'announcement' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <span>Announcement Top Banner</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays a prominent marquee or alert ribbon at the very top of your public website.
              </p>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={config.announcementBarEnabled ?? true}
                onChange={e => setConfig(prev => ({ ...prev, announcementBarEnabled: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800">Enable Announcement Bar</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-800">Announcement Text</label>
              <input
                type="text"
                value={config.announcementBarText || ''}
                onChange={e => setConfig(prev => ({ ...prev, announcementBarText: e.target.value }))}
                placeholder="e.g. 🚀 2026/2027 Academic Intake is now officially open! Apply online today."
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800">Action Link / Anchor (Optional)</label>
              <input
                type="text"
                value={config.announcementBarLink || ''}
                onChange={e => setConfig(prev => ({ ...prev, announcementBarLink: e.target.value }))}
                placeholder="#programs, #contact, or https://..."
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ABOUT US & MISSION */}
      {activeSection === 'about' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>About Us, Mission &amp; Core Values</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Introduce your institution’s story, founding principles, and core value statements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800">Section Headline</label>
              <input
                type="text"
                value={config.aboutHeadline || ''}
                onChange={e => setConfig(prev => ({ ...prev, aboutHeadline: e.target.value }))}
                placeholder={`About ${tenant.name}`}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>About Section Photo</span>
                <label className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleUploadAboutPhoto} className="hidden" />
                </label>
              </label>
              <input
                type="url"
                value={config.aboutImage || ''}
                onChange={e => setConfig(prev => ({ ...prev, aboutImage: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800">Organization Overview &amp; Narrative</label>
            <textarea
              rows={3}
              value={config.aboutText || ''}
              onChange={e => setConfig(prev => ({ ...prev, aboutText: e.target.value }))}
              placeholder="Detail your history, campus facilities, verified reputation, or client dedication..."
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800">Mission Statement</label>
              <textarea
                rows={2}
                value={config.mission || ''}
                onChange={e => setConfig(prev => ({ ...prev, mission: e.target.value }))}
                placeholder="To empower..."
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800">Vision Statement</label>
              <textarea
                rows={2}
                value={config.vision || ''}
                onChange={e => setConfig(prev => ({ ...prev, vision: e.target.value }))}
                placeholder="To be the leading..."
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Core Values Tag List */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800">Institutional Core Values</label>
            <div className="flex flex-wrap gap-2">
              {(config.coreValues || []).map((val, vIdx) => (
                <span
                  key={vIdx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoreValue(val)}
                    className="hover:text-red-600 cursor-pointer text-blue-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1 max-w-md">
              <input
                type="text"
                value={newCoreValue}
                onChange={e => setNewCoreValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCoreValue())}
                placeholder="Add a core value (e.g. Transparency)"
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCoreValue}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: CONTACT & SOCIAL LINKS */}
      {activeSection === 'contact' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Public Contact Details &amp; Social Links</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Provide contact info and social media channels displayed on your public website footer and contact section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Official Contact Email</label>
              <input
                type="email"
                value={config.contactEmail || ''}
                onChange={e => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="info@institution.com"
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Official Contact Phone</label>
              <input
                type="text"
                value={config.contactPhone || ''}
                onChange={e => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+254 700 000 000"
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">WhatsApp Quick Chat Number</label>
              <input
                type="text"
                value={config.whatsappPhone || ''}
                onChange={e => setConfig(prev => ({ ...prev, whatsappPhone: e.target.value }))}
                placeholder="+254700000000"
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Operating / Reception Hours</label>
              <input
                type="text"
                value={config.operatingHours || ''}
                onChange={e => setConfig(prev => ({ ...prev, operatingHours: e.target.value }))}
                placeholder="Mon – Fri: 8:00 AM – 5:00 PM"
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700">Physical Address / Main Campus Location</label>
              <input
                type="text"
                value={config.contactAddress || ''}
                onChange={e => setConfig(prev => ({ ...prev, contactAddress: e.target.value }))}
                placeholder="P.O. Box 12345, Nairobi, Kenya"
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h5 className="font-bold text-slate-900">Social Media Profile Links</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Facebook Page URL</label>
                <input
                  type="url"
                  value={config.facebookUrl || ''}
                  onChange={e => setConfig(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Twitter / X Profile URL</label>
                <input
                  type="url"
                  value={config.twitterUrl || ''}
                  onChange={e => setConfig(prev => ({ ...prev, twitterUrl: e.target.value }))}
                  placeholder="https://x.com/..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Instagram URL</label>
                <input
                  type="url"
                  value={config.instagramUrl || ''}
                  onChange={e => setConfig(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">LinkedIn Organization Page</label>
                <input
                  type="url"
                  value={config.linkedinUrl || ''}
                  onChange={e => setConfig(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: SEO & META */}
      {activeSection === 'seo' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Search Engine Optimization (SEO) &amp; Browser Meta</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Customize how your organization appears in search results and social share previews.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-800">Custom Browser Title Bar Text</label>
              <input
                type="text"
                value={config.customMetaTitle || ''}
                onChange={e => setConfig(prev => ({ ...prev, customMetaTitle: e.target.value }))}
                placeholder={`${tenant.name} | Official Website`}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800">Meta Search Snippet Description</label>
              <textarea
                rows={3}
                value={config.customMetaDescription || ''}
                onChange={e => setConfig(prev => ({ ...prev, customMetaDescription: e.target.value }))}
                placeholder="Concise summary for search engines (150-160 characters)..."
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Changes will instantly update your public landing page at <span className="font-bold text-slate-800">/public/{tenant.slug}</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Website...' : 'Save & Publish Website'}</span>
        </button>
      </div>
    </div>
  );
};
