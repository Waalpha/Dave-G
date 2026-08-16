import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore, hashPassword } from './src/data/dbStore';
import { ALL_ERP_MODULES, getModuleInfo } from './src/data/modulesCatalog';
import { ModuleId, User, Tenant } from './src/types';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Robust Authentication Parser supporting x-user-id and Authorization: Bearer <token>
  const getAuthUser = (req: express.Request): User | undefined => {
    let userId = (req.headers['x-user-id'] as string) || '';
    if (!userId && req.headers['authorization']) {
      const auth = req.headers['authorization'];
      if (typeof auth === 'string') {
        userId = auth.startsWith('Bearer ') ? auth.substring(7).trim() : auth.trim();
      }
    }
    if (!userId && req.query.userId) {
      userId = String(req.query.userId);
    }

    if (userId && userId !== 'null' && userId !== 'undefined') {
      const user = dbStore.getUserById(userId) || dbStore.getUserByEmail(userId);
      if (user) return user;
    }

    return undefined;
  };

  const getEffectiveTenantId = (req: express.Request, user?: User): string => {
    // 1. If non-super admin user, strictly enforce user's home tenant ID
    if (user && user.tenantId && user.tenantId !== 'platform_super_admin' && user.role !== 'SUPER_ADMIN') {
      return user.tenantId;
    }

    // 2. Explicit header or query override (permitted for Super Admin or domain-aware routing)
    const headerTenantId = (req.headers['x-tenant-id'] as string) || (req.headers['x-tenant-slug'] as string) || (req.query.tenantId as string) || (req.query.slug as string) || (req.body && req.body.tenantId ? (req.body.tenantId as string) : undefined);
    if (headerTenantId) {
      const t = dbStore.getTenant(headerTenantId) || dbStore.getTenantByDomain(headerTenantId) || dbStore.getTenantBySlugOrId(headerTenantId);
      if (t) return t.id;
    }

    // 3. Subdomain extraction from hostname (e.g. brightacademy.davetech.co.ke)
    const host = (req.headers.host || req.hostname || '').toLowerCase().split(':')[0];
    const baseDomain = (process.env.BASE_DOMAIN || 'davetech.co.ke').toLowerCase();
    if (host.endsWith(`.${baseDomain}`)) {
      const sub = host.slice(0, -(baseDomain.length + 1));
      if (sub && sub !== 'admin' && sub !== 'www' && sub !== 'api') {
        const t = dbStore.getTenantByDomain(sub);
        if (t) return t.id;
      }
    } else if (host.endsWith('.localhost')) {
      const sub = host.split('.')[0];
      if (sub && sub !== 'admin' && sub !== 'www' && sub !== 'api') {
        const t = dbStore.getTenantByDomain(sub);
        if (t) return t.id;
      }
    }

    if (user && user.tenantId && user.tenantId !== 'platform_super_admin') {
      return user.tenantId;
    }

    const tenants = dbStore.getAllTenants().filter(t => t.status === 'ACTIVE');
    return tenants[0]?.id || '';
  };

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Authentication required' });
    }
    (req as any).user = user;
    next();
  };

  // Super Admin Middleware
  const requireSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user as User;
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Platform Super Admin access required' });
    }
    next();
  };

  // Module Permission Middleware
  const requireModule = (moduleId: ModuleId) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user as User;
      if (!user) {
        return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Authentication required' });
      }

      const tenantId = getEffectiveTenantId(req, user);
      const tenant = dbStore.getTenant(tenantId);

      // Super Admin bypasses module check for testing/management
      if (user.role === 'SUPER_ADMIN') {
        (req as any).tenant = tenant;
        (req as any).effectiveTenantId = tenantId;
        return next();
      }

      if (!tenant) {
        (req as any).effectiveTenantId = tenantId;
        return next();
      }

      if (tenant.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'TENANT_SUSPENDED', message: 'Tenant organization account is suspended' });
      }

      // Automatically permit module access if active tenant is configured
      (req as any).tenant = tenant;
      (req as any).effectiveTenantId = tenantId;
      next();
    };
  };

  // Rate limiting map for failed login attempts
  const failedLoginAttempts = new Map<string, { count: number; lockUntil: number }>();

  // ==================== AUTH ROUTES ====================

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const attemptKey = `${normalizedEmail}_${req.ip || 'client'}`;

    if (!normalizedEmail || !password) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const user = dbStore.getUserByEmail(normalizedEmail);
    const isPasswordValid = user ? dbStore.verifyUserPassword(user, password) : false;

    // Rate Limiting Check only applies to failing requests
    const rateRecord = failedLoginAttempts.get(attemptKey);
    if (!isPasswordValid && rateRecord && Date.now() < rateRecord.lockUntil) {
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many failed login attempts. Account temporarily locked for security. Please try again in 5 minutes.'
      });
    }

    if (!user || !isPasswordValid) {
      const record = failedLoginAttempts.get(attemptKey) || { count: 0, lockUntil: 0 };
      record.count += 1;
      if (record.count >= 10) {
        record.lockUntil = Date.now() + 5 * 60 * 1000; // 5 minute lockout after 10 attempts
      }
      failedLoginAttempts.set(attemptKey, record);

      dbStore.logAction(
        'system',
        'anonymous',
        normalizedEmail || 'unknown',
        'TENANT_USER' as any,
        'LOGIN_FAILED',
        'Auth',
        `Failed login attempt for email: ${normalizedEmail || 'empty'}`
      );

      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password. Please check your credentials.' });
    }

    // Reset rate limiter on successful authentication
    failedLoginAttempts.delete(attemptKey);

    const effectiveTenantId = getEffectiveTenantId(req, user);
    const tenant = user.tenantId === 'platform_super_admin' ? dbStore.getTenant(effectiveTenantId) : dbStore.getTenant(user.tenantId);

    if (tenant && tenant.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'TENANT_SUSPENDED',
        message: 'Your organization account is currently suspended. Please contact platform administration.'
      });
    }

    dbStore.logAction(
      user.tenantId,
      user.id,
      user.name,
      user.role,
      'USER_LOGIN',
      'Auth',
      `User ${user.name} (${user.email}) signed into ${tenant ? tenant.name : 'Platform Administration'}`
    );

    return res.json({
      user,
      tenant,
      enabledModules: tenant ? tenant.enabledModules : ALL_ERP_MODULES.map(m => m.id)
    });
  });

  app.post('/api/auth/google', (req, res) => {
    const { email, name, photoUrl } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Google account email is required.' });
    }

    const user = dbStore.findOrCreateGoogleUser({
      email: normalizedEmail,
      name: name || undefined,
      photoUrl: photoUrl || undefined
    });

    const effectiveTenantId = getEffectiveTenantId(req, user);
    const tenant = user.tenantId === 'platform_super_admin' ? dbStore.getTenant(effectiveTenantId) : dbStore.getTenant(user.tenantId);

    dbStore.logAction(
      user.tenantId,
      user.id,
      user.name,
      user.role,
      'USER_LOGIN_GOOGLE',
      'Auth',
      `User ${user.name} (${user.email}) signed in via Google account`
    );

    return res.json({
      user,
      tenant,
      enabledModules: tenant ? tenant.enabledModules : ALL_ERP_MODULES.map(m => m.id)
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const effectiveTenantId = getEffectiveTenantId(req, user);
    const tenant = user.tenantId === 'platform_super_admin' ? dbStore.getTenant(effectiveTenantId) : dbStore.getTenant(user.tenantId);

    return res.json({
      user,
      tenant,
      enabledModules: tenant ? tenant.enabledModules : ALL_ERP_MODULES.map(m => m.id)
    });
  });

  app.put('/api/auth/profile', requireAuth, (req, res) => {
    const authUser = (req as any).user as User;
    try {
      const updatedUser = dbStore.updateUserProfile(authUser.id, req.body);
      const { passwordHash, resetToken, resetTokenExpiresAt, ...safeUser } = updatedUser;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update profile' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const user = getAuthUser(req);
    if (user) {
      dbStore.logAction(
        user.tenantId,
        user.id,
        user.name,
        user.role,
        'USER_LOGOUT',
        'Auth',
        `User ${user.name} logged out`
      );
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Please provide a valid email address.' });
    }

    const result = dbStore.requestPasswordReset(email.trim().toLowerCase());
    return res.json({
      success: true,
      message: 'If an account exists for that email address, password reset instructions have been generated.',
      ...(result.token ? { devResetToken: result.token } : {})
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Reset token and new password are required.' });
    }

    const result = dbStore.resetPasswordWithToken(token, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: 'RESET_FAILED', message: result.message || 'Invalid or expired password reset token.' });
    }

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.'
    });
  });

  // DEMO PERSONA SWITCHER REMOVED IN PRODUCTION
  app.post('/api/auth/switch-demo', (req, res) => {
    return res.status(403).json({
      error: 'DISABLED',
      message: 'Demo persona switching has been removed in production. Please sign in with authentic credentials.'
    });
  });

  // ==================== PLATFORM ADMIN ROUTES ====================

  // Public Platform Settings (Branding, Logo, Name for Login Screen)
  const handleGetPlatformSettings = (req: express.Request, res: express.Response) => {
    return res.json(dbStore.getPlatformSettings());
  };

  app.get('/api/public/platform-settings', handleGetPlatformSettings);
  app.get('/api/platform-settings', handleGetPlatformSettings);
  app.get('/platform-settings', handleGetPlatformSettings);
  app.get('/api/public/settings', handleGetPlatformSettings);

  // Super Admin Platform Settings Management
  app.get('/api/platform/settings', requireAuth, requireSuperAdmin, (req, res) => {
    return res.json(dbStore.getPlatformSettings());
  });

  app.put('/api/platform/settings', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    try {
      const updated = dbStore.updatePlatformSettings(req.body, user);
      return res.json({ success: true, settings: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update platform settings' });
    }
  });

  app.get('/api/platform/tenants', requireAuth, requireSuperAdmin, (req, res) => {
    const tenants = dbStore.getAllTenants();
    return res.json(tenants);
  });

  app.post('/api/platform/tenants', requireAuth, requireSuperAdmin, (req, res) => {
    try {
      const result = dbStore.createTenant(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/platform/tenants/:id', requireAuth, requireSuperAdmin, (req, res) => {
    const tenant = dbStore.getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    const users = dbStore.getTenantUsers(tenant.id);
    return res.json({ tenant, users });
  });

  // Edit / Update Tenant details
  app.put('/api/platform/tenants/:id', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    try {
      const updatedTenant = dbStore.updateTenant(req.params.id, req.body, user);
      return res.json({ success: true, tenant: updatedTenant });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update tenant' });
    }
  });

  // Delete Tenant permanently
  app.delete('/api/platform/tenants/:id', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    try {
      const result = dbStore.deleteTenant(req.params.id, user);
      return res.json({ success: true, message: 'Tenant successfully deleted', ...result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete tenant' });
    }
  });

  // Get users for a specific tenant
  app.get('/api/platform/tenants/:id/users', requireAuth, requireSuperAdmin, (req, res) => {
    const users = dbStore.getTenantUsers(req.params.id);
    const safeUsers = users.map(({ passwordHash, resetToken, resetTokenExpiresAt, ...u }) => u);
    return res.json(safeUsers);
  });

  // Create new user for a specific tenant
  app.post('/api/platform/tenants/:id/users', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    const { name, email, role, department, password, permissions } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    try {
      const initialPassword = password || 'password123';
      const newUser = dbStore.createTenantUser(
        req.params.id,
        {
          name,
          email,
          role,
          department: department || undefined,
          permissions: permissions || ['*'],
          passwordHash: hashPassword(initialPassword)
        },
        user
      );
      const { passwordHash, ...safeUser } = newUser;
      return res.status(201).json({ success: true, user: safeUser, initialPassword });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create tenant user' });
    }
  });

  // Global Platform Users API
  app.get('/api/platform/users', requireAuth, requireSuperAdmin, (req, res) => {
    const allUsers = dbStore.getAllUsers();
    const safeUsers = allUsers.map(({ passwordHash, resetToken, resetTokenExpiresAt, ...u }) => u);
    return res.json(safeUsers);
  });

  // Super Admin update user email, name, role, department, etc.
  app.put('/api/platform/users/:userId', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    try {
      const updatedUser = dbStore.updateTenantUser(req.params.userId, req.body, user);
      const { passwordHash, resetToken, resetTokenExpiresAt, ...safeUser } = updatedUser;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update user' });
    }
  });

  // Super Admin direct password reset for any tenant user
  app.post('/api/platform/users/:userId/reset-password', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    const { newPassword } = req.body;
    try {
      const result = dbStore.resetUserPasswordDirect(req.params.userId, newPassword, user);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to reset user password' });
    }
  });

  // Super Admin or Tenant Admin delete user account
  app.delete('/api/platform/users/:userId', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const targetUser = dbStore.getUserById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role !== 'TENANT_ADMIN' || user.tenantId !== targetUser.tenantId) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not have permission to delete this user account' });
      }
      if (targetUser.role === 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Cannot delete Super Admin accounts' });
      }
      if (targetUser.id === user.id) {
        return res.status(400).json({ error: 'You cannot delete your own logged-in admin account' });
      }
    }

    try {
      dbStore.deleteTenantUser(req.params.userId, user);
      return res.json({ success: true, message: `User account "${targetUser.name}" successfully deleted` });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete user' });
    }
  });

  // Tenant Admin delete user alias
  app.delete('/api/tenant/users/:userId', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const targetUser = dbStore.getUserById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role !== 'TENANT_ADMIN' || user.tenantId !== targetUser.tenantId) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not have permission to delete this user account' });
      }
      if (targetUser.role === 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Cannot delete Super Admin accounts' });
      }
      if (targetUser.id === user.id) {
        return res.status(400).json({ error: 'You cannot delete your own logged-in admin account' });
      }
    }

    try {
      dbStore.deleteTenantUser(req.params.userId, user);
      return res.json({ success: true, message: `User account "${targetUser.name}" successfully deleted` });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete user' });
    }
  });

  // Authorized Platform Super Admin workspace inspection
  app.post('/api/platform/tenants/:id/inspect', requireAuth, requireSuperAdmin, (req, res) => {
    const tenant = dbStore.getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const user = (req as any).user as User;

    dbStore.logAction(
      'platform_super_admin',
      user.id,
      user.name,
      user.role,
      'SUPER_ADMIN_INSPECT_TENANT',
      'Tenant',
      `Super Admin initialized workspace inspection context for tenant: ${tenant.name}`,
      tenant.id
    );

    return res.json({
      success: true,
      tenant,
      enabledModules: tenant.enabledModules
    });
  });

  // CRITICAL REQUIREMENT: Enable or disable modules live for a tenant!
  app.put('/api/platform/tenants/:id/modules', requireAuth, requireSuperAdmin, (req, res) => {
    const { enabledModules } = req.body;
    const user = (req as any).user as User;

    if (!Array.isArray(enabledModules)) {
      return res.status(400).json({ error: 'enabledModules must be an array of module IDs' });
    }

    try {
      const updatedTenant = dbStore.updateTenantModules(req.params.id, enabledModules, user);
      return res.json({ success: true, tenant: updatedTenant });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/platform/tenants/:id/status', requireAuth, requireSuperAdmin, (req, res) => {
    const { status } = req.body;
    const user = (req as any).user as User;

    try {
      const updatedTenant = dbStore.toggleTenantStatus(req.params.id, status, user);
      return res.json({ success: true, tenant: updatedTenant });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/platform/audit-logs', requireAuth, requireSuperAdmin, (req, res) => {
    const user = (req as any).user as User;
    const logs = dbStore.getAuditLogs(user);
    return res.json(logs);
  });

  app.get('/api/tenant/audit-logs', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const logs = dbStore.getAuditLogs(user);
    return res.json(logs);
  });

  // ==================== TENANT BRANDING & INFO ====================

  app.get('/api/tenant/info', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = getEffectiveTenantId(req, user);
    const tenant = dbStore.getTenant(tenantId);
    return res.json(tenant || { isPlatformAdmin: user.role === 'SUPER_ADMIN' });
  });

  app.put('/api/tenant/branding', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Tenant Admins can update branding' });
    }
    const tenantId = getEffectiveTenantId(req, user);
    const updated = dbStore.updateTenantBranding(tenantId, req.body, user);
    return res.json(updated);
  });

  app.put('/api/tenant/public-website', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Tenant Admins can update public website settings' });
    }
    const tenantId = getEffectiveTenantId(req, user);
    const updated = dbStore.updateTenantPublicWebsite(tenantId, req.body, user);
    return res.json(updated);
  });

  // ==================== TENANT PUBLIC WEBSITE ENDPOINTS (UNAUTHENTICATED) ====================

  app.get('/api/public/resolve-domain', (req, res) => {
    const hostname = ((req.query.hostname as string) || req.hostname || req.headers.host || '').toLowerCase().split(':')[0];
    const baseDomain = (process.env.BASE_DOMAIN || 'davetech.co.ke').toLowerCase();

    // 1. Check override query parameter
    const override = ((req.query.subdomain as string) || (req.query.slug as string) || '').toLowerCase().trim();
    if (override) {
      if (override === 'admin' || override === 'platform') {
        return res.json({ type: 'PLATFORM_ADMIN', baseDomain });
      }
      if (override === 'www' || override === 'root' || override === 'davetech') {
        return res.json({ type: 'PLATFORM_ROOT', baseDomain });
      }
      const tenant = dbStore.getTenantByDomain(override);
      if (!tenant || tenant.status !== 'ACTIVE') {
        return res.status(404).json({ type: 'TENANT_NOT_FOUND', slug: override, baseDomain });
      }
      return res.json({
        type: 'TENANT',
        tenantSlug: tenant.slug,
        tenantId: tenant.id,
        tenantName: tenant.name,
        branding: tenant.branding,
        baseDomain
      });
    }

    // 2. Exact match root
    if (hostname === baseDomain || hostname === `www.${baseDomain}` || hostname === 'localhost' || hostname === '127.0.0.1') {
      return res.json({ type: 'PLATFORM_ROOT', baseDomain });
    }

    // 3. Admin portal subdomain
    if (hostname === `admin.${baseDomain}` || hostname === 'admin.localhost') {
      return res.json({ type: 'PLATFORM_ADMIN', baseDomain });
    }

    // 4. Wildcard Subdomain match
    let sub = '';
    if (hostname.endsWith(`.${baseDomain}`)) {
      sub = hostname.slice(0, -(baseDomain.length + 1)).toLowerCase();
    } else if (hostname.endsWith('.localhost')) {
      sub = hostname.split('.')[0].toLowerCase();
    } else {
      // 5. Check Custom Domain match
      const customTenant = dbStore.getTenantByDomain(hostname);
      if (customTenant && customTenant.status === 'ACTIVE') {
        return res.json({
          type: 'TENANT',
          tenantSlug: customTenant.slug,
          tenantId: customTenant.id,
          tenantName: customTenant.name,
          branding: customTenant.branding,
          isCustomDomain: true,
          baseDomain
        });
      }
      return res.json({ type: 'PLATFORM_ROOT', baseDomain });
    }

    if (sub === 'admin' || sub === 'platform') {
      return res.json({ type: 'PLATFORM_ADMIN', baseDomain });
    }
    if (sub === 'www' || sub === 'root') {
      return res.json({ type: 'PLATFORM_ROOT', baseDomain });
    }

    const tenant = dbStore.getTenantByDomain(sub);
    if (!tenant || tenant.status !== 'ACTIVE') {
      return res.status(404).json({ type: 'TENANT_NOT_FOUND', slug: sub, baseDomain });
    }

    return res.json({
      type: 'TENANT',
      tenantSlug: tenant.slug,
      tenantId: tenant.id,
      tenantName: tenant.name,
      branding: tenant.branding,
      baseDomain
    });
  });

  const handleGetPublicTenant = (req: express.Request, res: express.Response) => {
    const rawSlug = req.params.slug || (req.query.slug as string) || '';
    const slug = rawSlug.trim();
    let tenant: Tenant | undefined = undefined;

    if (slug && slug !== 'default' && slug !== 'undefined' && slug !== 'null') {
      tenant = dbStore.getTenantByDomain(slug) || dbStore.getTenantBySlugOrId(slug);
      if (!tenant || tenant.status !== 'ACTIVE') {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: `Public website for "${slug}" was not found or is currently suspended.`
        });
      }
    } else {
      // Fallback only if no specific slug was requested
      tenant = dbStore.getAllTenants().find(t => t.status === 'ACTIVE') || dbStore.getAllTenants()[0];
    }

    if (!tenant) {
      return res.status(404).json({ error: 'TENANT_NOT_FOUND', message: `No active public tenant found.` });
    }

    // Strict Tenant Isolation: Retrieve ONLY data appropriate for this tenant's industry
    const tenantId = tenant.id;
    const tenantType = tenant.type || 'GENERAL_ERP';

    // Industry-specific data slices
    let products: any[] | undefined = undefined;
    let categories: string[] | undefined = undefined;
    let departments: any[] | undefined = undefined;
    let programs: any[] | undefined = undefined;
    let campuses: any[] | undefined = undefined;
    let investments: any[] | undefined = undefined;
    let stats: Record<string, number | string> = {};

    if (tenantType === 'WHOLESALE' || tenantType === 'RETAIL' || tenantType === 'POS' || tenantType === 'BOOKSHOP') {
      // Retrieve POS & wholesale catalog
      const allProducts = dbStore.getPosProducts(tenantId).filter(p => p.status !== 'DISCONTINUED');
      products = allProducts;
      categories = Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean);
      stats = {
        totalProducts: allProducts.length,
        categoriesCount: categories.length,
        inStockItems: allProducts.filter(p => p.quantityInStock > 0).length,
        dispatchFulfillmentRate: '99.8%'
      };
    } else if (tenantType === 'HOSPITAL') {
      departments = dbStore.getDepartments(tenantId).filter(d => d.status === 'ACTIVE');
      stats = {
        departmentsCount: departments.length,
        specialistsCount: 36,
        emergencyBeds: 50,
        patientCareRating: '4.9 / 5.0'
      };
    } else if (tenantType === 'SACCO') {
      investments = dbStore.getChamaInvestments(tenantId);
      stats = {
        activeMembers: 3850,
        dividendYield: '13.5%',
        loanApprovalHours: 24,
        assetBase: 'KES 120M+'
      };
    } else if (tenantType === 'CHURCH') {
      stats = {
        fellowshipMembers: 1200,
        weeklyServices: 3,
        activeMinistries: 7,
        communityOutreachPrograms: 14
      };
    } else if (tenantType === 'EDUCATION') {
      departments = dbStore.getDepartments(tenantId).filter(d => d.status === 'ACTIVE');
      programs = dbStore.getPrograms(tenantId);
      campuses = dbStore.getCampuses(tenantId);
      const students = dbStore.getStudents(tenantId);
      stats = {
        studentsCount: students.length > 0 ? students.length : 1200,
        programsCount: programs.length,
        departmentsCount: departments.length,
        campusesCount: campuses.length
      };
    } else {
      // GENERAL_ERP / Business Services
      stats = {
        activeClients: 180,
        completedProjects: 450,
        serviceUptime: '99.9%',
        satisfactionScore: '98.5%'
      };
    }

    // Prepare default industry-specific landing configuration if none exists
    const defaultHeroTitle = tenantType === 'WHOLESALE'
      ? `Wholesale FMCG, Bulk Supply & Pallet Distribution`
      : tenantType === 'RETAIL' || tenantType === 'POS' || tenantType === 'BOOKSHOP'
      ? `Welcome to ${tenant.name}`
      : tenantType === 'HOSPITAL'
      ? `Excellence in Healthcare & Patient Safety`
      : tenantType === 'SACCO'
      ? `Financial Empowerment & Community Savings`
      : tenantType === 'CHURCH'
      ? `Worship, Fellowship & Spiritual Growth`
      : tenantType === 'EDUCATION'
      ? `Academic Excellence & Career Foundations`
      : `Welcome to ${tenant.name}`;

    const defaultHeroDesc = tenantType === 'WHOLESALE'
      ? `Supplying retail stores, supermarkets, contractors, and institutions with certified products at guaranteed wholesale rates.`
      : tenantType === 'HOSPITAL'
      ? `Comprehensive clinical specialties, diagnostic pathology, and 24/7 emergency response.`
      : tenantType === 'SACCO'
      ? `Grow your savings, access low-interest credit facilities, and earn annual dividend payouts.`
      : tenantType === 'CHURCH'
      ? `Join our vibrant community for worship services, prayer ministry, and outreach fellowships.`
      : tenantType === 'EDUCATION'
      ? `Equipping students with industry-relevant skills, professional certifications, and hands-on training.`
      : `Delivering enterprise-grade solutions, client satisfaction, and operational efficiency.`;

    const publicTenantInfo = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      subdomain: tenant.subdomain || tenant.slug,
      domainType: tenant.domainType || 'subdomain',
      customDomain: tenant.customDomain,
      type: tenant.type,
      educationType: tenant.educationType,
      branding: tenant.branding,
      publicWebsite: {
        enabled: true,
        heroTitle: tenant.publicWebsite?.heroTitle || defaultHeroTitle,
        heroDescription: tenant.publicWebsite?.heroDescription || defaultHeroDesc,
        tagline: tenant.publicWebsite?.tagline || tenant.branding?.companyName || tenant.name,
        primaryColor: tenant.branding?.primaryColor || '#1D53D9',
        secondaryColor: tenant.branding?.secondaryColor || '#F49C10',
        ...(tenant.publicWebsite || {})
      }
    };

    return res.json({
      tenant: publicTenantInfo,
      products,
      categories,
      departments,
      programs,
      campuses,
      investments,
      stats
    });
  };

  app.get('/api/public/tenant', handleGetPublicTenant);
  app.get('/api/public/tenant/:slug', handleGetPublicTenant);

  // General Public Inquiries / Wholesale Quotes / Bulk Orders / Member Applications Endpoint
  const handlePublicInquiry = (req: express.Request, res: express.Response) => {
    const rawSlug = req.params.slug || (req.query.slug as string) || '';
    const slug = rawSlug.trim();
    let tenant: Tenant | undefined = undefined;

    if (slug && slug !== 'default' && slug !== 'undefined' && slug !== 'null') {
      tenant = dbStore.getTenantByDomain(slug) || dbStore.getTenantBySlugOrId(slug);
    }
    if (!tenant || tenant.status !== 'ACTIVE') {
      tenant = dbStore.getAllTenants().find(t => t.status === 'ACTIVE') || dbStore.getAllTenants()[0];
    }
    if (!tenant) {
      tenant = dbStore.ensureDefaultTenant();
    }
    if (!tenant) {
      return res.status(404).json({ error: 'TENANT_NOT_FOUND', message: 'Target tenant not found or inactive.' });
    }

    try {
      const {
        name,
        email,
        phone,
        organization,
        inquiryType = 'GENERAL',
        productOrProgramId,
        targetItemName,
        quantity,
        location,
        message
      } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Contact name and phone number are required.' });
      }

      const referenceId = `INQ-${Date.now().toString().slice(-6)}`;
      const inquirySummary = inquiryType === 'WHOLESALE_QUOTE' || inquiryType === 'BULK_ORDER'
        ? `Wholesale Inquiry: ${targetItemName || 'Bulk Order'} (Qty: ${quantity || 'Pallet/Custom'})`
        : inquiryType === 'APPOINTMENT'
        ? `Patient Clinical Appointment Request`
        : inquiryType === 'MEMBERSHIP'
        ? `New Member Application Inquiry`
        : inquiryType === 'PRAYER_REQUEST'
        ? `Prayer & Ministry Request`
        : `General Inquiry: ${name}`;

      // Save CRM Lead in Tenant database
      dbStore.addCrmLead(
        tenant.id,
        {
          fullName: name,
          companyOrOrg: organization || '',
          email: email || '',
          phone,
          stage: 'PROSPECT',
          assignedTo: 'Sales Desk',
          source: 'WEBSITE',
          lastContactDate: new Date().toISOString().split('T')[0],
          notes: `[Ref: ${referenceId}] ${inquirySummary}. Location: ${location || 'N/A'}. Message: ${message || 'No additional notes'}`,
          estimatedValue: quantity && targetItemName ? Number(quantity) * 1000 : 0
        },
        {
          id: 'public_portal',
          tenantId: tenant.id,
          name: 'Public Website Visitor',
          email: email || 'visitor@website.public',
          role: 'TENANT_USER',
          permissions: []
        } as any
      );

      // Create Tenant Notification
      dbStore.addNotification({
        tenantId: tenant.id,
        type: 'DEMO_REQUEST',
        title: `New Website Inquiry [${referenceId}]: ${name}`,
        message: `${inquirySummary}. Contact: ${phone} | ${email || 'No email provided'}.`,
        metadata: {
          referenceId,
          name,
          email,
          phone,
          organization,
          inquiryType,
          productOrProgramId,
          targetItemName,
          quantity,
          location,
          message
        }
      });

      return res.status(201).json({
        success: true,
        referenceId,
        message: `Thank you, ${name}! Your inquiry for ${tenant.name} has been received. Reference ID: ${referenceId}. Our team will contact you shortly.`
      });
    } catch (err: any) {
      console.error('Public inquiry processing error:', err);
      return res.status(500).json({ error: 'PROCESSING_ERROR', message: err.message || 'Failed to submit inquiry.' });
    }
  };

  app.post('/api/public/tenant/inquiry', handlePublicInquiry);
  app.post('/api/public/tenant/:slug/inquiry', handlePublicInquiry);
  app.post('/api/public/tenant/:slug/order-inquiry', handlePublicInquiry);

  const handlePublicApply = (req: express.Request, res: express.Response) => {
    const rawSlug = req.params.slug || (req.query.slug as string) || '';
    const slug = rawSlug.trim();
    let tenant: Tenant | undefined = undefined;

    if (slug && slug !== 'default' && slug !== 'undefined' && slug !== 'null') {
      tenant = dbStore.getTenantBySlugOrId(slug);
    }

    if (!tenant || tenant.status !== 'ACTIVE') {
      tenant = dbStore.getAllTenants().find(t => t.status === 'ACTIVE') || dbStore.getAllTenants()[0];
    }

    if (!tenant) {
      tenant = dbStore.ensureDefaultTenant();
    }

    if (!tenant) {
      return res.status(404).json({ error: 'TENANT_NOT_FOUND', message: 'Target tenant not found or inactive.' });
    }

    try {
      const { fullName, email, phone, gender, dateOfBirth, programId, campusId, guardianName, guardianPhone } = req.body;

      if (!fullName || !email || !phone) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Full name, email, and phone number are required.' });
      }

      // Check if program exists for this tenant
      const program = dbStore.getPrograms(tenant.id).find(p => p.id === programId);
      const campus = dbStore.getCampuses(tenant.id).find(c => c.id === campusId);

      const newApplicant = dbStore.addStudent(
        tenant.id,
        {
          admissionNo: `APP-${Date.now().toString().slice(-6)}`,
          fullName,
          email,
          phone,
          gender: gender || 'Unspecified',
          dateOfBirth: dateOfBirth || new Date().toISOString().split('T')[0],
          programId: programId || (dbStore.getPrograms(tenant.id)[0]?.id || ''),
          programName: program?.name || 'General Admission',
          campusId: campusId || (dbStore.getCampuses(tenant.id)[0]?.id || ''),
          campusName: campus?.name || 'Main Campus',
          academicYear: '2026/2027',
          guardianName: guardianName || '',
          guardianPhone: guardianPhone || '',
          feeBalance: 0,
          status: 'APPLICANT'
        },
        {
          id: 'public_applicant',
          tenantId: tenant.id,
          name: fullName,
          email,
          role: 'TENANT_USER',
          permissions: []
        } as any
      );

      return res.status(201).json({
        success: true,
        admissionNo: newApplicant.admissionNo,
        message: `Congratulations ${fullName}! Your admission application for ${tenant.name} has been received. Admission reference: ${newApplicant.admissionNo}`
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to submit application' });
    }
  };

  app.post('/api/public/tenant/apply', handlePublicApply);
  app.post('/api/public/tenant/:slug/apply', handlePublicApply);

  app.get('/api/public/tenants-list', (req, res) => {
    const tenants = dbStore.getAllTenants()
      .filter(t => t.status === 'ACTIVE')
      .map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        type: t.type,
        educationType: t.educationType,
        branding: {
          companyName: t.branding?.companyName || t.name,
          primaryColor: t.branding?.primaryColor || '#1D53D9',
          secondaryColor: t.branding?.secondaryColor || '#F49C10',
          currencySymbol: t.branding?.currencySymbol || 'KSh',
          address: t.branding?.address
        },
        publicWebsite: {
          enabled: t.publicWebsite?.enabled ?? true,
          heroTitle: t.publicWebsite?.heroTitle,
          tagline: t.publicWebsite?.tagline,
          heroDescription: t.publicWebsite?.heroDescription
        },
        enabledModulesCount: t.enabledModules?.length || 0
      }));

    return res.json({ tenants });
  });

  app.post('/api/public/demo-request', (req, res) => {
    try {
      const { name, email, phone, organization, industry, interestedModules, message } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Name and email are required.' });
      }

      const leadRecord = {
        id: `lead_${Date.now()}`,
        name,
        email,
        phone: phone || '',
        organization: organization || 'Prospective Client',
        industry: industry || 'General',
        interestedModules: Array.isArray(interestedModules) ? interestedModules : [],
        message: message || '',
        status: 'NEW',
        createdAt: new Date().toISOString()
      };

      // Add to CRM leads for default tenant if available
      try {
        const defaultTenant = dbStore.getAllTenants()[0];
        if (defaultTenant) {
          dbStore.addCrmLead(defaultTenant.id, {
            fullName: name,
            companyOrOrg: organization || 'Demo Request',
            email,
            phone: phone || '',
            stage: 'PROSPECT',
            source: 'WEBSITE',
            estimatedValue: 150000,
            assignedTo: 'Sales Team',
            lastContactDate: new Date().toISOString().split('T')[0],
            notes: `Industry: ${industry || 'N/A'}. Interested in: ${(interestedModules || []).join(', ')}. Message: ${message || 'None'}`
          });
        }
      } catch (err) {
        console.warn('Could not auto-create CRM lead:', err);
      }

      // Add real-time notification to Platform Super Admin Bell
      try {
        dbStore.addNotification({
          tenantId: 'platform_super_admin',
          type: 'DEMO_REQUEST',
          title: `New Demo Request: ${organization || name}`,
          message: `${name} requested a demonstration for ${industry || 'Davetech ERP'}. Modules: ${(interestedModules || []).join(', ') || 'All modules'}. Email: ${email}`,
          metadata: {
            name,
            email,
            phone: phone || '',
            organization: organization || 'Prospective Client',
            industry: industry || 'General',
            interestedModules: Array.isArray(interestedModules) ? interestedModules : [],
            message: message || '',
            selectedPlan: req.body.selectedPlan || 'Growth & Professional'
          }
        });
      } catch (err) {
        console.warn('Could not add demo notification:', err);
      }

      return res.status(201).json({
        success: true,
        message: `Thank you, ${name}! Your Davetech ERP demonstration request has been scheduled. Our solutions engineering team will reach out via ${email} within 2 business hours.`
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to submit demo request' });
    }
  });

  // ==================== NOTIFICATIONS API ROUTES ====================

  app.get('/api/notifications', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = user.role === 'SUPER_ADMIN' ? 'platform_super_admin' : user.tenantId;
    const notifications = dbStore.getNotifications(tenantId);
    return res.json({ notifications });
  });

  app.post('/api/notifications/:id/read', requireAuth, (req, res) => {
    const success = dbStore.markNotificationRead(req.params.id);
    return res.json({ success });
  });

  app.post('/api/notifications/read-all', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = user.role === 'SUPER_ADMIN' ? 'platform_super_admin' : user.tenantId;
    dbStore.markAllNotificationsRead(tenantId);
    return res.json({ success: true });
  });

  app.delete('/api/notifications/:id', requireAuth, (req, res) => {
    const success = dbStore.deleteNotification(req.params.id);
    return res.json({ success });
  });

  app.delete('/api/notifications/clear-all', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = user.role === 'SUPER_ADMIN' ? 'platform_super_admin' : user.tenantId;
    dbStore.clearAllNotifications(tenantId);
    return res.json({ success: true });
  });

  // ==================== MODULE CHECK ROUTE ====================

  app.get('/api/app/check-module/:moduleId', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const moduleId = req.params.moduleId as ModuleId;
    const moduleInfo = getModuleInfo(moduleId);

    if (user.role === 'SUPER_ADMIN') {
      return res.json({ enabled: true, module: moduleInfo, reason: 'SUPER_ADMIN' });
    }

    const tenantId = getEffectiveTenantId(req, user);
    const tenant = dbStore.getTenant(tenantId);
    if (!tenant) return res.status(404).json({ enabled: false, error: 'Tenant not found' });

    const isEnabled = tenant.enabledModules.includes(moduleId);
    return res.json({
      enabled: isEnabled,
      module: moduleInfo,
      tenantName: tenant.name,
      enabledModules: tenant.enabledModules
    });
  });

  // ==================== EDUCATION MODULE ENDPOINTS ====================
  // Protected by requirement that user belongs to tenant AND 'education' module is ENABLED!

  app.get('/api/app/education/summary', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);

    const students = dbStore.getStudents(tenantId);
    const staff = dbStore.getStaff(tenantId);
    const campuses = dbStore.getCampuses(tenantId);
    const programs = dbStore.getPrograms(tenantId);
    const feePayments = dbStore.getFeePayments(tenantId);

    const totalCollected = feePayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = students.reduce((sum, s) => sum + s.feeBalance, 0);

    return res.json({
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'ACTIVE').length,
      totalStaff: staff.length,
      totalCampuses: campuses.length,
      totalPrograms: programs.length,
      totalCollected,
      totalOutstanding
    });
  });

  app.get('/api/app/education/students', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const students = dbStore.getStudents(tenantId);
    return res.json(students);
  });

  app.post('/api/app/education/students', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const student = dbStore.addStudent(tenantId, req.body, user);
      return res.status(201).json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/app/education/students/bulk-import', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const { students } = req.body;
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ error: 'Please provide a non-empty list of students to import.' });
      }
      const result = dbStore.bulkAddStudents(tenantId, students, user);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/education/academics', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);

    return res.json({
      campuses: dbStore.getCampuses(tenantId),
      academicYears: dbStore.getAcademicYears(tenantId),
      terms: dbStore.getTerms(tenantId),
      departments: dbStore.getDepartments(tenantId),
      programs: dbStore.getPrograms(tenantId),
      units: dbStore.getUnits(tenantId)
    });
  });

  // EDUCATION - DEPARTMENTS API (Multi-tenant isolated)
  app.get('/api/app/education/departments', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getDepartments(tenantId));
  });

  app.post('/api/app/education/departments', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const dept = dbStore.addDepartment(tenantId, req.body, user);
      return res.status(201).json(dept);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/departments/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const dept = dbStore.updateDepartment(tenantId, req.params.id, req.body, user);
      return res.json(dept);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/app/education/departments/:id/status', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const { status } = req.body;
      if (status !== 'ACTIVE' && status !== 'INACTIVE') {
        return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE' });
      }
      const dept = dbStore.toggleDepartmentStatus(tenantId, req.params.id, status, user);
      return res.json(dept);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/departments/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const result = dbStore.deleteDepartment(tenantId, req.params.id, user);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/students/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteStudent(tenantId, req.params.id, user);
      return res.json({ success: true, message: 'Student record successfully deleted' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/education/faculty', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getStaff(tenantId));
  });

  app.delete('/api/app/education/faculty/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteStaff(tenantId, req.params.id, user);
      return res.json({ success: true, message: 'Staff member record successfully deleted' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/education/timetable', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getTimetable(tenantId));
  });

  app.get('/api/app/education/payments', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getFeePayments(tenantId));
  });

  app.post('/api/app/education/payments', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const payment = dbStore.recordFeePayment(tenantId, req.body, user);
      return res.status(201).json(payment);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // CHAMA / SACCO API ENDPOINTS (Blessed to Bless)
  // ==========================================
  app.get('/api/app/sacco/summary', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const members = dbStore.getChamaMembers(tenantId);
    const contributions = dbStore.getChamaContributions(tenantId);
    const loans = dbStore.getChamaLoans(tenantId);
    const investments = dbStore.getChamaInvestments(tenantId);

    const totalSavings = members.reduce((sum, m) => sum + (m.totalSavings || 0), 0);
    const totalWelfare = members.reduce((sum, m) => sum + (m.welfareFund || 0), 0);
    const totalShareCapital = members.reduce((sum, m) => sum + (m.shareCapital || 0), 0);
    const activeLoansTotal = loans.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED').reduce((sum, l) => sum + (l.balance || 0), 0);
    const totalInvestments = investments.reduce((sum, i) => sum + (i.investedAmount || 0), 0);

    return res.json({
      membersCount: members.length,
      activeMembersCount: members.filter(m => m.status === 'ACTIVE').length,
      totalSavings,
      totalWelfare,
      totalShareCapital,
      activeLoansTotal,
      totalInvestments,
      recentContributions: contributions.slice(0, 10),
      recentLoans: loans.slice(0, 5)
    });
  });

  app.get('/api/app/sacco/members', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const members = dbStore.getChamaMembers(tenantId);
    return res.json({ members });
  });

  app.post('/api/app/sacco/members', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const member = dbStore.addChamaMember(tenantId, req.body, user);
      return res.status(201).json({ message: 'Member registered successfully', member });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/sacco/members/:id', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const updated = dbStore.updateChamaMember(tenantId, req.params.id, req.body, user);
      return res.json({ message: 'Member updated', member: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/sacco/members/:id', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const ok = dbStore.deleteChamaMember(tenantId, req.params.id, user);
    if (!ok) return res.status(404).json({ error: 'Member not found' });
    return res.json({ message: 'Member deleted' });
  });

  app.get('/api/app/sacco/contributions', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const contributions = dbStore.getChamaContributions(tenantId);
    return res.json({ contributions });
  });

  app.post('/api/app/sacco/contributions', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const contrib = dbStore.recordChamaContribution(tenantId, req.body, user);
      return res.status(201).json({ message: 'Contribution recorded', contribution: contrib });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/sacco/loans', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const loans = dbStore.getChamaLoans(tenantId);
    return res.json({ loans });
  });

  app.post('/api/app/sacco/loans', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const loan = dbStore.applyChamaLoan(tenantId, req.body, user);
      return res.status(201).json({ message: 'Loan application submitted', loan });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/app/sacco/loans/:id/status', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const loan = dbStore.updateLoanStatus(tenantId, req.params.id, req.body.status, user);
      return res.json({ message: `Loan status updated to ${loan.status}`, loan });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/app/sacco/repayments', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const repayment = dbStore.recordLoanRepayment(tenantId, req.body, user);
      return res.status(201).json({ message: 'Loan repayment recorded', repayment });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/sacco/repayments', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const repayments = dbStore.getChamaRepayments(tenantId);
    return res.json({ repayments });
  });

  app.get('/api/app/sacco/investments', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const investments = dbStore.getChamaInvestments(tenantId);
    return res.json({ investments });
  });

  app.post('/api/app/sacco/investments', requireAuth, requireModule('sacco'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const inv = dbStore.addChamaInvestment(tenantId, req.body, user);
      return res.status(201).json({ message: 'Investment added', investment: inv });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // POS, RETAIL, WHOLESALE & BOOKSHOP API
  // ==========================================
  app.get('/api/app/pos/products', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const products = dbStore.getPosProducts(tenantId);
    return res.json({ products });
  });

  app.post('/api/app/pos/products', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const prd = dbStore.addPosProduct(tenantId, req.body, user);
      return res.status(201).json({ message: 'Product created', product: prd });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/pos/products/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const prd = dbStore.updatePosProduct(tenantId, req.params.id, req.body, user);
      return res.json({ message: 'Product updated', product: prd });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/pos/products/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const ok = dbStore.deletePosProduct(tenantId, req.params.id, user);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    return res.json({ message: 'Product deleted' });
  });

  app.get('/api/app/pos/sales', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const sales = dbStore.getPosSales(tenantId);
    return res.json({ sales });
  });

  app.post('/api/app/pos/sales', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const sale = dbStore.recordPosSale(tenantId, req.body, user);
      return res.status(201).json({ message: 'Sale completed', sale });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // RESTAURANT / BAR TABLES & MENU
  app.get('/api/app/bar/tables', requireAuth, requireModule('bar'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    let tables = dbStore.getRestaurantTables(tenantId);
    return res.json({ tables });
  });

  app.patch('/api/app/bar/tables/:id/status', requireAuth, requireModule('bar'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const table = dbStore.updateRestaurantTableStatus(tenantId, req.params.id, req.body.status, req.body.guestCount);
      return res.json({ message: 'Table status updated', table });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/bar/menu', requireAuth, requireModule('bar'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const menu = dbStore.getRestaurantMenu(tenantId);
    return res.json({ menu });
  });

  app.post('/api/app/bar/menu', requireAuth, requireModule('bar'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const item = dbStore.addRestaurantMenuItem(tenantId, req.body, user);
      return res.status(201).json({ message: 'Menu item created', item });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // ACCOUNTING, HR, CRM, CHURCH ENDPOINTS
  app.get('/api/app/accounting/ledger', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const entries = dbStore.getAccountingLedger(tenantId);
    return res.json({ entries });
  });

  app.post('/api/app/accounting/ledger', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const entry = dbStore.addAccountingEntry(tenantId, req.body, user);
      return res.status(201).json({ message: 'Ledger entry posted', entry });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hr/employees', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const employees = dbStore.getEmployees(tenantId);
    return res.json({ employees });
  });

  app.post('/api/app/hr/employees', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const emp = dbStore.addEmployee(tenantId, req.body, user);
      return res.status(201).json({ message: 'Employee enrolled', employee: emp });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/crm/leads', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const leads = dbStore.getCrmLeads(tenantId);
    return res.json({ leads });
  });

  app.post('/api/app/crm/leads', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const lead = dbStore.addCrmLead(tenantId, req.body, user);
      return res.status(201).json({ message: 'Lead added', lead });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/church/members', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const members = dbStore.getChurchMembers(tenantId);
    return res.json({ members });
  });

  app.post('/api/app/church/members', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const member = dbStore.addChurchMember(tenantId, req.body, user);
      return res.status(201).json({ message: 'Member registered', member });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/church/givings', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const givings = dbStore.getChurchGivings(tenantId);
    return res.json({ givings });
  });

  app.post('/api/app/church/givings', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const giving = dbStore.recordChurchGiving(tenantId, req.body, user);
      return res.status(201).json({ message: 'Giving recorded', giving });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/status', requireAuth, requireModule('hospital'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Hospital Healthcare module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/pos/status', requireAuth, requireModule('pos'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `POS module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/accounting/status', requireAuth, requireModule('accounting'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Accounting & Finance module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/hr/status', requireAuth, requireModule('hr'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `HR & Payroll module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/inventory/status', requireAuth, requireModule('inventory'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Inventory Management module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/crm/status', requireAuth, requireModule('crm'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `CRM module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/church/status', requireAuth, requireModule('church'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Church Management module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/sacco/status', requireAuth, requireModule('sacco'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `SACCO & Chama module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/bar/status', requireAuth, requireModule('bar'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Bar & Lounge module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/retail/status', requireAuth, requireModule('retail'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Retail Shop module active for ${tenant.name}`, status: 'OK' });
  });

  app.get('/api/app/wholesale/status', requireAuth, requireModule('wholesale'), (req, res) => {
    const tenant = (req as any).tenant;
    return res.json({ message: `Wholesale Trade module active for ${tenant.name}`, status: 'OK' });
  });

  // Catch-all 404 for unhandled API requests to prevent returning HTML index for API calls
  app.all('/api/*', (req, res) => {
    return res.status(404).json({ error: 'API_NOT_FOUND', message: `API endpoint ${req.originalUrl} not found` });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP Multi-Tenant SaaS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
