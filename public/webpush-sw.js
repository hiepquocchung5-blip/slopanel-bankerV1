const CACHE_NAME = 'slo-banker-cache-v1';

// V4: Essential listeners for PWA Installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// MANDATORY: Fetch listener is required for the browser to trigger "Install" prompt
self.addEventListener('fetch', (event) => {
  // Simple network-first or pass-through strategy
  event.respondWith(fetch(event.request));
});

// PUSH NOTIFICATIONS
self.addEventListener('push', function(event) {
  if (event.data) {
    const payload = event.data.json();
    const title = payload.title || 'New Request';
    const options = {
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/favicon.ico',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: payload.data,
      actions: [
        { action: 'open', title: 'View Details' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options).then(() => {
        // Send message to all clients to play sound if website is open
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PUSH_RECEIVED',
              title: title,
              body: payload.body
            });
          });
        });
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
