import React, { useState, useEffect } from 'react';
import { PlatformSettings as PlatformSettingsType } from '../../types';
import {
  Settings, Building2, Sparkles, Upload, Image, Shield, CheckCircle2,
  RefreshCw, AlertCircle, Eye, Palette, Mail, Phone, Lock, Save, Globe,
  Sliders, Layout, ExternalLink
} from 'lucide-react';
import { compressImageFile } from '../../lib/imageUtils';
import { PublicWebsiteEditor } from './components/PublicWebsiteEditor';

const COLOR_PRESETS = [
  { name: 'Royal Blue (Davetech)', hex: '#1D53D9' },
  { name: 'Amber Orange', hex: '#F49C10' },
  { name: 'Emerald Green', hex: '#14B57A' },
  { name: 'Soft Blue', hex: '#7CA4EF' },
  { name: 'Royal Purple', hex: '#9333ea' },
  { name: 'Corporate Blue', hex: '#2563eb' },
  { name: 'Indigo Dream', hex: '#4f46e5' },
  { name: 'Emerald Forest', hex: '#059669' },
  { name: 'Teal Modern', hex: '#0d9488' },
  { name: 'Slate Dark', hex: '#475569' }
];

interface PlatformSettingsProps {
  initialTab?: 'website-cms' | 'branding';
  onSettingsSaved?: () => void;
}

export const PlatformSettings: React.FC<PlatformSettingsProps> = ({ 
  initialTab = 'website-cms',
  onSettingsSaved 
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'website-cms' | 'branding'>(initialTab);
  const [settings, setSettings] = useState<PlatformSettingsType>({
    platformName: 'DAVETECH',
    tagline: 'Davetech Solutions',
    logoUrl: '/davetech-logo.svg',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    supportEmail: 'admin@davetech.co.ke',
    supportPhone: '+254 700 000 000',
    companyName: 'Davetech Solutions',
    copyrightText: '© 2026 Davetech Solutions. All rights reserved.',
    allowSelfRegistration: false,
    systemNotice: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'header' | 'login'>('header');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platform/settings', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 400, 400, 0.85);
        setSettings(prev => ({ ...prev, logoUrl: compressed }));
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to process logo image.');
      }
    }
  };

  const handleSaveDirect = async (updatedSettings: PlatformSettingsType) => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedSettings)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        if (onSettingsSaved) onSettingsSaved();
        window.dispatchEvent(new CustomEvent('platform-settings-updated', { detail: data.settings }));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update platform settings');
      }
    } catch (err) {
      console.error('Save platform settings error:', err);
      setError('A network error occurred while saving platform configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setNotification('Main ERP Platform identity, logo, and settings saved successfully!');
        if (onSettingsSaved) onSettingsSaved();
        // Broadcast custom event so layout updates immediately
        window.dispatchEvent(new CustomEvent('platform-settings-updated', { detail: data.settings }));
        setTimeout(() => setNotification(null), 5000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update platform settings');
      }
    } catch (err) {
      console.error('Save platform settings error:', err);
      setError('A network error occurred while saving platform configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset platform branding to default system settings?')) {
      setSettings({
        platformName: 'DAVETECH',
        tagline: 'Davetech Solutions',
        logoUrl: '/davetech-logo.svg',
        primaryColor: '#1D53D9',
        secondaryColor: '#F49C10',
        supportEmail: 'admin@davetech.co.ke',
        supportPhone: '+254 700 000 000',
        companyName: 'Davetech Solutions',
        copyrightText: '© 2026 Davetech Solutions. All rights reserved.',
        allowSelfRegistration: false,
        systemNotice: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
        <span className="text-xs">Loading Platform Identity Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#1F2937] max-w-6xl mx-auto">
      
      {/* Top Tab Navigation Bar */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-[#D8DCEB] shadow-xs">
        <button
          onClick={() => setActiveMainTab('website-cms')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeMainTab === 'website-cms'
              ? 'bg-[#1D53D9] text-white shadow-sm'
              : 'text-[#777E8C] hover:text-[#1F2937] hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Davetech Public Website CMS</span>
        </button>

        <button
          onClick={() => setActiveMainTab('branding')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeMainTab === 'branding'
              ? 'bg-[#1D53D9] text-white shadow-sm'
              : 'text-[#777E8C] hover:text-[#1F2937] hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Platform Identity, Logo & Theme Colors</span>
        </button>
      </div>

      {/* RENDER WEBSITE CMS */}
      {activeMainTab === 'website-cms' && (
        <PublicWebsiteEditor
          settings={settings}
          onSave={handleSaveDirect}
          saving={saving}
        />
      )}

      {/* RENDER PLATFORM BRANDING */}
      {activeMainTab === 'branding' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#D8DCEB] p-6 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded text-xs font-bold uppercase">
                  Main ERP Platform Configuration
                </span>
                <span className="text-xs text-[#777E8C] font-medium">• White-Label & Global Identity</span>
              </div>
              <h2 className="text-2xl font-black text-[#1D53D9] mt-2 flex items-center space-x-2">
                <Settings className="w-6 h-6 text-[#1D53D9]" />
                <span>ERP Platform Name, Logo & Branding</span>
              </h2>
              <p className="text-xs text-[#777E8C] mt-1 max-w-2xl font-medium">
                Customize the master ERP platform identity. Upload your corporate logo, rename the platform, adjust brand accent colors, and configure support details across the Super Admin portal and login screens.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#1F2937] text-xs font-bold rounded-xl border border-[#D8DCEB] transition-colors cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#1D53D9] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving Platform Changes...' : 'Save Platform Branding'}</span>
              </button>
            </div>
          </div>

      {/* Notifications */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#14B57A] shrink-0" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2.5 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: FORM CONTROLS */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 1: PLATFORM NAME & LOGO */}
          <div className="bg-white border border-[#D8DCEB] rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#D8DCEB] pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBE2F5] border border-[#D8DCEB] flex items-center justify-center text-[#1D53D9]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D53D9]">Platform Identity & Brand Assets</h3>
                  <p className="text-[11px] text-[#777E8C]">Main platform title, slogan, and visual emblems</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Platform Name */}
              <div className="space-y-1.5">
                <label className="text-[#1F2937] font-bold flex items-center space-x-1.5">
                  <span>Main ERP Platform Name *</span>
                  <span className="text-[10px] text-[#1D53D9] font-mono font-normal">(Displayed on Navigation, Headers & Login)</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.platformName}
                  onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                  placeholder="e.g. DAVETECH"
                  className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-3 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] font-medium text-sm transition-all"
                />
              </div>

              {/* Platform Tagline */}
              <div className="space-y-1.5">
                <label className="text-[#1F2937] font-bold">Platform Subtitle / Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g. Multi-Tenant Enterprise Management Console"
                  className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-2.5 text-[#1F2937] focus:outline-none focus:border-[#1D53D9]"
                />
              </div>

              {/* Platform Logo Section */}
              <div className="space-y-2 border-t border-[#D8DCEB] pt-4">
                <label className="text-[#1F2937] font-bold flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Image className="w-4 h-4 text-[#1D53D9]" />
                    <span>Main ERP Platform Logo</span>
                  </span>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, logoUrl: '' })}
                      className="text-[11px] text-red-500 hover:text-red-600 font-bold cursor-pointer"
                    >
                      Remove Logo (Use Default Icon)
                    </button>
                  )}
                </label>

                {/* Logo Preview & Upload Box */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#D8DCEB]">
                  {/* Visual Box */}
                  <div className="w-20 h-20 rounded-2xl bg-white border border-[#D8DCEB] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-2">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt={settings.platformName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-xl flex items-center justify-center text-white bg-[#1D53D9]"
                      >
                        <Shield className="w-8 h-8 opacity-90" />
                      </div>
                    )}
                  </div>

                  {/* Upload & URL Controls */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-4 py-2 bg-[#1D53D9] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center space-x-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-[#777E8C] font-mono">PNG, JPG, SVG or WEBP (Max 2MB)</span>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="url"
                        value={settings.logoUrl}
                        onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                        placeholder="Or enter direct image URL (https://...)"
                        className="w-full bg-white border border-[#D8DCEB] rounded-lg p-2 text-[#1F2937] text-xs focus:outline-none focus:border-[#1D53D9] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Theme Accent Color */}
              <div className="space-y-2 border-t border-[#D8DCEB] pt-4">
                <label className="text-[#1F2937] font-bold flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-[#1D53D9]" />
                  <span>Platform Theme Accent Color</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setSettings({ ...settings, primaryColor: preset.hex })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
                        settings.primaryColor === preset.hex
                          ? 'border-[#1D53D9] text-[#1D53D9] bg-blue-50/50 shadow-xs'
                          : 'border-[#D8DCEB] text-[#777E8C] hover:border-slate-400 hover:text-[#1F2937] bg-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-xl border border-[#D8DCEB]">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-20 bg-transparent text-xs text-[#1F2937] font-mono uppercase focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: CONTACT, COMPANY & COPYRIGHT */}
          <div className="bg-white border border-[#D8DCEB] rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#D8DCEB] pb-3 flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBE2F5] border border-[#D8DCEB] flex items-center justify-center text-[#1D53D9]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D53D9]">Platform Organization & Support Details</h3>
                <p className="text-[11px] text-[#777E8C]">Provider legal info, support channels, and footer notices</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#1F2937] font-bold flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#777E8C]" />
                  <span>Platform Support Email</span>
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  placeholder="support@erpplatform.com"
                  className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-2.5 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#1F2937] font-bold flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#777E8C]" />
                  <span>Platform Support Phone</span>
                </label>
                <input
                  type="text"
                  value={settings.supportPhone || ''}
                  onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                  placeholder="+254 700 000 000"
                  className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-2.5 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#1F2937] font-bold">Operating Entity / Provider Legal Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="e.g. Davetech Solutions Ltd"
                  className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-2.5 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#1F2937] font-bold">Platform Copyright Notice</label>
                <input
                  type="text"
                  value={settings.copyrightText}
                  onChange={e => setSettings({ ...settings, copyrightText: e.target.value })}
                  placeholder="© 2026 ERP Platform SaaS. All rights reserved."
                  className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-2.5 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] font-medium"
                />
              </div>
            </div>

            {/* System Broadcast Notice */}
            <div className="space-y-1.5 border-t border-[#D8DCEB] pt-4 text-xs">
              <label className="text-[#1F2937] font-bold">
                Global System Announcement Notice (Optional)
              </label>
              <textarea
                rows={2}
                value={settings.systemNotice || ''}
                onChange={e => setSettings({ ...settings, systemNotice: e.target.value })}
                placeholder="Broadcast notice displayed to platform users (e.g. Scheduled maintenance on Sunday 2:00 AM UTC)"
                className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-2.5 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE BRANDING PREVIEW WIDGET */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D8DCEB] rounded-2xl p-5 space-y-4 shadow-xs sticky top-20">
            <div className="flex items-center justify-between border-b border-[#D8DCEB] pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-[#1D53D9]" />
                <h3 className="text-xs font-bold text-[#1D53D9] uppercase tracking-wider">Live Real-Time Preview</h3>
              </div>
              <div className="flex bg-[#F8FAFC] p-0.5 rounded-lg border border-[#D8DCEB] text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('header')}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                    previewTab === 'header' ? 'bg-[#1D53D9] text-white' : 'text-[#777E8C] hover:text-[#1F2937]'
                  }`}
                >
                  Header
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('login')}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                    previewTab === 'login' ? 'bg-[#1D53D9] text-white' : 'text-[#777E8C] hover:text-[#1F2937]'
                  }`}
                >
                  Login Screen
                </button>
              </div>
            </div>

            {/* PREVIEW 1: PLATFORM HEADER BAR */}
            {previewTab === 'header' && (
              <div className="space-y-3">
                <p className="text-[11px] text-[#777E8C] font-medium">
                  How your customized brand appears at the top of the Platform Admin Console:
                </p>

                <div className="bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-3 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8DCEB] pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt={settings.platformName}
                          className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-[#D8DCEB] shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs bg-[#1D53D9]"
                        >
                          <Shield className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#1D53D9] text-xs tracking-wide">
                            {settings.platformName || 'DAVETECH'}
                          </span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB]"
                          >
                            Super Admin
                          </span>
                        </div>
                        <p className="text-[10px] text-[#777E8C] truncate max-w-[180px] font-medium">
                          {settings.tagline || 'Davetech Solutions'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-[#D8DCEB] text-[10px] text-[#777E8C] space-y-1 font-mono">
                    <p className="text-[#1F2937] font-bold flex items-center justify-between">
                      <span>Brand Color:</span>
                      <span className="uppercase font-bold" style={{ color: settings.primaryColor }}>{settings.primaryColor}</span>
                    </p>
                    <p className="truncate">Support: {settings.supportEmail || 'N/A'}</p>
                    <p className="truncate">Entity: {settings.companyName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW 2: LOGIN SCREEN CARD */}
            {previewTab === 'login' && (
              <div className="space-y-3">
                <p className="text-[11px] text-[#777E8C] font-medium">
                  How users and administrators see the sign-in portal:
                </p>

                <div className="bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-4 shadow-2xs text-center space-y-3">
                  {/* Brand Emblazoned Header */}
                  <div className="space-y-2">
                    {settings.logoUrl ? (
                      <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-[#D8DCEB] p-1 flex items-center justify-center">
                        <img
                          src={settings.logoUrl}
                          alt={settings.platformName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-white shadow-2xs bg-[#1D53D9]"
                      >
                        <Shield className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-[#1D53D9] text-sm">
                        {settings.platformName || 'DAVETECH'}
                      </h4>
                      <p className="text-[10px] text-[#777E8C] mt-0.5 font-medium">
                        {settings.tagline || 'Davetech Solutions'}
                      </p>
                    </div>
                  </div>

                  {/* Mock Sign in button */}
                  <div className="p-2 bg-white rounded-lg border border-[#D8DCEB] text-[10px] text-[#777E8C]">
                    <div
                      className="w-full py-1.5 text-white rounded-md font-bold text-[10px] shadow-2xs flex items-center justify-center bg-[#1D53D9]"
                    >
                      Sign In to ERP Console
                    </div>
                  </div>

                  <p className="text-[9px] text-[#777E8C]">
                    {settings.copyrightText}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[#D8DCEB] flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#1D53D9] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Applying Changes...' : 'Save & Apply Live Everywhere'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>
      )}
    </div>
  );
};
