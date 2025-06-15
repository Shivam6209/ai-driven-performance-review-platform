// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - This will be replaced with your actual config
// Note: In production, you should get these values from your environment
const firebaseConfig = {
  apiKey: "****", // Your actual API key
  authDomain: "noteskeeping-*****.firebaseapp.com", // Your actual auth domain
  projectId: "*****-*****", // Your actual project ID
  storageBucket: "noteskeep**********.firebasestorage.app", // Your actual storage bucket
  messagingSenderId: "****", // Your actual messaging sender ID
  appId: "1:30*****e14", // Your actual app ID
  databaseURL: "****" // Your actual database URL
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Performance Review Platform';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-32x32.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click - open the app
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  if (event.notification.data?.trackDismissal) {
    // Send analytics event
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      body: JSON.stringify({
        notificationId: event.notification.data.id,
        timestamp: Date.now()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(console.error);
  }
}); 