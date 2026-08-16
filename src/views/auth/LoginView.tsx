import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlatformSettings } from '../../types';
import { Shield, Lock, ArrowRight, ArrowLeft, Mail, KeyRound, CheckCircle2, AlertCircle, Globe, Info } from 'lucide-react';

interface LoginViewProps {
  tenantSlug?: string;
  onNavigateToPublic?: (slug?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ tenantSlug, onNavigateToPublic }) => {
  const { login } = useAuth();

  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');

  // Platform branding state
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformName: 'DAVETECH',
    tagline: 'Davetech Solutions',
    logoUrl: '/davetech-logo.svg',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    copyrightText: '© 2026 Davetech Solutions. All rights reserved.',
    supportEmail: 'admin@davetech.co.ke',
    companyName: 'Davetech Solutions',
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
    if (tenantSlug && tenantSlug !== 'default' && tenantSlug !== 'admin') {
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

  // Login form state - starts strictly with empty fields
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
      setError('Invalid email or password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    const isSuccess = typeof res === 'object' ? res.success : Boolean(res);
    if (!isSuccess) {
      setError(typeof res === 'object' && res.error ? res.error : 'Invalid email or password. Please check your credentials.');
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
    } catch (err) {
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
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white relative">
      {/* Top Bar Return to Public Website */}
      <div className="absolute top-4 left-4 sm:left-8 z-20">
        <button
          type="button"
          onClick={() => {
            if (onNavigateToPublic) {
              onNavigateToPublic();
            } else {
              window.location.hash = '/public';
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer backdrop-blur-md shadow-md hover:scale-102"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Back to Public Website</span>
        </button>
      </div>

      <div className="max-w-md w-full space-y-8 mt-10 sm:mt-0">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          {tenantBranding ? (
            <>
              {tenantBranding.logoUrl ? (
                <div className="w-20 h-20 bg-slate-900/90 border border-slate-800 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl p-2 group transition-transform hover:scale-105">
                  <img
                    src={tenantBranding.logoUrl}
                    alt={tenantBranding.name}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 border border-white/20 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl"
                  style={{ backgroundColor: tenantBranding.primaryColor || '#1D53D9' }}
                >
                  <Shield className="w-8 h-8" />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {tenantBranding.name}
                </h1>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {mode === 'login' && 'Staff & Portal Member Sign In'}
                  {mode === 'forgot' && 'Account Recovery'}
                  {mode === 'reset' && 'Create New Secure Password'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                  <span>Powered by </span>
                  <strong className="text-blue-400 font-semibold">Davetech ERP</strong>
                </div>
              </div>
            </>
          ) : (
            <>
              {platformSettings.logoUrl ? (
                <div className="w-20 h-20 bg-slate-900/90 border border-slate-800 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl p-2 group transition-transform hover:scale-105">
                  <img
                    src={platformSettings.logoUrl}
                    alt={platformSettings.platformName}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 border border-white/20 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl"
                  style={{ backgroundColor: platformSettings.primaryColor || '#9333ea' }}
                >
                  <Shield className="w-8 h-8" />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {platformSettings.platformName || 'DAVETECH'}
                </h1>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {mode === 'login' && (platformSettings.tagline || 'Davetech Solutions')}
                  {mode === 'forgot' && 'Password Recovery Service'}
                  {mode === 'reset' && 'Create New Secure Password'}
                </p>
              </div>

              {/* System Broadcast Announcement Notice */}
              {platformSettings.systemNotice && (
                <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-300 text-xs flex items-center justify-center space-x-2 shadow-sm">
                  <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{platformSettings.systemNotice}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Auth Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 backdrop-blur-md">
          
          {/* Notification Alerts */}
          {error && (
            <div className="p-3.5 bg-red-950/80 border border-red-800/80 text-red-200 rounded-xl text-xs font-semibold flex items-start space-x-2.5 shadow-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 rounded-xl text-xs font-semibold flex items-start space-x-2.5 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {/* MODE 1: PRODUCTION LOGIN */}
          {mode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. adminbreakthrough76@gmail.com"
                    autoComplete="email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1D53D9] focus:ring-1 focus:ring-[#1D53D9] transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryEmail(email);
                        switchMode('forgot');
                      }}
                      className="text-[11px] font-semibold text-[#7CA4EF] hover:text-white transition-colors focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1D53D9] focus:ring-1 focus:ring-[#1D53D9] transition-all font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1D53D9] hover:bg-[#1542B3] active:bg-[#0F328C] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* 1-Tap Fill Super Admin Credentials */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('adminbreakthrough76@gmail.com');
                      setPassword('password123');
                      setError('');
                    }}
                    className="w-full py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 active:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700/80 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Autofill Super Admin Account (adminbreakthrough76@gmail.com)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE 2: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-5 text-xs">
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Enter your registered business email address below. We will generate password recovery instructions for your account.
              </p>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1D53D9] focus:ring-1 focus:ring-[#1D53D9] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1D53D9] hover:bg-[#1542B3] text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Processing...' : 'Send Reset Instructions'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-[#7CA4EF] hover:text-white font-medium text-[11px] flex items-center space-x-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enter Reset Token</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-slate-400 hover:text-white font-medium text-[11px] flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: RESET PASSWORD */}
          {mode === 'reset' && (
            <div className="space-y-5 text-xs">
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Token</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Enter 64-character reset token"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1D53D9] focus:ring-1 focus:ring-[#1D53D9] transition-all font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>New Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1D53D9] focus:ring-1 focus:ring-[#1D53D9] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1D53D9] focus:ring-1 focus:ring-[#1D53D9] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1D53D9] hover:bg-[#1542B3] text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-slate-400 hover:text-white font-medium text-[11px] flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Security Note */}
        <div className="text-center space-y-3">
          <div className="text-[11px] text-slate-500 space-y-1">
            <p>{platformSettings.copyrightText || '© 2026 Davetech Solutions. All rights reserved.'}</p>
            <p className="text-[10px] text-slate-600">
              Protected by end-to-end encrypted session credentials &amp; tenant isolation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
