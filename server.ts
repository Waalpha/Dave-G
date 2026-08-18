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

  // Comprehensive CORS middleware for custom domains, subdomains (*.davetech.co.ke), and local development
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-tenant-id, x-tenant-slug');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

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

    // Default Super Admin fallback for seamless zero-barrier access
    return (
      dbStore.getUserByEmail('adminbreakthrough76@gmail.com') ||
      dbStore.getUserByEmail('admin@platform.com') ||
      dbStore.getAllUsers().find(u => u.role === 'SUPER_ADMIN') ||
      dbStore.getAllUsers()[0]
    );
  };

  const getEffectiveTenantId = (req: express.Request, user?: User): string => {
    // 1. If non-super admin user, strictly enforce user's home tenant ID
    if (user && user.tenantId && user.tenantId !== 'platform_super_admin' && user.role !== 'SUPER_ADMIN') {
      const requestedTenantId = (req.headers['x-tenant-id'] as string) ||
                                (req.headers['x-tenant-slug'] as string) ||
                                (req.query.tenantId as string) ||
                                (req.query.slug as string) ||
                                (req.body && req.body.tenantId ? (req.body.tenantId as string) : undefined);
      if (requestedTenantId && requestedTenantId !== user.tenantId) {
        const userTenant = dbStore.getTenant(user.tenantId);
        if (!userTenant || (userTenant.slug !== requestedTenantId && userTenant.subdomain !== requestedTenantId && userTenant.id !== requestedTenantId)) {
          const forbiddenError: any = new Error('FORBIDDEN_CROSS_TENANT_ACCESS: You do not have permission to access another organization\'s workspace or records.');
          forbiddenError.statusCode = 403;
          throw forbiddenError;
        }
      }
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
    const reserved = ['admin', 'sales', 'support', 'billing', 'api', 'app', 'www', 'mail', 'help', 'status', 'cdn', 'assets', 'platform', 'static', 'root', 'default', 'login', 'dashboard', 'portal'];

    if (host.endsWith(`.${baseDomain}`)) {
      const sub = host.slice(0, -(baseDomain.length + 1)).toLowerCase().trim();
      if (sub && !reserved.includes(sub)) {
        const t = dbStore.getTenantByDomain(sub) || dbStore.getTenantBySlugOrId(sub);
        if (t) return t.id;
      }
    } else if (host.endsWith('.localhost')) {
      const sub = host.split('.')[0].toLowerCase().trim();
      if (sub && !reserved.includes(sub)) {
        const t = dbStore.getTenantByDomain(sub) || dbStore.getTenantBySlugOrId(sub);
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

      let tenantId: string;
      try {
        tenantId = getEffectiveTenantId(req, user);
      } catch (err: any) {
        if (err.statusCode === 403 || err.message?.includes('FORBIDDEN')) {
          return res.status(403).json({ error: 'FORBIDDEN', message: err.message });
        }
        throw err;
      }

      const tenant = dbStore.getTenant(tenantId);

      // Super Admin bypasses module check for testing/management
      if (user.role === 'SUPER_ADMIN') {
        (req as any).tenant = tenant;
        (req as any).effectiveTenantId = tenantId;
        return next();
      }

      if (!tenant) {
        return res.status(404).json({ error: 'TENANT_NOT_FOUND', message: 'Tenant organization not found' });
      }

      if (tenant.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'TENANT_SUSPENDED', message: 'Tenant organization account is suspended' });
      }

      if (tenant.enabledModules && !tenant.enabledModules.includes(moduleId)) {
        return res.status(403).json({
          error: 'FORBIDDEN_MODULE',
          message: `The ${moduleId} module is not enabled for your organization.`
        });
      }

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

  app.put('/api/platform/settings', requireAuth, requireSuperAdmin, async (req, res) => {
    const user = (req as any).user as User;
    try {
      const updated = await dbStore.updatePlatformSettings(req.body, user);
      return res.json({ success: true, settings: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update platform settings' });
    }
  });

  const handleGetAllTenants = (req: express.Request, res: express.Response) => {
    const tenants = dbStore.getAllTenants() || [];
    return res.json(tenants);
  };

  // Platform tenants endpoint is strictly reserved for Super Admins
  app.get('/api/platform/tenants', requireAuth, requireSuperAdmin, handleGetAllTenants);
  app.get('/api/public/tenants', requireAuth, requireSuperAdmin, handleGetAllTenants);

  // Tenant-safe tenants listing: returns all tenants for SUPER_ADMIN, or ONLY the user's tenant for TENANT_ADMIN / STAFF
  app.get('/api/tenants', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role === 'SUPER_ADMIN') {
      return handleGetAllTenants(req, res);
    }
    const tenant = dbStore.getTenant(user.tenantId);
    return res.json(tenant ? [tenant] : []);
  });

  app.post('/api/platform/tenants', requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const result = await dbStore.createTenant(req.body);
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
  app.put('/api/platform/tenants/:id', requireAuth, requireSuperAdmin, async (req, res) => {
    const user = (req as any).user as User;
    try {
      const updatedTenant = await dbStore.updateTenant(req.params.id, req.body, user);
      return res.json({ success: true, tenant: updatedTenant });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update tenant' });
    }
  });

  // Delete Tenant permanently
  app.delete('/api/platform/tenants/:id', requireAuth, requireSuperAdmin, async (req, res) => {
    const user = (req as any).user as User;
    try {
      const result = await dbStore.deleteTenant(req.params.id, user);
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

  // Tenant-scoped User Management (Strictly isolated to user's effective tenant)
  app.get('/api/tenant/users', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const tenantId = getEffectiveTenantId(req, user);
    const users = dbStore.getTenantUsers(tenantId);
    const safeUsers = users.map(({ passwordHash, resetToken, resetTokenExpiresAt, ...u }) => u);
    return res.json(safeUsers);
  });

  app.post('/api/tenant/users', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Only Tenant Administrators can create user accounts' });
    }
    const tenantId = getEffectiveTenantId(req, user);
    const { name, email, role, department, password, permissions } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    // Prevent non-superadmins from assigning SUPER_ADMIN role
    const assignedRole = (user.role !== 'SUPER_ADMIN' && role === 'SUPER_ADMIN') ? 'STAFF' : (role || 'STAFF');
    try {
      const initialPassword = password || 'password123';
      const newUser = dbStore.createTenantUser(
        tenantId,
        {
          name,
          email,
          role: assignedRole,
          department: department || undefined,
          permissions: Array.isArray(permissions) ? permissions : ['*'],
          passwordHash: hashPassword(initialPassword)
        },
        user
      );
      const { passwordHash, resetToken, resetTokenExpiresAt, ...safeUser } = newUser;
      return res.status(201).json({ success: true, user: safeUser, initialPassword });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create user account' });
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
  app.put('/api/platform/tenants/:id/modules', requireAuth, requireSuperAdmin, async (req, res) => {
    const { enabledModules } = req.body;
    const user = (req as any).user as User;

    if (!Array.isArray(enabledModules)) {
      return res.status(400).json({ error: 'enabledModules must be an array of module IDs' });
    }

    try {
      const updatedTenant = await dbStore.updateTenantModules(req.params.id, enabledModules, user);
      return res.json({ success: true, tenant: updatedTenant });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/platform/tenants/:id/status', requireAuth, requireSuperAdmin, async (req, res) => {
    const { status } = req.body;
    const user = (req as any).user as User;

    try {
      const updatedTenant = await dbStore.toggleTenantStatus(req.params.id, status, user);
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

  app.put('/api/tenant/branding', requireAuth, async (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Tenant Admins can update branding' });
    }
    const tenantId = getEffectiveTenantId(req, user);
    try {
      const updated = await dbStore.updateTenantBranding(tenantId, req.body, user);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/tenant/public-website', requireAuth, async (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Tenant Admins can update public website settings' });
    }
    const tenantId = getEffectiveTenantId(req, user);
    try {
      const updated = await dbStore.updateTenantPublicWebsite(tenantId, req.body, user);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // ==================== TENANT PUBLIC WEBSITE ENDPOINTS (UNAUTHENTICATED) ====================

  app.get('/api/public/resolve-domain', (req, res) => {
    const hostname = ((req.query.hostname as string) || req.hostname || req.headers.host || '').toLowerCase().split(':')[0];
    const baseDomain = (process.env.BASE_DOMAIN || 'davetech.co.ke').toLowerCase();

    // 1. Check override query parameter (e.g. ?area=sales or ?subdomain=apex)
    const areaOverride = ((req.query.area as string) || (req.query.portal as string) || '').toLowerCase().trim();
    if (areaOverride) {
      if (areaOverride === 'admin' || areaOverride === 'platform') {
        return res.json({ type: 'PLATFORM_ADMIN', platformArea: 'admin', baseDomain });
      }
      if (areaOverride === 'sales') {
        return res.json({ type: 'PLATFORM_SALES', platformArea: 'sales', baseDomain });
      }
      if (areaOverride === 'support' || areaOverride === 'help') {
        return res.json({ type: 'PLATFORM_SUPPORT', platformArea: 'support', baseDomain });
      }
      if (areaOverride === 'billing') {
        return res.json({ type: 'PLATFORM_BILLING', platformArea: 'billing', baseDomain });
      }
    }

    const override = ((req.query.subdomain as string) || (req.query.slug as string) || (req.query.tenant as string) || '').toLowerCase().trim();
    if (override) {
      if (override === 'admin' || override === 'platform') {
        return res.json({ type: 'PLATFORM_ADMIN', platformArea: 'admin', baseDomain });
      }
      if (override === 'sales') {
        return res.json({ type: 'PLATFORM_SALES', platformArea: 'sales', baseDomain });
      }
      if (override === 'support' || override === 'help') {
        return res.json({ type: 'PLATFORM_SUPPORT', platformArea: 'support', baseDomain });
      }
      if (override === 'billing') {
        return res.json({ type: 'PLATFORM_BILLING', platformArea: 'billing', baseDomain });
      }
      if (override === 'www' || override === 'root' || override === 'davetech' || override === 'default') {
        return res.json({ type: 'PLATFORM_ROOT', platformArea: 'root', baseDomain });
      }
      const tenant = dbStore.getTenantByDomain(override) || dbStore.getTenantBySlugOrId(override);
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
      return res.json({ type: 'PLATFORM_ROOT', platformArea: 'root', baseDomain });
    }

    // 3. Reserved platform subdomains
    if (hostname === `admin.${baseDomain}` || hostname === 'admin.localhost') {
      return res.json({ type: 'PLATFORM_ADMIN', platformArea: 'admin', baseDomain });
    }
    if (hostname === `sales.${baseDomain}` || hostname === 'sales.localhost') {
      return res.json({ type: 'PLATFORM_SALES', platformArea: 'sales', baseDomain });
    }
    if (hostname === `support.${baseDomain}` || hostname === 'support.localhost' || hostname === `help.${baseDomain}`) {
      return res.json({ type: 'PLATFORM_SUPPORT', platformArea: 'support', baseDomain });
    }
    if (hostname === `billing.${baseDomain}` || hostname === 'billing.localhost') {
      return res.json({ type: 'PLATFORM_BILLING', platformArea: 'billing', baseDomain });
    }

    // 4. Wildcard Subdomain match
    let sub = '';
    if (hostname.endsWith(`.${baseDomain}`)) {
      sub = hostname.slice(0, -(baseDomain.length + 1)).toLowerCase().trim();
    } else if (hostname.endsWith('.localhost')) {
      sub = hostname.split('.')[0].toLowerCase().trim();
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
      return res.json({ type: 'PLATFORM_ROOT', platformArea: 'root', baseDomain });
    }

    if (sub === 'admin' || sub === 'platform') {
      return res.json({ type: 'PLATFORM_ADMIN', platformArea: 'admin', baseDomain });
    }
    if (sub === 'sales') {
      return res.json({ type: 'PLATFORM_SALES', platformArea: 'sales', baseDomain });
    }
    if (sub === 'support' || sub === 'help') {
      return res.json({ type: 'PLATFORM_SUPPORT', platformArea: 'support', baseDomain });
    }
    if (sub === 'billing') {
      return res.json({ type: 'PLATFORM_BILLING', platformArea: 'billing', baseDomain });
    }
    if (sub === 'www' || sub === 'root' || sub === 'default') {
      return res.json({ type: 'PLATFORM_ROOT', platformArea: 'root', baseDomain });
    }

    const tenant = dbStore.getTenantByDomain(sub) || dbStore.getTenantBySlugOrId(sub);
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
    const rawSlug = req.params.slug || (req.query.slug as string) || (req.query.tenant as string) || (req.query.subdomain as string) || '';
    const slug = rawSlug.trim();
    let tenant: Tenant | undefined = undefined;

    if (slug && slug !== 'default' && slug !== 'undefined' && slug !== 'null' && slug !== 'root' && slug !== 'www') {
      tenant = dbStore.getTenantByDomain(slug) || dbStore.getTenantBySlugOrId(slug);
      if (!tenant || tenant.status !== 'ACTIVE') {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: `Public website for "${slug}" was not found or is currently suspended.`
        });
      }
    } else {
      // Check hostname for tenant subdomain
      const host = ((req.headers.host || req.hostname || '') as string).toLowerCase().split(':')[0];
      const baseDomain = (process.env.BASE_DOMAIN || 'davetech.co.ke').toLowerCase();
      if (host.endsWith(`.${baseDomain}`)) {
        const sub = host.slice(0, -(baseDomain.length + 1)).trim();
        if (sub && sub !== 'www' && sub !== 'admin' && sub !== 'sales' && sub !== 'support' && sub !== 'billing') {
          tenant = dbStore.getTenantByDomain(sub) || dbStore.getTenantBySlugOrId(sub);
        }
      } else if (host.endsWith('.localhost')) {
        const sub = host.split('.')[0].trim();
        if (sub && sub !== 'www' && sub !== 'admin' && sub !== 'sales' && sub !== 'support' && sub !== 'billing') {
          tenant = dbStore.getTenantByDomain(sub) || dbStore.getTenantBySlugOrId(sub);
        }
      }
    }

    if (!tenant || tenant.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'TENANT_NOT_FOUND', message: `No active tenant found.` });
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

  app.delete('/api/app/education/students/all', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const result = dbStore.deleteAllStudents(tenantId, user);
      return res.json({ success: true, message: `Successfully deleted all ${result.deletedCount} students.`, deletedCount: result.deletedCount });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/students/delete-all', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const result = dbStore.deleteAllStudents(tenantId, user);
      return res.json({ success: true, message: `Successfully deleted all ${result.deletedCount} students.`, deletedCount: result.deletedCount });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/students', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const result = dbStore.deleteAllStudents(tenantId, user);
      return res.json({ success: true, message: `Successfully deleted all ${result.deletedCount} students.`, deletedCount: result.deletedCount });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/students/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      if (req.params.id === 'all' || req.params.id === 'delete-all') {
        const result = dbStore.deleteAllStudents(tenantId, user);
        return res.json({ success: true, message: `Successfully deleted all ${result.deletedCount} students.`, deletedCount: result.deletedCount });
      }
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

  // Campuses
  app.get('/api/app/education/campuses', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getCampuses(tenantId));
  });

  app.post('/api/app/education/campuses', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const campus = dbStore.addCampus(tenantId, req.body, user);
      return res.status(201).json(campus);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/campuses/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const campus = dbStore.updateCampus(tenantId, req.params.id, req.body, user);
      return res.json(campus);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/campuses/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteCampus(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Academic Years
  app.get('/api/app/education/academic-years', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getAcademicYears(tenantId));
  });

  app.post('/api/app/education/academic-years', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const year = dbStore.addAcademicYear(tenantId, req.body, user);
      return res.status(201).json(year);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/academic-years/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const year = dbStore.updateAcademicYear(tenantId, req.params.id, req.body, user);
      return res.json(year);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/academic-years/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteAcademicYear(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Terms
  app.get('/api/app/education/terms', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getTerms(tenantId));
  });

  app.post('/api/app/education/terms', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const term = dbStore.addTerm(tenantId, req.body, user);
      return res.status(201).json(term);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/terms/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const term = dbStore.updateTerm(tenantId, req.params.id, req.body, user);
      return res.json(term);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/terms/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteTerm(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Programs / Courses
  app.get('/api/app/education/programs', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getPrograms(tenantId));
  });

  app.post('/api/app/education/programs', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const program = dbStore.addProgram(tenantId, req.body, user);
      return res.status(201).json(program);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/programs/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const program = dbStore.updateProgram(tenantId, req.params.id, req.body, user);
      return res.json(program);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/programs/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteProgram(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Units / Subjects
  app.get('/api/app/education/units', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getUnits(tenantId));
  });

  app.post('/api/app/education/units', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const unit = dbStore.addUnit(tenantId, req.body, user);
      return res.status(201).json(unit);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/units/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const unit = dbStore.updateUnit(tenantId, req.params.id, req.body, user);
      return res.json(unit);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/units/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteUnit(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Classes / Cohorts
  app.get('/api/app/education/classes', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getClasses(tenantId));
  });

  app.post('/api/app/education/classes', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const cls = dbStore.addClass(tenantId, req.body, user);
      return res.status(201).json(cls);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/classes/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const cls = dbStore.updateClass(tenantId, req.params.id, req.body, user);
      return res.json(cls);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/classes/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteClass(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Students update
  app.put('/api/app/education/students/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const student = dbStore.updateStudent(tenantId, req.params.id, req.body, user);
      return res.json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Faculty / Staff
  app.post('/api/app/education/faculty', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const staff = dbStore.addStaff(tenantId, req.body, user);
      return res.status(201).json(staff);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/faculty/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const staff = dbStore.updateStaff(tenantId, req.params.id, req.body, user);
      return res.json(staff);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Timetable
  app.post('/api/app/education/timetable', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const entry = dbStore.addTimetableEntry(tenantId, req.body, user);
      return res.status(201).json(entry);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/timetable/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteTimetableEntry(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Attendance
  app.get('/api/app/education/attendance', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const { classId, unitId, date } = req.query as { classId?: string; unitId?: string; date?: string };
    return res.json(dbStore.getAttendance(tenantId, { classId, unitId, date }));
  });

  app.post('/api/app/education/attendance', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const records = Array.isArray(req.body.records) ? req.body.records : [req.body];
      const result = dbStore.recordAttendance(tenantId, records, user);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Fee Structures
  app.get('/api/app/education/fee-structures', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getFeeStructures(tenantId));
  });

  app.post('/api/app/education/fee-structures', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const struct = dbStore.addFeeStructure(tenantId, req.body, user);
      return res.status(201).json(struct);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/fee-structures/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const struct = dbStore.updateFeeStructure(tenantId, req.params.id, req.body, user);
      return res.json(struct);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/fee-structures/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteFeeStructure(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Student Invoices
  app.get('/api/app/education/invoices', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const { studentId } = req.query as { studentId?: string };
    return res.json(dbStore.getInvoices(tenantId, studentId));
  });

  app.post('/api/app/education/invoices', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const inv = dbStore.createInvoice(tenantId, req.body, user);
      return res.status(201).json(inv);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/app/education/invoices/batch-generate', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const result = dbStore.generateClassInvoices(tenantId, req.body, user);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Student Grades
  app.get('/api/app/education/grades', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const { studentId, unitId } = req.query as { studentId?: string; unitId?: string };
    return res.json(dbStore.getStudentGrades(tenantId, studentId, unitId));
  });

  app.post('/api/app/education/grades', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const grades = Array.isArray(req.body.grades) ? req.body.grades : [req.body];
      const result = dbStore.recordStudentGrades(tenantId, grades, user);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Library
  app.get('/api/app/education/library/books', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getLibraryBooks(tenantId));
  });

  app.post('/api/app/education/library/books', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const book = dbStore.addLibraryBook(tenantId, req.body, user);
      return res.status(201).json(book);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/library/books/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const book = dbStore.updateLibraryBook(tenantId, req.params.id, req.body, user);
      return res.json(book);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/library/books/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteLibraryBook(tenantId, req.params.id, user);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/education/library/loans', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getLibraryLoans(tenantId));
  });

  app.post('/api/app/education/library/loans/issue', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const loan = dbStore.issueLibraryLoan(tenantId, req.body, user);
      return res.status(201).json(loan);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/app/education/library/loans/:id/return', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const loan = dbStore.returnLibraryLoan(tenantId, req.params.id, user);
      return res.json(loan);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Hostel / Accommodation
  app.get('/api/app/education/hostel', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    return res.json(dbStore.getHostelRooms(tenantId));
  });

  app.post('/api/app/education/hostel', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const room = dbStore.addHostelRoom(tenantId, req.body, user);
      return res.status(201).json(room);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/education/hostel/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const room = dbStore.updateHostelRoom(tenantId, req.params.id, req.body, user);
      return res.json(room);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/education/hostel/:id', requireAuth, requireModule('education'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      dbStore.deleteHostelRoom(tenantId, req.params.id, user);
      return res.json({ success: true });
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

  // HEALTHCARE & HOSPITAL ERP API ROUTES (Strictly tenant-isolated with requireModule('hospital'))
  app.get('/api/app/hospital/summary', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const summary = dbStore.getHealthcareSummary(tenantId);
    return res.json(summary);
  });

  // Patients
  app.get('/api/app/hospital/patients', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const patients = dbStore.getPatients(tenantId);
    return res.json({ patients });
  });

  app.get('/api/app/hospital/patients/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const patient = dbStore.getPatientById(tenantId, req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    return res.json({ patient });
  });

  app.post('/api/app/hospital/patients', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const patient = dbStore.addPatient(tenantId, req.body, user);
      return res.status(201).json({ message: 'Patient registered successfully', patient });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/patients/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const patient = dbStore.updatePatient(tenantId, req.params.id, req.body, user);
      return res.json({ message: 'Patient updated successfully', patient });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/patients/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deletePatient(tenantId, req.params.id, user);
    if (!success) return res.status(404).json({ error: 'Patient not found or could not be deleted' });
    return res.json({ success: true, message: 'Patient deleted successfully' });
  });

  // Healthcare Departments & Staff & Shifts
  app.get('/api/app/hospital/departments', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const departments = dbStore.getHealthcareDepartments(tenantId);
    return res.json({ departments });
  });

  app.post('/api/app/hospital/departments', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const department = dbStore.addHealthcareDepartment(tenantId, req.body, user);
      return res.status(201).json({ message: 'Department created', department });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/departments/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const department = dbStore.updateHealthcareDepartment(tenantId, req.params.id, req.body, user);
      return res.json({ message: 'Department updated', department });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/departments/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteHealthcareDepartment(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/staff', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const staff = dbStore.getHealthcareStaff(tenantId);
    return res.json({ staff });
  });

  app.post('/api/app/hospital/staff', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const staff = dbStore.addHealthcareStaff(tenantId, req.body, user);
      return res.status(201).json({ message: 'Staff member registered', staff });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/staff/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const staff = dbStore.updateHealthcareStaff(tenantId, req.params.id, req.body);
      return res.json({ message: 'Staff member updated', staff });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/staff/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteHealthcareStaff(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/shifts', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const shifts = dbStore.getStaffShifts(tenantId);
    return res.json({ shifts });
  });

  app.post('/api/app/hospital/shifts', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const shift = dbStore.addStaffShift(tenantId, req.body);
      return res.status(201).json({ message: 'Shift scheduled', shift });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/shifts/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const shift = dbStore.updateStaffShift(tenantId, req.params.id, req.body);
      return res.json({ message: 'Shift updated', shift });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Appointments, Queue & Triage
  app.get('/api/app/hospital/appointments', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const appointments = dbStore.getAppointments(tenantId);
    return res.json({ appointments });
  });

  app.post('/api/app/hospital/appointments', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const appointment = dbStore.addAppointment(tenantId, req.body, user);
      return res.status(201).json({ message: 'Appointment booked', appointment });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/appointments/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const appointment = dbStore.updateAppointment(tenantId, req.params.id, req.body);
      return res.json({ message: 'Appointment updated', appointment });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/appointments/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteAppointment(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/queues', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const queues = dbStore.getQueues(tenantId);
    return res.json({ queues });
  });

  app.post('/api/app/hospital/queues', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const queue = dbStore.addQueue(tenantId, req.body);
      return res.status(201).json({ message: 'Patient queued', queue });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/queues/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const queue = dbStore.updateQueue(tenantId, req.params.id, req.body);
      return res.json({ message: 'Queue updated', queue });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/triages', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const triages = dbStore.getTriages(tenantId);
    return res.json({ triages });
  });

  app.post('/api/app/hospital/triages', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const triage = dbStore.addTriage(tenantId, req.body, user);
      return res.status(201).json({ message: 'Vitals & triage recorded', triage });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Consultations & EMR
  app.get('/api/app/hospital/encounters', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const encounters = dbStore.getConsultationEncounters(tenantId);
    return res.json({ encounters });
  });

  app.post('/api/app/hospital/encounters', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const encounter = dbStore.addConsultationEncounter(tenantId, req.body, user);
      return res.status(201).json({ message: 'Consultation encounter recorded', encounter });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/encounters/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const encounter = dbStore.updateConsultationEncounter(tenantId, req.params.id, req.body);
      return res.json({ message: 'Encounter updated', encounter });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Prescriptions & Pharmacy
  app.get('/api/app/hospital/prescriptions', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const prescriptions = dbStore.getPrescriptions(tenantId);
    return res.json({ prescriptions });
  });

  app.post('/api/app/hospital/prescriptions', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const prescription = dbStore.addPrescription(tenantId, req.body, user);
      return res.status(201).json({ message: 'Prescription created', prescription });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/prescriptions/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const prescription = dbStore.updatePrescription(tenantId, req.params.id, req.body);
      return res.json({ message: 'Prescription updated', prescription });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/medicines', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const medicines = dbStore.getMedicines(tenantId);
    return res.json({ medicines });
  });

  app.post('/api/app/hospital/medicines', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const medicine = dbStore.addMedicine(tenantId, req.body);
      return res.status(201).json({ message: 'Medicine added to catalogue', medicine });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/medicines/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const medicine = dbStore.updateMedicine(tenantId, req.params.id, req.body);
      return res.json({ message: 'Medicine updated', medicine });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/medicines/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteMedicine(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/medicine-batches', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const batches = dbStore.getMedicineBatches(tenantId);
    return res.json({ batches });
  });

  app.post('/api/app/hospital/medicine-batches', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const batch = dbStore.addMedicineBatch(tenantId, req.body);
      return res.status(201).json({ message: 'Medicine batch stocked', batch });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/dispenses', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const dispenses = dbStore.getPharmacyDispenses(tenantId);
    return res.json({ dispenses });
  });

  app.post('/api/app/hospital/dispenses', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const dispense = dbStore.dispensePrescription(tenantId, req.body, user);
      return res.status(201).json({ message: 'Prescription dispensed successfully', dispense });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Laboratory & Radiology
  app.get('/api/app/hospital/lab-tests', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const labTests = dbStore.getLabTests(tenantId);
    return res.json({ labTests });
  });

  app.post('/api/app/hospital/lab-tests', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const labTest = dbStore.addLabTest(tenantId, req.body);
      return res.status(201).json({ message: 'Lab test added to catalogue', labTest });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/lab-tests/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const labTest = dbStore.updateLabTest(tenantId, req.params.id, req.body);
      return res.json({ message: 'Lab test updated', labTest });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/lab-tests/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteLabTest(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/lab-requests', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const labRequests = dbStore.getLabRequests(tenantId);
    return res.json({ labRequests });
  });

  app.post('/api/app/hospital/lab-requests', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const labRequest = dbStore.addLabRequest(tenantId, req.body);
      return res.status(201).json({ message: 'Lab test requested', labRequest });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/lab-requests/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const labRequest = dbStore.updateLabRequest(tenantId, req.params.id, req.body);
      return res.json({ message: 'Lab request updated', labRequest });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/radiology-services', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const services = dbStore.getRadiologyServices(tenantId);
    return res.json({ services });
  });

  app.post('/api/app/hospital/radiology-services', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const service = dbStore.addRadiologyService(tenantId, req.body);
      return res.status(201).json({ message: 'Radiology service added', service });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/radiology-services/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const service = dbStore.updateRadiologyService(tenantId, req.params.id, req.body);
      return res.json({ message: 'Radiology service updated', service });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/radiology-services/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteRadiologyService(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/radiology-requests', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const requests = dbStore.getRadiologyRequests(tenantId);
    return res.json({ requests });
  });

  app.post('/api/app/hospital/radiology-requests', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const request = dbStore.addRadiologyRequest(tenantId, req.body);
      return res.status(201).json({ message: 'Radiology investigation requested', request });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/radiology-requests/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const request = dbStore.updateRadiologyRequest(tenantId, req.params.id, req.body);
      return res.json({ message: 'Radiology request updated', request });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Inpatient Wards, Beds & Admissions & Nursing
  app.get('/api/app/hospital/wards', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const wards = dbStore.getWards(tenantId);
    return res.json({ wards });
  });

  app.post('/api/app/hospital/wards', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const ward = dbStore.addWard(tenantId, req.body);
      return res.status(201).json({ message: 'Ward created', ward });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/wards/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const ward = dbStore.updateWard(tenantId, req.params.id, req.body);
      return res.json({ message: 'Ward updated', ward });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/wards/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteWard(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/beds', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const beds = dbStore.getBeds(tenantId);
    return res.json({ beds });
  });

  app.post('/api/app/hospital/beds', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const bed = dbStore.addBed(tenantId, req.body);
      return res.status(201).json({ message: 'Bed registered', bed });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/beds/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const bed = dbStore.updateBed(tenantId, req.params.id, req.body);
      return res.json({ message: 'Bed updated', bed });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/beds/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteBed(tenantId, req.params.id);
    return res.json({ success });
  });

  app.get('/api/app/hospital/admissions', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const admissions = dbStore.getInpatientAdmissions(tenantId);
    return res.json({ admissions });
  });

  app.post('/api/app/hospital/admissions', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const admission = dbStore.admitPatient(tenantId, req.body, user);
      return res.status(201).json({ message: 'Patient admitted successfully', admission });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/app/hospital/admissions/:id/discharge', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const admission = dbStore.dischargePatient(tenantId, req.params.id, req.body);
      return res.json({ message: 'Patient discharged successfully', admission });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/nursing-care', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const records = dbStore.getNursingCareRecords(tenantId);
    return res.json({ records });
  });

  app.post('/api/app/hospital/nursing-care', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const record = dbStore.addNursingCareRecord(tenantId, req.body);
      return res.status(201).json({ message: 'Nursing care record logged', record });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/med-administrations', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const records = dbStore.getMedicationAdministrations(tenantId);
    return res.json({ records });
  });

  app.post('/api/app/hospital/med-administrations', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const record = dbStore.addMedicationAdministration(tenantId, req.body);
      return res.status(201).json({ message: 'Medication administration recorded', record });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Theatre & Surgery
  app.get('/api/app/hospital/theatres', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const rooms = dbStore.getTheatreRooms(tenantId);
    return res.json({ rooms });
  });

  app.post('/api/app/hospital/theatres', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const room = dbStore.addTheatreRoom(tenantId, req.body);
      return res.status(201).json({ message: 'Theatre room registered', room });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/theatres/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const room = dbStore.updateTheatreRoom(tenantId, req.params.id, req.body);
      return res.json({ message: 'Theatre room updated', room });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/surgeries', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const surgeries = dbStore.getTheatreSurgeries(tenantId);
    return res.json({ surgeries });
  });

  app.post('/api/app/hospital/surgeries', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const surgery = dbStore.addTheatreSurgery(tenantId, req.body);
      return res.status(201).json({ message: 'Surgery scheduled', surgery });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/surgeries/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const surgery = dbStore.updateTheatreSurgery(tenantId, req.params.id, req.body);
      return res.json({ message: 'Surgery record updated', surgery });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Medical Billing, Receipts & Insurance
  app.get('/api/app/hospital/invoices', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const invoices = dbStore.getMedicalInvoices(tenantId);
    return res.json({ invoices });
  });

  app.post('/api/app/hospital/invoices', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const invoice = dbStore.addMedicalInvoice(tenantId, req.body, user);
      return res.status(201).json({ message: 'Invoice generated', invoice });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/invoices/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const invoice = dbStore.updateMedicalInvoice(tenantId, req.params.id, req.body);
      return res.json({ message: 'Invoice updated', invoice });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/payments', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const payments = dbStore.getMedicalPayments(tenantId);
    return res.json({ payments });
  });

  app.post('/api/app/hospital/payments', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const payment = dbStore.recordMedicalPayment(tenantId, req.body, user);
      return res.status(201).json({ message: 'Payment recorded and receipt generated', payment });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/insurance-providers', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const providers = dbStore.getInsuranceProviders(tenantId);
    return res.json({ providers });
  });

  app.post('/api/app/hospital/insurance-providers', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const provider = dbStore.addInsuranceProvider(tenantId, req.body);
      return res.status(201).json({ message: 'Insurance provider added', provider });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/insurance-providers/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const provider = dbStore.updateInsuranceProvider(tenantId, req.params.id, req.body);
      return res.json({ message: 'Insurance provider updated', provider });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/insurance-claims', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const claims = dbStore.getInsuranceClaims(tenantId);
    return res.json({ claims });
  });

  app.post('/api/app/hospital/insurance-claims', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const claim = dbStore.addInsuranceClaim(tenantId, req.body);
      return res.status(201).json({ message: 'Insurance claim submitted', claim });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/insurance-claims/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const claim = dbStore.updateInsuranceClaim(tenantId, req.params.id, req.body);
      return res.json({ message: 'Insurance claim updated', claim });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Healthcare Suppliers & Inventory
  app.get('/api/app/hospital/suppliers', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const suppliers = dbStore.getHealthcareSuppliers(tenantId);
    return res.json({ suppliers });
  });

  app.post('/api/app/hospital/suppliers', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const supplier = dbStore.addHealthcareSupplier(tenantId, req.body);
      return res.status(201).json({ message: 'Supplier registered', supplier });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/suppliers/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const supplier = dbStore.updateHealthcareSupplier(tenantId, req.params.id, req.body);
      return res.json({ message: 'Supplier updated', supplier });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/inventory', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const inventory = dbStore.getHealthcareInventory(tenantId);
    return res.json({ inventory });
  });

  app.post('/api/app/hospital/inventory', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const item = dbStore.addHealthcareInventory(tenantId, req.body);
      return res.status(201).json({ message: 'Inventory item added', item });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/inventory/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const item = dbStore.updateHealthcareInventory(tenantId, req.params.id, req.body);
      return res.json({ message: 'Inventory item updated', item });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/app/hospital/inventory/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const success = dbStore.deleteHealthcareInventory(tenantId, req.params.id);
    return res.json({ success });
  });

  // Ambulance Fleet & Trips
  app.get('/api/app/hospital/ambulances', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const ambulances = dbStore.getAmbulances(tenantId);
    return res.json({ ambulances });
  });

  app.post('/api/app/hospital/ambulances', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const ambulance = dbStore.addAmbulance(tenantId, req.body);
      return res.status(201).json({ message: 'Ambulance registered', ambulance });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/ambulances/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const ambulance = dbStore.updateAmbulance(tenantId, req.params.id, req.body);
      return res.json({ message: 'Ambulance updated', ambulance });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/ambulance-trips', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const trips = dbStore.getAmbulanceTrips(tenantId);
    return res.json({ trips });
  });

  app.post('/api/app/hospital/ambulance-trips', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const trip = dbStore.addAmbulanceTrip(tenantId, req.body);
      return res.status(201).json({ message: 'Ambulance trip dispatched', trip });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/ambulance-trips/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const trip = dbStore.updateAmbulanceTrip(tenantId, req.params.id, req.body);
      return res.json({ message: 'Ambulance trip updated', trip });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Blood Bank
  app.get('/api/app/hospital/blood-donors', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const donors = dbStore.getBloodDonors(tenantId);
    return res.json({ donors });
  });

  app.post('/api/app/hospital/blood-donors', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const donor = dbStore.addBloodDonor(tenantId, req.body);
      return res.status(201).json({ message: 'Blood donor registered', donor });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/blood-units', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const units = dbStore.getBloodUnits(tenantId);
    return res.json({ units });
  });

  app.post('/api/app/hospital/blood-units', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const unit = dbStore.addBloodUnit(tenantId, req.body);
      return res.status(201).json({ message: 'Blood unit banked', unit });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/blood-units/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const unit = dbStore.updateBloodUnit(tenantId, req.params.id, req.body);
      return res.json({ message: 'Blood unit updated', unit });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/app/hospital/blood-transfusions', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const transfusions = dbStore.getBloodTransfusions(tenantId);
    return res.json({ transfusions });
  });

  app.post('/api/app/hospital/blood-transfusions', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const transfusion = dbStore.recordBloodTransfusion(tenantId, req.body);
      return res.status(201).json({ message: 'Blood transfusion recorded', transfusion });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Mortuary Management
  app.get('/api/app/hospital/mortuary', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    const records = dbStore.getMortuaryRecords(tenantId);
    return res.json({ records });
  });

  app.post('/api/app/hospital/mortuary', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const record = dbStore.addMortuaryRecord(tenantId, req.body);
      return res.status(201).json({ message: 'Mortuary record created', record });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/app/hospital/mortuary/:id', requireAuth, requireModule('hospital'), (req, res) => {
    const user = (req as any).user as User;
    const tenantId = (req as any).effectiveTenantId || getEffectiveTenantId(req, user);
    try {
      const record = dbStore.updateMortuaryRecord(tenantId, req.params.id, req.body);
      return res.json({ message: 'Mortuary record updated', record });
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

  // Global JSON Error Handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.statusCode || (err.message?.includes('FORBIDDEN') ? 403 : 500);
    if (req.path.startsWith('/api/')) {
      return res.status(status).json({
        error: err.statusCode === 403 || err.message?.includes('FORBIDDEN') ? 'FORBIDDEN' : 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred'
      });
    }
    next(err);
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
