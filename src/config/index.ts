// Configuration file for environment variables with fallback defaults
interface Config {
  api: {
    baseUrl: string;
    mediaUrl: string;
  };
  app: {
    name: string;
    version: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
    vapidKey: string;
  };
}

const config: Config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    mediaUrl: import.meta.env.VITE_MEDIA_URL || 'http://localhost:3000',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Sharingo',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  firebase: {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
    measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined)?.trim(),
    vapidKey: (import.meta.env.VITE_FIREBASE_VAPID_KEY || '').trim(),
  },
};

export default config;
