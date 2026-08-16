import React, { useState } from 'react';
import { Edit2, X, AlertCircle, RefreshCw, Save, Building2, Upload, Palette, DollarSign, Globe, Phone, MapPin, Mail } from 'lucide-react';
import { Tenant, TenantType, EducationType } from '../../../types';
import { compressImageFile } from '../../../lib/imageUtils';

interface EditTenantModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTenantModal: React.FC<EditTenantModalProps> = ({
  tenant,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState(tenant.name || '');
  const [subdomain, setSubdomain] = useState(tenant.subdomain || tenant.slug || '');
  const [customDomain, setCustomDomain] = useState(tenant.customDomain || '');
  const [websiteEnabled, setWebsiteEnabled] = useState(tenant.websiteEnabled !== false);
  const [type, setType] = useState<TenantType>(tenant.type || 'EDUCATION');
  const [educationType, setEducationType] = useState<EducationType | undefined>(tenant.educationType || 'TVET');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>(tenant.status || 'ACTIVE');
  
  // Branding
  const [logoUrl, setLogoUrl] = useState(tenant.branding?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(tenant.branding?.primaryColor || '#1e3a8a');
  const [currency, setCurrency] = useState(tenant.branding?.currency || 'KES');
  const [currencySymbol, setCurrencySymbol] = useState(tenant.branding?.currencySymbol || 'KSh');
  const [contactEmail, setContactEmail] = useState(tenant.branding?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(tenant.branding?.contactPhone || '');
  const [address, setAddress] = useState(tenant.branding?.address || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 400, 400, 0.85);
        setLogoUrl(compressed);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to process logo image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization name is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/platform/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        },
        body: JSON.stringify({
          name: name.trim(),
          subdomain: subdomain.trim() || undefined,
          slug: subdomain.trim() || undefined,
          customDomain: customDomain.trim() || undefined,
          websiteEnabled,
          type,
          educationType: type === 'EDUCATION' ? educationType : undefined,
          status,
          branding: {
            companyName: name.trim(),
            logoUrl: logoUrl || undefined,
            primaryColor,
            currency,
            currencySymbol,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            address: address.trim() || undefined
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to update organization details.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Organization: {tenant.name}</h3>
              <p className="text-[11px] text-slate-400">Configure profile, currency, branding, and contact info</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Organization / Institution Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Subdomain (*.davetech.co.ke)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value)}
                  placeholder="e.g. brightacademy"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-l-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
                <span className="px-3 py-2.5 bg-slate-800 border border-l-0 border-slate-700 text-slate-400 text-xs rounded-r-xl font-mono">
                  .davetech.co.ke
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Custom Domain (Optional)</label>
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="e.g. portal.brightacademy.ac.ke"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Public Website Portal</label>
              <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  id="websiteEnabled"
                  checked={websiteEnabled}
                  onChange={e => setWebsiteEnabled(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="websiteEnabled" className="text-xs text-slate-300 cursor-pointer select-none">
                  Enable Public Landing Page for this Tenant
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Tenant Domain Type *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as TenantType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="EDUCATION">Education / School ERP</option>
                <option value="HOSPITAL">Hospital Healthcare</option>
                <option value="POS">Point of Sale (POS)</option>
                <option value="RETAIL">Retail Shop</option>
                <option value="WHOLESALE">Wholesale Trade</option>
                <option value="CHURCH">Church Management</option>
                <option value="SACCO">Chama & SACCO</option>
                <option value="BAR">Bar & Lounge</option>
                <option value="GENERAL_ERP">General ERP</option>
              </select>
            </div>

            {type === 'EDUCATION' ? (
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Education Subtype</label>
                <select
                  value={educationType || 'TVET'}
                  onChange={e => setEducationType(e.target.value as EducationType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="UNIVERSITY">University</option>
                  <option value="COLLEGE">College</option>
                  <option value="TVET">TVET / Vocational Training</option>
                  <option value="SECONDARY_SCHOOL">Secondary School</option>
                  <option value="PRIMARY_SCHOOL">Primary School</option>
                  <option value="TRAINING_INSTITUTE">Training Institute</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1 opacity-50">
                <label className="text-slate-300 font-semibold">Subtype</label>
                <input
                  type="text"
                  disabled
                  value="N/A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="ACTIVE">ACTIVE (Operational)</option>
                <option value="SUSPENDED">SUSPENDED (Locked)</option>
              </select>
            </div>
          </div>

          {/* Logo & Primary Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800 pt-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Organization Logo</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer shrink-0 flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Theme Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Currency & Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800 pt-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Currency Code & Symbol</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. KES"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Symbol (KSh)"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Official Contact Email</label>
              <input
                type="email"
                placeholder="info@institution.ac.ke"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Contact Phone</label>
              <input
                type="text"
                placeholder="+254 700 000 000"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Physical / Postal Address</label>
              <input
                type="text"
                placeholder="P.O. Box 12345, Nairobi"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{loading ? 'Saving Changes...' : 'Save Organization Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
