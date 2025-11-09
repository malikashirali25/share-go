/* eslint-disable no-undef */
let messagingInstance = null;

const initializeMessaging = (firebaseConfig) => {
  if (messagingInstance || !firebaseConfig?.apiKey) {
    return;
  }

  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

  firebase.initializeApp(firebaseConfig);
  messagingInstance = firebase.messaging();

  messagingInstance.onBackgroundMessage((payload) => {
    const notificationTitle = payload?.notification?.title || 'New notification';
    const notificationOptions = {
      body: payload?.notification?.body,
      icon: payload?.notification?.icon,
      data: payload?.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
};

self.addEventListener('message', (event) => {
  if (event.data?.type === 'INIT_FIREBASE_CONFIG') {
    initializeMessaging(event.data.payload);
  }
});

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload?.notification?.title || 'New notification';
      const options = {
        body: payload?.notification?.body,
        icon: payload?.notification?.icon,
        data: payload?.data,
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (error) {
      console.error('Failed to handle push event', error);
    }
  }
});

