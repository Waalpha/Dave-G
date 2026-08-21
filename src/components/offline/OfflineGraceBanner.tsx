import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldAlert, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { offlineSyncService, OfflineServiceState } from '../../lib/offlineSyncService';
import { useAuth } from '../../context/AuthContext';

export const OfflineGraceBanner: React.FC = () => {
  const { currentTenant, user, token } = useAuth();
  const [offlineState, setOfflineState] = useState<OfflineServiceState>(offlineSyncService.getState());
  const [retrying, setRetrying] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((state) => {
      setOfflineState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleRetryConnection = async () => {
    setRetrying(true);
    try {
      if (currentTenant?.id && user) {
        await offlineSyncService.requestFreshLease(currentTenant.id, user, token || undefined);
      }
      await offlineSyncService.syncPendingQueue(token || undefined);
    } catch (err) {
      console.error('Retry connection error:', err);
    } finally {
      setRetrying(false);
    }
  };

  // 1. Expired state - Non-dismissible critical blocking notice
  if (offlineState.isExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-md z-40 border-b border-red-700 animate-in slide-in-from-top-2 duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <ShieldAlert className="w-5 h-5 text-white shrink-0 animate-pulse" />
            <div>
              <p className="text-xs sm:text-sm font-bold">
                Offline access period expired. Please connect to the internet to verify your Davetech ERP subscription and continue working.
              </p>
              <p className="text-[11px] text-red-100 opacity-90">
                New operational transactions (sales, payments, attendance, registrations) are paused to protect subscription integrity.
              </p>
            </div>
          </div>
          <button
            onClick={handleRetryConnection}
            disabled={retrying}
            className="px-4 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Verifying...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Offline approaching expiration (< 12 hours remaining)
  const isUrgent = offlineState.isOffline && offlineState.remainingMs <= 12 * 3600 * 1000;

  if (isUrgent && !dismissedWarning) {
    return (
      <div className="bg-amber-600 text-white px-4 py-2.5 shadow-xs z-40 border-b border-amber-700 animate-in slide-in-from-top-1 duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>Warning:</strong> You are offline. Please reconnect to the internet within 12 hours ({offlineState.remainingFormatted} remaining) to continue using Davetech ERP.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRetryConnection}
              disabled={retrying}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setDismissedWarning(true)}
              className="p-1 hover:bg-white/20 rounded cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
