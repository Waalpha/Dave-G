import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlatformSettings } from '../../types';
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
  Building2,
  Layers,
  ShieldCheck,
  Check,
  BarChart3,
  Users2,
  Briefcase
} from 'lucide-react';

interface LoginViewProps {
  tenantSlug?: string;
  onNavigateToPublic?: (slug?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ tenantSlug, onNavigateToPublic }) => {
  const { user, login, logout } = useAuth();

  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Platform branding state
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformName: 'DAVETECH',
    tagline: 'One Platform. Every Business.',
    logoUrl: '/davetech-logo.svg',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    copyrightText: '© 2026 Davetech ERP. All rights reserved.',
    supportEmail: 'support@davetech.co.ke',
    companyName: 'Davetech ERP',
    allowSelfRegistration: false,
    systemNotice: ''
  });

  // Tenant branding state when accessed via tenant subdomain
  const [tenantBranding, setTenantBranding] = useState<{
    name: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    contactEmail?: string;
  } | null>(null);

  useEffect(() => {
    if (tenantSlug && tenantSlug !== 'default' && tenantSlug !== 'admin' && tenantSlug !== 'root') {
      fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.tenant) {
            setTenantBranding({
              name: data.tenant.name,
              logoUrl: data.tenant.branding?.logoUrl,
              primaryColor: data.tenant.branding?.primaryColor || '#1D53D9',
              secondaryColor: data.tenant.branding?.secondaryColor || '#F49C10',
              contactEmail: data.tenant.branding?.contactEmail
            });
          }
        })
        .catch(() => {});
    }

    fetch('/api/public/platform-settings')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.platformName) {
          setPlatformSettings(data);
        }
      })
      .catch(() => {});
  }, [tenantSlug]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password recovery form state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status feedback
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Sign In submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      setLoading(false);

      const isSuccess = typeof res === 'object' ? res.success : Boolean(res);
      if (!isSuccess) {
        setError(typeof res === 'object' && res.error ? res.error : 'Invalid email or password. Please try again.');
      }
    } catch {
      setLoading(false);
      setError('Unable to sign in. Please try again.');
    }
  };

  // Handle Forgot Password submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!recoveryEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() })
      });
      const data = await res.json().catch(() => null);
      
      setInfo('If an account exists for that email address, password reset instructions have been generated.');
      
      if (data && data.devResetToken) {
        setResetToken(data.devResetToken);
      }
    } catch {
      setInfo('If an account exists for that email address, password reset instructions have been generated.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!resetToken.trim()) {
      setError('Please enter a valid reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setInfo('Your password has been successfully reset. You can now sign in.');
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
      setError('An error occurred while resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'forgot' | 'reset') => {
    setError('');
    setInfo('');
    setMode(newMode);
  };

  const handleBackToPublic = () => {
    if (onNavigateToPublic) {
      onNavigateToPublic();
    } else {
      window.location.hash = '/public';
    }
  };

  const handleGoToWorkspace = () => {
    if (user?.role === 'SUPER_ADMIN') {
      window.location.hash = '/platform/dashboard';
    } else {
      window.location.hash = '/app/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Bar Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={handleBackToPublic}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100/80 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          <span>Back to Davetech ERP</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium">Cloud ERP Online</span>
        </div>
      </nav>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: Davetech ERP Branding & Value Strip (Desktop) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            
            {/* Background Decorative Mesh Shapes */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-8">
              {/* Brand Logo & Name */}
              <div className="flex items-center space-x-3.5">
                {tenantBranding?.logoUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-white/10 p-2 border border-white/20 flex items-center justify-center backdrop-blur-xs">
                    <img src={tenantBranding.logoUrl} alt={tenantBranding.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 shadow-md flex items-center justify-center">
                    <img src="/davetech-logo.svg" alt="Davetech ERP" className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>{tenantBranding ? tenantBranding.name : 'DAVETECH ERP'}</span>
                  </div>
                  <div className="text-[11px] font-medium text-blue-300">
                    {tenantBranding ? 'Authorized Tenant Portal' : 'One Platform. Every Business.'}
                  </div>
                </div>
              </div>

              {/* Main Headline & Description */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  One Platform. <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    Every Business.
                  </span>
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  Manage your organization with a powerful, secure cloud ERP platform designed for seamless operations across all departments.
                </p>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Multi-Tenant Cloud Platform', desc: 'Dedicated workspaces with strict organization boundaries' },
                  { label: 'Business Management', desc: 'Integrated finance, inventory, POS, HR, and sales' },
                  { label: 'Industry Solutions', desc: 'Tailored tools for retail, education, healthcare, and services' },
                  { label: 'Role-Based Access', desc: 'Enterprise-grade permission controls and audit logs' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Platform Status */}
            <div className="relative z-10 pt-8 border-t border-white/10 mt-8 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Cloud Security</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">v2.5.0</div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: White Modern Login Card                       */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Header Titles */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'forgot' && 'Reset Your Password'}
                  {mode === 'reset' && 'Create New Password'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  {mode === 'login' && (
                    tenantBranding 
                      ? `Sign in to access the ${tenantBranding.name} portal.`
                      : 'Sign in to your Davetech ERP workspace.'
                  )}
                  {mode === 'forgot' && 'Enter your business email to receive recovery instructions.'}
                  {mode === 'reset' && 'Enter your reset token and configure your new secure password.'}
                </p>
              </div>

              {/* Active Session Continuation Banner */}
              {user && mode === 'login' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <span className="text-xs font-semibold text-slate-800">
                      You're already signed in
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleGoToWorkspace}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium flex items-start space-x-2.5 shadow-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {info && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-start space-x-2.5 shadow-xs animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{info}</span>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MODE 1: PRODUCTION LOGIN                           */}
              {/* -------------------------------------------------- */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-semibold text-xs flex items-center justify-between">
                      <span>Email Address</span>
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
                        placeholder="name@company.com"
                        autoComplete="email"
                        className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-normal text-xs"
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
                        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-normal text-xs"
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    {loading ? (
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

              {/* -------------------------------------------------- */}
              {/* MODE 2: FORGOT PASSWORD                           */}
              {/* -------------------------------------------------- */}
              {mode === 'forgot' && (
                <div className="space-y-4 text-xs">
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-semibold text-xs">
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
                          placeholder="name@company.com"
                          className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-normal text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Instructions...</span>
                        </>
                      ) : (
                        <span>Send Recovery Instructions</span>
                      )}
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Have a reset token?</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MODE 3: RESET PASSWORD                            */}
              {/* -------------------------------------------------- */}
              {mode === 'reset' && (
                <div className="space-y-4 text-xs">
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-semibold text-xs">
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
                          className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-semibold text-xs">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-semibold text-xs">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-5 px-4 sm:px-8 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {platformSettings.copyrightText || '© 2026 Davetech ERP. All rights reserved.'}
          </div>
          <div className="flex items-center space-x-6">
            <button type="button" onClick={handleBackToPublic} className="hover:text-blue-600 transition-colors cursor-pointer">
              Privacy
            </button>
            <button type="button" onClick={handleBackToPublic} className="hover:text-blue-600 transition-colors cursor-pointer">
              Terms
            </button>
            <button type="button" onClick={handleBackToPublic} className="hover:text-blue-600 transition-colors cursor-pointer">
              Support
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
