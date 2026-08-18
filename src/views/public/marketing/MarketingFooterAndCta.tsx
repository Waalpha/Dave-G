import React from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Layers, 
  CheckCircle2,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

interface MarketingFooterAndCtaProps {
  publicLogoUrl?: string;
  onGetStarted: () => void;
  onOpenDemoModal: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onSignIn?: () => void;
}

export const MarketingFooterAndCta: React.FC<MarketingFooterAndCtaProps> = ({
  publicLogoUrl,
  onGetStarted,
  onOpenDemoModal,
  onNavigateSection,
  onSignIn
}) => {
  const currentYear = new Date().getFullYear();

  const handleNav = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const logoSrc = publicLogoUrl || '/davetech-logo.svg';

  return (
    <div>
      {/* FINAL FULL-WIDTH CALL TO ACTION SECTION */}
      <section className="relative py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-slate-950 via-[#0B192C] to-slate-950 text-white border-t border-slate-800">
        
        {/* Ambient background lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modernize Your Organization</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to Transform Your Organization with Davetech ERP?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Unify your finance, sales, inventory, academic departments, and operations on one intelligent cloud ERP platform.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-extrabold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-xl shadow-xl shadow-blue-600/35 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Book a Live Demo</span>
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              No credit card required for consultation
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Bank-grade 256-bit encryption
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Comprehensive migration support
            </span>
          </div>

        </div>
      </section>

      {/* COMPREHENSIVE 5-COLUMN FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('hero')}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 p-1.5 flex items-center justify-center">
                  <img 
                    src={logoSrc} 
                    alt="DAVETECH ERP" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/davetech-logo.svg';
                    }}
                  />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  DAVETECH <span className="text-cyan-400">ERP</span>
                </span>
              </div>

              <p className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
                An all-in-one cloud ERP platform for modern organizations.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
                Connecting finance, sales, inventory, human resources, education, healthcare, and enterprise operations into one unified cloud solution.
              </p>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>support@davetech.co.ke</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>https://davetech.co.ke</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Navigation
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNav('hero')} className="hover:text-white transition-colors text-left cursor-pointer">Home</button></li>
                <li><button onClick={() => handleNav('solutions')} className="hover:text-white transition-colors text-left cursor-pointer">Solutions</button></li>
                <li><button onClick={() => handleNav('modules')} className="hover:text-white transition-colors text-left cursor-pointer">Modules</button></li>
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">Industries</button></li>
                <li><button onClick={() => handleNav('pricing')} className="hover:text-white transition-colors text-left cursor-pointer">Pricing</button></li>
                <li><button onClick={() => handleNav('about')} className="hover:text-white transition-colors text-left cursor-pointer">About</button></li>
              </ul>
            </div>

            {/* Industries Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Industries
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">Education ERP</button></li>
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">Business & Commercial</button></li>
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">Healthcare & Clinical</button></li>
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">Retail & POS</button></li>
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">Church Management</button></li>
                <li><button onClick={() => handleNav('industries')} className="hover:text-white transition-colors text-left cursor-pointer">SACCO & Chama</button></li>
              </ul>
            </div>

            {/* Account & Support Links */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Access & Support
                </h4>
                <ul className="space-y-2">
                  <li><button onClick={onSignIn} className="text-cyan-400 hover:text-white transition-colors text-left font-semibold cursor-pointer">Portal Login</button></li>
                  <li><button onClick={onOpenDemoModal} className="hover:text-white transition-colors text-left cursor-pointer">Book a Demo</button></li>
                  <li><button onClick={() => handleNav('faq')} className="hover:text-white transition-colors text-left cursor-pointer">Frequently Asked Questions</button></li>
                  <li><button onClick={onOpenDemoModal} className="hover:text-white transition-colors text-left cursor-pointer">Contact Sales Team</button></li>
                </ul>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Security Indicators */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div>
              © {currentYear} DAVETECH ERP. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Cloud Security</span>
              </span>
              <span>•</span>
              <span>256-bit TLS Encryption</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};
