/**
 * Central Hostname & Domain Resolution Engine for Davetech Multi-Tenant ERP
 * 
 * Supports:
 * - Wildcard DNS (*.davetech.co.ke)
 * - Tenant-Owned Verified Custom Domains (e.g. www.example.com, portal.example.co.ke)
 * - Reserved Platform Subdomains (admin, sales, support, billing, etc.)
 * - Dynamic Multi-Tenant Subdomains (schools, hospitals, saccos, retail, wholesale, churches)
 * - Local development (*.localhost, localhost, 127.0.0.1, query param overrides)
 * - Strict Tenant Isolation (hostname-first resolution, zero tenant crosstalk)
 */

export const RESERVED_PLATFORM_SUBDOMAINS: string[] = [
  'admin',
  'sales',
  'support',
  'billing',
  'api',
  'app',
  'www',
  'mail',
  'help',
  'status',
  'cdn',
  'assets',
  'platform',
  'static',
  'root',
  'default',
  'login',
  'dashboard',
  'portal',
  'davetech',
  'webmail',
  'autodiscover',
  'cpanel',
  'whm'
];

export type PlatformArea = 'admin' | 'sales' | 'support' | 'billing' | 'root';

export type HostContext =
  | { type: 'platform'; area: 'admin' }
  | { type: 'platform'; area: 'sales' }
  | { type: 'platform'; area: 'support' }
  | { type: 'platform'; area: 'billing' }
  | { type: 'platform'; area: 'root' }
  | { type: 'tenant'; slug: string; isCustomDomain?: boolean }
  | { type: 'public' }
  | { type: 'unknown'; hostname: string };

export interface ResolvedDomain {
  type: 'PLATFORM_ROOT' | 'PLATFORM_ADMIN' | 'PLATFORM_SALES' | 'PLATFORM_SUPPORT' | 'PLATFORM_BILLING' | 'TENANT' | 'RESERVED' | 'UNKNOWN';
  tenantSlug: string | null;
  tenantId?: string | null;
  tenantName?: string | null;
  hostname: string;
  isCustomDomain: boolean;
  rawSubdomain: string | null;
  platformArea?: PlatformArea;
  hostContext: HostContext;
  branding?: any;
}

/**
 * Get base platform domain (defaults to davetech.co.ke)
 */
export function getBaseDomain(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BASE_DOMAIN) {
    return (import.meta as any).env.VITE_BASE_DOMAIN.toLowerCase().trim();
  }
  if (typeof process !== 'undefined' && process.env?.BASE_DOMAIN) {
    return process.env.BASE_DOMAIN.toLowerCase().trim();
  }
  return 'davetech.co.ke';
}

/**
 * Checks if a given subdomain is reserved for platform infrastructure
 */
export function isReservedSubdomain(subdomain: string): boolean {
  if (!subdomain) return false;
  const clean = subdomain.trim().toLowerCase();
  return RESERVED_PLATFORM_SUBDOMAINS.includes(clean);
}

/**
 * Normalizes an organization name or input into a safe, valid slug/subdomain
 */
export function normalizeSubdomain(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Normalizes a custom domain or hostname
 */
export function normalizeDomainName(domain: string): string {
  if (!domain) return '';
  return domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .split(':')[0];
}

/**
 * Validates syntax for custom domains
 */
export function validateDomainName(domain: string): { valid: boolean; error?: string } {
  const clean = normalizeDomainName(domain);
  if (!clean) {
    return { valid: false, error: 'Domain name cannot be empty.' };
  }

  const baseDomain = getBaseDomain();
  if (clean === baseDomain || clean === `www.${baseDomain}`) {
    return { valid: false, error: `The root domain ${clean} is reserved for Davetech platform.` };
  }

  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  if (!domainRegex.test(clean) && !clean.endsWith('.localhost')) {
    return { valid: false, error: 'Invalid domain format. Example: portal.organization.co.ke or www.organization.com' };
  }

  return { valid: true };
}

export const CLOUD_DEPLOYMENT_SUFFIXES = [
  '.onrender.com',
  '.render.com',
  '.run.app',
  '.web.app',
  '.firebaseapp.com',
  '.vercel.app',
  '.netlify.app',
  '.railway.app',
  '.up.railway.app',
  '.herokuapp.com',
  '.replit.dev',
  '.repl.co',
  '.pages.dev',
  '.workers.dev',
  '.github.io',
  '.fly.dev',
  '.glitch.me',
  '.surge.sh',
  '.azurewebsites.net',
  '.amazonaws.com',
  '.ngrok-free.app',
  '.ngrok.io',
  '.loca.lt'
];

/**
 * Checks if the hostname is a common cloud deployment platform or local development host.
 */
export function isCloudOrDevHost(hostname: string): boolean {
  if (!hostname) return false;
  const clean = normalizeDomainName(hostname);
  if (clean === 'localhost' || clean === '127.0.0.1') return true;
  return CLOUD_DEPLOYMENT_SUFFIXES.some(suffix => clean.endsWith(suffix));
}

/**
 * Helper to construct a platform area resolution object
 */
function createPlatformResolution(
  area: PlatformArea,
  hostname: string,
  rawSubdomain: string | null
): ResolvedDomain {
  let type: ResolvedDomain['type'] = 'PLATFORM_ROOT';
  if (area === 'admin') type = 'PLATFORM_ADMIN';
  else if (area === 'sales') type = 'PLATFORM_SALES';
  else if (area === 'support') type = 'PLATFORM_SUPPORT';
  else if (area === 'billing') type = 'PLATFORM_BILLING';

  return {
    type,
    tenantSlug: null,
    hostname,
    isCustomDomain: false,
    rawSubdomain,
    platformArea: area,
    hostContext: { type: 'platform', area } as HostContext
  };
}

/**
 * Helper to construct a tenant resolution object
 */
function createTenantResolution(
  slug: string,
  hostname: string,
  isCustomDomain = false
): ResolvedDomain {
  const cleanSlug = slug.toLowerCase().trim();
  return {
    type: 'TENANT',
    tenantSlug: cleanSlug,
    hostname,
    isCustomDomain,
    rawSubdomain: cleanSlug,
    hostContext: { type: 'tenant', slug: cleanSlug, isCustomDomain }
  };
}

/**
 * Parses a hostname and resolves whether it belongs to the Root Website,
 * a Reserved Platform Area (admin, sales, support, billing), a Davetech Subdomain, or a Custom Domain.
 */
export function resolveHostname(hostnameInput?: string, searchParams?: URLSearchParams): ResolvedDomain {
  let hostname = normalizeDomainName(
    hostnameInput || (typeof window !== 'undefined' ? window.location.hostname : '')
  );

  // 1. Check for manual dev query param override (e.g. ?subdomain=apex or ?tenant=dreamline or ?area=sales or ?domain=...)
  let params = searchParams;
  if (!params && typeof window !== 'undefined') {
    if (window.location.search) {
      params = new URLSearchParams(window.location.search);
    } else if (window.location.hash && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      if (hashQuery) {
        params = new URLSearchParams(hashQuery);
      }
    }
  }

  if (params) {
    const areaOverride = params.get('area') || params.get('portal');
    if (areaOverride) {
      const cleanArea = areaOverride.toLowerCase().trim();
      if (cleanArea === 'admin' || cleanArea === 'platform') return createPlatformResolution('admin', hostname, 'admin');
      if (cleanArea === 'sales') return createPlatformResolution('sales', hostname, 'sales');
      if (cleanArea === 'support') return createPlatformResolution('support', hostname, 'support');
      if (cleanArea === 'billing') return createPlatformResolution('billing', hostname, 'billing');
    }

    const customDomainOverride = params.get('customDomain') || params.get('domain');
    if (customDomainOverride) {
      const cleanCustom = normalizeDomainName(customDomainOverride);
      if (cleanCustom) {
        return createTenantResolution(cleanCustom, hostname, true);
      }
    }

    const tenantOverride = params.get('subdomain') || params.get('tenant') || params.get('slug');
    if (tenantOverride) {
      const clean = tenantOverride.toLowerCase().trim();
      if (clean === 'admin' || clean === 'platform') return createPlatformResolution('admin', hostname, 'admin');
      if (clean === 'sales') return createPlatformResolution('sales', hostname, 'sales');
      if (clean === 'support') return createPlatformResolution('support', hostname, 'support');
      if (clean === 'billing') return createPlatformResolution('billing', hostname, 'billing');
      if (clean === 'www' || clean === 'root' || clean === 'davetech' || clean === 'default') {
        return createPlatformResolution('root', hostname, null);
      }
      return createTenantResolution(clean, hostname, false);
    }
  }

  const baseDomain = getBaseDomain();

  // 2. Exact Root Domain match (e.g. davetech.co.ke or www.davetech.co.ke)
  if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    return createPlatformResolution('root', hostname, null);
  }

  // 3. Localhost & Cloud preview deployment domains (e.g. *.run.app, *.onrender.com, localhost)
  if (isCloudOrDevHost(hostname)) {
    // Check if hostname has a subdomain prefix before localhost (e.g. apex.localhost, sales.localhost)
    if (hostname.endsWith('.localhost')) {
      const sub = hostname.split('.')[0].toLowerCase().trim();
      if (sub === 'admin' || sub === 'platform') return createPlatformResolution('admin', hostname, sub);
      if (sub === 'sales') return createPlatformResolution('sales', hostname, sub);
      if (sub === 'support') return createPlatformResolution('support', hostname, sub);
      if (sub === 'billing') return createPlatformResolution('billing', hostname, sub);
      if (sub === 'www' || sub === 'root') return createPlatformResolution('root', hostname, null);
      return createTenantResolution(sub, hostname, false);
    }

    // Default cloud deployment host without query override -> Root Platform Public Website
    return createPlatformResolution('root', hostname, null);
  }

  // 4. Wildcard Subdomain match (e.g. *.davetech.co.ke)
  if (hostname.endsWith(`.${baseDomain}`)) {
    const subdomain = hostname.slice(0, -(baseDomain.length + 1)).toLowerCase().trim();

    // 4.1 Reserved Platform Subdomains (NEVER treated as tenant slugs)
    if (subdomain === 'admin' || subdomain === 'platform') {
      return createPlatformResolution('admin', hostname, subdomain);
    }
    if (subdomain === 'sales') {
      return createPlatformResolution('sales', hostname, subdomain);
    }
    if (subdomain === 'support' || subdomain === 'help') {
      return createPlatformResolution('support', hostname, subdomain);
    }
    if (subdomain === 'billing') {
      return createPlatformResolution('billing', hostname, subdomain);
    }
    if (subdomain === 'www' || subdomain === 'root' || subdomain === 'default') {
      return createPlatformResolution('root', hostname, null);
    }

    // 4.2 Other reserved infrastructure subdomains
    if (isReservedSubdomain(subdomain) && subdomain !== 'app') {
      return {
        type: 'RESERVED',
        tenantSlug: null,
        hostname,
        isCustomDomain: false,
        rawSubdomain: subdomain,
        hostContext: { type: 'unknown', hostname }
      };
    }

    // 4.3 Dynamic Tenant Subdomain (e.g. school.davetech.co.ke -> slug: "school")
    return createTenantResolution(subdomain, hostname, false);
  }

  // 5. Tenant Custom Domain (e.g. www.example.com, portal.example.co.ke)
  // When an unfamiliar external domain hits the server, resolve as custom domain
  return createTenantResolution(hostname, hostname, true);
}

/**
 * Asynchronously resolves domain with backend authoritative resolution
 */
export async function resolveDomainAsync(hostnameInput?: string): Promise<ResolvedDomain> {
  const clientResolved = resolveHostname(hostnameInput);

  // If already identified as a platform area or cloud root, return immediately
  if (clientResolved.type !== 'TENANT') {
    return clientResolved;
  }

  try {
    const targetHost = clientResolved.hostname;
    const query = clientResolved.isCustomDomain
      ? `hostname=${encodeURIComponent(targetHost)}`
      : `subdomain=${encodeURIComponent(clientResolved.tenantSlug || '')}`;

    const res = await fetch(`/api/public/resolve-domain?${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data.type === 'TENANT') {
        return {
          type: 'TENANT',
          tenantSlug: data.tenantSlug || clientResolved.tenantSlug,
          tenantId: data.tenantId,
          tenantName: data.tenantName,
          hostname: targetHost,
          isCustomDomain: !!data.isCustomDomain || clientResolved.isCustomDomain,
          rawSubdomain: data.tenantSlug,
          branding: data.branding,
          hostContext: {
            type: 'tenant',
            slug: data.tenantSlug || clientResolved.tenantSlug || '',
            isCustomDomain: !!data.isCustomDomain
          }
        };
      }
    }
  } catch {
    // Return client-resolved fallback
  }

  return clientResolved;
}

/**
 * Returns the simplified HostContext
 */
export function resolveHostContext(hostname?: string): HostContext {
  const resolved = resolveHostname(hostname);
  return resolved.hostContext;
}

/**
 * Builds the canonical public URL for a tenant subdomain
 */
export function buildTenantUrl(tenantSlug: string, isLocalDev: boolean = false): string {
  const baseDomain = getBaseDomain();
  if (isLocalDev && typeof window !== 'undefined') {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${tenantSlug}.localhost${port}`;
  }
  return `https://${tenantSlug}.${baseDomain}`;
}

/**
 * Builds the canonical public URL for a custom domain
 */
export function buildCustomDomainUrl(customDomain: string): string {
  const clean = normalizeDomainName(customDomain);
  return `https://${clean}`;
}

/**
 * Returns the primary URL for a tenant (prioritizing custom domain if verified and primary)
 */
export function getPrimaryDomainUrl(tenant: { customDomain?: string | null; subdomain?: string; slug: string }): string {
  if (tenant.customDomain && tenant.customDomain.trim()) {
    return buildCustomDomainUrl(tenant.customDomain);
  }
  const slug = tenant.subdomain || tenant.slug;
  return buildTenantUrl(slug);
}
