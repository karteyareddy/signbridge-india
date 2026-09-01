'use client';

import {
  AccessPointContext,
  FeedbackSubmission,
  ServicePackContent,
  UrgencyLevel,
} from '../../types/access-point';
import {
  BACKGROUND_SYNC_TAG,
  buildCachedServicePackRecord,
  CachedServicePackRecord,
  createOfflineOperation,
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  OfflineOperation,
  OUTBOX_STORE,
  SERVICE_PACK_STORE,
} from './shared';

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

export function canUseOfflineStorage(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openOfflineDatabase(): Promise<IDBDatabase> {
  if (!canUseOfflineStorage()) {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

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
    request.onerror = () => reject(request.error ?? new Error('Could not open offline storage.'));
  });
}

async function sendMessageToServiceWorker(message: object): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  (navigator.serviceWorker.controller ?? registration?.active)?.postMessage(message);
}

export async function getCachedServicePack(
  qrToken: string
): Promise<CachedServicePackRecord | null> {
  if (!canUseOfflineStorage()) return null;

  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(SERVICE_PACK_STORE, 'readonly');
    const result = await requestToPromise(
      transaction.objectStore(SERVICE_PACK_STORE).get(qrToken)
    );
    return (result as CachedServicePackRecord | undefined) ?? null;
  } finally {
    database.close();
  }
}

export async function cacheServicePack(
  qrToken: string,
  context: AccessPointContext,
  pack: ServicePackContent
): Promise<CachedServicePackRecord | null> {
  if (!canUseOfflineStorage()) return null;

  const record = buildCachedServicePackRecord(qrToken, context, pack);
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(SERVICE_PACK_STORE, 'readwrite');
    await requestToPromise(transaction.objectStore(SERVICE_PACK_STORE).put(record));
  } finally {
    database.close();
  }

  await sendMessageToServiceWorker({ type: 'CACHE_SERVICE_PACK', urls: record.mediaUrls });
  return record;
}

async function requestBackgroundSync(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;
  const syncRegistration = registration as ServiceWorkerRegistration & {
    sync?: { register(tag: string): Promise<void> };
  };

  if (syncRegistration.sync) {
    await syncRegistration.sync.register(BACKGROUND_SYNC_TAG);
  } else if (navigator.onLine) {
    registration.active?.postMessage({ type: 'FLUSH_OUTBOX' });
  }
}

export async function enqueueOfflineOperation(
  type: 'feedback',
  payload: FeedbackSubmission
): Promise<OfflineOperation>;
export async function enqueueOfflineOperation(
  type: 'assistance',
  payload: { access_point_id: string; urgency: UrgencyLevel }
): Promise<OfflineOperation>;
export async function enqueueOfflineOperation(
  type: OfflineOperation['type'],
  payload: FeedbackSubmission | { access_point_id: string; urgency: UrgencyLevel }
): Promise<OfflineOperation> {
  const operation =
    type === 'feedback'
      ? createOfflineOperation('feedback', payload as FeedbackSubmission)
      : createOfflineOperation(
          'assistance',
          payload as { access_point_id: string; urgency: UrgencyLevel }
        );
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(OUTBOX_STORE, 'readwrite');
    await requestToPromise(transaction.objectStore(OUTBOX_STORE).put(operation));
  } finally {
    database.close();
  }

  await requestBackgroundSync().catch(() => undefined);
  return operation;
}

export async function requestOutboxFlush(): Promise<void> {
  await sendMessageToServiceWorker({ type: 'FLUSH_OUTBOX' });
}
