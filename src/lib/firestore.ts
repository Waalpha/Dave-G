import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, deleteDoc, getDocs, collection, Firestore, setLogLevel } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Suppress internal gRPC idle stream disconnect and keepalive debug/info warnings
try {
  setLogLevel('error');
} catch {
  // Ignore in environments where setLogLevel might already be configured
}

export enum FirestoreErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  UNAVAILABLE = 'UNAVAILABLE',
  UNKNOWN = 'UNKNOWN'
}

export function classifyFirestoreError(err: any): { code: FirestoreErrorCode; message: string } {
  const message = err instanceof Error ? err.message : String(err || 'Unknown error');
  const lower = message.toLowerCase();

  if (lower.includes('permission_denied') || lower.includes('permission-denied') || lower.includes('insufficient permissions')) {
    return { code: FirestoreErrorCode.PERMISSION_DENIED, message };
  }
  if (lower.includes('not-found') || lower.includes('not_found')) {
    return { code: FirestoreErrorCode.NOT_FOUND, message };
  }
  if (lower.includes('offline') || lower.includes('network') || lower.includes('unavailable') || lower.includes('failed to get document')) {
    return { code: FirestoreErrorCode.NETWORK_ERROR, message };
  }
  if (lower.includes('invalid-argument') || lower.includes('invalid_argument')) {
    return { code: FirestoreErrorCode.INVALID_ARGUMENT, message };
  }
  if (lower.includes('quota') || lower.includes('resource-exhausted')) {
    return { code: FirestoreErrorCode.QUOTA_EXCEEDED, message };
  }

  return { code: FirestoreErrorCode.UNKNOWN, message };
}

let db: Firestore | null = null;

export function getDb(): Firestore | null {
  if (db) return db;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const databaseId = config.firestoreDatabaseId || '(default)';

      const firebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        appId: config.appId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
      };

      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        experimentalAutoDetectLongPolling: true,
      }, databaseId);
      console.log(`[Firestore] Initialized Web SDK successfully with databaseId: ${databaseId}`);
    } else {
      console.warn('[Firestore] firebase-applet-config.json not found');
    }
  } catch (err) {
    const classified = classifyFirestoreError(err);
    console.error(`[Firestore] Initialization error [${classified.code}]:`, classified.message);
    db = null;
  }

  return db;
}

// Helpers to save and load state collections to Firestore
function sanitizeOversizedPayload(obj: any, maxStringLength = 100_000): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeOversizedPayload(item, maxStringLength));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (value.startsWith('data:image/') && value.length > maxStringLength) {
        // Strip oversized base64 data to keep doc under Firestore 1MB quota
        console.warn(`[Firestore] Trimming oversized base64 field '${key}' (${value.length} bytes) to fit Firestore document limits.`);
        result[key] = '';
      } else if (value.length > maxStringLength) {
        result[key] = value.substring(0, maxStringLength);
      } else {
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeOversizedPayload(value, maxStringLength);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function saveDocToFirestore(collectionName: string, docId: string, data: any): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) {
    console.warn(`[Firestore] Firestore not initialized. Skipped remote persist for ${collectionName}/${docId}.`);
    return false;
  }

  let cleanData = JSON.parse(JSON.stringify(data));
  let serialized = JSON.stringify(cleanData);

  // Firestore maximum document size is 1,048,576 bytes. Keep within 800KB safety margin.
  if (Buffer.byteLength(serialized, 'utf8') > 800_000) {
    cleanData = sanitizeOversizedPayload(cleanData, 50_000);
    serialized = JSON.stringify(cleanData);
    if (Buffer.byteLength(serialized, 'utf8') > 950_000) {
      cleanData = sanitizeOversizedPayload(cleanData, 10_000);
    }
  }

  try {
    const docRef = doc(firestore, collectionName, docId);
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (err: any) {
    if (err?.message?.includes('closing') || err?.message?.includes('closed') || err?.message?.includes('hidden')) {
      db = null;
    }
    const { code, message } = classifyFirestoreError(err);
    console.warn(`[Firestore] Failed to save ${collectionName}/${docId} [${code}]: ${message}`);
    return false;
  }
}

export async function deleteDocFromFirestore(collectionName: string, docId: string): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) {
    return false;
  }

  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    if (err?.message?.includes('closing') || err?.message?.includes('closed') || err?.message?.includes('hidden')) {
      db = null;
    }
    const { code, message } = classifyFirestoreError(err);
    console.warn(`[Firestore] Failed to delete ${collectionName}/${docId} [${code}]: ${message}`);
    return false;
  }
}

export async function loadCollectionFromFirestore<T>(collectionName: string): Promise<T[]> {
  try {
    const firestore = getDb();
    if (!firestore) return [];
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const items: T[] = [];
    querySnapshot.forEach(docSnap => {
      items.push(docSnap.data() as T);
    });
    return items;
  } catch (err: any) {
    if (err?.message?.includes('closing') || err?.message?.includes('closed') || err?.message?.includes('hidden')) {
      db = null;
    }
    const { code, message } = classifyFirestoreError(err);
    console.warn(`[Firestore] Notice loading collection ${collectionName} [${code}]: ${message}`);
    return [];
  }
}
