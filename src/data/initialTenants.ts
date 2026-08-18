import { Tenant } from '../types';

/**
 * Clean multi-tenant initialization:
 * No hardcoded customer organizations exist by default.
 * All customer institutions/organizations are dynamically provisioned by Platform Super Admins 
 * or self-registered via public signup flows.
 */
export const INITIAL_TENANTS: Tenant[] = [];
