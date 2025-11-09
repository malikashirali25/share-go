import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging, getToken } from 'firebase/messaging';
import config from '../config';

let firebaseApp: FirebaseApp | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

const logConfigSummary = () => {
  if (import.meta.env.DEV) {
    const summary = {
      hasApiKey: Boolean(config.firebase.apiKey),
      hasAuthDomain: Boolean(config.firebase.authDomain),
      hasProjectId: Boolean(config.firebase.projectId),
      hasStorageBucket: Boolean(config.firebase.storageBucket),
      hasMessagingSenderId: Boolean(config.firebase.messagingSenderId),
      hasAppId: Boolean(config.firebase.appId),
      hasMeasurementId: Boolean(config.firebase.measurementId),
      hasVapidKey: Boolean(config.firebase.vapidKey),
    };
    console.info('[FCM] Firebase config summary', summary);
  }
};

const ensureFirebaseApp = (): FirebaseApp => {
  if (firebaseApp) {
    return firebaseApp;
  }

  logConfigSummary();

  const missingKeys: string[] = [];
  if (!config.firebase.apiKey) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!config.firebase.authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.firebase.projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.firebase.storageBucket) missingKeys.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!config.firebase.messagingSenderId) missingKeys.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!config.firebase.appId) missingKeys.push('VITE_FIREBASE_APP_ID');
  if (!config.firebase.vapidKey) missingKeys.push('VITE_FIREBASE_VAPID_KEY');

  if (missingKeys.length > 0) {
    throw new Error(`Firebase configuration is missing required keys: ${missingKeys.join(', ')}. Please check your environment variables.`);
  }

  firebaseApp = getApps().length ? getApp() : initializeApp({
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
    ...(config.firebase.measurementId ? { measurementId: config.firebase.measurementId } : {}),
  });

  return firebaseApp;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (messagingPromise) {
    return messagingPromise;
  }

  messagingPromise = (async () => {
    const supported = await isSupported().catch((err) => {
      console.warn('Firebase messaging is not supported in this browser.', err);
      return false;
    });

    if (!supported) {
      return null;
    }

    const app = ensureFirebaseApp();
    return getMessaging(app);
  })();

  return messagingPromise;
};

const sendConfigToServiceWorker = (registration: ServiceWorkerRegistration) => {
  const message = {
    type: 'INIT_FIREBASE_CONFIG',
    payload: { ...config.firebase },
  };

  const send = (target?: ServiceWorker | null) => {
    target?.postMessage(message);
  };

  if (registration.installing) {
    registration.installing.addEventListener('statechange', () => {
      if (registration.installing?.state === 'activated') {
        send(registration.active);
      }
    });
  }

  send(registration.waiting);
  send(registration.active);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    send(navigator.serviceWorker.controller);
  }, { once: true });
};

export const registerFirebaseServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    sendConfigToServiceWorker(registration);
    navigator.serviceWorker.ready
      .then((readyRegistration) => {
        sendConfigToServiceWorker(readyRegistration);
      })
      .catch((error) => {
        console.warn('Failed to confirm ready service worker registration', error);
      });
    return registration;
  } catch (error) {
    console.error('Failed to register Firebase messaging service worker', error);
    return null;
  }
};

export const retrieveFcmToken = async (messaging: Messaging): Promise<string | null> => {
  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    console.log('=============================', config.firebase.vapidKey);

    const token = await getToken(messaging, {
      vapidKey: config.firebase.vapidKey || undefined,
      serviceWorkerRegistration,
    });
    return token ?? null;
  } catch (error) {
    console.error('Failed to retrieve FCM token', error);
    if (import.meta.env.DEV) {
      console.info('[FCM] config snapshot at failure', {
        hasApiKey: Boolean(config.firebase.apiKey),
        hasAuthDomain: Boolean(config.firebase.authDomain),
        hasProjectId: Boolean(config.firebase.projectId),
        hasMessagingSenderId: Boolean(config.firebase.messagingSenderId),
        hasAppId: Boolean(config.firebase.appId),
        hasVapidKey: Boolean(config.firebase.vapidKey),
      });
    }
    return null;
  }
};

