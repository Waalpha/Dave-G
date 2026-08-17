import React, { useState, useEffect } from 'react';
import { MarketingHeader } from './marketing/MarketingHeader';
import { MarketingHero } from './marketing/MarketingHero';
import { TrustBar } from './marketing/TrustBar';
import { ProductImageCarousel } from './marketing/ProductImageCarousel';
import { PlatformOverview } from './marketing/PlatformOverview';
import { IndustrySolutions } from './marketing/IndustrySolutions';
import { PlatformModulesGrid } from './marketing/PlatformModulesGrid';
import { MultiTenantSection } from './marketing/MultiTenantSection';
import { ProductShowcaseAlternating } from './marketing/ProductShowcaseAlternating';
import { EducationSolutionSection } from './marketing/EducationSolutionSection';
import { RetailSolutionSection } from './marketing/RetailSolutionSection';
import { FinanceOperationsSection } from './marketing/FinanceOperationsSection';
import { ReportsAnalyticsSection } from './marketing/ReportsAnalyticsSection';
import { SecurityArchitectureSection } from './marketing/SecurityArchitectureSection';
import { WhyDavetechSection } from './marketing/WhyDavetechSection';
import { HowItWorksSection } from './marketing/HowItWorksSection';
import { PricingSection } from './marketing/PricingSection';
import { FaqSection } from './marketing/FaqSection';
import { MarketingFooterAndCta } from './marketing/MarketingFooterAndCta';
import { DemoRequestModal } from './marketing/DemoRequestModal';
import { ModuleDetailModal } from './marketing/ModuleDetailModal';
import { PlatformSettings } from '../../types';

interface DavetechMainWebsiteProps {
  onSignInClick?: () => void;
  onNavigateToLogin?: () => void;
  onSelectTenantDemo?: (tenantId: string) => void;
  onNavigateToTenant?: (tenantSlug: string) => void;
  onNavigateToTenantWorkspace?: (tenantSlug: string) => Promise<void>;
  onNavigateToModuleDemo?: (modId: string) => void;
}

export const DavetechMainWebsite: React.FC<DavetechMainWebsiteProps> = ({
  onSignInClick,
  onNavigateToLogin,
  onSelectTenantDemo,
  onNavigateToTenant,
  onNavigateToTenantWorkspace,
  onNavigateToModuleDemo
}) => {
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [selectedModuleForModal, setSelectedModuleForModal] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  // Load platform public settings (branding, custom logo, media slides)
  useEffect(() => {
    fetch('/api/platform/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(err => {
        console.warn('Failed to load platform settings from API, using defaults:', err);
      });
  }, []);

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    } else if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.hash = '/login';
    }
  };

  const handleGetStarted = () => {
    setDemoModalOpen(true);
  };

  const handleOpenDemoModal = () => {
    setDemoModalOpen(true);
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleForModal(moduleId);
  };

  const handleCloseModuleModal = () => {
    setSelectedModuleForModal(null);
  };

  const publicLogo = settings?.publicWebsiteLogoUrl || settings?.publicWebsite?.publicLogoUrl || settings?.logoUrl || '/davetech-logo.svg';
  const customMedia = settings?.publicWebsiteMedia || settings?.publicWebsite?.mediaSlides;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* 1. Header (uses public website logo) */}
      <MarketingHeader 
        publicLogoUrl={publicLogo}
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
        onOpenDemoModal={handleOpenDemoModal}
      />

      <main className="flex-grow">
        {/* 2. Hero */}
        <MarketingHero 
          onGetStarted={handleGetStarted}
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 3. Platform Capabilities Strip */}
        <TrustBar />

        {/* 4. Visual Image Slider / Carousel */}
        <ProductImageCarousel 
          customMedia={customMedia}
          onOpenDemoModal={handleOpenDemoModal}
          onExploreModule={handleSelectModule}
        />

        {/* 5. What is Davetech ERP? */}
        <PlatformOverview 
          onExploreClick={() => {
            const el = document.getElementById('modules');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 6. Industry Solutions (8 Comprehensive Cards) */}
        <IndustrySolutions 
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 7. ERP Modules (14 Modular Cards) */}
        <PlatformModulesGrid 
          onSelectModule={handleSelectModule}
        />

        {/* 8. Multi-Tenant Architecture Visual */}
        <MultiTenantSection />

        {/* 9. Dashboard / Product Showcase (Alternating Workflows) */}
        <ProductShowcaseAlternating 
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 10. Education Solution Section */}
        <EducationSolutionSection 
          onOpenDemoModal={handleOpenDemoModal}
          onExploreModule={handleSelectModule}
        />

        {/* 11. Retail / POS Solution Section */}
        <RetailSolutionSection 
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 12. Finance & Business Operations Section */}
        <FinanceOperationsSection 
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 13. Reports & Analytics Section */}
        <ReportsAnalyticsSection 
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 14. Security & Governance Architecture Section */}
        <SecurityArchitectureSection />

        {/* 15. Why Davetech ERP Section (6 Cards) */}
        <WhyDavetechSection />

        {/* 16. How It Works Section (3 Steps) */}
        <HowItWorksSection 
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 17. Plans & Pricing Section */}
        <PricingSection 
          configuredPlans={settings?.publicWebsite?.pricingPlans}
          onOpenDemoModal={handleOpenDemoModal}
        />

        {/* 18. FAQ Section */}
        <FaqSection 
          onOpenDemoModal={handleOpenDemoModal}
        />
      </main>

      {/* 19. Final CTA & Comprehensive 5-Column Footer */}
      <MarketingFooterAndCta 
        publicLogoUrl={publicLogo}
        onGetStarted={handleGetStarted}
        onOpenDemoModal={handleOpenDemoModal}
        onSignIn={handleSignIn}
      />

      {/* 20. Interactive Lead Capture and Module Modals */}
      <DemoRequestModal 
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />

      <ModuleDetailModal 
        moduleId={selectedModuleForModal}
        onClose={handleCloseModuleModal}
        onRequestDemoForModule={() => {
          setSelectedModuleForModal(null);
          setDemoModalOpen(true);
        }}
      />
    </div>
  );
};
