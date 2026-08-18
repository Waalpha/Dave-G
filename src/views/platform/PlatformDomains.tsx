import React, { useState, useEffect } from 'react';
import { 
  Globe, Server, CheckCircle2, AlertCircle, RefreshCw, Plus, Search, 
  Trash2, Star, ShieldCheck, Lock, ExternalLink, Filter, Building2, Copy, Check
} from 'lucide-react';
import { TenantDomain, Tenant } from '../../types';
import { TenantDomainManager } from '../tenant/components/TenantDomainManager';
import { getBaseDomain, buildTenantUrl, buildCustomDomainUrl } from '../../lib/domainResolver';

export const PlatformDomains: React.FC = () => {
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SUBDOMAIN' | 'CUSTOM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'FAILED'>('ALL');

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

  const filteredDomains = domains.filter(dom => {
    const tenant = tenants.find(t => t.id === dom.tenantId);
    const matchesSearch = 
      dom.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant?.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || dom.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || dom.verificationStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalDomains = domains.length;
  const customDomainsCount = domains.filter(d => d.type === 'CUSTOM').length;
  const verifiedDomainsCount = domains.filter(d => d.verificationStatus === 'VERIFIED').length;
  const pendingDomainsCount = domains.filter(d => d.verificationStatus === 'PENDING' && d.type === 'CUSTOM').length;

  return (
    <div className="space-y-6 text-xs text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Tenant Domain &amp; DNS Subsystem</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage Davetech subdomains (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">*.{baseDomain}</code>) and tenant-owned custom domains with automated SSL &amp; DNS challenge verification.
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
        </div>
      </div>

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
            placeholder="Search domain or organization..."
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
                <th className="p-4">Domain Type</th>
                <th className="p-4">Verification</th>
                <th className="p-4">SSL Security</th>
                <th className="p-4">Registered Date</th>
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

                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(dom.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  <h3 className="text-base font-bold text-slate-900">
                    Domain &amp; Routing: {selectedTenantForDomainModal.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Tenant ID: {selectedTenantForDomainModal.id} &bull; Subdomain: {selectedTenantForDomainModal.slug || selectedTenantForDomainModal.subdomain}.{baseDomain}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTenantForDomainModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
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
