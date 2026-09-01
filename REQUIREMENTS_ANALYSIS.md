# SIGNBRIDGE INDIA - Requirements Analysis

This document provides a comprehensive breakdown of the requirements for the SIGNBRIDGE INDIA MVP, based on the Product Requirements Document (PRD).

## 1. Complete Feature List
- **ISL Learning Hub**: 5-10 minute video-first micro-courses (Beginner, Everyday, Workplace, Healthcare, etc.), camera practice, immediate feedback on hand position/movement, spaced repetition, certificates/badges.
- **ISL Access Point**: QR/NFC code scanning at physical locations to load context-specific communication tools.
- **Contextual Phrase Composer**: Intent-based phrase building rather than free-text translation (e.g., *Hospital -> I need an appointment -> Which department?*). Visual phrase boards with text/video options.
- **AI Sign Assist**: Camera capture with MediaPipe landmark extraction predicting a constrained set of 30-50 high-value signs/intents using a temporal model. Includes a strict confidence threshold and safe fallbacks.
- **Human Escalation**: One-tap fallback to request a certified interpreter or volunteer when AI is uncertain or communication is complex.
- **ISL Readiness Dashboard**: Institutional reporting showing readiness score, number of trained staff, training completion rates, user feedback scores, and successful self-service interactions.
- **Community Validation**: Deaf user and community flagging of incorrect phrases, correction proposals, and moderation workflows.
- **Gamification/Incentives**: 5-minute daily learning streaks, role-based badges (e.g., ISL Ready Receptionist), district-level accessibility challenges.

## 2. MVP/P0/P1/P2 Classification

**P0 (MVP Priority - Must Have for Hackathon)**
- ISL Access Point QR flow (Signature innovation)
- Service-specific phrase packs (10-20 validated phrases for 2 categories: e.g., Hospital, College)
- ISL learning micro-course (1 track with 5 short lessons)
- 30-50 sign/intent AI demo (Camera practice with live landmarks/model output)
- Confidence + fallback for AI
- Institution readiness dashboard
- Offline/PWA support (cache demonstration)
- Responsive PWA with 8-10 polished screens

**P1 (Important Additions)**
- Human escalation mock (operator/interpreter queue screen)
- Community feedback loop
- Certificates and badges for learning

**P2 (Nice to Have / Future Roadmap)**
- NFC support
- District heatmap (Scale/policy demonstration)
- Advanced continuous translation

## 3. User Roles
- **Deaf / hard-of-hearing citizen**: Needs fast, dignified access to services.
- **Family member / caregiver**: Needs to learn basic ISL and emergency phrases.
- **Hearing citizen**: Needs micro-courses and everyday communication practice.
- **Frontline staff**: (e.g., receptionist, nurse, teacher) Needs role-based phrase packs and quick reference.
- **Institution administrator**: Needs to view readiness dashboards and manage staff training.
- **Certified interpreter / trained volunteer**: Handles complex cases efficiently via escalation queue.
- **District / policy stakeholder**: Views aggregated readiness heatmaps.
- **Admin**: Manages institutions, content, users, and model feedback.

## 4. User Journeys
- **Deaf user at a service point**: User scans QR at reception -> service context auto-loads -> user selects intent via visual phrase board -> staff responds via UI -> human escalation requested if needed -> interaction finishes -> user provides success rating.
- **Hearing staff learns**: Staff scans institution invitation -> selects their specific role -> takes a 5-minute lesson -> practices 10 critical phrases via camera -> earns competency badge -> institution score increases.
- **AI recognition practice**: User selects practice sign -> camera opens with framing guide -> MediaPipe extracts landmarks -> model predicts sign. If high confidence, show prediction. If low confidence, show fallback / "Not sure" state and offer manual phrase selection.

## 5. Technical Requirements
- **Frontend**: Next.js + TypeScript.
- **UI Framework**: Tailwind CSS + shadcn/ui.
- **Offline / Mobile**: Progressive Web App (PWA) using Service Workers and IndexedDB for caching.
- **Backend API**: FastAPI + Python (for ML inference and rapid API development).
- **Database & Authentication**: PostgreSQL / Supabase, Supabase Auth.
- **Storage**: Supabase Storage for videos/assets.
- **Realtime**: WebSocket / Supabase Realtime for escalation status and dashboards.
- **Maps**: OpenStreetMap + Leaflet.
- **Deployment**: Vercel (frontend) + managed Python service (API).
- **Monitoring**: Sentry + structured logs.

## 6. Database Requirements
*(Using PostgreSQL / Supabase)*
- `users`: id, role, preferred_language, accessibility_preferences, created_at
- `institutions`: id, name, type, district, state, address, readiness_level
- `access_points`: id, institution_id, service_type, qr_token, nfc_id, active
- `staff_profiles`: user_id, institution_id, role, training_level, badge
- `courses` & `lessons`: id, title, category, video_url, duration
- `service_packs` & `phrases`: intents, texts, isl_assets, locale, source, reviewed_by
- `practice_sessions` & `ai_predictions`: scores, predicted_intent, confidence
- `assistance_requests`: access_point_id, urgency, status
- `feedback` & `content_reports`: outcomes, ratings, reporter details
- `model_versions`: dataset metrics, deployed_at

## 7. API Requirements
- `/auth/*`: Supabase Auth endpoints.
- `/institutions`: GET/POST for discovery and management.
- `/access-points/{id}`: GET location/service context.
- `/service-packs/{id}`: GET phrase pack and offline manifest.
- `/courses` & `/lessons/{id}`: GET learning content.
- `/practice/session`: POST practice results.
- `/ai/predict`: POST landmark sequence for model inference.
- `/assistance` & `/assistance/{id}`: POST request help, GET status.
- `/feedback`: POST interaction ratings.
- `/readiness/{institutionId}`: GET metrics for dashboard.
- `/community/report`: POST content/model issues.
- `/analytics/events`: POST privacy-safe telemetry.

## 8. AI/ML Requirements
- **CV / Preprocessing**: MediaPipe for lightweight pose/hand landmark extraction. Must handle missing landmarks and temporal resampling. Normalise coordinates relative to torso/shoulder.
- **Model**: Temporal model (GRU / TCN / small Transformer) processing sequences of 21-30 frames of landmarks.
- **Scope**: Predict 30-50 high-value intents/signs (MVP).
- **Inference**: Export to ONNX Runtime. Run in-browser where feasible, otherwise via FastAPI backend.
- **Evaluation**: Must use signer-independent splits to ensure generalisation.
- **Safety**: Strict confidence thresholds. Low confidence must trigger a safe fallback (phrase cards/human), never a silent hallucinated translation.

## 9. Offline/PWA Requirements
- **PWA Installation**: Installable on Android devices.
- **Caching**: Service Worker / IndexedDB to cache service packs, phrase assets, and basic learning content.
- **Progressive Download**: Download only the specific district/service pack needed to save bandwidth.
- **Media**: Low-resolution video variants for poor connectivity.
- **Sync**: Queue feedback/practice scores locally while offline, sync when online.
- **Fallback**: Static phrase board functions completely offline, even without AI support.

## 10. Accessibility Requirements
- **WCAG Alignment**: Keyboard navigation, visible focus, semantic labels, screen-reader support.
- **Visuals**: Large touch targets, high contrast mode, reduced-motion mode (disabling unnecessary animations).
- **Media**: Captions on every learning video.
- **Status Indicators**: Never rely on color alone (use text + icon).
- **Device Support**: Portrait mobile-first layout optimized for low-end Android devices.
- **Language**: Simple language, local-language UI support (English, Telugu, Tamil, Malayalam, Hindi).

## 11. Security/Privacy Requirements
- **Camera Data**: Default to no raw camera storage. Process landmarks locally to preserve privacy.
- **Consent**: Explicit consent required before any data is used for model improvement.
- **Anonymization**: Separate identity data from analytics; do not expose Deaf user identities on public dashboards.
- **Access Control**: Role-based access for institution admins and interpreters.
- **AI Safety**: Do not present model predictions as official interpretations. No LLM generation for medical/legal/emergency content.

## 12. External Integrations
- **Supabase**: Authentication, Database, Object Storage, Realtime channels.
- **OpenStreetMap / Leaflet**: For district heatmaps and service point mapping.
- **Web Speech API**: Browser-native text-to-speech / speech-to-text for hearing user fallback (MVP).
- **Firebase Cloud Messaging**: Optional, for push notifications if browser notifications are insufficient.

## 13. Dependencies
- Next.js (React), Tailwind CSS, shadcn/ui
- Supabase JS Client
- FastAPI, PyTorch, ONNX Runtime (Python ecosystem for ML)
- MediaPipe (JS or Python depending on inference location)
- Leaflet.js
- Sentry (Error tracking)
- Vercel (Frontend hosting)

## 14. Risks and Difficult Areas
- **Signer-Independent Generalization**: The MVP AI model might overfit to the training signers and perform poorly for real-world diverse users (varying lighting, backgrounds, camera angles).
- **Performance on Low-End Devices**: Running MediaPipe landmark extraction and temporal inference at 30fps could cause lag or battery drain on budget Android phones.
- **Offline Video Storage**: Caching multiple video assets (service phrases) via IndexedDB/Service Worker could hit storage limits or fail silently on some mobile browsers.
- **Expectation Management**: Positioning AI as a constrained "Assist" tool so users don't expect arbitrary sentence translation, requiring very clear UI guardrails around AI confidence.

## 15. Ambiguous Requirements that Need Decisions
- **Inference Location (Browser vs. Server)**: The PRD lists both `/ai/predict` API and "browser inference where feasible". **Decision needed**: Will the hackathon MVP run ONNX inference via WASM entirely in the browser (eliminating server latency/costs), or rely on the FastAPI endpoint?
- **Local Language Support**: The PRD specifies English, Telugu, Tamil, Malayalam, and Hindi. **Decision needed**: For a 48-hour hackathon, should the team restrict the MVP to English + 1 local language to reduce UI and translation overhead?
- **Dataset Sourcing**: The PRD references iSign, ISLTranslate, etc. **Decision needed**: The exact licensed dataset to be used for the 30-50 sign MVP must be finalized immediately to begin training.
- **Simulated Interpreter Backend**: **Decision needed**: Will the human escalation mock just be a static state change (e.g. "Request sent -> Accepted"), or a functional real-time WebSocket chat interface between two browser windows?
