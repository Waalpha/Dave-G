import React, { useState, useEffect } from 'react';
import { PlatformOfflineConfig, OfflineGracePeriodHours, ModuleId } from '../../../types';
import { 
  WifiOff, ShieldCheck, Clock, Layers, Save, CheckCircle2, 
  AlertCircle, ShieldAlert, Smartphone, Database, Check
} from 'lucide-react';

interface PlatformOfflineEditorProps {
  initialConfig?: PlatformOfflineConfig;
  onSaved?: () => void;
}

const AVAILABLE_OFFLINE_MODULES: Array<{ id: ModuleId; label: string; description: string }> = [
  { id: 'pos', label: 'Point of Sale (POS)', description: 'Sales orders, thermal receipt issuance, local stock deductions' },
  { id: 'education', label: 'Education & Admissions', description: 'Student attendance marking, student admission applications' },
  { id: 'inventory', label: 'Inventory Management', description: 'Stock level lookups, local stock count adjustments' },
  { id: 'retail', label: 'Retail Sales', description: 'Barcode lookup, counter retail checkout' },
  { id: 'wholesale', label: 'Wholesale Store', description: 'Bulk order drafts and stock allocations' },
  { id: 'bookshop', label: 'Bookshop & Stationeries', description: 'Book inventory sales and material distribution' }
];

const GRACE_PERIOD_OPTIONS: Array<{ value: OfflineGracePeriodHours; label: string; desc: string }> = [
  { value: 0, label: '0 Hours (Strict Online Only)', desc: 'No offline continuity. Network disconnection halts operations immediately.' },
  { value: 24, label: '24 Hours (1 Day)', desc: 'Short outage continuity for metropolitan fast-reconnect setups.' },
  { value: 48, label: '48 Hours (2 Days)', desc: 'Weekend continuity protection against ISP maintenance.' },
  { value: 72, label: '72 Hours (3 Days - Recommended)', desc: 'Standard business continuity window before requiring online verification.' },
  { value: 168, label: '168 Hours (7 Days)', desc: 'Maximum extended window for remote regional branch offices.' }
];

export const PlatformOfflineEditor: React.FC<PlatformOfflineEditorProps> = ({ initialConfig, onSaved }) => {
  const [config, setConfig] = useState<PlatformOfflineConfig>({
    enabled: true,
    defaultGracePeriodHours: 72,
    maxGracePeriodHours: 168,
    allowedOfflineModules: ['pos', 'education', 'inventory', 'retail', 'wholesale', 'bookshop'],
    offlineDeviceLimit: 10,
    requireOnlineVerificationFrequencyHours: 72,
    enableOfflinePos: true,
    enableOfflineEducation: true,
    enableOfflineInventory: true,
    offlineTransactionLimit: 1000,
    ...initialConfig
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platform/settings/offline', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.warn('Failed to load platform offline config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/platform/settings/offline', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setNotification('Global Controlled Offline Mode settings saved successfully!');
        if (onSaved) onSaved();
        setTimeout(() => setNotification(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to save offline settings');
      }
    } catch (err: any) {
      setError(err.message || 'Network error saving offline settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (modId: ModuleId) => {
    const current = config.allowedOfflineModules || [];
    if (current.includes(modId)) {
      setConfig({
        ...config,
        allowedOfflineModules: current.filter(m => m !== modId)
      });
    } else {
      setConfig({
        ...config,
        allowedOfflineModules: [...current, modId]
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in">
      {/* Notifications */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold uppercase">
                SaaS Subscription Protection
              </span>
              <span className="text-xs text-slate-500 font-medium">• Server-Authoritative Architecture</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-2 flex items-center space-x-2">
              <WifiOff className="w-6 h-6 text-blue-600" />
              <span>Controlled Offline Mode & Grace Periods</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Configure platform-wide offline authorization policies. Customers can continue operating during temporary outages without allowing permanent offline ownership or subscription bypasses.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Offline Policies'}</span>
          </button>
        </div>
      </div>

      {/* Core Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Policies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Master Switch */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Platform Controlled Offline Mode</h3>
                <p className="text-xs text-slate-500">
                  When enabled, subscribed organizations receive signed cryptographic leases to work during outages.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Grace Period Selection */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Default Grace Period Duration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The maximum continuous offline time allowed before requiring active online subscription verification.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {GRACE_PERIOD_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`p-3.5 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                    config.defaultGracePeriodHours === opt.value
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="gracePeriod"
                    checked={config.defaultGracePeriodHours === opt.value}
                    onChange={() => setConfig({ ...config, defaultGracePeriodHours: opt.value })}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Max Platform Cap */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Platform Maximum Grace Period Ceiling</label>
                <p className="text-[11px] text-slate-500">Tenants cannot configure a grace period higher than this ceiling.</p>
              </div>
              <select
                value={config.maxGracePeriodHours}
                onChange={(e) => setConfig({ ...config, maxGracePeriodHours: Number(e.target.value) as OfflineGracePeriodHours })}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
                <option value={72}>72 Hours</option>
                <option value={168}>168 Hours (7 Days)</option>
              </select>
            </div>
          </div>

          {/* Authorized Offline Modules */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Authorized Offline ERP Modules</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select modules permitted to operate offline. Sensitive administrative functions (user creation, billing, audit logs) remain strictly online-only.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_OFFLINE_MODULES.map((mod) => {
                const isSelected = (config.allowedOfflineModules || []).includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-300'
                        : 'bg-slate-50/60 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">{mod.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{mod.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Device & Security Architecture Summary */}
        <div className="space-y-6">
          {/* Device Limit Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Offline Device Limits</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Max Authorized Offline Devices Per Organization
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.offlineDeviceLimit || 10}
                onChange={(e) => setConfig({ ...config, offlineDeviceLimit: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Prevents unauthorized replication of offline instances across unmetered workstations.
              </p>
            </div>
          </div>

          {/* Security Safeguards */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight">Security & Anti-Bypass Protections</h3>
            </div>

            <ul className="text-xs space-y-2.5 text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Cryptographic Signing:</strong> Leases are HMAC-SHA256 signed on the server with private platform secret keys.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Clock Tamper Protection:</strong> Monotonic hardware timing detects local system clock rollback or manipulation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Server-Authoritative Sync:</strong> Transactions are validated, deduplicated, and audited server-side upon reconnection.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Instant Expiration:</strong> Suspended or expired subscriptions immediately invalidate offline lease renewals.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
};
