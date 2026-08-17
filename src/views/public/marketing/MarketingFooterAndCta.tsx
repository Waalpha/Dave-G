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
  ExternalLink,
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
      <section className="relative py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-t border-blue-500/30">
        
        {/* Ambient background styling */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Modernize Your Organization</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight uppercase">
            READY TO RUN YOUR ORGANIZATION BETTER?
          </h2>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Bring your business operations together with Davetech ERP. Connect finance, sales, inventory, academic departments, and people under one secure system.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-blue-700 bg-white hover:bg-blue-50 active:bg-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-7 py-4 text-sm font-bold text-white bg-blue-800/80 hover:bg-blue-800 border border-blue-400/40 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-blue-200" />
              <span>Book a Live Demo</span>
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              No credit card required for consultation
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              Multi-tenant architecture
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              Custom migration support
            </span>
          </div>

        </div>
      </section>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('hero')}>
                <img 
                  src={logoSrc} 
                  alt="Davetech ERP" 
                  className="h-8 w-auto max-w-[160px] object-contain brightness-0 invert"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/davetech-logo.svg';
                  }}
                />
                <span className="text-lg font-black tracking-tight text-white">
                  Davetech ERP
                </span>
              </div>

              <p className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
                One Platform. Every Business.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                A unified multi-tenant cloud ERP platform engineered to connect finance, sales, inventory, human capital, education, retail, and healthcare operations.
              </p>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>sales@davetech.co.ke</span>
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
                Platform
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNav('showcase-slider')} className="hover:text-white transition-colors text-left">Visual Tour</button></li>
                <li><button onClick={() => handleNav('overview')} className="hover:text-white transition-colors text-left">Overview</button></li>
                <li><button onClick={() => handleNav('modules')} className="hover:text-white transition-colors text-left">14+ Modules</button></li>
                <li><button onClick={() => handleNav('architecture')} className="hover:text-white transition-colors text-left">Multi-Tenant</button></li>
                <li><button onClick={() => handleNav('workflows')} className="hover:text-white transition-colors text-left">Workflows</button></li>
                <li><button onClick={() => handleNav('security')} className="hover:text-white transition-colors text-left">Security</button></li>
                <li><button onClick={() => handleNav('pricing')} className="hover:text-white transition-colors text-left">Pricing</button></li>
              </ul>
            </div>

            {/* Solutions Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Solutions
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNav('education-showcase')} className="hover:text-white transition-colors text-left">Education ERP</button></li>
                <li><button onClick={() => handleNav('retail-showcase')} className="hover:text-white transition-colors text-left">Retail & POS</button></li>
                <li><button onClick={() => handleNav('finance-showcase')} className="hover:text-white transition-colors text-left">Connected Finance</button></li>
                <li><button onClick={() => handleNav('reports-analytics')} className="hover:text-white transition-colors text-left">Reports & Analytics</button></li>
                <li><button onClick={() => handleNav('solutions')} className="hover:text-white transition-colors text-left">Healthcare</button></li>
                <li><button onClick={() => handleNav('solutions')} className="hover:text-white transition-colors text-left">Hospitality</button></li>
                <li><button onClick={() => handleNav('solutions')} className="hover:text-white transition-colors text-left">SACCO & Chama</button></li>
                <li><button onClick={() => handleNav('solutions')} className="hover:text-white transition-colors text-left">Wholesale</button></li>
              </ul>
            </div>

            {/* Company & Support Links */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Company
                </h4>
                <ul className="space-y-2">
                  <li><button onClick={() => handleNav('why-davetech')} className="hover:text-white transition-colors text-left">Why Davetech</button></li>
                  <li><button onClick={() => handleNav('how-it-works')} className="hover:text-white transition-colors text-left">How It Works</button></li>
                  <li><button onClick={() => handleNav('faq')} className="hover:text-white transition-colors text-left">FAQ</button></li>
                  <li><button onClick={onSignIn} className="text-blue-400 hover:text-white transition-colors text-left font-semibold">Sign In / Workspace</button></li>
                  <li><button onClick={onOpenDemoModal} className="text-blue-400 hover:underline transition-colors text-left font-semibold">Book a Demo</button></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Support
                </h4>
                <ul className="space-y-2">
                  <li><button onClick={onOpenDemoModal} className="hover:text-white transition-colors text-left">Help & Support</button></li>
                  <li><button onClick={onOpenDemoModal} className="hover:text-white transition-colors text-left">Request Migration</button></li>
                  <li><button onClick={onOpenDemoModal} className="hover:text-white transition-colors text-left">Talk to Sales</button></li>
                </ul>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div>
              © {currentYear} Davetech ERP. All rights reserved. One Platform. Every Business.
            </div>
            <div className="flex items-center space-x-4">
              <span>Multi-Tenant Architecture</span>
              <span>•</span>
              <span>Role-Based Access Control</span>
              <span>•</span>
              <span>Enterprise Grade</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};
