import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlatformSettings } from '../../types';
import { TenantNotFound } from '../../components/common/TenantNotFound';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface LoginViewProps {
  tenantSlug?: string;
  onNavigateToPublic?: (slug?: string) => void;
}

interface TenantBrandingInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  coverUrl?: string;
  type?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ tenantSlug, onNavigateToPublic }) => {
  const { user, login, logout } = useAuth();

  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Resolution status: 'LOADING' | 'RESOLVED_TENANT' | 'TENANT_NOT_FOUND' | 'PLATFORM_ADMIN'
  const [resolutionStatus, setResolutionStatus] = useState<
    'LOADING' | 'RESOLVED_TENANT' | 'TENANT_NOT_FOUND' | 'PLATFORM_ADMIN'
  >('LOADING');

  // Resolved tenant branding state
  const [tenantBranding, setTenantBranding] = useState<TenantBrandingInfo | null>(null);

  // Platform branding state (used only for Platform Admin / root platform)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformName: 'DAVETECH',
    tagline: 'Platform Administration',
    logoUrl: '/davetech-logo.svg',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    copyrightText: `© ${new Date().getFullYear()} Davetech ERP. All rights reserved.`,
    supportEmail: 'support@davetech.co.ke',
    companyName: 'Davetech ERP',
    allowSelfRegistration: false,
    systemNotice: ''
  });

  // Login form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password recovery form inputs
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Resolve tenant configuration
  useEffect(() => {
    let isMounted = true;
    const cleanSlug = (tenantSlug || '').trim().toLowerCase();

    // Check if this is a tenant portal vs platform admin
    const isTenantContext =
      cleanSlug &&
      cleanSlug !== 'default' &&
      cleanSlug !== 'root' &&
      cleanSlug !== 'admin' &&
      cleanSlug !== 'platform' &&
      cleanSlug !== 'sales' &&
      cleanSlug !== 'support' &&
      cleanSlug !== 'billing' &&
      cleanSlug !== 'www';

    if (isTenantContext) {
      setResolutionStatus('LOADING');
      fetch(`/api/public/tenant/${encodeURIComponent(cleanSlug)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('TENANT_NOT_FOUND');
          }
          return res.json();
        })
        .then(data => {
          if (!isMounted) return;
          if (data && data.tenant) {
            const t = data.tenant;
            const branding: TenantBrandingInfo = {
              id: t.id,
              name: t.name,
              slug: t.slug,
              logoUrl: t.branding?.logoUrl || t.logoUrl,
              tagline: t.branding?.tagline || t.publicWebsite?.tagline,
              primaryColor: t.branding?.primaryColor || '#1D53D9',
              secondaryColor: t.branding?.secondaryColor || '#F49C10',
              contactEmail: t.branding?.contactEmail || t.contactEmail,
              coverUrl: t.branding?.coverUrl,
              type: t.type
            };
            setTenantBranding(branding);
            setResolutionStatus('RESOLVED_TENANT');
            document.title = `${branding.name} - Secure Organization Portal`;
          } else {
            setResolutionStatus('TENANT_NOT_FOUND');
          }
        })
        .catch(() => {
          if (isMounted) {
            setResolutionStatus('TENANT_NOT_FOUND');
          }
        });
    } else {
      // Platform Admin / Root context
      setResolutionStatus('PLATFORM_ADMIN');
      document.title = 'Davetech ERP - Platform Sign In';
      fetch('/api/public/platform-settings')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (isMounted && data && data.platformName) {
            setPlatformSettings(data);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [tenantSlug]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      setSubmitting(false);

      const isSuccess = typeof res === 'object' ? res.success : Boolean(res);
      if (!isSuccess) {
        setError(
          typeof res === 'object' && res.error
            ? res.error
            : 'Invalid email or password. Please verify your credentials.'
        );
      }
    } catch {
      setSubmitting(false);
      setError('Unable to sign in. Please verify your connection and try again.');
    }
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!recoveryEmail) {
      setError('Please enter your account email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() })
      });
      const data = await res.json().catch(() => null);

      setInfo(
        'If an account exists for that email address, password reset instructions have been generated.'
      );

      if (data && data.devResetToken) {
        setResetToken(data.devResetToken);
      }
    } catch {
      setInfo(
        'If an account exists for that email address, password reset instructions have been generated.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!resetToken.trim()) {
      setError('Please enter your reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setInfo('Your password has been successfully updated. You can now sign in.');
        setMode('login');
        setEmail(recoveryEmail);
        setPassword('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data?.message || 'Invalid or expired password reset token.');
      }
    } catch {
      setError('An error occurred while updating password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (newMode: 'login' | 'forgot' | 'reset') => {
    setError('');
    setInfo('');
    setMode(newMode);
  };

  const handleGoToWorkspace = () => {
    if (user?.role === 'SUPER_ADMIN') {
      window.location.hash = '/platform/dashboard';
    } else {
      window.location.hash = '/app/dashboard';
    }
  };

  const handleBackToPublic = () => {
    if (onNavigateToPublic) {
      onNavigateToPublic(tenantBranding?.slug);
    } else if (tenantBranding?.slug) {
      window.location.hash = `/public/${tenantBranding.slug}`;
    } else {
      window.location.hash = '/public';
    }
  };

  // 1. LOADING STATE: Clean skeleton screen without any hardcoded mock names or generic platform slogans
  if (resolutionStatus === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6 text-slate-300" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-44 bg-slate-100 rounded-md animate-pulse mx-auto" />
            <div className="h-3 w-32 bg-slate-100 rounded-md animate-pulse mx-auto" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-11 bg-slate-200 rounded-xl animate-pulse mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // 2. TENANT NOT FOUND STATE: Clean invalid portal page
  if (resolutionStatus === 'TENANT_NOT_FOUND') {
    return (
      <TenantNotFound
        attemptedSlug={tenantSlug}
        onNavigateHome={() => {
          if (onNavigateToPublic) {
            onNavigateToPublic();
          } else {
            window.location.hash = '/public';
          }
        }}
      />
    );
  }

  // Determine active branding values based on resolved context
  const isTenantPortal = resolutionStatus === 'RESOLVED_TENANT' && tenantBranding;
  const brandName = isTenantPortal ? tenantBranding.name : (platformSettings.platformName || 'DAVETECH ERP');
  const brandLogo = isTenantPortal ? tenantBranding.logoUrl : platformSettings.logoUrl;
  const brandPrimaryColor = isTenantPortal
    ? (tenantBranding.primaryColor || '#1D53D9')
    : (platformSettings.primaryColor || '#1D53D9');
  const brandTagline = isTenantPortal
    ? (tenantBranding.tagline || 'Secure Organization Portal')
    : (platformSettings.tagline || 'Platform Administration');
  const copyrightText = isTenantPortal
    ? `© ${new Date().getFullYear()} ${tenantBranding.name}. All rights reserved.`
    : (platformSettings.copyrightText || `© ${new Date().getFullYear()} Davetech ERP. All rights reserved.`);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col justify-between selection:bg-slate-800 selection:text-white">
      
      {/* Top Navigation Bar: Minimal and isolated */}
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              {brandName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none tracking-tight">
              {brandName}
            </h1>
            <span className="text-[10px] text-slate-500 font-medium leading-none">
              {isTenantPortal ? 'Secure Organization Portal' : 'Platform Administration'}
            </span>
          </div>
        </div>

        {/* Action / Status on Top Right */}
        <div className="flex items-center space-x-3">
          {isTenantPortal ? (
            <button
              type="button"
              onClick={handleBackToPublic}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Website</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBackToPublic}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Platform Home</span>
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Encrypted</span>
          </div>
        </div>
      </nav>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 lg:p-10 space-y-6">
          
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              {brandLogo ? (
                <div className="w-16 h-16 rounded-2xl bg-slate-50 p-2.5 border border-slate-200 shadow-xs flex items-center justify-center">
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-sm"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {brandName.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {brandName}
              </h2>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Organization Portal</span>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Create New Password'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {mode === 'login' && (
                isTenantPortal
                  ? `Sign in to access your ${brandName} portal.`
                  : `Sign in to access the ${brandName} console.`
              )}
              {mode === 'forgot' && 'Enter your registered email address to receive recovery instructions.'}
              {mode === 'reset' && 'Enter your reset token and configure your new secure password.'}
            </p>
          </div>

          {/* Active Session Continuation Banner */}
          {user && mode === 'login' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-800">
                  You're already signed in
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleGoToWorkspace}
                  className="flex-1 py-2.5 px-4 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 active:scale-98"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  <span>Continue to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setEmail('');
                    setPassword('');
                    setError('');
                    setInfo('You have been signed out.');
                  }}
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Status Notifications */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-start space-x-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold text-xs block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all font-normal text-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold text-xs">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      switchMode('forgot');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all font-normal text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button with dynamic tenant primary color */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 active:scale-98 disabled:opacity-60 mt-2"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold text-xs block">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all font-normal text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 active:scale-98 disabled:opacity-60"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <span>Send Recovery Instructions</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Have a reset token?</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: RESET PASSWORD */}
          {mode === 'reset' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold text-xs block">
                    Reset Token
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      placeholder="Paste your reset token"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold text-xs block">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold text-xs block">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 active:scale-98 disabled:opacity-60 mt-2"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 sm:px-8 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {copyrightText}
          </div>
          {isTenantPortal && tenantBranding.contactEmail ? (
            <a
              href={`mailto:${tenantBranding.contactEmail}`}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              Contact Support
            </a>
          ) : (
            <div className="text-[11px] text-slate-400">
              Secure Isolated Environment
            </div>
          )}
        </div>
      </footer>

    </div>
  );
};
