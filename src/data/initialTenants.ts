import { Tenant } from '../types';
import { BROOKS_OF_LIFE_TENANT } from './brooksOfLifeInitialData';

/**
 * Multi-tenant initialization:
 * Brooks of Life UK is provisioned as an independent theological education, TEMS examination & Christian media tenant.
 */
export const INITIAL_TENANTS: Tenant[] = [
  BROOKS_OF_LIFE_TENANT
];

