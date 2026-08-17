import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  Layers,
  GraduationCap,
  ShoppingBag,
  CreditCard,
  Package,
  BarChart3,
  Building2
} from 'lucide-react';
import { PublicWebsiteMediaItem } from '../../../types';

interface ProductImageCarouselProps {
  customMedia?: PublicWebsiteMediaItem[];
  onOpenDemoModal: () => void;
  onExploreModule?: (moduleId: string) => void;
}

interface DefaultSlide {
  id: string;
  title: string;
  caption: string;
  badge: string;
  description: string;
  category: string;
  imageUrl: string;
  icon: React.ReactNode;
  actionText: string;
  actionTarget: string;
}

const DEFAULT_SLIDES: DefaultSlide[] = [
  {
    id: 'slide_dashboard',
    title: 'Davetech ERP Dashboard',
    caption: 'Your organization at a glance',
    badge: 'CENTRAL COMMAND',
    description: 'Real-time financial summaries, departmental activity logs, pending approvals, and operational health metrics consolidated into a single responsive executive view.',
    category: 'Core Enterprise',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    icon: <Building2 className="w-5 h-5" />,
    actionText: 'Explore Dashboard',
    actionTarget: '#overview'
  },
  {
    id: 'slide_education',
    title: 'Education Management',
    caption: 'Manage students, staff, courses, departments, classes and fees',
    badge: 'HIGHER ED & TVET SUITE',
    description: 'Complete student information system (SIS), online admissions, course registration, KNEC & GPA grading, automated timetable generation, and instant M-Pesa fee reconciliation.',
    category: 'Education Solution',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
    icon: <GraduationCap className="w-5 h-5" />,
    actionText: 'Explore Education ERP',
    actionTarget: '#education-showcase'
  },
  {
    id: 'slide_retail',
    title: 'Retail & POS',
    caption: 'Connect sales, inventory and customers',
    badge: 'HIGH-SPEED COMMERCE',
    description: 'Touch-optimized point of sale, barcode scanning, thermal receipt printing, cash drawer reconciliation, multi-register support, and synchronized inventory across all branches.',
    category: 'Retail & POS',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b445?auto=format&fit=crop&w=1600&q=80',
    icon: <ShoppingBag className="w-5 h-5" />,
    actionText: 'Explore POS System',
    actionTarget: '#retail-showcase'
  },
  {
    id: 'slide_accounting',
    title: 'Accounting & Finance',
    caption: 'Track financial activity and business performance',
    badge: 'STATUTORY COMPLIANCE',
    description: 'Full double-entry general ledger, automated Profit & Loss statements, balance sheets, accounts receivable, payable management, VAT/tax filing, and multi-currency support.',
    category: 'Financial Suite',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
    icon: <CreditCard className="w-5 h-5" />,
    actionText: 'Explore Accounting',
    actionTarget: '#finance-showcase'
  },
  {
    id: 'slide_inventory',
    title: 'Inventory Management',
    caption: 'Manage stock, purchasing and suppliers',
    badge: 'SUPPLY CHAIN AUTOMATION',
    description: 'Multi-warehouse stock tracking, automated low-stock reorder thresholds, batch/serial tracking, purchase order requisitions, supplier rating, and stock valuation reports.',
    category: 'Supply Chain',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
    icon: <Package className="w-5 h-5" />,
    actionText: 'Explore Inventory',
    actionTarget: '#modules'
  },
  {
    id: 'slide_reports',
    title: 'Reports & Analytics',
    caption: 'Turn operational data into useful insights',
    badge: 'BUSINESS INTELLIGENCE',
    description: 'Executive dashboards, dynamic data filters, historical trend graphs, student performance analytics, revenue forecasting, and exportable PDF/Excel compliance reports.',
    category: 'Business Analytics',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    icon: <BarChart3 className="w-5 h-5" />,
    actionText: 'Explore Analytics',
    actionTarget: '#reports-analytics'
  }
];

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  customMedia,
  onOpenDemoModal,
  onExploreModule
}) => {
  // Merge custom slides with fallback defaults if no custom media is available
  const slides = (customMedia && customMedia.length > 0)
    ? customMedia.sort((a, b) => a.order - b.order).map((item, idx) => ({
        id: item.id || `custom_${idx}`,
        title: item.title,
        caption: item.description,
        badge: item.badge || 'PLATFORM SHOWCASE',
        description: item.description,
        category: 'Davetech ERP',
        imageUrl: item.imageUrl,
        icon: <Sparkles className="w-5 h-5" />,
        actionText: item.buttonText || 'Request Live Demo',
        actionTarget: item.buttonLink || '#demo'
      }))
    : DEFAULT_SLIDES;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatic Slide Rotation
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const currentSlide = slides[currentIndex];

  const handleActionClick = (target: string) => {
    if (target === '#demo' || target.includes('demo')) {
      onOpenDemoModal();
    } else if (target.startsWith('#')) {
      const el = document.getElementById(target.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onOpenDemoModal();
      }
    } else if (onExploreModule && target.startsWith('mod_')) {
      onExploreModule(target.replace('mod_', ''));
    } else {
      onOpenDemoModal();
    }
  };

  return (
    <section id="showcase-slider" className="py-20 bg-slate-900 text-white relative overflow-hidden border-y border-slate-800">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Visual Tour</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
            SEE DAVETECH ERP IN ACTION
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Explore the platform and see how Davetech ERP brings different business operations together.
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative bg-slate-950/80 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] lg:min-h-[520px]">
            
            {/* Image Preview Half */}
            <div className="lg:col-span-7 relative overflow-hidden bg-slate-900 flex items-center justify-center">
              <img 
                src={currentSlide.imageUrl} 
                alt={currentSlide.title}
                className="w-full h-full object-cover object-center min-h-[300px] lg:min-h-[520px] transition-all duration-700 ease-out transform group-hover:scale-102"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/90 hidden lg:block" />
              
              {/* Category Pill Over Image */}
              <div className="absolute top-4 left-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-slate-200 shadow-lg">
                <span className="text-blue-400">{currentSlide.icon}</span>
                <span>{currentSlide.category}</span>
              </div>
            </div>

            {/* Content & Caption Half */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-slate-950 relative z-10">
              
              <div className="space-y-4">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-extrabold uppercase tracking-wider">
                  <span>{currentSlide.badge}</span>
                </div>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {currentSlide.title}
                </h3>

                {/* Caption / Subtitle */}
                <p className="text-sm sm:text-base font-semibold text-blue-300 italic">
                  "{currentSlide.caption}"
                </p>

                {/* Detailed Description */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentSlide.description}
                </p>
              </div>

              {/* Action and Controls Footer */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => handleActionClick(currentSlide.actionTarget)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <span>{currentSlide.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Quick Slide Navigation Arrows */}
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-400 px-2">
                    {currentIndex + 1} / {slides.length}
                  </span>

                  <button
                    onClick={handleNext}
                    aria-label="Next Slide"
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                    className="w-9 h-9 rounded-lg bg-slate-850 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-750 ml-1"
                    title={isPlaying ? 'Pause auto-sliding' : 'Resume auto-sliding'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Dots Indicator Strip */}
          <div className="bg-slate-900/90 py-3 px-6 border-t border-slate-800/80 flex items-center justify-center space-x-2 overflow-x-auto">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                className={`transition-all duration-300 rounded-full h-2 ${
                  currentIndex === idx 
                    ? 'w-8 bg-blue-500' 
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
