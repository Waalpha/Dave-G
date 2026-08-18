import React, { useState, useEffect } from 'react';
import { 
  Globe, Shield, CheckCircle2, AlertTriangle, AlertCircle, Copy, 
  ExternalLink, Plus, RefreshCw, Trash2, Star, ArrowRight, Lock, 
  Server, Info, HelpCircle, Check, Sparkles
} from 'lucide-react';
import { TenantDomain, TenantDnsRecord, DomainVerificationStatus, Tenant } from '../../../types';
import { validateDomainName, normalizeDomainName, getBaseDomain, buildTenantUrl, buildCustomDomainUrl } from '../../../lib/domainResolver';

interface TenantDomainManagerProps {
  tenantId: string;
  tenantName?: string;
  isSuperAdmin?: boolean;
  onDomainsUpdated?: () => void;
}

export const TenantDomainManager: React.FC<TenantDomainManagerProps> = ({
  tenantId,
  tenantName,
  isSuperAdmin = false,
  onDomainsUpdated
}) => {
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Add Domain Modal/Form State
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [setAsPrimary, setSetAsPrimary] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<TenantDomain | null>(null);

  // Expanded DNS Details State
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseDomain = getBaseDomain();

  const loadDomains = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = isSuperAdmin
        ? `/api/platform/domains`
        : `/api/tenant/domains`;
      
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': tenantId
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load domain configurations.');
      }

      const data = await res.json();
      const allDomains: TenantDomain[] = data.domains || [];
      const tenantDomains = isSuperAdmin
        ? allDomains.filter(d => d.tenantId === tenantId)
        : allDomains;

      setDomains(tenantDomains);

      // Auto-expand any pending custom domain so the user immediately sees DNS instructions
      const pendingCustom = tenantDomains.find(d => d.type === 'CUSTOM' && d.verificationStatus === 'PENDING');
      if (pendingCustom && !expandedDomainId) {
        setExpandedDomainId(pendingCustom.id);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load domain records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [tenantId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const validation = validateDomainName(newDomainInput);
    if (!validation.valid) {
      setAddError(validation.error || 'Invalid domain syntax.');
      return;
    }

    setAddLoading(true);
    try {
      const endpoint = isSuperAdmin
        ? `/api/platform/tenants/${tenantId}/domains`
        : `/api/tenant/domains`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          domain: normalizeDomainName(newDomainInput),
          isPrimary: setAsPrimary
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to add domain');
      }

      setActionSuccess(`Domain "${data.domain.domain}" added successfully! Configure DNS records below to verify.`);
      setNewDomainInput('');
      setSetAsPrimary(false);
      setIsAddingDomain(false);
      await loadDomains();
      if (data.domain?.id) {
        setExpandedDomainId(data.domain.id);
      }
      onDomainsUpdated?.();
    } catch (err: any) {
      setAddError(err.message || 'Failed to register domain.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    setError(null);
    setActionSuccess(null);
    try {
      const endpoint = isSuperAdmin
        ? `/api/platform/domains/${domainId}/verify`
        : `/api/tenant/domains/${domainId}/verify`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': tenantId
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Verification failed');
      }

      setActionSuccess(data.message || 'Domain verified and active!');
      await loadDomains();
      onDomainsUpdated?.();
    } catch (err: any) {
      setError(err.message || 'DNS verification failed. Please ensure DNS records have propagated.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    setSettingPrimaryId(domainId);
    setError(null);
    setActionSuccess(null);
    try {
      const endpoint = isSuperAdmin
        ? `/api/platform/domains/${domainId}/set-primary`
        : `/api/tenant/domains/${domainId}/set-primary`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': tenantId
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update primary domain');
      }

      setActionSuccess(`Primary domain changed to "${data.domain.domain}".`);
      await loadDomains();
      onDomainsUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Could not update primary domain.');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDeleteDomain = async () => {
    if (!domainToDelete) return;
    setDeletingId(domainToDelete.id);
    setError(null);
    setActionSuccess(null);
    try {
      const endpoint = isSuperAdmin
        ? `/api/platform/domains/${domainToDelete.id}`
        : `/api/tenant/domains/${domainToDelete.id}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || '',
          'x-tenant-id': tenantId
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to remove domain');
      }

      setActionSuccess(data.message || 'Domain removed.');
      setDomainToDelete(null);
      await loadDomains();
      onDomainsUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Could not remove domain.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Domains &amp; Routing Configuration</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Manage Davetech subdomains and connect your organization's custom branded domain with automated SSL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDomains}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddingDomain(true);
              setAddError(null);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs shadow-blue-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Custom Domain</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start space-x-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{actionSuccess}</div>
        </div>
      )}

      {/* Architecture Info Callout */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Server className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 text-xs">Dual Domain Resolution &amp; Tenant Isolation</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every organization receives a permanent, instant-routing Davetech subdomain (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">*.{baseDomain}</code>) and can bind custom domains (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">portal.myorganization.co.ke</code>). Both resolve to your exact workspace with isolated security.
            </p>
          </div>
        </div>
      </div>

      {/* Add Domain Form / Modal */}
      {isAddingDomain && (
        <form onSubmit={handleAddDomain} className="bg-white border-2 border-blue-500/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Connect a Custom Domain</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingDomain(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Domain Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. portal.school.co.ke or erp.company.com"
                  value={newDomainInput}
                  onChange={e => setNewDomainInput(e.target.value)}
                  required
                  className="w-full pl-3 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  FQDN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your fully qualified domain name (without http:// or https://).
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="setAsPrimaryCheckbox"
                checked={setAsPrimary}
                onChange={e => setSetAsPrimary(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="setAsPrimaryCheckbox" className="text-xs font-medium text-slate-700 cursor-pointer">
                Set as primary domain for public links and portal invitations upon verification
              </label>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingDomain(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              {addLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{addLoading ? 'Registering Domain...' : 'Register & Generate DNS Records'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Domain List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Configured Domains ({domains.length})
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            SSL &bull; TLS 1.3 &bull; Automatic Let's Encrypt / Cloud Routing
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="font-medium">Loading domain records...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Globe className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No domains configured yet.</p>
            <button
              type="button"
              onClick={() => setIsAddingDomain(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Connect First Custom Domain</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {domains.map(dom => {
              const isExpanded = expandedDomainId === dom.id;
              const isVerified = dom.verificationStatus === 'VERIFIED';
              const isSubdomain = dom.type === 'SUBDOMAIN';
              const liveUrl = isSubdomain ? buildTenantUrl(dom.domain.split('.')[0]) : buildCustomDomainUrl(dom.domain);

              return (
                <div key={dom.id} className="p-5 hover:bg-slate-50/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Domain Identifier & Badges */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {dom.domain}
                        </span>

                        {dom.isPrimary && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                            <span>Primary Domain</span>
                          </span>
                        )}

                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSubdomain
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          <span>{isSubdomain ? 'Davetech Subdomain' : 'Custom Domain'}</span>
                        </span>

                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : dom.verificationStatus === 'FAILED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isVerified ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{dom.verificationStatus}</span>
                        </span>

                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dom.sslStatus === 'ACTIVE'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Lock className="w-3 h-3" />
                          <span>SSL: {dom.sslStatus || 'ACTIVE'}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span>Created: {new Date(dom.createdAt).toLocaleDateString()}</span>
                        {dom.verifiedAt && (
                          <span>Verified: {new Date(dom.verifiedAt).toLocaleDateString()}</span>
                        )}
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                          <span>Open Live Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!isSubdomain && (
                        <button
                          type="button"
                          onClick={() => setExpandedDomainId(isExpanded ? null : dom.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Hide DNS Setup' : 'View DNS Setup'}
                        </button>
                      )}

                      {!isVerified && !isSubdomain && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDomain(dom.id)}
                          disabled={verifyingId === dom.id}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          {verifyingId === dom.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{verifyingId === dom.id ? 'Checking DNS...' : 'Verify DNS'}</span>
                        </button>
                      )}

                      {isVerified && !dom.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(dom.id)}
                          disabled={settingPrimaryId === dom.id}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          {settingPrimaryId === dom.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Star className="w-3.5 h-3.5" />
                          )}
                          <span>Make Primary</span>
                        </button>
                      )}

                      {!dom.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setDomainToDelete(dom)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete domain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DNS Record Setup Instructions */}
                  {isExpanded && !isSubdomain && (
                    <div className="mt-4 p-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2.5 text-slate-200">
                          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Server className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white">Required DNS Records for {dom.domain}</span>
                            <p className="text-[11px] text-slate-400 font-sans">
                              Add both records below in your DNS provider (e.g. Cloudflare, GoDaddy, Namecheap, Safaricom, cPanel).
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-sans">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isVerified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {isVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
                            <span>Status: {dom.verificationStatus}</span>
                          </span>
                        </div>
                      </div>

                      {/* DNS Records Cards */}
                      <div className="space-y-4 font-sans">
                        {/* RECORD 1: CNAME Routing */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                            <div className="flex items-center space-x-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono font-black text-xs">
                                CNAME
                              </span>
                              <span className="font-bold text-xs text-slate-200">Routing &amp; SSL Target</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">TTL: 300 / Automatic</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Host / Name */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Host / Name</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(dom.domain.startsWith('www.') ? 'www' : (dom.domain.split('.').length > 2 ? dom.domain.split('.')[0] : '@'), `cname_host_${dom.id}`)}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  {copiedKey === `cname_host_${dom.id}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied Host!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Host</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="font-mono text-xs font-bold text-blue-300 break-all select-all">
                                {dom.domain.startsWith('www.') ? 'www' : (dom.domain.split('.').length > 2 ? dom.domain.split('.')[0] : '@')}
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Full domain: <span className="font-mono text-slate-400">{dom.domain}</span>
                              </p>
                            </div>

                            {/* Points To / Value */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Points To / Target Value</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(`app.${baseDomain}`, `cname_val_${dom.id}`)}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  {copiedKey === `cname_val_${dom.id}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied Target!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Target</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="font-mono text-xs font-bold text-emerald-400 break-all select-all">
                                app.{baseDomain}
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Proxies traffic to Davetech SSL edge router
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* RECORD 2: TXT Verification */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                            <div className="flex items-center space-x-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-black text-xs">
                                TXT
                              </span>
                              <span className="font-bold text-xs text-slate-200">Ownership Verification Challenge</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">TTL: 300 / Automatic</span>
                          </div>

                          <div className="space-y-3">
                            {/* Host / Name */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Host / Name</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(`_davetech-challenge`, `txt_short_${dom.id}`)}
                                    className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                    title="Copy short host prefix"
                                  >
                                    {copiedKey === `txt_short_${dom.id}` ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy Host</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(`_davetech-challenge.${dom.domain}`, `txt_full_${dom.id}`)}
                                    className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                    title="Copy full FQDN host"
                                  >
                                    {copiedKey === `txt_full_${dom.id}` ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy FQDN</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="font-mono text-xs font-bold text-amber-300 break-all select-all">
                                _davetech-challenge.{dom.domain}
                              </div>
                              <p className="text-[10px] text-slate-500">
                                If your DNS provider appends your domain automatically, use host: <span className="font-mono text-slate-300 font-bold">_davetech-challenge</span>
                              </p>
                            </div>

                            {/* Verification String Value */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-400">TXT Value / Content String</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(
                                    dom.verificationToken?.startsWith('davetech-verification=')
                                      ? dom.verificationToken
                                      : `davetech-verification=${dom.verificationToken || `davetech-challenge-${dom.id.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`}`,
                                    `txt_val_${dom.id}`
                                  )}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-bold transition-colors cursor-pointer"
                                >
                                  {copiedKey === `txt_val_${dom.id}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">Copied Full Token!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Full Verification Value</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="font-mono text-xs font-bold text-amber-300 bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all leading-relaxed tracking-wide">
                                {dom.verificationToken?.startsWith('davetech-verification=')
                                  ? dom.verificationToken
                                  : `davetech-verification=${dom.verificationToken || `davetech-challenge-${dom.id.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`}`}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Paste this entire string into the TXT record Value/Content field in your DNS manager.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar with Verify DNS Button */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 font-sans text-xs">
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                          <Info className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>
                            After saving DNS records in your domain provider, click below to verify ownership.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleVerifyDomain(dom.id)}
                          disabled={verifyingId === dom.id}
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {verifyingId === dom.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>{verifyingId === dom.id ? 'Checking DNS Records...' : 'Verify DNS Records Now'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {domainToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Remove Domain?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to disconnect domain <span className="font-bold font-mono text-slate-900">{domainToDelete.domain}</span>? Users visiting this URL will no longer be routed to this organization.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDomainToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDomain}
                disabled={deletingId === domainToDelete.id}
                className="inline-flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs shadow-rose-500/20"
              >
                {deletingId === domainToDelete.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deletingId === domainToDelete.id ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
