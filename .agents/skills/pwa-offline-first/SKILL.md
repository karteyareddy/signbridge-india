---
name: pwa-offline-first
description: Triggered when working on service workers, IndexedDB caching, offline functionality, or low-connectivity handling.
---
# PWA & Offline Strategy

**Rural & Offline Resilience:**
- **Caching Assets**: Use a Service Worker to cache static frontend assets.
- **Data Caching**: Store downloaded Service Packs (JSON and small video files) in IndexedDB.
- **Operation**: The app MUST function offline. If offline, the QR scan loads the cached pack from IndexedDB and displays the static phrase board.
- **Syncing**: Queue user feedback, telemetry, and assistance requests locally when offline, and use Background Sync to push them to Supabase when reconnected.
- **Media**: Always provide fallback low-res videos or static thumbnails to accommodate poor connectivity.
