import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, Laptop, ArrowUpRight, X, ChevronRight,
  Database, AlertCircle, Check
} from 'lucide-react';
import { offlineSyncService, OfflineServiceState } from '../../lib/offlineSyncService';
import { useAuth } from '../../context/AuthContext';

export const OfflineStatusIndicator: React.FC = () => {
  const { currentTenant, user, token } = useAuth();
  const [offlineState, setOfflineState] = useState<OfflineServiceState>(offlineSyncService.getState());
  const [showDrawer, setShowDrawer] = useState(false);
  const [syncingManual, setSyncingManual] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((state) => {
      setOfflineState(state);
    });
    return () => unsubscribe();
  }, []);

  // Request fresh lease on tenant or user load if online
  useEffect(() => {
    if (currentTenant?.id && user && offlineState.isOnline) {
      offlineSyncService.requestFreshLease(currentTenant.id, user, token || undefined).catch(() => {});
    }
  }, [currentTenant?.id, user?.id, offlineState.isOnline]);

  const handleManualSync = async () => {
    setSyncingManual(true);
    try {
      if (currentTenant?.id && user) {
        await offlineSyncService.requestFreshLease(currentTenant.id, user, token || undefined);
      }
      await offlineSyncService.syncPendingQueue(token || undefined);
    } catch (err) {
      console.error('Manual sync error:', err);
    } finally {
      setSyncingManual(false);
    }
  };

  // Status Badge Rendering
  let badgeIcon = <Wifi className="w-3.5 h-3.5 text-emerald-500" />;
  let badgeText = 'ONLINE';
  let badgeColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';

  if (offlineState.isSyncing || syncingManual) {
    badgeIcon = <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
    badgeText = 'SYNCING...';
    badgeColorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (offlineState.isExpired) {
    badgeIcon = <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />;
    badgeText = 'OFFLINE ACCESS EXPIRED';
    badgeColorClass = 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
  } else if (offlineState.isOffline) {
    badgeIcon = <WifiOff className="w-3.5 h-3.5 text-amber-600" />;
    badgeText = `OFFLINE — ${offlineState.remainingFormatted} remaining`;
    badgeColorClass = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
  } else if (offlineState.lastSyncSuccess && offlineState.pendingCount === 0) {
    badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    badgeText = 'ONLINE';
    badgeColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
  }

  const pendingItems = offlineSyncService.getPendingQueue();

  return (
    <>
      {/* Top Bar Indicator Pill */}
      <button
        onClick={() => setShowDrawer(true)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${badgeColorClass}`}
        title="View Controlled Offline Mode and Sync Status"
      >
        {badgeIcon}
        <span className="font-medium tracking-tight">{badgeText}</span>
        {offlineState.pendingCount > 0 && (
          <span className="ml-1 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
            {offlineState.pendingCount}
          </span>
        )}
      </button>

      {/* Offline Mode Diagnostics & Sync Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Controlled Offline Mode</h3>
                  <p className="text-[11px] text-slate-500">Davetech ERP SaaS Subscription Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Primary Status Card */}
              <div className={`p-4 rounded-xl border ${
                offlineState.isExpired 
                  ? 'bg-red-50/70 border-red-200' 
                  : offlineState.isOffline 
                  ? 'bg-amber-50/70 border-amber-200' 
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {offlineState.isExpired ? (
                      <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    ) : offlineState.isOffline ? (
                      <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <Wifi className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {offlineState.isExpired
                          ? 'Offline Access Expired'
                          : offlineState.isOffline
                          ? 'Operating in Controlled Offline Mode'
                          : 'Online & Authoritative'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {offlineState.isExpired
                          ? 'Offline grace period has lapsed. Please connect to the internet to verify your monthly subscription and continue working.'
                          : offlineState.isOffline
                          ? `You have ${offlineState.remainingFormatted} of authorized offline continuity remaining.`
                          : 'Connected to Davetech Cloud. Transactions and subscriptions are synchronized.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grace Period Progress bar if offline */}
                {offlineState.isOffline && !offlineState.isExpired && (
                  <div className="mt-4 pt-3 border-t border-amber-200/60">
                    <div className="flex justify-between text-[11px] font-medium text-amber-900 mb-1">
                      <span>Remaining Grace Period</span>
                      <span className="font-bold">{offlineState.remainingFormatted}</span>
                    </div>
                    <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(5, Math.min(100, (offlineState.remainingMs / (72 * 3600 * 1000)) * 100))}%` 
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-amber-700 mt-1.5">
                      Default 72-hour grace period configured by Davetech Super Admin.
                    </p>
                  </div>
                )}
              </div>

              {/* Offline License Lease Details */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Server-Authorized Lease</span>
                  <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    HMAC-SHA256
                  </span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Tenant</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {offlineState.activeLease?.tenantName || currentTenant?.name || 'Workspace'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Subscription</span>
                    <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{offlineState.activeLease?.subscriptionStatus || 'ACTIVE'}</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Last Verified</span>
                    <span className="font-medium text-slate-700 text-[11px]">
                      {offlineState.lastVerifiedAt 
                        ? new Date(offlineState.lastVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Device Identity</span>
                    <span className="font-mono text-[11px] text-slate-700 truncate block" title={offlineState.deviceId}>
                      {offlineState.deviceId.slice(0, 12)}...
                    </span>
                  </div>
                </div>

                {/* Allowed Modules Tags */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                    Authorized Offline Modules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(offlineState.allowedOfflineModules || ['pos', 'education', 'inventory']).map((mod) => (
                      <span
                        key={mod}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold uppercase"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sync Queue Table */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pending Sync Queue
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {pendingItems.length} transactions stored locally on device
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                    {offlineState.pendingCount} Pending
                  </span>
                </div>

                {pendingItems.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    All local operations are synchronized with the Davetech cloud.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100 text-xs">
                    {pendingItems.map((item) => (
                      <div key={item.operationId} className="pt-2 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                            <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                              {item.module}
                            </span>
                            <span>{item.action}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleTimeString()} • ID: {item.operationId.slice(0, 10)}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.syncStatus === 'SYNCED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.syncStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.syncStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                onClick={handleManualSync}
                disabled={syncingManual || offlineState.isSyncing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncingManual || offlineState.isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {syncingManual || offlineState.isSyncing
                    ? 'Verifying Subscription & Syncing...'
                    : 'Retry Connection & Sync Now'}
                </span>
              </button>

              <p className="text-[10px] text-center text-slate-400">
                Davetech ERP SaaS • Permanent offline operation is prohibited by license terms.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
