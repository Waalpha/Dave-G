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
  Building2,
  GraduationCap,
  Activity,
  Landmark,
  Coins,
  Church,
  Store,
  UtensilsCrossed,
  LogOut,
  Sparkles,
  ExternalLink
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
  contactPhone?: string;
  coverUrl?: string;
  type?: string;
  educationType?: string;
  websiteEnabled?: boolean;
}

// Industry-aware helper: provides dynamic context labels, descriptions, and feature lists
function getTenantIndustryDetails(tenantType?: string, educationType?: string, tenantName?: string) {
  const tType = (tenantType || '').toUpperCase();
  const eType = (educationType || '').toUpperCase();

  if (tType === 'EDUCATION' || eType) {
    const specificEdu =
      eType === 'UNIVERSITY'
        ? 'University'
        : eType === 'COLLEGE'
        ? 'College'
        : eType === 'TVET' || eType === 'VOCATIONAL_TRAINING'
        ? 'Technical & Vocational Institute'
        : eType === 'SECONDARY_SCHOOL' || eType === 'PRIMARY_SCHOOL'
        ? 'School'
        : 'Educational Institution';

    return {
      portalLabel: `Secure ${specificEdu} Portal`,
      typeBadge: specificEdu,
      welcomeSubtitle: 'Sign in to access student management, academic records, examinations and fee billing.',
      defaultTagline: 'Excellence in Academic Management, Student Services & Administration.',
      highlights: [
        'Admissions, Student Registers & Transcripts',
        'Fee Billing, Invoicing & Automated M-Pesa Receipts',
        'Lecturer Timetables, Attendance & Exam Grading'
      ],
      Icon: GraduationCap
    };
  }

  if (tType === 'HOSPITAL' || tType === 'HEALTHCARE' || tType === 'CLINIC') {
    return {
      portalLabel: 'Secure Healthcare Portal',
      typeBadge: 'Healthcare Facility',
      welcomeSubtitle: 'Sign in to access electronic health records, triage, pharmacy, diagnostics and patient care.',
      defaultTagline: 'Precision Clinical Workflows, Patient Care & Statutory Compliance.',
      highlights: [
        'Outpatient Triage, Consultation & Clinical Encounters',
        'Pharmacy Dispensing, Drug Inventory & Batches',
        'Laboratory Diagnostics, Radiology & Medical Billing'
      ],
      Icon: Activity
    };
  }

  if (tType === 'SACCO') {
    return {
      portalLabel: 'Secure SACCO Portal',
      typeBadge: 'Financial Co-operative',
      welcomeSubtitle: 'Sign in to access member accounts, shares, loan processing, and dividend management.',
      defaultTagline: 'Financial Integrity, Member Empowerment & Automated Credit Management.',
      highlights: [
        'Member Registers, Share Capital & Savings Ledger',
        'Loan Appraisals, Guarantor Scoring & Repayments',
        'Automated Dividend Computations & Auditing'
      ],
      Icon: Landmark
    };
  }

  if (tType === 'CHAMA') {
    return {
      portalLabel: 'Secure Chama Portal',
      typeBadge: 'Investment Group',
      welcomeSubtitle: 'Sign in to access group contributions, merry-go-round cycles, and investment records.',
      defaultTagline: 'Collaborative Wealth Creation & Transparent Group Ledgers.',
      highlights: [
        'Group Contributions & Merry-Go-Round Rotations',
        'Member Welfare Balances & Investment Portfolio',
        'Automated Double-Entry Financial Statements'
      ],
      Icon: Coins
    };
  }

  if (tType === 'CHURCH') {
    return {
      portalLabel: 'Secure Ministry Portal',
      typeBadge: 'Church & Ministry',
      welcomeSubtitle: 'Sign in to access church membership, fellowship groups, tithes, and community outreach.',
      defaultTagline: 'Empowering Ministry Operations, Fellowship & Stewardship.',
      highlights: [
        'Member Directory, Departments & Fellowship Cells',
        'Tithes, Offerings, Pledges & Project Giving',
        'Pastoral Scheduling & Ministry Event Workflows'
      ],
      Icon: Church
    };
  }

  if (tType === 'WHOLESALE' || tType === 'RETAIL' || tType === 'POS' || tType === 'BOOKSHOP') {
    return {
      portalLabel: 'Secure Commerce & POS Portal',
      typeBadge: 'Commerce & Retail',
      welcomeSubtitle: 'Sign in to access point of sale checkout, inventory control, purchase orders, and sales analytics.',
      defaultTagline: 'High-Velocity Counter Sales, Inventory Optimization & Fiscal Compliance.',
      highlights: [
        'Touch POS & Thermal Barcode Checkout',
        'Multi-Warehouse Inventory & Batch Reorder Triggers',
        'Real-Time Sales Reconciliation & Margin Analytics'
      ],
      Icon: Store
    };
  }

  if (tType === 'RESTAURANT' || tType === 'BAR') {
    return {
      portalLabel: 'Secure Hospitality Portal',
      typeBadge: 'Hospitality & Dining',
      welcomeSubtitle: 'Sign in to access table orders, kitchen display, recipe costing, and cashier settlement.',
      defaultTagline: 'Efficient Floor Management, Kitchen Speed & Revenue Control.',
      highlights: [
        'Table Management & Kitchen Order Ticketing (KOT)',
        'Recipe Costing & Beverage Inventory Depletion',
        'Fast Split Payments & Cashier Shift Audits'
      ],
      Icon: UtensilsCrossed
    };
  }

  // General / Default ERP Organization
  return {
    portalLabel: 'Secure Organization Portal',
    typeBadge: 'Enterprise Workspace',
    welcomeSubtitle: tenantName
      ? `Sign in to access your ${tenantName} workspace.`
      : 'Sign in to access your organization workspace.',
    defaultTagline: 'Centralized Enterprise Management, Accounting & Operations.',
    highlights: [
      'Role-Based Granular Access & Module Security',
      'Statutory Double-Entry Accounting & Financial Ledger',
      'Real-Time Audit Trails & Cryptographic Data Isolation'
    ],
    Icon: Building2
  };
}

export const LoginView: React.FC<LoginViewProps> = ({ tenantSlug, onNavigateToPublic }) => {
  const { user, login, logout, isLoading: authLoading } = useAuth();

  // Navigation mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Tenant resolution status: 'LOADING' | 'RESOLVED_TENANT' | 'TENANT_NOT_FOUND' | 'PLATFORM_ADMIN'
  const [resolutionStatus, setResolutionStatus] = useState<
    'LOADING' | 'RESOLVED_TENANT' | 'TENANT_NOT_FOUND' | 'PLATFORM_ADMIN'
  >('LOADING');

  // Resolved tenant branding state
  const [tenantBranding, setTenantBranding] = useState<TenantBrandingInfo | null>(null);

  // Platform branding state (used when accessing platform admin / root domain)
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
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [cancelRedirect, setCancelRedirect] = useState(false);

  // 1. Resolve Tenant Configuration on mount or when tenantSlug changes
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
              contactPhone: t.branding?.contactPhone || t.contactPhone,
              coverUrl: t.branding?.coverUrl,
              type: t.type,
              educationType: t.educationType,
              websiteEnabled: t.publicWebsite?.enabled ?? true
            };
            setTenantBranding(branding);
            setResolutionStatus('RESOLVED_TENANT');
            document.title = `${branding.name} — Sign In`;
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
      document.title = 'Davetech ERP — Sign In';
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

  // 2. Authenticated User Handling: Auto-redirect if already signed in
  useEffect(() => {
    if (!user || cancelRedirect || resolutionStatus === 'LOADING') return;

    setRedirectCountdown(2);
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleNavigateToWorkspace();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, cancelRedirect, resolutionStatus]);

  const handleNavigateToWorkspace = () => {
    if (user?.role === 'SUPER_ADMIN') {
      window.location.hash = '/platform/dashboard';
    } else {
      window.location.hash = '/app/dashboard';
    }
  };

  // Handle Login Submit
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
            : 'Incorrect email address or password. Please try again.'
        );
      }
    } catch {
      setSubmitting(false);
      setError('Unable to sign in. Please verify your connection and try again.');
    }
  };

  // Handle Forgot Password Submit
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

  // Handle Password Reset Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!resetToken.trim()) {
      setError('Please enter your reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
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

  const handleBackToPublic = () => {
    if (onNavigateToPublic) {
      onNavigateToPublic(tenantBranding?.slug);
    } else if (tenantBranding?.slug) {
      window.location.hash = `/public/${tenantBranding.slug}`;
    } else {
      window.location.hash = '/public';
    }
  };

  // 1. LOADING STATE: Clean skeleton screen without any hardcoded names
  if (resolutionStatus === 'LOADING' || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 animate-pulse mx-auto flex items-center justify-center">
            <Building2 className="w-7 h-7 text-slate-600" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-800 rounded-lg animate-pulse mx-auto" />
            <div className="h-3.5 w-32 bg-slate-800/60 rounded-md animate-pulse mx-auto" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-11 bg-slate-800/80 rounded-xl animate-pulse" />
            <div className="h-11 bg-slate-800/80 rounded-xl animate-pulse" />
            <div className="h-12 bg-blue-600/30 rounded-xl animate-pulse mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // 2. TENANT NOT FOUND STATE: Clean invalid portal resolution page
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

  // Active branding parameters
  const isTenantPortal = resolutionStatus === 'RESOLVED_TENANT' && !!tenantBranding;
  const brandName = isTenantPortal ? tenantBranding.name : (platformSettings.platformName || 'DAVETECH');
  const brandLogo = isTenantPortal ? tenantBranding.logoUrl : platformSettings.logoUrl;
  const brandPrimaryColor = isTenantPortal
    ? (tenantBranding.primaryColor || '#1D53D9')
    : (platformSettings.primaryColor || '#1D53D9');
  const brandSecondaryColor = isTenantPortal
    ? (tenantBranding.secondaryColor || '#F49C10')
    : (platformSettings.secondaryColor || '#F49C10');

  // Industry-specific text and icons
  const industryDetails = isTenantPortal
    ? getTenantIndustryDetails(tenantBranding.type, tenantBranding.educationType, tenantBranding.name)
    : {
        portalLabel: 'Platform Administration Console',
        typeBadge: 'Central SaaS Infrastructure',
        welcomeSubtitle: 'Sign in to access multi-tenant administration, billing & system governance.',
        defaultTagline: 'High-Performance Cloud ERP Architecture & Enterprise Automation.',
        highlights: [
          'Global Tenant Provisioning & Subscription Billing',
          'Enterprise RBAC & Centralized Security Policies',
          'Cross-Tenant Telemetry & Cryptographic Audit Trails'
        ],
        Icon: ShieldCheck
      };

  const portalTagline = isTenantPortal && tenantBranding.tagline
    ? tenantBranding.tagline
    : industryDetails.defaultTagline;

  const IndustryIcon = industryDetails.Icon;

  // =========================================================================
  // 3. AUTHENTICATED USER SESSION SCREEN
  // If user is signed in, show ONLY the dedicated session management screen
  // (NEVER alongside or above the standard email/password inputs).
  // =========================================================================
  if (user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
        {/* Minimal top bar */}
        <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-700 shadow-xs"
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
              <span className="text-sm font-bold text-white tracking-tight block leading-tight">
                {brandName}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {industryDetails.portalLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Session</span>
            </div>
          </div>
        </header>

        {/* Dedicated Session Management Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: brandPrimaryColor }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: brandSecondaryColor }}
            />

            {/* Avatar / Organization Monogram */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg border border-slate-700 bg-slate-800 p-1">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-emerald-500 text-slate-950 border-2 border-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* User Greeting */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Signed In to {brandName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user.name}
              </h1>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                You are currently signed in as{' '}
                <span className="text-slate-200 font-medium">{user.email}</span> with{' '}
                <span className="text-blue-400 font-medium">
                  {user.role === 'SUPER_ADMIN'
                    ? 'Platform Super Admin'
                    : user.role === 'TENANT_ADMIN'
                    ? 'Organization Admin'
                    : 'Authorized User'}
                </span>{' '}
                privileges.
              </p>
            </div>

            {/* Auto-redirect countdown notice */}
            {redirectCountdown !== null && redirectCountdown > 0 && !cancelRedirect && (
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-xs text-blue-300 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  Redirecting to workspace in {redirectCountdown}s...
                </span>
                <button
                  type="button"
                  onClick={() => setCancelRedirect(true)}
                  className="text-xs text-blue-200 hover:text-white font-semibold underline cursor-pointer"
                >
                  Stay here
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleNavigateToWorkspace}
                className="w-full py-3.5 px-6 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99]"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                <span>Continue to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setEmail('');
                    setPassword('');
                    setError('');
                    setInfo('You have successfully signed out.');
                    setCancelRedirect(true);
                  }}
                  className="flex-1 py-3 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign In with Different Account</span>
                </button>

                {isTenantPortal && (
                  <button
                    type="button"
                    onClick={handleBackToPublic}
                    className="py-3 px-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Public Site</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer Isolation Note */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
              Session is encrypted & bound to {brandName}
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="w-full py-4 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </footer>
      </div>
    );
  }

  // =========================================================================
  // 4. UN-AUTHENTICATED LOGIN EXPERIENCE (Split Desktop Hero + Auth Form)
  // Clean, modern enterprise SaaS authentication page that dynamically adapts
  // to any tenant type (Schools, Hospitals, SACCOs, Retail, Churches, etc.)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:grid lg:grid-cols-12 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* =================================================================== */}
      {/* LEFT COLUMN: Branded Hero & Organization Identity Card (Desktop)   */}
      {/* =================================================================== */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/80 flex-col justify-between p-8 xl:p-12 relative overflow-hidden">
        
        {/* Subtle Ambient Background Gradients */}
        <div
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: brandPrimaryColor }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: brandSecondaryColor }}
        />

        {/* Top: Organization Brand Header */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3.5">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-12 h-12 rounded-2xl object-contain bg-white p-1 border border-slate-700 shadow-md"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {brandName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                {brandName}
              </h1>
              <span className="text-xs text-slate-400 font-medium block">
                {industryDetails.portalLabel}
              </span>
            </div>
          </div>

          {/* Industry Type Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-semibold shadow-xs">
            <IndustryIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{industryDetails.typeBadge}</span>
          </div>
        </div>

        {/* Middle: Value Statement & Dynamic Features */}
        <div className="relative z-10 space-y-8 my-8">
          <div className="space-y-3">
            <h2 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {portalTagline}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {industryDetails.welcomeSubtitle}
            </p>
          </div>

          {/* 3 Key Operational Highlights */}
          <div className="space-y-3">
            {industryDetails.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-slate-300 font-medium leading-relaxed">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Security & Isolation Badge */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">256-Bit TLS Encryption</span>
          </div>
          <span className="text-[11px] text-slate-500">Strict Data Isolation</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT COLUMN: Authentication Form Container                         */}
      {/* =================================================================== */}
      <div className="flex-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16">
        
        {/* Top Bar for Mobile/Tablet & Navigation Link */}
        <div className="w-full flex items-center justify-between mb-6 sm:mb-8">
          {/* Mobile brand monogram */}
          <div className="flex lg:hidden items-center gap-2.5">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-9 h-9 rounded-xl object-contain bg-white p-1 border border-slate-700 shadow-xs"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {brandName.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-sm font-bold text-white block leading-none">
                {brandName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {industryDetails.portalLabel}
              </span>
            </div>
          </div>

          {/* Right Action: Public Website Return */}
          <div className="ml-auto">
            {isTenantPortal && tenantBranding.websiteEnabled ? (
              <button
                type="button"
                onClick={handleBackToPublic}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900 border border-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Back to Website</span>
              </button>
            ) : !isTenantPortal ? (
              <button
                type="button"
                onClick={handleBackToPublic}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900 border border-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Back to Home</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Center Form Card */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Card Title & Dynamic Subtitle */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold">
              <IndustryIcon className="w-3 h-3 text-blue-400" />
              <span>{industryDetails.portalLabel}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mode === 'login' && 'Sign In to Workspace'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Create New Password'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {mode === 'login' && industryDetails.welcomeSubtitle}
              {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
              {mode === 'reset' && 'Enter your reset token and configure your new secure password.'}
            </p>
          </div>

          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/80 text-red-300 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {info && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{info}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs sm:text-sm font-normal"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      switchMode('forgot');
                    }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors focus:outline-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs sm:text-sm font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button (Dynamically tinted with tenant's primary brand color) */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99] disabled:opacity-60 mt-2"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Have a reset token?</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <div className="space-y-4">
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Reset Token
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      placeholder="Paste your 64-character token"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99] disabled:opacity-60 mt-2"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* Minimal Platform Brand Attribution Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Davetech ERP Multi-Tenant Cloud</span>
            </span>
            <span>v4.0 Secure</span>
          </div>

        </div>

        {/* Bottom copyright notice */}
        <div className="w-full text-center text-xs text-slate-500 pt-6">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>

      </div>

    </div>
  );
};
