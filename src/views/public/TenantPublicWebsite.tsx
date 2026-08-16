import React, { useState, useEffect } from 'react';
import { PublicTenantResponse } from '../../types';
import { TenantNotFound } from '../../components/common/TenantNotFound';

// Modular Industry Templates
import { WholesaleWebsiteTemplate } from './templates/WholesaleWebsiteTemplate';
import { RetailWebsiteTemplate } from './templates/RetailWebsiteTemplate';
import { HealthcareWebsiteTemplate } from './templates/HealthcareWebsiteTemplate';
import { SaccoChamaWebsiteTemplate } from './templates/SaccoChamaWebsiteTemplate';
import { ChurchWebsiteTemplate } from './templates/ChurchWebsiteTemplate';
import { HospitalityWebsiteTemplate } from './templates/HospitalityWebsiteTemplate';
import { EnterpriseBusinessWebsiteTemplate } from './templates/EnterpriseBusinessWebsiteTemplate';
import { EducationWebsiteTemplate } from './templates/EducationWebsiteTemplate';
import { SafeConfigurationUnavailable } from './templates/SafeConfigurationUnavailable';

interface TenantPublicWebsiteProps {
  tenantSlug?: string;
  onNavigateToLogin?: (tenantId?: string) => void;
  onPortalLogin?: (tenantId?: string) => void;
  onNavigateToMainPlatform?: () => void;
}

export const TenantPublicWebsite: React.FC<TenantPublicWebsiteProps> = ({
  tenantSlug = '',
  onNavigateToLogin,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const handleLoginNavigation = onNavigateToLogin || onPortalLogin;
  const [data, setData] = useState<PublicTenantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantData();
  }, [tenantSlug]);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cleanSlug = (tenantSlug || '').trim();
      const endpoint = cleanSlug && cleanSlug !== 'default' && cleanSlug !== 'undefined'
        ? `/api/public/tenant/${encodeURIComponent(cleanSlug)}`
        : `/api/public/tenant`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('TENANT_NOT_FOUND');
        }
        throw new Error('Failed to load institution public landing page.');
      }
      const json: PublicTenantResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading the website.');
    } finally {
      setLoading(false);
    }
  };

  const handlePortalLogin = () => {
    if (handleLoginNavigation && data?.tenant) {
      handleLoginNavigation(data.tenant.id);
    } else if (handleLoginNavigation) {
      handleLoginNavigation();
    } else {
      window.location.hash = '/app/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-300">Resolving workspace portal...</p>
      </div>
    );
  }

  if (error || !data || !data.tenant) {
    return (
      <TenantNotFound
        attemptedSlug={tenantSlug}
        onNavigateHome={() => {
          if (onNavigateToMainPlatform) {
            onNavigateToMainPlatform();
          } else {
            window.location.hash = '/public';
          }
        }}
      />
    );
  }

  const tenantType = (data.tenant.type || '').toUpperCase();

  // Multi-Tenant Industry Renderer Dispatcher
  // A Wholesale/Shop tenant will strictly render WholesaleWebsiteTemplate.
  // NO default fallback to School under any circumstances.
  switch (tenantType) {
    case 'WHOLESALE':
      return (
        <WholesaleWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'RETAIL':
    case 'POS':
    case 'BOOKSHOP':
      return (
        <RetailWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'HOSPITAL':
      return (
        <HealthcareWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'SACCO':
      return (
        <SaccoChamaWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'CHURCH':
      return (
        <ChurchWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'RESTAURANT':
    case 'BAR':
      return (
        <HospitalityWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'GENERAL_ERP':
      return (
        <EnterpriseBusinessWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    case 'EDUCATION':
      return (
        <EducationWebsiteTemplate
          data={data}
          tenantSlug={tenantSlug || data.tenant.slug}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );

    default:
      // Safe fallback state - strictly NEVER render school content for unknown types
      return (
        <SafeConfigurationUnavailable
          tenant={data.tenant}
          onPortalLogin={handlePortalLogin}
          onNavigateToMainPlatform={onNavigateToMainPlatform}
        />
      );
  }
};
