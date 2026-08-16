import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformLayout } from './components/layout/PlatformLayout';
import { TenantLayout } from './components/layout/TenantLayout';
import { LoginView } from './views/auth/LoginView';
import { PlatformDashboard } from './views/platform/PlatformDashboard';
import { PlatformTenants } from './views/platform/PlatformTenants';
import { PlatformAuditLogs } from './views/platform/PlatformAuditLogs';
import { PlatformPlans } from './views/platform/PlatformPlans';
import { PlatformSettings } from './views/platform/PlatformSettings';
import { TenantDashboard } from './views/tenant/TenantDashboard';
import { EducationDashboard } from './views/tenant/education/EducationDashboard';
import { GenericModuleView } from './views/tenant/GenericModuleView';
import { TenantSettings } from './views/tenant/TenantSettings';
import { TenantPublicWebsite } from './views/public/TenantPublicWebsite';
import { DavetechMainWebsite } from './views/public/DavetechMainWebsite';
import { SaccoDashboard } from './views/tenant/chama/SaccoDashboard';
import { PosTerminalView } from './views/tenant/pos/PosTerminalView';
import { RestaurantBarDashboard } from './views/tenant/restaurant/RestaurantBarDashboard';
import { ChurchDashboard } from './views/tenant/church/ChurchDashboard';
import { CoreEnterpriseDashboard } from './views/tenant/enterprise/CoreEnterpriseDashboard';
import { AccessDeniedGuard } from './components/common/AccessDeniedGuard';
import { TenantMismatchGuard } from './components/common/TenantMismatchGuard';
import { resolveHostname, ResolvedDomain } from './lib/domainResolver';
import { Shield, ArrowLeft } from 'lucide-react';

function MainAppContent() {
  const { user, tenant, inspectingTenant, clearInspection, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('/app/dashboard');
  const [platformTab, setPlatformTab] = useState<string>('dashboard');
  const [domainResolution, setDomainResolution] = useState<ResolvedDomain>(() => resolveHostname());

  // Handle Hash Routing & Domain Resolution
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').trim();
      const resolution = resolveHostname();
      setDomainResolution(resolution);

      // Default route based on domain type
      let defaultRoute = '/public';
      if (resolution.type === 'PLATFORM_ADMIN') {
        defaultRoute = '/platform/dashboard';
      }

      const hash = (!rawHash || rawHash === '/' || rawHash === '') ? defaultRoute : rawHash;
      if (hash.startsWith('/platform')) {
        const tab = hash.split('/')[2] || 'dashboard';
        setPlatformTab(tab);
        setCurrentRoute(hash);
      } else {
        setCurrentRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  const navigatePlatformTab = (tab: string) => {
    window.location.hash = `/platform/${tab}`;
    setPlatformTab(tab);
    setCurrentRoute(`/platform/${tab}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading SaaS ERP Environment...</p>
        </div>
      </div>
    );
  }

  // Active tenant slug if accessed on a tenant subdomain or tenant route
  const activeTenantSlug = domainResolution.type === 'TENANT'
    ? (domainResolution.tenantSlug || undefined)
    : (currentRoute.startsWith('/public/') ? currentRoute.replace(/^\/public\/?/, '').trim() : undefined);

  // 0. PUBLIC WEBSITE ROUTE (/ or /public or /public/*)
  if (currentRoute === '/' || currentRoute === '/public' || currentRoute === '/public/' || currentRoute.startsWith('/public/')) {
    const slug = activeTenantSlug;
    
    // If no specific tenant slug is given, display Davetech ERP Main Platform Marketing Website
    if (!slug || slug === 'default' || slug === 'root' || slug === 'www') {
      return (
        <DavetechMainWebsite
          onNavigateToLogin={() => navigateTo('/login')}
          onNavigateToTenant={(tenantSlug) => navigateTo(`/public/${tenantSlug}`)}
          onNavigateToModuleDemo={(modId) => {
            if (modId) {
              // Map module to representative tenant demo
              const moduleTenantMap: Record<string, string> = {
                wholesale: 'dreamline-shop',
                education: 'apex-institute',
                hospital: 'st-jude-hospital',
                sacco: 'blessed-sacco',
                church: 'grace-cathedral',
                pos: 'dreamline-shop',
                retail: 'dreamline-shop',
                bar: 'dreamline-shop'
              };
              const targetSlug = moduleTenantMap[modId] || 'apex-institute';
              navigateTo(`/public/${targetSlug}`);
            } else {
              navigateTo('/login');
            }
          }}
        />
      );
    }

    // Otherwise render the specific organization/tenant's public website (e.g. Dreamline Wholesale, Apex Institute)
    return (
      <TenantPublicWebsite
        tenantSlug={slug}
        onNavigateToLogin={() => navigateTo('/login')}
        onPortalLogin={() => navigateTo('/login')}
        onNavigateToMainPlatform={() => {
          window.location.search = '';
          navigateTo('/public');
        }}
      />
    );
  }

  // 0.1 LOGIN ROUTE (/login) or if unauthenticated on private route
  if (!user || currentRoute === '/login') {
    if (user && currentRoute === '/login') {
      // If user is already authenticated, route them to their dashboard
      if (user.role === 'SUPER_ADMIN' && !inspectingTenant) {
        navigateTo('/platform/dashboard');
      } else {
        navigateTo('/app/dashboard');
      }
    }
    return (
      <LoginView
        tenantSlug={activeTenantSlug}
        onNavigateToPublic={(slug) => navigateTo(slug ? `/public/${slug}` : '/public')}
      />
    );
  }

  // 1. SUPER ADMIN PLATFORM AREA (/platform/*)
  if (user.role === 'SUPER_ADMIN' && !inspectingTenant && (currentRoute.startsWith('/platform') || !currentRoute.startsWith('/app'))) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <PlatformLayout currentTab={platformTab} onSelectTab={navigatePlatformTab}>
          {platformTab === 'dashboard' && <PlatformDashboard onNavigateTab={navigatePlatformTab} />}
          {platformTab === 'tenants' && <PlatformTenants initialTab="tenants" onInspectNavigate={() => navigateTo('/app/dashboard')} />}
          {platformTab === 'users' && <PlatformTenants initialTab="users" onInspectNavigate={() => navigateTo('/app/dashboard')} />}
          {platformTab === 'audit-logs' && <PlatformAuditLogs />}
          {platformTab === 'plans' && <PlatformPlans />}
          {platformTab === 'website-cms' && <PlatformSettings initialTab="website-cms" />}
          {platformTab === 'settings' && <PlatformSettings initialTab="branding" />}
        </PlatformLayout>
      </div>
    );
  }

  // 2. TENANT USER PREVENTED FROM ACCESSING PLATFORM ROUTES
  if (user.role !== 'SUPER_ADMIN' && currentRoute.startsWith('/platform')) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <AccessDeniedGuard
          reason="Platform Administration is reserved strictly for the SaaS Platform Super Admin."
          onNavigateDashboard={() => navigateTo('/app/dashboard')}
        />
      </div>
    );
  }

  // 2.1 CROSS-TENANT MISMATCH GUARD
  if (
    user.role !== 'SUPER_ADMIN' &&
    domainResolution.type === 'TENANT' &&
    domainResolution.tenantSlug &&
    tenant?.slug &&
    domainResolution.tenantSlug.toLowerCase() !== tenant.slug.toLowerCase()
  ) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <TenantMismatchGuard
          currentSubdomainSlug={domainResolution.tenantSlug}
          userTenantName={tenant?.name}
          userTenantSlug={tenant?.slug}
          onNavigateCorrectTenant={() => {
            window.location.search = `?subdomain=${encodeURIComponent(tenant.slug)}`;
            navigateTo('/app/dashboard');
          }}
        />
      </div>
    );
  }

  // 3. TENANT USER WORKSPACE (/app/*)
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Super Admin Workspace Inspection Banner */}
      {user.role === 'SUPER_ADMIN' && inspectingTenant && (
        <div className="bg-purple-900 text-white px-4 py-2 text-xs flex items-center justify-between z-50 border-b border-purple-700 shadow-md">
          <div className="flex items-center space-x-2 font-medium">
            <Shield className="w-4 h-4 text-purple-300" />
            <span>
              Authorized Super Admin Context: Inspecting Workspace <strong>{inspectingTenant?.name || ''}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              clearInspection();
              navigatePlatformTab('tenants');
            }}
            className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded-lg font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Platform Console</span>
          </button>
        </div>
      )}

      <TenantLayout currentRoute={currentRoute} onNavigate={navigateTo}>
        {currentRoute === '/app/dashboard' && <TenantDashboard onNavigate={navigateTo} />}
        {currentRoute === '/app/education' && <EducationDashboard />}
        
        {/* Settings Guard: TENANT_USER cannot access Organization Settings */}
        {currentRoute === '/app/settings' && (
          user.role === 'TENANT_USER' ? (
            <AccessDeniedGuard
              reason="Organization settings are restricted to Tenant Administrators."
              onNavigateDashboard={() => navigateTo('/app/dashboard')}
            />
          ) : (
            <TenantSettings />
          )
        )}

        {/* Production-Ready Industry-Specific & Enterprise ERP Module Views */}
        {currentRoute === '/app/sacco' && (
          <SaccoDashboard />
        )}
        {currentRoute === '/app/pos' && (
          <PosTerminalView
            saleType="POS"
            title="Point of Sale (POS) Terminal"
            subtitle="Fast barcode scanner checkout, cash/M-Pesa payment split and receipts"
          />
        )}
        {currentRoute === '/app/retail' && (
          <PosTerminalView
            saleType="RETAIL"
            title="Retail Store Sales & Billing"
            subtitle="Storefront inventory, retail pricing, discounts, and customer billing"
          />
        )}
        {currentRoute === '/app/wholesale' && (
          <PosTerminalView
            saleType="WHOLESALE"
            title="Wholesale Trade & Distribution"
            subtitle="Bulk item volume pricing, customer accounts, credit balances & dispatches"
          />
        )}
        {currentRoute === '/app/bookshop' && (
          <PosTerminalView
            saleType="BOOKSHOP"
            title="Bookshop & Stationeries POS"
            subtitle="ISBN cataloging, textbooks, stationery sets and bulk school supplies"
          />
        )}
        {currentRoute === '/app/bar' && (
          <RestaurantBarDashboard />
        )}
        {currentRoute === '/app/church' && (
          <ChurchDashboard />
        )}
        {currentRoute === '/app/accounting' && (
          <CoreEnterpriseDashboard defaultTab="accounting" />
        )}
        {currentRoute === '/app/hr' && (
          <CoreEnterpriseDashboard defaultTab="hr" />
        )}
        {currentRoute === '/app/crm' && (
          <CoreEnterpriseDashboard defaultTab="crm" />
        )}
        {currentRoute === '/app/inventory' && (
          <PosTerminalView
            saleType="RETAIL"
            title="Inventory & Stock Control"
            subtitle="Real-time stock on hand, reorder thresholds, unit costs and item categories"
          />
        )}
        {currentRoute === '/app/hospital' && (
          <GenericModuleView moduleId="hospital" onNavigateDashboard={() => navigateTo('/app/dashboard')} />
        )}
        {currentRoute === '/app/general-erp' && (
          <CoreEnterpriseDashboard defaultTab="accounting" />
        )}
        {currentRoute === '/app/reports' && (
          <CoreEnterpriseDashboard defaultTab="accounting" />
        )}
      </TenantLayout>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
