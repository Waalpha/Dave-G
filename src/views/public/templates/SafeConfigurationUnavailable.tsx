import React from 'react';
import { ShieldAlert, Lock, Mail, Phone, MapPin, ExternalLink, ArrowRight, Building2, HelpCircle } from 'lucide-react';
import { PublicTenantInfo } from '../../../types';

interface SafeConfigurationUnavailableProps {
  tenant: PublicTenantInfo;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const SafeConfigurationUnavailable: React.FC<SafeConfigurationUnavailableProps> = ({
  tenant,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const branding = tenant.branding;
  const companyName = branding?.companyName || tenant.name || 'Organization Workspace';
  const primaryColor = branding?.primaryColor || '#1e293b';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white block">{companyName}</span>
              <span className="text-[10px] text-slate-400 font-mono">Tenant Workspace: {tenant.slug}</span>
            </div>
          </div>

          <button
            onClick={onPortalLogin}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>Portal Login</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Tenant Status Notice
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Website Configuration Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            The public landing page for <strong>{companyName}</strong> has not yet been configured with an active industry template by the workspace administrator.
          </p>
        </div>

        {/* Tenant Information Card */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-left space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Organization Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {branding?.contactEmail && (
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{branding.contactEmail}</span>
              </div>
            )}

            {branding?.contactPhone && (
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{branding.contactPhone}</span>
              </div>
            )}

            {branding?.address && (
              <div className="flex items-start space-x-2 text-slate-300 sm:col-span-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{branding.address}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 text-[11px]">
              Are you an authorized administrator for this workspace?
            </span>
            <button
              onClick={onPortalLogin}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition-colors flex items-center space-x-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>Sign In & Configure Website</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-[11px] text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {companyName}. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <span>Powered by Davetech Cloud ERP</span>
            {onNavigateToMainPlatform && (
              <button onClick={onNavigateToMainPlatform} className="text-sky-400 hover:underline cursor-pointer">
                Main Platform
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
