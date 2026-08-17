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
    console.error('[Firestore] Initialization error:', err);
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

export async function saveDocToFirestore(collectionName: string, docId: string, data: any): Promise<void> {
  const firestore = getDb();
  if (!firestore) {
    throw new Error(`Firestore not initialized. Cannot persist document ${docId} to ${collectionName}.`);
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
    console.log(`[Firestore] Successfully persisted ${collectionName}/${docId}`);
  } catch (err: any) {
    if (err?.message?.includes('closing') || err?.message?.includes('closed') || err?.message?.includes('hidden')) {
      db = null;
    }
    console.error(`[Firestore] Error saving doc ${docId} to ${collectionName}:`, err?.message || err);
    throw err;
  }
}

export async function deleteDocFromFirestore(collectionName: string, docId: string): Promise<void> {
  const firestore = getDb();
  if (!firestore) {
    throw new Error(`Firestore not initialized. Cannot delete document ${docId} from ${collectionName}.`);
  }

  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Successfully deleted ${collectionName}/${docId}`);
  } catch (err: any) {
    if (err?.message?.includes('closing') || err?.message?.includes('closed') || err?.message?.includes('hidden')) {
      db = null;
    }
    console.error(`[Firestore] Error deleting doc ${docId} from ${collectionName}:`, err?.message || err);
    throw err;
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
    console.warn(`[Firestore] Notice loading collection ${collectionName}:`, err?.message || err);
    return [];
  }
}
