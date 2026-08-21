import React, { useState, useEffect } from 'react';
import { Tenant, TenantOfflineConfig, AuthorizedOfflineDevice, ModuleId } from '../../../types';
import { 
  X, WifiOff, Clock, Smartphone, ShieldCheck, ShieldAlert, 
  Trash2, AlertCircle, CheckCircle2, Save, RefreshCw, Check
} from 'lucide-react';

interface TenantOfflineModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSaved: () => void;
}

const AVAILABLE_OFFLINE_MODULES: Array<{ id: ModuleId; label: string }> = [
  { id: 'pos', label: 'POS & Cashier' },
  { id: 'education', label: 'Education & Attendance' },
  { id: 'inventory', label: 'Inventory Management' },
  { id: 'retail', label: 'Retail Sales' },
  { id: 'wholesale', label: 'Wholesale Store' },
  { id: 'bookshop', label: 'Bookshop' }
];

export const TenantOfflineModal: React.FC<TenantOfflineModalProps> = ({
  tenant,
  onClose,
  onSaved
}) => {
  const [config, setConfig] = useState<TenantOfflineConfig>({
    enabled: true,
    gracePeriodHours: 72,
    allowedOfflineModules: (tenant.enabledModules || []).filter(m => 
      ['pos', 'education', 'inventory', 'retail', 'wholesale', 'bookshop'].includes(m)
    ),
    enableOfflinePos: true,
    enableOfflineEducation: true,
    enableOfflineInventory: true,
    offlineTransactionLimit: 500,
    authorizedDevices: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchTenantOfflineConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/platform/tenants/${tenant.id}/offline`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.warn('Error fetching tenant offline config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantOfflineConfig();
  }, [tenant.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}/offline`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setNotification('Tenant offline authorization updated successfully!');
        onSaved();
        setTimeout(() => {
          setNotification(null);
          onClose();
        }, 1200);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to update tenant offline settings');
      }
    } catch (err: any) {
      setError(err.message || 'Network error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to revoke offline authorization for this workstation? The device will immediately be blocked from offline operations.')) {
      return;
    }
    setRevokingId(deviceId);
    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}/devices/${deviceId}/revoke`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setNotification('Device offline authorization revoked.');
        await fetchTenantOfflineConfig();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to revoke device');
      }
    } catch (err: any) {
      setError(err.message || 'Error revoking device');
    } finally {
      setRevokingId(null);
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

  const devices = config.authorizedDevices || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Controlled Offline Configuration — {tenant.name}
              </h3>
              <p className="text-xs text-slate-500">
                Subscription enforcement & authorized device workstation limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {notification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Master Enable & Grace Period */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Enable Offline Access for this Organization
                </span>
                <span className="text-slate-500 text-xs">
                  Allows workstations under {tenant.name} to continue working during ISP outages.
                </span>
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

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-800 text-xs block">
                  Configured Grace Period Duration
                </label>
                <span className="text-slate-500 text-[11px]">
                  Maximum offline window before online subscription check is required.
                </span>
              </div>
              <select
                value={config.gracePeriodHours}
                onChange={(e) => setConfig({ ...config, gracePeriodHours: Number(e.target.value) as any })}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0 Hours (Strict Online Only)</option>
                <option value={24}>24 Hours (1 Day)</option>
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (3 Days - Recommended)</option>
                <option value={168}>168 Hours (7 Days)</option>
              </select>
            </div>
          </div>

          {/* Module Toggles */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs block">
              Permitted Offline Modules for {tenant.name}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_OFFLINE_MODULES.map((mod) => {
                const isEnabled = (config.allowedOfflineModules || []).includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer transition-all ${
                      isEnabled ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      isEnabled ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isEnabled && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="text-xs truncate">{mod.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authorized Devices List */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Registered Authorized Devices & Workstations
                </h4>
                <p className="text-[11px] text-slate-500">
                  {devices.filter(d => d.status === 'ACTIVE').length} active workstations authorized
                </p>
              </div>
            </div>

            {devices.length === 0 ? (
              <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Smartphone className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                No offline workstations registered yet. Workstations automatically register on initial authenticated login.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-44 overflow-y-auto">
                {devices.map((d) => (
                  <div key={d.id} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{d.deviceName}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          d.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ID: {d.deviceId.slice(0, 16)} • Last IP: {d.lastIp || '127.0.0.1'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Last active: {new Date(d.lastSeenAt).toLocaleString()}
                      </div>
                    </div>

                    {d.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleRevokeDevice(d.deviceId)}
                        disabled={revokingId === d.deviceId}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{revokingId === d.deviceId ? 'Revoking...' : 'Revoke'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
