'use client';

import React, { useEffect, useState } from 'react';
import { requestOutboxFlush } from '../../lib/offline/database';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      void requestOutboxFlush();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          setIsReady(true);
          registration.active?.postMessage({ type: 'CACHE_STORED_PACK_MEDIA' });
          if (navigator.onLine) void requestOutboxFlush();
        })
        .catch(() => setIsReady(false));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {isOnline
          ? isReady
            ? 'Online. Offline service-pack support is ready.'
            : 'Online.'
          : 'Offline. Saved service packs remain available and submissions will be queued.'}
      </div>
      {!isOnline && (
        <div
          className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-950"
          role="status"
        >
          Offline mode — saved phrase boards work, and submissions will sync after reconnecting.
        </div>
      )}
      {children}
    </>
  );
}
