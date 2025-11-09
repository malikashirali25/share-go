import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFirebaseMessaging, registerFirebaseServiceWorker, retrieveFcmToken } from '../lib/firebase';
import { notificationService } from '../services/notificationService';

const DEVICE_ID_STORAGE_KEY = 'sharego_device_id';
const TOKEN_CACHE_STORAGE_KEY = 'sharego_fcm_token_cache';

const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const existingId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, newId);
  return newId;
};

const getCacheFingerprint = (token: string, userId?: number) => JSON.stringify({
  token,
  userId: typeof userId === 'number' ? userId : null,
});

export const useFcmRegistration = (): void => {
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    let cancelled = false;

    const requestAndRegister = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) {
          return;
        }

        const registration = await registerFirebaseServiceWorker();
        if (!registration || cancelled) {
          return;
        }

        const messaging = await getFirebaseMessaging();
        if (!messaging || cancelled) {
          return;
        }

        const token = await retrieveFcmToken(messaging);
        if (!token || cancelled) {
          return;
        }

        const deviceId = getOrCreateDeviceId();
        if (!deviceId) {
          return;
        }

        const resolvedUserId = isLoggedIn && user?.id ? Number.parseInt(String(user.id), 10) : undefined;
        const fingerprint = getCacheFingerprint(token, resolvedUserId);
        const cachedFingerprint = localStorage.getItem(TOKEN_CACHE_STORAGE_KEY);

        if (fingerprint === cachedFingerprint) {
          return;
        }

        await notificationService.updatePublicFcmToken({
          deviceId,
          fcmToken: token,
          ...(resolvedUserId ? { userId: resolvedUserId } : {}),
        });

        localStorage.setItem(TOKEN_CACHE_STORAGE_KEY, fingerprint);
      } catch (error) {
        console.error('Failed to register Firebase Cloud Messaging token', error);
      }
    };

    requestAndRegister();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, user?.id]);
};

