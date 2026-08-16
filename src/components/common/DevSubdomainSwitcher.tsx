import React, { useState, useEffect } from 'react';
import { Globe, Shield, Building, ChevronDown, Check, ExternalLink, X } from 'lucide-react';
import { Tenant } from '../../types';
import { getBaseDomain } from '../../lib/domainResolver';

interface DevSubdomainSwitcherProps {
  currentResolvedType: 'PLATFORM_ROOT' | 'PLATFORM_ADMIN' | 'TENANT' | 'RESERVED';
  currentTenantSlug: string | null;
  onSelectTarget: (type: 'PLATFORM_ROOT' | 'PLATFORM_ADMIN' | 'TENANT', slug?: string) => void;
}

export const DevSubdomainSwitcher: React.FC<DevSubdomainSwitcherProps> = ({
  currentResolvedType,
  currentTenantSlug,
  onSelectTarget
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const baseDomain = getBaseDomain();

  useEffect(() => {
    fetch('/api/platform/tenants')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTenants(data);
        }
      })
      .catch(() => {});
  }, []);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-3 right-3 z-50 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-full shadow-2xl text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur cursor-pointer"
        title="Open Domain/Subdomain Switcher"
      >
        <Globe className="w-3.5 h-3.5 text-blue-400" />
        <span>Subdomain Switcher</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 font-sans">
      <div className="bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur p-2.5 sm:p-3 text-slate-200 text-xs flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] text-slate-400">Current Domain:</span>
          <span className="font-mono font-bold text-white text-[11px]">
            {currentResolvedType === 'PLATFORM_ADMIN' && `admin.${baseDomain}`}
            {currentResolvedType === 'PLATFORM_ROOT' && `${baseDomain}`}
            {currentResolvedType === 'TENANT' && (
              currentTenantSlug?.includes('.') ? currentTenantSlug : `${currentTenantSlug || 'tenant'}.${baseDomain}`
            )}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
          >
            <span>Switch Domain</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 space-y-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs">Simulate Wildcard Subdomain</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Core Targets */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onSelectTarget('PLATFORM_ROOT');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentResolvedType === 'PLATFORM_ROOT' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <div className="font-semibold">Davetech Main Website</div>
                      <div className="text-[10px] opacity-75 font-mono">{baseDomain}</div>
                    </div>
                  </div>
                  {currentResolvedType === 'PLATFORM_ROOT' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    onSelectTarget('PLATFORM_ADMIN');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentResolvedType === 'PLATFORM_ADMIN' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <div>
                      <div className="font-semibold">Platform Super Admin</div>
                      <div className="text-[10px] opacity-75 font-mono">admin.{baseDomain}</div>
                    </div>
                  </div>
                  {currentResolvedType === 'PLATFORM_ADMIN' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Tenant Subdomains */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Tenant Subdomains (*.{baseDomain})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {tenants.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTarget('TENANT', t.slug);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        currentResolvedType === 'TENANT' && currentTenantSlug === t.slug
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-medium">{t.name}</span>
                        <span className="block text-[10px] opacity-70 font-mono">
                          {t.slug}.{baseDomain}
                        </span>
                      </div>
                      {currentResolvedType === 'TENANT' && currentTenantSlug === t.slug && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Arbitrary Subdomain (e.g. unknown or new) */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Test Any Subdomain:
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customInput.trim()) {
                      onSelectTarget('TENANT', customInput.trim());
                      setCustomInput('');
                      setIsOpen(false);
                    }
                  }}
                  className="flex gap-1"
                >
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. unknowncompany"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Go
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setMinimized(true)}
          className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          title="Minimize switcher"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
