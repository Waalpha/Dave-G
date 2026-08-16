import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  Auth 
} from 'firebase/auth';

// Read config safely in browser environment
const firebaseConfig = {
  projectId: "gen-lang-client-0034779810",
  appId: "1:626614375833:web:d053df04a0ecc9e0a5ef08",
  apiKey: "AIzaSyDxvXfDF12pV6lw9NyqSNXucWuWPAebTuU",
  authDomain: "gen-lang-client-0034779810.firebaseapp.com",
};

export function getClientFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

let clientAuth: Auth | null = null;

export function getClientAuth(): Auth {
  if (!clientAuth) {
    const app = getClientFirebaseApp();
    clientAuth = getAuth(app);
    
    // Safely configure browser persistence to prevent IndexedDB closing/hidden crash on mobile
    try {
      setPersistence(clientAuth, browserLocalPersistence).catch(() => {
        try {
          if (clientAuth) {
            setPersistence(clientAuth, browserSessionPersistence).catch(() => {
              if (clientAuth) setPersistence(clientAuth, inMemoryPersistence).catch(() => {});
            });
          }
        } catch (_) {}
      });
    } catch (_) {}
  }
  return clientAuth;
}

export async function signInWithGooglePopup() {
  const auth = getClientAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      photoUrl: user.photoURL,
      idToken
    };
  } catch (err: any) {
    // Check for common mobile / IndexedDB backgrounding errors
    const errorStr = (err?.message || err?.toString() || '').toLowerCase();
    if (
      errorStr.includes('database is closing') ||
      errorStr.includes('database connection is being closed') ||
      errorStr.includes('hidden') ||
      err?.code === 'auth/internal-error'
    ) {
      // Re-initialize persistence to in-memory/session and attempt once more if needed
      try {
        await setPersistence(auth, inMemoryPersistence);
      } catch (_) {}
    }
    throw err;
  }
}
