import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Image as ImageIcon, Upload, Save, Eye,
  ShieldCheck, GraduationCap, BookOpen, Building, CheckCircle2,
  Trash2, Sliders, ArrowRight, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic
} from 'lucide-react';
import { TenantHeroSlide } from '../../../types';
import { compressImageFile } from '../../../lib/imageUtils';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS
} from '../../../lib/typography';

interface HeroSlideModalProps {
  isOpen: boolean;
  slide: TenantHeroSlide | null;
  onClose: () => void;
  onSave: (slide: TenantHeroSlide) => void;
  primaryColor?: string;
}

const PRESET_IMAGES = [
  {
    name: 'Modern University Campus',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Technical & Engineering Lab',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Students Collaborating & Library',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Innovation Hub & Group Workshop',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Graduation & Academic Achievement',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80'
  }
];

export const HeroSlideModal: React.FC<HeroSlideModalProps> = ({
  isOpen,
  slide,
  onClose,
  onSave,
  primaryColor = '#1D53D9'
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [primaryBtnText, setPrimaryBtnText] = useState('Apply For Admission');
  const [primaryBtnAction, setPrimaryBtnAction] = useState<any>('apply');
  const [secondaryBtnText, setSecondaryBtnText] = useState('Explore Academic Programs');
  const [secondaryBtnAction, setSecondaryBtnAction] = useState<any>('programs');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(70);
  const [fontFamily, setFontFamily] = useState<string>('sans');
  const [titleFontSize, setTitleFontSize] = useState<string>('lg');
  const [titleFontWeight, setTitleFontWeight] = useState<string>('black');
  const [titleItalic, setTitleItalic] = useState<boolean>(false);
  const [subtitleFontSize, setSubtitleFontSize] = useState<string>('base');
  const [subtitleItalic, setSubtitleItalic] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (slide) {
      setTitle(slide.title || '');
      setSubtitle(slide.subtitle || '');
      setTagline(slide.tagline || '');
      setBadgeText(slide.badgeText || '');
      setImageUrl(slide.imageUrl || '');
      setPrimaryBtnText(slide.primaryBtnText || 'Apply For Admission');
      setPrimaryBtnAction(slide.primaryBtnAction || 'apply');
      setSecondaryBtnText(slide.secondaryBtnText || 'Explore Academic Programs');
      setSecondaryBtnAction(slide.secondaryBtnAction || 'programs');
      setAlignment(slide.alignment || 'center');
      setOverlayOpacity(slide.overlayOpacity ?? 70);
      setFontFamily(slide.fontFamily || 'sans');
      setTitleFontSize(slide.titleFontSize || 'lg');
      setTitleFontWeight(slide.titleFontWeight || 'black');
      setTitleItalic(slide.titleItalic || false);
      setSubtitleFontSize(slide.subtitleFontSize || 'base');
      setSubtitleItalic(slide.subtitleItalic || false);
    } else {
      setTitle('Excellence in Academic Innovation & Practical Skills');
      setSubtitle('Join a vibrant institution committed to experiential learning, accredited diplomas, and industry career pathways.');
      setTagline('Accredited Institution • Modern Laboratories');
      setBadgeText('🎓 ADMISSIONS OPEN 2026/2027');
      setImageUrl(PRESET_IMAGES[0].url);
      setPrimaryBtnText('Apply For Admission');
      setPrimaryBtnAction('apply');
      setSecondaryBtnText('Explore Programs');
      setSecondaryBtnAction('programs');
      setAlignment('center');
      setOverlayOpacity(70);
      setFontFamily('sans');
      setTitleFontSize('lg');
      setTitleFontWeight('black');
      setTitleItalic(false);
      setSubtitleFontSize('base');
      setSubtitleItalic(false);
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await compressImageFile(file, 1920, 1080, 0.85);
      setImageUrl(base64);
    } catch (err: any) {
      alert(err.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert('Slide Title and Background Image are required.');
      return;
    }

    const newSlide: TenantHeroSlide = {
      id: slide?.id || `slide_${Date.now().toString(36)}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      tagline: tagline.trim() || undefined,
      badgeText: badgeText.trim() || undefined,
      imageUrl: imageUrl.trim(),
      primaryBtnText: primaryBtnText.trim() || undefined,
      primaryBtnAction,
      secondaryBtnText: secondaryBtnText.trim() || undefined,
      secondaryBtnAction,
      alignment,
      overlayOpacity,
      fontFamily: fontFamily as any,
      titleFontSize: titleFontSize as any,
      titleFontWeight: titleFontWeight as any,
      titleItalic,
      subtitleFontSize: subtitleFontSize as any,
      subtitleItalic
    };

    onSave(newSlide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 text-xs text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {slide ? 'Edit Hero Carousel Slide' : 'Add New Hero Carousel Slide'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Customize high-impact headline, imagery, and interactive call-to-action buttons.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Live Mini Preview */}
          <div className="relative rounded-xl overflow-hidden h-44 bg-slate-900 border border-slate-800 flex items-center justify-center text-center p-4 shadow-inner">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-50"
              />
            )}
            <div
              className="absolute inset-0 bg-slate-950"
              style={{ opacity: overlayOpacity / 100 }}
            />
            <div className={`relative z-10 space-y-2 max-w-md w-full text-${alignment}`}>
              {badgeText && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-400/40">
                  {badgeText}
                </span>
              )}
              <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight line-clamp-2 drop-shadow">
                {title || 'Slide Title Headline'}
              </h3>
              <p className="text-slate-200 text-[11px] line-clamp-2 opacity-90 drop-shadow-xs">
                {subtitle || 'Slide subtitle summary text...'}
              </p>
              <div className={`pt-1 flex items-center gap-2 ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'}`}>
                {primaryBtnText && (
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px]">
                    {primaryBtnText}
                  </span>
                )}
                {secondaryBtnText && (
                  <span className="px-2.5 py-1 rounded bg-white/20 text-white font-semibold text-[10px]">
                    {secondaryBtnText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Slide Text Content */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Slide Badge / Category Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎓 ADMISSIONS OPEN 2026/2027"
                  value={badgeText}
                  onChange={e => setBadgeText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tagline / Accreditations
                </label>
                <input
                  type="text"
                  placeholder="e.g. TVET Accredited • Modern Innovation Hub"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Headline Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Excellence in Competency-Based Education & Research"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Subtitle Description *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Empowering visionary leaders with world-class faculty, accredited curricula, and state-of-the-art facilities."
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          {/* Background Image & Presets */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="font-bold text-slate-700 block">
              Background Banner Image *
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 w-full"
              />

              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Compressing...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Unsplash Preset Gallery */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                Or pick from curated campus photo presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all cursor-pointer group ${
                      imageUrl === preset.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-transparent hover:opacity-90'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1">
                      <span className="text-[9px] text-white font-semibold leading-none truncate drop-shadow">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Setup */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs">Call-to-Action Buttons & Navigation</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Button */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] block">Primary Button (Prominent)</span>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Button Label</label>
                  <input
                    type="text"
                    value={primaryBtnText}
                    onChange={e => setPrimaryBtnText(e.target.value)}
                    placeholder="Apply For Admission"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Action Trigger</label>
                  <select
                    value={primaryBtnAction}
                    onChange={e => setPrimaryBtnAction(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="apply">Open Admission Application Modal</option>
                    <option value="programs">Navigate to Academic Programs</option>
                    <option value="departments">Navigate to Departments</option>
                    <option value="admissions">Navigate to Admission Requirements</option>
                    <option value="campuses">Navigate to Campuses</option>
                    <option value="news">Navigate to News & Announcements</option>
                    <option value="about">Navigate to About Us</option>
                    <option value="login">Open Portal Login</option>
                  </select>
                </div>
              </div>

              {/* Secondary Button */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] block">Secondary Button (Outlined)</span>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Button Label</label>
                  <input
                    type="text"
                    value={secondaryBtnText}
                    onChange={e => setSecondaryBtnText(e.target.value)}
                    placeholder="Explore Programs"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Action Trigger</label>
                  <select
                    value={secondaryBtnAction}
                    onChange={e => setSecondaryBtnAction(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="programs">Navigate to Academic Programs</option>
                    <option value="departments">Navigate to Departments</option>
                    <option value="admissions">Navigate to Admission Requirements</option>
                    <option value="campuses">Navigate to Campuses</option>
                    <option value="news">Navigate to News & Announcements</option>
                    <option value="about">Navigate to About Us</option>
                    <option value="apply">Open Admission Application Modal</option>
                    <option value="login">Open Portal Login</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Styling Controls */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>Slide Typography, Font Size & Style</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Font family, size, weight & italic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {/* Font Family */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Font Style / Family</label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {FONT_FAMILY_OPTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Title Font Size */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Title Font Size</label>
                <select
                  value={titleFontSize}
                  onChange={e => setTitleFontSize(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {FONT_SIZE_OPTIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Title Bold Weight */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Title Bold Weight</label>
                <select
                  value={titleFontWeight}
                  onChange={e => setTitleFontWeight(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {FONT_WEIGHT_OPTIONS.map(w => (
                    <option key={w.id} value={w.id}>{w.label}</option>
                  ))}
                </select>
              </div>

              {/* Title Italic Toggle */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Title Font Italic</label>
                <button
                  type="button"
                  onClick={() => setTitleItalic(!titleItalic)}
                  className={`w-full p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    titleItalic
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Italic className="w-3.5 h-3.5" />
                  <span>{titleItalic ? 'Italic Enabled' : 'Normal Upright'}</span>
                </button>
              </div>
            </div>

            {/* Subtitle Typography */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700">Subtitle Size:</span>
                <select
                  value={subtitleFontSize}
                  onChange={e => setSubtitleFontSize(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
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
                  checked={subtitleItalic}
                  onChange={e => setSubtitleItalic(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Italicize Subtitle Description</span>
              </label>
            </div>
          </div>

          {/* Layout & Styling Options */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs">Visual Alignment & Contrast</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Text Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setAlignment(align)}
                      className={`py-2 px-3 rounded-lg border font-bold capitalize transition-all cursor-pointer ${
                        alignment === align
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Dark Overlay Darkness</label>
                  <span className="font-mono text-slate-500 font-bold">{overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={overlayOpacity}
                  onChange={e => setOverlayOpacity(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] text-slate-500">
                  Higher values make white text clearer against bright images.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{slide ? 'Update Slide' : 'Add Slide to Carousel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
