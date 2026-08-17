import React from 'react';
import { Globe, Building2, HelpCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { getBaseDomain } from '../../lib/domainResolver';

interface TenantNotFoundProps {
  attemptedSlug?: string;
  onNavigateHome?: () => void;
}

export const TenantNotFound: React.FC<TenantNotFoundProps> = ({
  attemptedSlug = '',
  onNavigateHome
}) => {
  const baseDomain = getBaseDomain();

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = `https://${baseDomain}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Status */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Building2 className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Hostname Resolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Organization Not Found
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            This organization could not be found.
          </p>
          {attemptedSlug && (
            <div className="py-2 px-4 bg-slate-950 rounded-xl border border-slate-800 text-blue-400 font-mono text-sm inline-block shadow-inner break-all">
              {attemptedSlug.includes('.') ? attemptedSlug : `${attemptedSlug}.${baseDomain}`}
            </div>
          )}
        </div>

        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 text-left text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Possible Reasons:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>The subdomain or organization name may be misspelled in the URL.</li>
            <li>The organization workspace may be inactive or suspended.</li>
            <li>DNS propagation or custom domain assignment may still be in progress.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Back to https://{baseDomain}</span>
          </button>
          <a
            href={`mailto:support@${baseDomain}`}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>Contact Platform Support</span>
          </a>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
          Davetech Cloud ERP Platform • Multi-Tenant Architecture
        </div>
      </div>
    </div>
  );
};
