/**
 * Domain & Subdomain Resolution Engine for Davetech Multi-Tenant ERP
 * Supports Wildcard DNS (*.davetech.co.ke), Localhost subdomains (*.localhost),
 * Custom domains, and preview query/hash overrides.
 */

export const RESERVED_SUBDOMAINS = [
  'admin',
  'api',
  'app',
  'www',
  'mail',
  'support',
  'help',
  'billing',
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

export interface ResolvedDomain {
  type: 'PLATFORM_ROOT' | 'PLATFORM_ADMIN' | 'TENANT' | 'RESERVED';
  tenantSlug: string | null;
  hostname: string;
  isCustomDomain: boolean;
  rawSubdomain: string | null;
}

/**
 * Get base platform domain (defaults to davetech.co.ke)
 */
export function getBaseDomain(): string {
  // Vite client-side env
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  if (metaEnv && metaEnv.VITE_BASE_DOMAIN) {
    return metaEnv.VITE_BASE_DOMAIN.toLowerCase().trim();
  }
  // Node.js server-side env
  if (typeof process !== 'undefined' && process.env && process.env.BASE_DOMAIN) {
    return process.env.BASE_DOMAIN.toLowerCase().trim();
  }
  return 'davetech.co.ke';
}

/**
 * Checks if a given subdomain is reserved
 */
export function isReservedSubdomain(subdomain: string): boolean {
  if (!subdomain) return false;
  const clean = subdomain.trim().toLowerCase();
  return RESERVED_SUBDOMAINS.includes(clean);
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
  const clean = hostname.toLowerCase().trim();
  if (clean === 'localhost' || clean === '127.0.0.1') return true;
  return CLOUD_DEPLOYMENT_SUFFIXES.some(suffix => clean.endsWith(suffix));
}

/**
 * Parses a hostname (browser window.location.hostname or server req.hostname)
 * and resolves whether it belongs to the Root Website, Platform Admin, or a Tenant.
 */
export function resolveHostname(hostnameInput?: string, searchParams?: URLSearchParams): ResolvedDomain {
  let hostname = (hostnameInput || (typeof window !== 'undefined' ? window.location.hostname : ''))
    .toLowerCase()
    .trim();

  // Strip port if present
  if (hostname.includes(':')) {
    hostname = hostname.split(':')[0];
  }

  // 1. Check for manual dev query param override (e.g. ?subdomain=brightacademy or ?tenant=apex-institute)
  if (searchParams) {
    const override = searchParams.get('subdomain') || searchParams.get('tenant');
    if (override) {
      const cleanOverride = override.toLowerCase().trim();
      if (cleanOverride === 'admin' || cleanOverride === 'platform') {
        return {
          type: 'PLATFORM_ADMIN',
          tenantSlug: null,
          hostname,
          isCustomDomain: false,
          rawSubdomain: 'admin'
        };
      }
      if (cleanOverride === 'www' || cleanOverride === 'root' || cleanOverride === 'davetech' || cleanOverride === 'default') {
        return {
          type: 'PLATFORM_ROOT',
          tenantSlug: null,
          hostname,
          isCustomDomain: false,
          rawSubdomain: null
        };
      }
      return {
        type: 'TENANT',
        tenantSlug: cleanOverride,
        hostname,
        isCustomDomain: false,
        rawSubdomain: cleanOverride
      };
    }
  }

  // Also check window.location.search in browser if not explicitly passed
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('subdomain') || params.get('tenant');
    if (override) {
      const cleanOverride = override.toLowerCase().trim();
      if (cleanOverride === 'admin' || cleanOverride === 'platform') {
        return {
          type: 'PLATFORM_ADMIN',
          tenantSlug: null,
          hostname,
          isCustomDomain: false,
          rawSubdomain: 'admin'
        };
      }
      if (cleanOverride === 'www' || cleanOverride === 'root' || cleanOverride === 'davetech' || cleanOverride === 'default') {
        return {
          type: 'PLATFORM_ROOT',
          tenantSlug: null,
          hostname,
          isCustomDomain: false,
          rawSubdomain: null
        };
      }
      return {
        type: 'TENANT',
        tenantSlug: cleanOverride,
        hostname,
        isCustomDomain: false,
        rawSubdomain: cleanOverride
      };
    }
  }

  const baseDomain = getBaseDomain();

  // 2. Cloud deployment domains (e.g. davetech-2026.onrender.com, *.run.app, *.vercel.app, localhost)
  if (isCloudOrDevHost(hostname)) {
    // Check if hostname has a subdomain prefix before localhost, e.g. brightacademy.localhost
    if (hostname.endsWith('.localhost')) {
      const parts = hostname.split('.');
      const sub = parts[0];
      if (sub === 'admin' || sub === 'platform') {
        return {
          type: 'PLATFORM_ADMIN',
          tenantSlug: null,
          hostname,
          isCustomDomain: false,
          rawSubdomain: sub
        };
      }
      if (sub === 'www') {
        return {
          type: 'PLATFORM_ROOT',
          tenantSlug: null,
          hostname,
          isCustomDomain: false,
          rawSubdomain: null
        };
      }
      return {
        type: 'TENANT',
        tenantSlug: sub,
        hostname,
        isCustomDomain: false,
        rawSubdomain: sub
      };
    }

    // Default cloud deployment host without query override -> Root Platform
    return {
      type: 'PLATFORM_ROOT',
      tenantSlug: null,
      hostname,
      isCustomDomain: false,
      rawSubdomain: null
    };
  }

  // 3. Exact Root Domain match (e.g. davetech.co.ke or www.davetech.co.ke)
  if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    return {
      type: 'PLATFORM_ROOT',
      tenantSlug: null,
      hostname,
      isCustomDomain: false,
      rawSubdomain: null
    };
  }

  // 4. Wildcard Subdomain match (e.g. *.davetech.co.ke)
  if (hostname.endsWith(`.${baseDomain}`)) {
    const subdomain = hostname.slice(0, -(baseDomain.length + 1)).toLowerCase().trim();

    // Check Platform Admin subdomain: admin.davetech.co.ke
    if (subdomain === 'admin' || subdomain === 'platform') {
      return {
        type: 'PLATFORM_ADMIN',
        tenantSlug: null,
        hostname,
        isCustomDomain: false,
        rawSubdomain: subdomain
      };
    }

    // Check other reserved subdomains (api, support, etc.)
    if (isReservedSubdomain(subdomain) && subdomain !== 'app') {
      return {
        type: 'RESERVED',
        tenantSlug: null,
        hostname,
        isCustomDomain: false,
        rawSubdomain: subdomain
      };
    }

    // Valid Tenant Subdomain: brightacademy.davetech.co.ke
    return {
      type: 'TENANT',
      tenantSlug: subdomain,
      hostname,
      isCustomDomain: false,
      rawSubdomain: subdomain
    };
  }

  // 5. Custom Domain fallback:
  // If it's a domain that doesn't match base domain or cloud provider, treat as Root Platform unless specified
  return {
    type: 'PLATFORM_ROOT',
    tenantSlug: null,
    hostname,
    isCustomDomain: false,
    rawSubdomain: null
  };
}

/**
 * Builds the canonical public URL for a tenant
 */
export function buildTenantUrl(tenantSlug: string, isLocalDev: boolean = false): string {
  const baseDomain = getBaseDomain();
  if (isLocalDev && typeof window !== 'undefined') {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${tenantSlug}.localhost${port}`;
  }
  return `https://${tenantSlug}.${baseDomain}`;
}
