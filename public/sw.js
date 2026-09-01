/* global self, caches, indexedDB */

const CACHE_VERSION = 'signbridge-v2';
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const MEDIA_CACHE = `${CACHE_VERSION}-service-pack-media`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_ROUTES = ['/', '/access', '/access/hosp-reg-001', '/access/col-adm-001'];

const DB_NAME = 'signbridge-offline';
const DB_VERSION = 1;
const SERVICE_PACK_STORE = 'service-packs';
const OUTBOX_STORE = 'outbox';
const SYNC_TAG = 'signbridge-outbox-sync';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SERVICE_PACK_STORE)) {
        database.createObjectStore(SERVICE_PACK_STORE, { keyPath: 'qrToken' });
      }
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        const outbox = database.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
        outbox.createIndex('createdAt', 'createdAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cachePageAndAssets(cache, path) {
  const response = await fetch(path, { cache: 'reload' });
  if (!response.ok) return;

  await cache.put(path, response.clone());
  const html = await response.text();
  const assetUrls = new Set();
  const attributePattern = /(?:src|href)=["']([^"']+)["']/g;
  let match;

  while ((match = attributePattern.exec(html))) {
    const url = new URL(match[1], self.location.origin);
    if (url.origin === self.location.origin && url.pathname !== path) {
      assetUrls.add(url.href);
    }
  }

  await Promise.allSettled(
    [...assetUrls].map(async (url) => {
      const assetResponse = await fetch(url, { cache: 'reload' });
      if (assetResponse.ok) await cache.put(url, assetResponse);
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.addAll([
        OFFLINE_URL,
        '/manifest.webmanifest',
        '/icons/signbridge.svg',
        '/icons/signbridge-maskable.svg',
        '/isl-video-poster.svg',
      ]);
      await Promise.allSettled(PRECACHE_ROUTES.map((route) => cachePageAndAssets(cache, route)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const validCaches = new Set([APP_SHELL_CACHE, RUNTIME_CACHE, MEDIA_CACHE]);
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.filter((name) => !validCaches.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    const shell = await caches.open(APP_SHELL_CACHE);
    return (
      (await shell.match(request)) ||
      (request.mode === 'navigate' ? await shell.match('/access/hosp-reg-001') : undefined) ||
      (await shell.match(OFFLINE_URL))
    );
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === 'video' || request.destination === 'image') {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') || request.destination === 'style' || request.destination === 'script')
  ) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
  }
});

async function cacheServicePackMedia(urls) {
  const cache = await caches.open(MEDIA_CACHE);
  await Promise.allSettled(
    urls.map(async (url) => {
      if (await cache.match(url)) return;
      const parsed = new URL(url, self.location.origin);
      const response = await fetch(parsed.href, {
        mode: parsed.origin === self.location.origin ? 'same-origin' : 'no-cors',
      });
      if (response.ok || response.type === 'opaque') await cache.put(parsed.href, response);
    })
  );
}

async function cacheStoredServicePackMedia() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(SERVICE_PACK_STORE, 'readonly');
    const records = await idbRequest(transaction.objectStore(SERVICE_PACK_STORE).getAll());
    const urls = [...new Set(records.flatMap((record) => record.mediaUrls || []))];
    await cacheServicePackMedia(urls);
  } finally {
    database.close();
  }
}

async function getOutboxOperations(database) {
  const transaction = database.transaction(OUTBOX_STORE, 'readonly');
  const operations = await idbRequest(transaction.objectStore(OUTBOX_STORE).getAll());
  return operations.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

async function deleteOutboxOperation(database, id) {
  const transaction = database.transaction(OUTBOX_STORE, 'readwrite');
  await idbRequest(transaction.objectStore(OUTBOX_STORE).delete(id));
}

async function updateOutboxOperation(database, operation) {
  const transaction = database.transaction(OUTBOX_STORE, 'readwrite');
  await idbRequest(transaction.objectStore(OUTBOX_STORE).put(operation));
}

async function flushOutbox() {
  const database = await openDatabase();
  try {
    const operations = await getOutboxOperations(database);
    for (const operation of operations) {
      try {
        const response = await fetch('/api/offline-sync', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(operation),
        });

        if (response.ok) {
          await deleteOutboxOperation(database, operation.id);
        } else if (response.status >= 400 && response.status < 500) {
          await deleteOutboxOperation(database, operation.id);
        } else {
          throw new Error(`Sync failed with ${response.status}.`);
        }
      } catch (error) {
        await updateOutboxOperation(database, { ...operation, attempts: operation.attempts + 1 });
        throw error;
      }
    }
  } finally {
    database.close();
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_SERVICE_PACK' && Array.isArray(event.data.urls)) {
    event.waitUntil(cacheServicePackMedia(event.data.urls));
  }
  if (event.data?.type === 'FLUSH_OUTBOX') {
    event.waitUntil(flushOutbox());
  }
  if (event.data?.type === 'CACHE_STORED_PACK_MEDIA') {
    event.waitUntil(cacheStoredServicePackMedia());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) event.waitUntil(flushOutbox());
});
