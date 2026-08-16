import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, GraduationCap, BookOpen, Building,
  Sparkles, Award, ShieldCheck, ArrowRight, LogIn, Calendar,
  CheckCircle2, Play, Pause, Compass, Users
} from 'lucide-react';
import { TenantHeroSlide } from '../../types';
import {
  getFontFamilyClass,
  getHeadingSizeClass,
  getSubtitleSizeClass,
  getFontWeightClass,
  getTextAlignClass
} from '../../lib/typography';

interface HeroSliderProps {
  slides?: TenantHeroSlide[];
  autoSlideInterval?: number; // in seconds
  primaryColor?: string;
  secondaryColor?: string;
  institutionName?: string;
  onActionClick: (action: string) => void;
  onApplyNow: () => void;
  onExplorePrograms: () => void;
  onPortalLogin: () => void;
}

export const DEFAULT_HERO_SLIDES: TenantHeroSlide[] = [
  {
    id: 'slide-1',
    badgeText: '🎓 ADMISSIONS OPEN • ACADEMIC YEAR 2026/2027',
    tagline: 'Government Accredited • Industry Aligned • Career Ready',
    title: 'Excellence in Higher Education, Applied Technology & Innovation',
    subtitle: 'Empowering the next generation of industry leaders with world-class faculty, accredited competency-based curricula, and modern research laboratories.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
    primaryBtnText: 'Apply For Admission',
    primaryBtnAction: 'apply',
    secondaryBtnText: 'Explore Academic Programs',
    secondaryBtnAction: 'programs',
    alignment: 'center',
    overlayOpacity: 70
  },
  {
    id: 'slide-2',
    badgeText: '🚀 HANDS-ON TECHNICAL & VOCATIONAL TVET',
    tagline: 'Practical Competency • Modern Workplaces • Direct Employment',
    title: 'Transformative STEM, Engineering & Business Disciplines',
    subtitle: 'Gain job-ready skills through immersive workshops, state-of-the-art computer labs, industry apprenticeships, and personalized career mentorship.',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
    primaryBtnText: 'View Academic Departments',
    primaryBtnAction: 'departments',
    secondaryBtnText: 'Admission Requirements',
    secondaryBtnAction: 'admissions',
    alignment: 'left',
    overlayOpacity: 65
  },
  {
    id: 'slide-3',
    badgeText: '🌟 MULTI-CAMPUS COMMUNITY & 24/7 DIGITAL PORTAL',
    tagline: 'Smart Campuses • Digital Libraries • Secure Student Portals',
    title: 'Modern Learning Facilities & Connected Digital Campus',
    subtitle: 'Access interactive course modules, real-time fee tracking, digital exam timetables, and campus amenities from any device anywhere.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
    primaryBtnText: 'Explore Our Campuses',
    primaryBtnAction: 'campuses',
    secondaryBtnText: 'Staff & Student Portal',
    secondaryBtnAction: 'login',
    alignment: 'center',
    overlayOpacity: 70
  },
  {
    id: 'slide-4',
    badgeText: '🏆 RESEARCH, ENTREPRENEURSHIP & COMMUNITY IMPACT',
    tagline: 'Global Partnerships • Student Incubators • Sports & Leadership',
    title: 'Inspiring Innovation, Creativity & Real-World Solutions',
    subtitle: 'Join a vibrant community of innovators participating in annual hackathons, startup incubators, athletic championships, and international student exchanges.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
    primaryBtnText: 'Campus News & Announcements',
    primaryBtnAction: 'news',
    secondaryBtnText: 'About Our Institution',
    secondaryBtnAction: 'about',
    alignment: 'left',
    overlayOpacity: 70
  }
];

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoSlideInterval = 6,
  primaryColor = '#1D53D9',
  secondaryColor = '#F49C10',
  institutionName = 'Institution',
  onActionClick,
  onApplyNow,
  onExplorePrograms,
  onPortalLogin
}) => {
  // Use custom slides if provided and non-empty, otherwise use defaults
  const activeSlides: TenantHeroSlide[] = (slides && slides.length > 0)
    ? slides
    : DEFAULT_HERO_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalMs = Math.max(3000, (autoSlideInterval || 6) * 1000);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, intervalMs, activeSlides.length, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleButtonAction = (action?: string) => {
    if (!action) {
      onApplyNow();
      return;
    }

    switch (action) {
      case 'apply':
        onApplyNow();
        break;
      case 'programs':
        onExplorePrograms();
        break;
      case 'login':
        onPortalLogin();
        break;
      default:
        onActionClick(action);
        break;
    }
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section
      className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-slate-800 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Institution Highlights Slider"
    >
      {/* Background Images with Crossfade & Ken Burns zoom animation */}
      {activeSlides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&auto=format&fit=crop&q=80'}
              alt={slide.title}
              className={`w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-10000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Dynamic Subtle Contrast Gradient Overlay for clear photo visibility */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent"
              style={{
                opacity: (slide.overlayOpacity ? Math.min(slide.overlayOpacity / 100, 0.45) : 0.35)
              }}
            />
          </div>
        );
      })}

      {/* Subtle Top Progress Bar for Active Slide */}
      {activeSlides.length > 1 && !isPaused && (
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10 overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-500 animate-slide-progress"
            style={{
              animationDuration: `${intervalMs}ms`
            }}
          />
        </div>
      )}

      {/* Main Slide Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center w-full">
        {(() => {
          const fontClass = getFontFamilyClass(currentSlide.fontFamily);
          const headingSizeClass = getHeadingSizeClass(currentSlide.titleFontSize);
          const headingWeightClass = getFontWeightClass(currentSlide.titleFontWeight, 'font-black');
          const headingItalicClass = currentSlide.titleItalic ? 'italic' : 'not-italic';
          const align = getTextAlignClass(currentSlide.alignment);
          const subtitleSizeClass = getSubtitleSizeClass(currentSlide.subtitleFontSize);
          const subtitleItalicClass = currentSlide.subtitleItalic ? 'italic' : 'not-italic';

          return (
            <div
              key={currentIndex}
              className={`space-y-6 max-w-4xl transition-all duration-700 animate-in fade-in zoom-in-95 ${fontClass} ${align.container}`}
            >
              {/* Badge Pill */}
              <div className={`flex flex-wrap gap-2 ${align.stats}`}>
                {currentSlide.badgeText && (
                  <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg shadow-blue-900/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{currentSlide.badgeText}</span>
                  </span>
                )}
                {currentSlide.tagline && (
                  <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{currentSlide.tagline}</span>
                  </span>
                )}
              </div>

              {/* Headline with custom size, bold weight, align and italic */}
              <h1 className={`${headingSizeClass} ${headingWeightClass} ${headingItalicClass} ${align.text} text-white tracking-tight leading-[1.12] drop-shadow-md`}>
                {currentSlide.title || `Shape Your Future with Quality Education at ${institutionName}`}
              </h1>

              {/* Subtitle with custom size and italic */}
              <p className={`${subtitleSizeClass} ${subtitleItalicClass} ${align.text} text-slate-200 max-w-3xl font-normal leading-relaxed drop-shadow-sm opacity-95`}>
                {currentSlide.subtitle}
              </p>

              {/* Call-To-Action Action Buttons */}
              <div className={`pt-4 flex flex-col sm:flex-row items-center gap-3.5 ${align.stats}`}>
                {/* Primary Action Button */}
                <button
                  onClick={() => handleButtonAction(currentSlide.primaryBtnAction)}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-extrabold text-white shadow-xl shadow-blue-900/50 flex items-center justify-center space-x-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-white/20"
                  style={{ backgroundColor: primaryColor }}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>{currentSlide.primaryBtnText || 'Apply For Admission'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary Action Button */}
                <button
                  onClick={() => handleButtonAction(currentSlide.secondaryBtnAction)}
                  className="w-full sm:w-auto px-7 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700/90 hover:border-slate-500 rounded-xl text-sm font-bold flex items-center justify-center space-x-2.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-black/40"
                >
                  <BookOpen className="w-4.5 h-4.5 text-blue-400" />
                  <span>{currentSlide.secondaryBtnText || 'Explore Academic Programs'}</span>
                </button>

                {/* Direct Quick Portal Link */}
                <button
                  onClick={onPortalLogin}
                  className="w-full sm:w-auto px-5 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 backdrop-blur-md transition-all cursor-pointer"
                  title="Staff & Student ERP Portal Login"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Portal Login</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Navigation Controls: Previous / Next Buttons */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-slate-700/80 backdrop-blur-md hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-slate-700/80 backdrop-blur-md hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Bottom Pagination Indicators & Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-3 px-4">
        {/* Play/Pause Button */}
        {activeSlides.length > 1 && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-full bg-slate-900/60 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-xs transition-colors cursor-pointer mr-1"
            title={isPaused ? 'Resume auto-slides' : 'Pause auto-slides'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        )}

        {/* Dots / Pills */}
        <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/70 shadow-lg">
          {activeSlides.map((slide, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={slide.id || idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'w-8 bg-blue-500 shadow-md shadow-blue-500/50'
                    : 'w-2.5 bg-white/40 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>

        <span className="text-[11px] font-bold text-slate-300/80 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-700/50 ml-1">
          {currentIndex + 1} / {activeSlides.length}
        </span>
      </div>
    </section>
  );
};
