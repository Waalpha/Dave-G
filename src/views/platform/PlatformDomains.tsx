import React, { useState, useEffect } from 'react';
import { 
  Globe, Server, CheckCircle2, AlertCircle, RefreshCw, Plus, Search, 
  Trash2, Star, ShieldCheck, Lock, ExternalLink, Filter, Building2, Copy, Check,
  ArrowRight, Eye, Shield, AlertTriangle, Layers, X
} from 'lucide-react';
import { TenantDomain, Tenant } from '../../types';
import { TenantDomainManager } from '../tenant/components/TenantDomainManager';
import { getBaseDomain, buildTenantUrl, buildCustomDomainUrl, validateDomainName, normalizeDomainName } from '../../lib/domainResolver';
import { useAuth } from '../../context/AuthContext';

interface PlatformDomainsProps {
  onInspectNavigate?: () => void;
}

export const PlatformDomains: React.FC<PlatformDomainsProps> = ({ onInspectNavigate }) => {
  const { inspectTenant } = useAuth();
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SUBDOMAIN' | 'CUSTOM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'FAILED'>('ALL');

  // Add Domain Modal State
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [selectedTenantIdForAdd, setSelectedTenantIdForAdd] = useState('');
  const [newDomainInput, setNewDomainInput] = useState('');
  const [setAsPrimaryInput, setSetAsPrimaryInput] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Selected Tenant for detailed manager modal
  const [selectedTenantForDomainModal, setSelectedTenantForDomainModal] = useState<Tenant | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseDomain = getBaseDomain();

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [domainsRes, tenantsRes] = await Promise.all([
        fetch('/api/platform/domains', { headers: getHeaders() }),
        fetch('/api/platform/tenants', { headers: getHeaders() })
      ]);

      if (domainsRes.ok) {
        const domData = await domainsRes.json();
        setDomains(domData.domains || []);
      }
      if (tenantsRes.ok) {
        const tenData = await tenantsRes.json();
        if (Array.isArray(tenData)) {
          setTenants(tenData);
          if (tenData.length > 0 && !selectedTenantIdForAdd) {
            setSelectedTenantIdForAdd(tenData[0].id);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load domains.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInspect = async (tenantId: string) => {
    const success = await inspectTenant(tenantId);
    if (success) {
      onInspectNavigate?.();
    }
  };

  const handleAddDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    if (!selectedTenantIdForAdd) {
      setAddError('Please select a target tenant organization.');
      return;
    }

    const validation = validateDomainName(newDomainInput);
    if (!validation.valid) {
      setAddError(validation.error || 'Invalid domain syntax.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch(`/api/platform/tenants/${selectedTenantIdForAdd}/domains`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          domain: normalizeDomainName(newDomainInput),
          isPrimary: setAsPrimaryInput
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add domain');
      }

      setAddSuccess(`Domain "${data.domain.domain}" successfully added and DNS records initialized!`);
      setNewDomainInput('');
      setSetAsPrimaryInput(false);
      await fetchData();

      const targetTenant = tenants.find(t => t.id === selectedTenantIdForAdd);
      if (targetTenant) {
        setSelectedTenantForDomainModal(targetTenant);
      }
      setIsAddDomainModalOpen(false);
    } catch (err: any) {
      setAddError(err.message || 'Failed to register domain.');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredDomains = domains.filter(dom => {
    const tenant = tenants.find(t => t.id === dom.tenantId);
    const matchesSearch = 
      dom.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant?.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant?.type || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || dom.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || dom.verificationStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalDomains = domains.length;
  const customDomainsCount = domains.filter(d => d.type === 'CUSTOM').length;
  const verifiedDomainsCount = domains.filter(d => d.verificationStatus === 'VERIFIED').length;
  const pendingDomainsCount = domains.filter(d => d.verificationStatus === 'PENDING' && d.type === 'CUSTOM').length;

  const getTenantTypeBadge = (type?: string) => {
    switch (type) {
      case 'EDUCATION':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">Education</span>;
      case 'HOSPITAL':
      case 'HEALTHCARE':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Healthcare</span>;
      case 'RETAIL':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Retail</span>;
      case 'WHOLESALE':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Wholesale</span>;
      case 'SACCO':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">Chama / SACCO</span>;
      case 'POS':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">POS Retail</span>;
      case 'BOOKSHOP':
        return <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold">Bookshop</span>;
      case 'BAR':
      case 'RESTAURANT':
        return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">Restaurant / Bar</span>;
      case 'CHURCH':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">Church</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">Enterprise</span>;
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Platform Domains &amp; DNS Routing</h1>
            <p className="text-xs text-slate-500 font-medium">
              Centralized Davetech subdomains (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">*.{baseDomain}</code>) and custom tenant domains with automated SSL &amp; DNS challenge verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddDomainModalOpen(true);
              setAddError(null);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs shadow-blue-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Domain</span>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Domains</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalDomains}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Subdomains &amp; Custom Domains</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Custom Domains</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">{customDomainsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Tenant-owned branded domains</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{verifiedDomainsCount}</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">SSL / TLS 1.3 Active</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending DNS Check</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{pendingDomainsCount}</p>
          <p className="text-[10px] text-amber-600 mt-1 font-medium">Awaiting CNAME / TXT challenge</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain, organization, type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'SUBDOMAIN', 'CUSTOM'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  typeFilter === type
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type === 'SUBDOMAIN' ? 'Subdomains' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'VERIFIED', 'PENDING', 'FAILED'] as const).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Domain / Hostname</th>
                <th className="p-4">Assigned Tenant</th>
                <th className="p-4">Tenant Type</th>
                <th className="p-4">Domain Type</th>
                <th className="p-4">Verification</th>
                <th className="p-4">SSL Security</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold">Loading domain records...</p>
                  </td>
                </tr>
              ) : filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No matching domains found.</p>
                  </td>
                </tr>
              ) : (
                filteredDomains.map(dom => {
                  const tenant = tenants.find(t => t.id === dom.tenantId);
                  const isVerified = dom.verificationStatus === 'VERIFIED';
                  const isSubdomain = dom.type === 'SUBDOMAIN';
                  const liveUrl = isSubdomain ? buildTenantUrl(dom.domain.split('.')[0]) : buildCustomDomainUrl(dom.domain);

                  return (
                    <tr key={dom.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {dom.domain}
                          </span>
                          {dom.isPrimary && (
                            <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Star className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                              <span>Primary</span>
                            </span>
                          )}
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      <td className="p-4">
                        {tenant ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                              {tenant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{tenant.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Slug: {tenant.slug}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">{dom.tenantId}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {getTenantTypeBadge(tenant?.type)}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSubdomain
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {isSubdomain ? 'Davetech Subdomain' : 'Custom Domain'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                          <Lock className="w-3 h-3 text-teal-600" />
                          <span>TLS 1.3 Active</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {tenant && (
                            <button
                              type="button"
                              onClick={() => handleInspect(tenant.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1"
                              title="Open and inspect tenant workspace"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Workspace</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (tenant) {
                                setSelectedTenantForDomainModal(tenant);
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Manage DNS</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connect New Domain Modal for Super Admin */}
      {isAddDomainModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connect Domain to Organization</h3>
                  <p className="text-[11px] text-slate-500">Platform-level hostname mapping and DNS provisioner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDomainModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDomainSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Organization <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTenantIdForAdd}
                  onChange={e => setSelectedTenantIdForAdd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug} • {t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Domain Name (FQDN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. portal.school.co.ke or www.company.com"
                  value={newDomainInput}
                  onChange={e => setNewDomainInput(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter fully qualified domain name (e.g. <code className="text-blue-600 font-mono">portal.sheeworld.co.ke</code> or <code className="text-blue-600 font-mono">www.sheeworld.com</code>)
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modalPrimaryCheckbox"
                  checked={setAsPrimaryInput}
                  onChange={e => setSetAsPrimaryInput(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="modalPrimaryCheckbox" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Set as primary domain for this organization
                </label>
              </div>

              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDomainModalOpen(false)}
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
                  <span>{addLoading ? 'Connecting...' : 'Connect & Generate DNS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Domain Details Modal */}
      {selectedTenantForDomainModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Domain &amp; Routing: {selectedTenantForDomainModal.name}
                    </h3>
                    {getTenantTypeBadge(selectedTenantForDomainModal.type)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Tenant ID: {selectedTenantForDomainModal.id} &bull; Subdomain: {selectedTenantForDomainModal.slug || selectedTenantForDomainModal.subdomain}.{baseDomain}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleInspect(selectedTenantForDomainModal.id)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTenantForDomainModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <TenantDomainManager
              tenantId={selectedTenantForDomainModal.id}
              tenantName={selectedTenantForDomainModal.name}
              isSuperAdmin={true}
              onDomainsUpdated={() => {
                fetchData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
