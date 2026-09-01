---
name: testing
description: Triggered when writing tests, performing QA, validating models, or preparing for production readiness.
---
# Testing & Quality Assurance

**Validation Requirements:**
- **Device Support**: UI and Performance must be tested on low-end Android devices.
- **Offline Resilience**: Actively test the application's behavior when the network connection is dropped or throttled (Service Worker and IndexedDB functionality).
- **AI Evaluation**: The ML model must be evaluated using signer-independent data splits to prove real-world generalization.
- **Completion Criteria**: Run full linting, unit tests (where applicable), and a production build (`npm run build`) before declaring any major feature complete.
- **Edge Cases**: Always test what happens when MediaPipe fails to find landmarks or when the database query returns 0 rows.
