import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  enableIndexedDbPersistence
} from 'firebase/firestore';

const CONFIG_STORAGE_KEY = 'bb_firebase_config';

// Load stored Firebase config or environment variables
export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  // Check Vite environment variables if available
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } else {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

let appInstance = null;
let dbInstance = null;

// Initialize Firebase App & Firestore with offline cache
export function getFirebaseFirestore(customConfig = null) {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    if (!dbInstance) {
      dbInstance = getFirestore(appInstance);
      // Enable Firestore offline persistence for web/mobile
      try {
        enableIndexedDbPersistence(dbInstance).catch((err) => {
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn('[Firebase] Persistence enabled in another tab.');
          } else if (err.code === 'unimplemented') {
            console.warn('[Firebase] Browser does not support persistence.');
          }
        });
      } catch (e) {}
    }

    return dbInstance;
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
    return null;
  }
}

// Check if Firebase is currently active
export function isFirebaseConnected() {
  const config = getSavedFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

// Cloud Mutators
export async function syncOrderToFirebase(order) {
  const firestore = getFirebaseFirestore();
  if (!firestore || !order?.id) return;
  try {
    await setDoc(doc(firestore, 'orders', order.id), order, { merge: true });
    console.log(`[Firebase Cloud] Synced order ${order.invoiceNo}`);
  } catch (err) {
    console.error('[Firebase Cloud] Failed to sync order:', err);
  }
}

export async function syncShopToFirebase(shop) {
  const firestore = getFirebaseFirestore();
  if (!firestore || !shop?.id) return;
  try {
    await setDoc(doc(firestore, 'shops', shop.id), shop, { merge: true });
    console.log(`[Firebase Cloud] Synced shop ${shop.name}`);
  } catch (err) {
    console.error('[Firebase Cloud] Failed to sync shop:', err);
  }
}

export async function syncStaffToFirebase(staffMember) {
  const firestore = getFirebaseFirestore();
  if (!firestore || !staffMember?.id) return;
  try {
    await setDoc(doc(firestore, 'staff', staffMember.id), staffMember, { merge: true });
    console.log(`[Firebase Cloud] Synced staff member ${staffMember.name}`);
  } catch (err) {
    console.error('[Firebase Cloud] Failed to sync staff:', err);
  }
}

export async function syncSettingsToFirebase(settings) {
  const firestore = getFirebaseFirestore();
  if (!firestore || !settings) return;
  try {
    await setDoc(doc(firestore, 'settings', 'active_settings'), settings, { merge: true });
    console.log(`[Firebase Cloud] Synced cafe settings`);
  } catch (err) {
    console.error('[Firebase Cloud] Failed to sync settings:', err);
  }
}

// Real-Time Listeners (Sync Web & Mobile in real-time)
export function subscribeToFirebaseOrders(onOrdersUpdate) {
  const firestore = getFirebaseFirestore();
  if (!firestore) return () => {};

  try {
    const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'), limit(200));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach(docSnap => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (orders.length > 0) {
        onOrdersUpdate(orders);
      }
    }, (error) => {
      console.warn('[Firebase] Orders subscription error:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase] Failed to attach orders listener:', err);
    return () => {};
  }
}

export function subscribeToFirebaseShops(onShopsUpdate) {
  const firestore = getFirebaseFirestore();
  if (!firestore) return () => {};

  try {
    const unsubscribe = onSnapshot(collection(firestore, 'shops'), (snapshot) => {
      const shops = [];
      snapshot.forEach(docSnap => {
        shops.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (shops.length > 0) {
        onShopsUpdate(shops);
      }
    }, (error) => {
      console.warn('[Firebase] Shops subscription error:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase] Failed to attach shops listener:', err);
    return () => {};
  }
}

export function subscribeToFirebaseStaff(onStaffUpdate) {
  const firestore = getFirebaseFirestore();
  if (!firestore) return () => {};

  try {
    const unsubscribe = onSnapshot(collection(firestore, 'staff'), (snapshot) => {
      const staffList = [];
      snapshot.forEach(docSnap => {
        staffList.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (staffList.length > 0) {
        onStaffUpdate(staffList);
      }
    }, (error) => {
      console.warn('[Firebase] Staff subscription error:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase] Failed to attach staff listener:', err);
    return () => {};
  }
}
