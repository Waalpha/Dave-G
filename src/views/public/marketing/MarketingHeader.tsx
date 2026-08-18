import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface MarketingHeaderProps {
  publicLogoUrl?: string;
  onSignIn: () => void;
  onGetStarted: () => void;
  onOpenDemoModal?: () => void;
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-slate-950/20 border-b border-slate-800' 
          : 'bg-transparent border-b border-slate-800/40 backdrop-blur-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Zone 1: Davetech ERP Brand Logo */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer group py-1" 
            onClick={() => scrollTo('hero')}
          >
            <img 
              src={logoSrc} 
              alt="DAVETECH ERP" 
              className="h-12 sm:h-14 md:h-16 w-auto max-h-16 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/davetech-logo.svg';
              }}
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white whitespace-nowrap leading-none">
                DAVETECH <span className="text-cyan-400">ERP</span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mt-1 hidden sm:inline">
                Cloud Enterprise Platform
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Home, Solutions, Modules, Industries, Pricing, About) */}
          <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2 text-sm font-semibold text-slate-300">
            <button 
              onClick={() => scrollTo('hero')} 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollTo('solutions')} 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap cursor-pointer"
            >
              Solutions
            </button>
            <button 
              onClick={() => scrollTo('modules')} 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap cursor-pointer"
            >
              Modules
            </button>
            <button 
              onClick={() => scrollTo('industries')} 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap cursor-pointer"
            >
              Industries
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollTo('about')} 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Zone 3: Actions (Login & Get Started) */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onSignIn}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Login</span>
            </button>

            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-98 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-b border-slate-800 px-5 pt-4 pb-6 space-y-2 shadow-2xl text-slate-200">
          <button 
            onClick={() => scrollTo('hero')} 
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
          >
            <span>Home</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => scrollTo('solutions')} 
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
          >
            <span>Solutions</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => scrollTo('modules')} 
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
          >
            <span>Modules</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => scrollTo('industries')} 
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
          >
            <span>Industries</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => scrollTo('pricing')} 
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
          >
            <span>Pricing</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => scrollTo('about')} 
            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
          >
            <span>About</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          
          <div className="pt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="py-3 px-3 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl text-center cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="py-3 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl text-center cursor-pointer shadow-md shadow-blue-600/30"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
