import { 
  OfflineLicenseLease, OfflineQueueItem, OfflineSyncBatchPayload, 
  OfflineSyncBatchResult, ModuleId, TenantOfflineConfig, User
} from '../types';

const DB_NAME = 'davetech_erp_offline_db';
const DB_VERSION = 1;
const LEASE_STORE = 'license_lease';
const QUEUE_STORE = 'sync_queue';
const CACHE_STORE = 'data_cache';
const DEVICE_STORE = 'device_info';

export type OfflineStateListener = (state: OfflineServiceState) => void;

export interface OfflineServiceState {
  isOnline: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncSuccess: boolean | null;
  lastSyncAt: string | null;
  pendingCount: number;
  activeLease: OfflineLicenseLease | null;
  isGracePeriodActive: boolean;
  isExpired: boolean;
  remainingMs: number;
  remainingFormatted: string;
  allowedOfflineModules: ModuleId[];
  deviceId: string;
  deviceName: string;
  lastVerifiedAt: string | null;
  clockTamperedDetected: boolean;
}

class OfflineSyncServiceEngine {
  private db: IDBDatabase | null = null;
  private dbInitPromise: Promise<IDBDatabase | null> | null = null;
  private isOnlineState: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncingState: boolean = false;
  private activeLease: OfflineLicenseLease | null = null;
  private deviceId: string = '';
  private deviceName: string = 'Authorized Workstation';
  private listeners: Set<OfflineStateListener> = new Set();
  
  // Anti-tampering monotonic tracking
  private baselinePerfNow: number = typeof performance !== 'undefined' ? performance.now() : 0;
  private baselineEpoch: number = Date.now();
  private monotonicSecondsElapsed: number = 0;
  private clockTamperedDetected: boolean = false;
  private lastVerifiedAt: string | null = null;
  private lastSyncAt: string | null = null;
  private lastSyncSuccess: boolean | null = null;
  private pendingQueueCache: OfflineQueueItem[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDeviceId();
      this.initDB();
      this.setupNetworkListeners();
      this.startHeartbeatTimer();
    }
  }

  // ==========================================
  // INITIALIZATION & DATABASE
  // ==========================================

  private initDeviceId(): void {
    const storedId = localStorage.getItem('davetech_device_id');
    if (storedId) {
      this.deviceId = storedId;
    } else {
      const newId = `dev_dt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      this.deviceId = newId;
      localStorage.setItem('davetech_device_id', newId);
    }

    const storedName = localStorage.getItem('davetech_device_name');
    if (storedName) {
      this.deviceName = storedName;
    } else {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
      this.deviceName = isMobile ? 'Mobile Terminal' : 'Main Counter Workstation';
      localStorage.setItem('davetech_device_name', this.deviceName);
    }
  }

  private async initDB(): Promise<IDBDatabase | null> {
    if (this.db) return this.db;
    if (this.dbInitPromise) return this.dbInitPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[OfflineSyncService] IndexedDB is not available in this environment.');
      return null;
    }

    this.dbInitPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(LEASE_STORE)) {
            db.createObjectStore(LEASE_STORE, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(QUEUE_STORE)) {
            const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'operationId' });
            queueStore.createIndex('by_tenant', 'tenantId', { unique: false });
            queueStore.createIndex('by_status', 'syncStatus', { unique: false });
          }
          if (!db.objectStoreNames.contains(CACHE_STORE)) {
            const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'cacheKey' });
            cacheStore.createIndex('by_tenant', 'tenantId', { unique: false });
          }
          if (!db.objectStoreNames.contains(DEVICE_STORE)) {
            db.createObjectStore(DEVICE_STORE, { keyPath: 'key' });
          }
        };

        req.onsuccess = async (e) => {
          this.db = (e.target as IDBOpenDBRequest).result;
          await this.loadPersistedLease();
          await this.refreshPendingQueueCache();
          this.notifyListeners();
          resolve(this.db);
        };

        req.onerror = (e) => {
          console.error('[OfflineSyncService] IndexedDB open failed:', e);
          resolve(null);
        };
      } catch (err) {
        console.error('[OfflineSyncService] IndexedDB initialization exception:', err);
        resolve(null);
      }
    });

    return this.dbInitPromise;
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineSyncService] Network online detected');
      this.isOnlineState = true;
      this.notifyListeners();
      this.handleReconnection();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineSyncService] Network offline detected');
      this.isOnlineState = false;
      this.notifyListeners();
    });
  }

  private startHeartbeatTimer(): void {
    // Check every 10 seconds for clock updates & connectivity heartbeat
    setInterval(() => {
      this.updateMonotonicTracking();
      this.notifyListeners();
    }, 10000);

    // Periodic background sync if online & items pending
    setInterval(() => {
      if (this.isOnlineState && this.pendingQueueCache.length > 0 && !this.isSyncingState) {
        this.syncPendingQueue();
      }
    }, 30000);
  }

  // ==========================================
  // ANTI-TAMPERING & MONOTONIC CLOCK PROTECTION
  // ==========================================

  private updateMonotonicTracking(): void {
    if (typeof performance !== 'undefined') {
      const nowPerf = performance.now();
      const elapsedSincePerfStart = (nowPerf - this.baselinePerfNow) / 1000;
      this.monotonicSecondsElapsed += Math.max(0, elapsedSincePerfStart);
      this.baselinePerfNow = nowPerf;
    }

    // Check for negative time jump (user rolling system clock backwards)
    const currentEpoch = Date.now();
    if (this.activeLease) {
      if (currentEpoch < this.activeLease.issuedAt - 60000) {
        // System clock rolled back before lease was issued!
        this.clockTamperedDetected = true;
      }
    }
  }

  // ==========================================
  // LEASE MANAGEMENT
  // ==========================================

  private async loadPersistedLease(): Promise<void> {
    if (!this.db) return;
    try {
      const tx = this.db.transaction(LEASE_STORE, 'readonly');
      const store = tx.objectStore(LEASE_STORE);
      const req = store.get('active_lease');

      req.onsuccess = () => {
        if (req.result && req.result.lease) {
          this.activeLease = req.result.lease;
          this.lastVerifiedAt = req.result.lastVerifiedAt || null;
          this.monotonicSecondsElapsed = req.result.monotonicSecondsElapsed || 0;
          this.notifyListeners();
        }
      };
    } catch (err) {
      console.warn('[OfflineSyncService] Failed to load persisted lease:', err);
    }
  }

  private async persistLease(lease: OfflineLicenseLease): Promise<void> {
    this.activeLease = lease;
    this.lastVerifiedAt = new Date().toISOString();
    this.clockTamperedDetected = false;
    this.monotonicSecondsElapsed = 0;
    this.baselinePerfNow = performance.now();
    this.baselineEpoch = Date.now();

    if (!this.db) await this.initDB();
    if (!this.db) return;

    try {
      const tx = this.db.transaction(LEASE_STORE, 'readwrite');
      const store = tx.objectStore(LEASE_STORE);
      store.put({
        key: 'active_lease',
        lease,
        lastVerifiedAt: this.lastVerifiedAt,
        monotonicSecondsElapsed: 0,
        savedAt: Date.now()
      });
    } catch (err) {
      console.warn('[OfflineSyncService] Error persisting lease:', err);
    }
    this.notifyListeners();
  }

  public async requestFreshLease(
    tenantId: string,
    user: User,
    authToken?: string
  ): Promise<OfflineLicenseLease | null> {
    if (!this.isOnlineState) return this.activeLease;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-device-id': this.deviceId
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const params = new URLSearchParams({
        deviceId: this.deviceId,
        deviceName: this.deviceName
      });

      const res = await fetch(`/api/app/offline/lease?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.lease) {
          await this.persistLease(data.lease);
          this.isOnlineState = true;
          return data.lease;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('[OfflineSyncService] Lease rejected by server:', errData);
      }
    } catch (err) {
      console.warn('[OfflineSyncService] Network error requesting lease, offline mode engaged:', err);
      this.isOnlineState = false;
    }
    return this.activeLease;
  }

  // ==========================================
  // STATE & EXPIRY EVALUATION
  // ==========================================

  public getState(): OfflineServiceState {
    const now = Date.now();
    let isGracePeriodActive = false;
    let isExpired = false;
    let remainingMs = 0;
    let allowedOfflineModules: ModuleId[] = [];

    if (this.activeLease) {
      allowedOfflineModules = this.activeLease.allowedOfflineModules || [];

      // Calculate time remaining based on signed expiry timestamp
      const naturalRemaining = Math.max(0, this.activeLease.expiresAt - now);
      
      // Calculate anti-tampering monotonic remaining
      const totalAllowedDurationMs = this.activeLease.gracePeriodHours * 3600 * 1000;
      const monotonicRemaining = Math.max(0, totalAllowedDurationMs - (this.monotonicSecondsElapsed * 1000));
      
      // Use strictest of natural time or monotonic elapsed time
      remainingMs = Math.min(naturalRemaining, monotonicRemaining);

      if (this.clockTamperedDetected || remainingMs <= 0) {
        isExpired = true;
        isGracePeriodActive = false;
        remainingMs = 0;
      } else {
        isGracePeriodActive = true;
        isExpired = false;
      }
    } else {
      // No active lease
      isExpired = !this.isOnlineState;
    }

    return {
      isOnline: this.isOnlineState,
      isOffline: !this.isOnlineState,
      isSyncing: this.isSyncingState,
      lastSyncSuccess: this.lastSyncSuccess,
      lastSyncAt: this.lastSyncAt,
      pendingCount: this.pendingQueueCache.filter(i => i.syncStatus === 'PENDING' || i.syncStatus === 'FAILED').length,
      activeLease: this.activeLease,
      isGracePeriodActive,
      isExpired,
      remainingMs,
      remainingFormatted: this.formatRemainingTime(remainingMs),
      allowedOfflineModules,
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      lastVerifiedAt: this.lastVerifiedAt,
      clockTamperedDetected: this.clockTamperedDetected
    };
  }

  private formatRemainingTime(ms: number): string {
    if (ms <= 0) return '0h 00m';
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  public isModuleAllowedOffline(moduleId: ModuleId): boolean {
    if (this.isOnlineState) return true;
    const state = this.getState();
    if (state.isExpired) return false;
    return state.allowedOfflineModules.includes(moduleId);
  }

  public canPerformOfflineWrite(moduleId: ModuleId): { allowed: boolean; reason?: string } {
    if (this.isOnlineState) return { allowed: true };
    const state = this.getState();

    if (!this.activeLease) {
      return { 
        allowed: false, 
        reason: 'No offline authorization lease found on this device. Please connect to the internet to verify your Davetech ERP subscription.' 
      };
    }

    if (state.isExpired) {
      return {
        allowed: false,
        reason: 'Offline access period expired. Please connect to the internet to verify your Davetech ERP subscription and continue working.'
      };
    }

    if (!state.allowedOfflineModules.includes(moduleId)) {
      return {
        allowed: false,
        reason: `Module '${moduleId}' is not authorized for offline use. Sensitive and server-dependent functions require an active internet connection.`
      };
    }

    return { allowed: true };
  }

  // ==========================================
  // DATA CACHING (OFFLINE LOOKUPS)
  // ==========================================

  public async cacheLookupData(tenantId: string, cacheKey: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) return;

    try {
      const tx = this.db.transaction(CACHE_STORE, 'readwrite');
      const store = tx.objectStore(CACHE_STORE);
      store.put({
        cacheKey: `${tenantId}_${cacheKey}`,
        tenantId,
        key: cacheKey,
        data,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[OfflineSyncService] Error caching lookup data:', err);
    }
  }

  public async getCachedLookupData<T = any>(tenantId: string, cacheKey: string): Promise<T | null> {
    if (!this.db) await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(CACHE_STORE, 'readonly');
        const store = tx.objectStore(CACHE_STORE);
        const req = store.get(`${tenantId}_${cacheKey}`);

        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data as T);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // ==========================================
  // OFFLINE MUTATION QUEUE
  // ==========================================

  public async enqueueMutation(
    tenantId: string,
    userId: string,
    module: ModuleId,
    action: string,
    payload: any
  ): Promise<{ success: boolean; operationId: string; error?: string }> {
    const writeCheck = this.canPerformOfflineWrite(module);
    if (!writeCheck.allowed) {
      return { success: false, operationId: '', error: writeCheck.reason };
    }

    const operationId = `op_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    const queueItem: OfflineQueueItem = {
      operationId,
      tenantId,
      userId,
      deviceId: this.deviceId,
      module,
      action,
      payload,
      createdAt: new Date().toISOString(),
      clientTimestamp: Date.now(),
      syncStatus: 'PENDING',
      retryCount: 0
    };

    if (!this.db) await this.initDB();
    if (this.db) {
      try {
        const tx = this.db.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        store.put(queueItem);
      } catch (err) {
        console.error('[OfflineSyncService] Error storing mutation queue item:', err);
      }
    }

    await this.refreshPendingQueueCache();
    this.notifyListeners();

    // Trigger immediate background sync if online
    if (this.isOnlineState) {
      this.syncPendingQueue().catch(() => {});
    }

    return { success: true, operationId };
  }

  private async refreshPendingQueueCache(): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          this.pendingQueueCache = req.result || [];
          resolve();
        };
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public getPendingQueue(): OfflineQueueItem[] {
    return [...this.pendingQueueCache];
  }

  // ==========================================
  // SYNCHRONIZATION ENGINE
  // ==========================================

  public async syncPendingQueue(authToken?: string): Promise<OfflineSyncBatchResult | null> {
    if (this.isSyncingState) return null;
    await this.refreshPendingQueueCache();

    const pendingItems = this.pendingQueueCache.filter(
      item => item.syncStatus === 'PENDING' || item.syncStatus === 'FAILED'
    );

    if (pendingItems.length === 0) {
      this.lastSyncSuccess = true;
      this.notifyListeners();
      return null;
    }

    const tenantId = pendingItems[0].tenantId;
    const userId = pendingItems[0].userId;

    this.isSyncingState = true;
    this.notifyListeners();

    try {
      const payload: OfflineSyncBatchPayload = {
        deviceId: this.deviceId,
        tenantId,
        leaseSignature: this.activeLease?.signature || '',
        operations: pendingItems
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-device-id': this.deviceId
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/app/offline/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result: OfflineSyncBatchResult = await res.json();
        
        // Update local database statuses
        if (this.db) {
          const tx = this.db.transaction(QUEUE_STORE, 'readwrite');
          const store = tx.objectStore(QUEUE_STORE);

          for (const item of pendingItems) {
            if (result.acceptedOperations.includes(item.operationId)) {
              item.syncStatus = 'SYNCED';
              item.serverSyncedAt = new Date().toISOString();
              store.put(item);
            } else {
              const rej = result.rejectedOperations.find(r => r.operationId === item.operationId);
              if (rej) {
                item.syncStatus = 'REJECTED';
                item.errorMessage = rej.reason;
              } else {
                item.syncStatus = 'FAILED';
                item.retryCount += 1;
              }
              store.put(item);
            }
          }
        }

        // If a fresh lease was returned, save it
        if (result.freshLease) {
          await this.persistLease(result.freshLease);
        }

        this.lastSyncSuccess = true;
        this.lastSyncAt = new Date().toISOString();
        this.isOnlineState = true;
        await this.refreshPendingQueueCache();
        this.notifyListeners();
        return result;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('[OfflineSyncService] Sync request rejected by server:', errData);
        this.lastSyncSuccess = false;
      }
    } catch (err) {
      console.warn('[OfflineSyncService] Network error during batch sync:', err);
      this.isOnlineState = false;
      this.lastSyncSuccess = false;
    } finally {
      this.isSyncingState = false;
      this.notifyListeners();
    }
    return null;
  }

  private async handleReconnection(): Promise<void> {
    if (this.activeLease) {
      const storedUserId = localStorage.getItem('erp_user_id') || this.activeLease.userId;
      const userMock: any = { id: storedUserId, permissions: this.activeLease.permissions };
      await this.requestFreshLease(this.activeLease.tenantId, userMock);
    }
    await this.syncPendingQueue();
  }

  // ==========================================
  // REACTIVE SUBSCRIBERS
  // ==========================================

  public subscribe(listener: OfflineStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (err) {
        console.error('[OfflineSyncService] Error in listener callback:', err);
      }
    });
  }
}

export const offlineSyncService = new OfflineSyncServiceEngine();
