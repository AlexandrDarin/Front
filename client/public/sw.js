const CACHE_NAME = 'techstore-v1';
const API_CACHE_NAME = 'techstore-api-v1';
const STATIC_CACHE_NAME = 'techstore-static-v1';

// Файлы для кэширования
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Установка service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Стратегия: Stale-While-Revalidate для API
async function apiStrategy(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Если сеть недоступна и есть кэш, возвращаем его
      return cachedResponse;
    });

  return cachedResponse || networkPromise;
}

// Стратегия: Cache First для статики
async function staticStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

// Стратегия: Network First для важных запросов
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Вы офлайн', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API запросы
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiStrategy(event.request));
  }
  // Статические файлы
  else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    event.respondWith(staticStrategy(event.request));
  }
  // HTML и другие запросы
  else {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  try {
    const db = await openDB();
    const orders = await db.getAll('pendingOrders');
    
    for (const order of orders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await db.delete('pendingOrders', order.id);
        }
      } catch (error) {
        console.error('Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push уведомления
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Перейти в магазин'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TechStore', options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Помощник для открытия IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TechStoreDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id' });
      }
    };
  });
}