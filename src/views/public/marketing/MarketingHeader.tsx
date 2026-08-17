import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Building2,
  Lock,
  ChevronDown
} from 'lucide-react';

interface MarketingHeaderProps {
  publicLogoUrl?: string;
  onSignIn: () => void;
  onGetStarted: () => void;
  onOpenDemoModal: () => void;
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
  publicLogoUrl,
  onSignIn,
  onGetStarted,
  onOpenDemoModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const logoSrc = publicLogoUrl || '/davetech-logo.svg';

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200' 
          : 'bg-white/85 backdrop-blur-xs border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Zone 1: Single-Element Brand Logo / Wordmark */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <img 
              src={logoSrc} 
              alt="Davetech ERP" 
              className="h-8 sm:h-9 w-auto max-w-[180px] object-contain"
              onError={(e) => {
                // Fallback to built-in SVG mark if broken
                (e.currentTarget as HTMLImageElement).src = '/davetech-logo.svg';
              }}
            />
            <span className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap hidden sm:inline">
              Davetech ERP
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-5 text-xs font-bold text-slate-600">
            <button 
              onClick={() => scrollTo('showcase-slider')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Tour
            </button>
            <button 
              onClick={() => scrollTo('overview')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Overview
            </button>
            <button 
              onClick={() => scrollTo('solutions')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Solutions
            </button>
            <button 
              onClick={() => scrollTo('modules')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Modules
            </button>
            <button 
              onClick={() => scrollTo('architecture')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Multi-Tenant
            </button>
            <button 
              onClick={() => scrollTo('workflows')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Workflows
            </button>
            <button 
              onClick={() => scrollTo('education-showcase')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Education
            </button>
            <button 
              onClick={() => scrollTo('retail-showcase')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Retail & POS
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollTo('faq')} 
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              FAQ
            </button>
          </nav>

          {/* Zone 3: Actions (Sign In & Get Started) */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onOpenDemoModal}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors flex items-center space-x-1.5 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Book Demo</span>
            </button>

            <button
              onClick={onSignIn}
              className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all whitespace-nowrap"
            >
              Sign In
            </button>

            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-lg max-h-[80vh] overflow-y-auto">
          <button 
            onClick={() => scrollTo('showcase-slider')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Visual Tour
          </button>
          <button 
            onClick={() => scrollTo('overview')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Overview
          </button>
          <button 
            onClick={() => scrollTo('solutions')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Industry Solutions
          </button>
          <button 
            onClick={() => scrollTo('modules')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            14+ Modules
          </button>
          <button 
            onClick={() => scrollTo('architecture')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Multi-Tenant Architecture
          </button>
          <button 
            onClick={() => scrollTo('workflows')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Workflows
          </button>
          <button 
            onClick={() => scrollTo('education-showcase')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            School ERP
          </button>
          <button 
            onClick={() => scrollTo('retail-showcase')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Retail & POS
          </button>
          <button 
            onClick={() => scrollTo('pricing')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollTo('faq')} 
            className="w-full text-left py-2 text-xs font-bold text-slate-800 border-b border-slate-100"
          >
            FAQ
          </button>
          
          <div className="pt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemoModal();
              }}
              className="py-2.5 px-3 text-xs font-bold text-slate-800 bg-slate-100 rounded-xl text-center"
            >
              Book Demo
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="py-2.5 px-3 text-xs font-bold text-white bg-blue-600 rounded-xl text-center"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
