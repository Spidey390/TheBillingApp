import { initializeApp } from 'firebase/app';

export const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

function getFirebaseConfig() {
  if (useEmulators) {
    return {
      apiKey: envConfig.apiKey || 'demo-api-key',
      authDomain: envConfig.authDomain || 'demo-billingapp.firebaseapp.com',
      projectId: 'demo-billingapp',
      storageBucket: envConfig.storageBucket || 'demo-billingapp.firebasestorage.app',
      messagingSenderId: envConfig.messagingSenderId || '000000000000',
      appId: envConfig.appId || '1:000000000000:web:000000000000',
      measurementId: envConfig.measurementId
    };
  }

  const missing = ['apiKey', 'projectId', 'authDomain', 'appId'].filter(k => !envConfig[k]);
  if (missing.length > 0) {
    const names = missing.map(k => `VITE_FIREBASE_${k.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`);
    console.error(`Firebase configuration error: Missing required environment variables: ${names.join(', ')}`);
  }

  return envConfig;
}

export const app = initializeApp(getFirebaseConfig());
