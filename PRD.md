**FUTURE 6.0 - HACKATHON PRODUCT REQUIREMENTS DOCUMENT**

**SIGNBRIDGE INDIA**

_A Deaf-First Accessibility Network for Indian Sign Language_

Learn ISL → Make Services ISL-Ready → Communicate → Measure Inclusion

| **Document**                  | **Version** | **Status**                      | **Target** |
| ----------------------------- | ----------- | ------------------------------- | ---------- |
| Product Requirements Document | 1.0         | Hackathon MVP + Scale Blueprint | Future 6.0 |

Prepared as a practical, implementation-focused product blueprint. The central design principle is that AI should remove barriers, not replace Deaf people, certified interpreters, or the Indian Sign Language community.

# 1\. Executive Summary

SIGNBRIDGE INDIA is proposed as a digital accessibility layer that connects Deaf and hard-of-hearing citizens with the people and services around them. Instead of building another standalone sign-language dictionary or promising perfect real-time translation, the platform makes real-world services ISL-ready.

The product combines five capabilities: (1) a practical ISL learning system for hearing people, (2) service-specific ISL communication packs, (3) constrained AI-assisted sign recognition for selected high-value phrases, (4) a human escalation path when AI is uncertain, and (5) an institutional accessibility dashboard that measures whether a hospital, college, bank, government office, transport hub, or workplace is actually ready to serve Deaf citizens.

The strongest hackathon differentiator is the 'ISL Access Point': every participating institution can place a QR/NFC marker at a service counter. A Deaf user scans it and immediately gets the exact communication tools for that location-service phrase cards, form guidance, a text/visual conversation mode, and an option to request human assistance. This converts ISL from a learning topic into a service infrastructure.

# 2\. Problem Definition

Indian Sign Language is officially recognised and has an established national resource ecosystem, but recognition does not automatically create day-to-day accessibility. The product therefore targets the gap between 'ISL exists' and 'this service is usable in ISL'.

| **Problem**                                                         | **Real-world consequence**                                | **Product response**                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| Hearing staff do not know ISL                                       | Basic service interactions become slow or impossible      | Role-based 5-10 minute micro-learning + competency badges                |
| Generic translation is unreliable for high-stakes contexts          | Wrong interpretation can create serious misunderstandings | Context-specific phrase packs + confidence thresholds + human escalation |
| Existing resources are scattered                                    | Users must search before every interaction                | QR/NFC ISL Access Points at physical service locations                   |
| Rural/Tier 2/3 connectivity is inconsistent                         | Cloud-only tools fail when most needed                    | Offline-first PWA + downloadable district/service packs                  |
| Institutions cannot measure accessibility                           | No operational accountability                             | ISL Readiness Score + anonymous usage analytics                          |
| Deaf users are often treated as recipients rather than participants | Products miss real linguistic and cultural needs          | Deaf-first validation, feedback and community governance                 |

# 3\. Existing Solution Landscape - What We Should NOT Copy

A current landscape review shows that the ecosystem already contains several useful categories. The innovation opportunity is therefore not 'invent sign language technology', but connect learning, service access, human support and institutional adoption into one system.

| **Existing category / example**    | **What it already does**                                       | **Gap we exploit**                                                                                        |
| ---------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ISLRTC / Government ISL Dictionary | Large official video-based dictionary and learning resources   | Excellent reference resource, but not a complete service-access workflow                                  |
| ISLRTC Sign Learn ecosystem        | Structured access to ISL learning content                      | Does not by itself make every physical service counter ISL-ready                                          |
| SignAble                           | On-demand ISL interpretation using VRI/VRS                     | Human interpretation is valuable but can be unavailable, costly or unnecessary for routine interactions   |
| DeafTawk                           | Connects Deaf users with interpreters through digital services | Strong human-interpreter model; opportunity remains for self-service, offline and institutional readiness |
| ISL Connect                        | Text/voice/video/scans to ISL using 3D animation               | Translation is one component; our focus is the complete service journey and adoption layer                |
| Signer.AI / student projects       | ISL learning, dictionaries, avatars and/or translation         | Learning/translation alone does not create a network of ISL-ready institutions                            |
| Academic ISL recognition systems   | Pose/video recognition and translation research                | Research models need constrained deployment, privacy controls and real-world service workflows            |

Important positioning: we should acknowledge these solutions in the pitch. Saying 'nothing exists' would be factually weak. Our claim should be: 'The missing layer is the last mile between an ISL resource and an ISL-ready service.'

## Research references informing the design

- ISLRTC provides an official ISL Dictionary, dictionary dataset/resources and national training ecosystem.
- ISLRTC's FAQ states that the dictionary is available through its online resources and that an app development process has existed around the dictionary ecosystem.
- DEPwD lists SignAble among solutions for hearing impairment and describes its VRI/VRS interpretation model.
- DeafTawk provides subscriber, interpreter and web/reporting components for on-demand interpretation.
- ISL Connect describes text-to-ISL, voice-to-ISL, video and scan-oriented capabilities using 3D ISL animation.
- Recent research has produced large ISL resources, including iSign (>118K video-sentence/phrase pairs), ISLTranslate (~31K continuous ISL-English pairs), and a 40,033-video isolated ISL dataset covering 2,002 common words.
- These resources make a research-grade model possible, but a hackathon MVP should still constrain its recognition scope and avoid claiming unrestricted sentence translation.

# 4\. Core Innovation

## The product idea: 'ISL Access Points + Accessibility Passport'

Every participating physical institution receives a digital accessibility identity. At the entrance, reception, help desk, classroom, hospital counter, bank desk, railway/help counter, or government office, a user sees an 'ISL Access Point' QR/NFC marker.

Scanning the marker opens a location-specific experience. The user does not need to explain what service they need or search a huge dictionary. The platform already knows the institution category and service context.

| **Layer**         | **Example**                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| Location context  | District hospital → Registration Desk                                  |
| Service pack      | Appointment, registration, waiting time, documents, payment, emergency |
| ISL learning      | Staff learns the 20 phrases used most often at that counter            |
| Communication     | User selects visual phrase / types / speaks / signs                    |
| AI assistance     | Recognises a limited set of supported signs and returns text/intent    |
| Human escalation  | Low-confidence or complex case → request interpreter/volunteer         |
| Feedback          | User rates whether communication was successful                        |
| Institution score | Readiness score changes based on training, availability and feedback   |

## Why this is genuinely different

- It treats accessibility as infrastructure, not merely an app feature.
- It helps both sides: Deaf users get immediate service access; hearing staff get practical ISL training.
- It avoids unsafe 'AI replaces interpreter' positioning.
- It creates a measurable adoption loop: train → deploy → use → receive feedback → improve.
- It works even when the user has never used the platform before because the QR/NFC marker acts as the entry point.
- It is designed for rural India from the beginning: cached content, low bandwidth, local-language UI, service packs and fallback communication.

# 5\. Target Users

| **Persona**                               | **Needs**                                            | **Key features**                                                                        |
| ----------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Deaf / hard-of-hearing citizen            | Fast, dignified access to services                   | ISL-first UI, visual service cards, QR access point, text/visual chat, human escalation |
| Family member / caregiver                 | Help without becoming a full-time interpreter        | Learn basic ISL, emergency phrases, service guides                                      |
| Hearing citizen                           | Learn enough ISL for meaningful everyday interaction | Micro-courses, practice, gamification, certificates                                     |
| Frontline staff                           | Communicate at the service counter                   | Role-based phrase packs, practice mode, quick reference                                 |
| Institution administrator                 | Prove and improve accessibility                      | Readiness dashboard, staff training, service usage, feedback                            |
| Certified interpreter / trained volunteer | Handle complex cases efficiently                     | Escalation queue, availability, secure video/audio support                              |
| District / policy stakeholder             | Understand accessibility gaps                        | Aggregated readiness heatmap and service-gap analytics                                  |

# 6\. Product Modules

## Module A - ISL Learning Hub

- Beginner, Everyday Communication, Workplace, Healthcare, Education, Civic Services and Emergency tracks.
- 5-10 minute lessons instead of long lectures.
- Video-first learning with captions and text explanations.
- Camera practice for selected signs.
- Immediate feedback: hand position, movement consistency and confidence.
- Spaced repetition and daily practice.
- Certificates based on demonstrated competency rather than simply watching videos.
- Local-language support for UI and explanations: English, Telugu, Tamil, Malayalam, Hindi initially; architecture should support more languages.
- Accessibility: captions, large controls, high contrast, keyboard navigation, reduced-motion mode.

## Module B - ISL Access Point

- QR/NFC code identifies the institution and service counter.
- Instant service-specific phrase board.
- Common questions and answers in ISL video/animation.
- User can show a phrase to staff without needing to speak.
- Staff can select a response and show it visually.
- Optional text-to-speech for hearing users.
- Optional speech-to-text for hearing users.
- Offline cache of the service pack.
- One-tap 'Need human assistance' escalation.

## Module C - AI Sign Assist

AI is deliberately constrained. The MVP recognises a curated vocabulary of high-value signs/phrases rather than pretending to translate arbitrary ISL conversations.

- Camera capture → pose/hand landmarks → temporal model → intent/sign prediction.
- Use MediaPipe or equivalent landmark extraction to reduce raw-video compute and improve privacy.
- Temporal model: lightweight GRU/TCN/Transformer over landmark sequences.
- Export model to ONNX for browser inference where feasible.
- Confidence threshold; if confidence is low, display 'I am not confident' and offer phrase selection or human help.
- Store no raw camera frames by default.
- Explicit consent before any data is used for model improvement.

## Module D - Contextual Phrase Composer

Instead of translating arbitrary sentences, users choose an intent and the platform builds a validated service phrase. This is safer and more feasible.

| **Intent**        | **Example output**                                                     |
| ----------------- | ---------------------------------------------------------------------- |
| Hospital          | I need an appointment → I have an ID → Which department? → Please wait |
| College           | I need admission information → Where is the office? → I need this form |
| Bank              | I need to update details → What documents are required?                |
| Government office | I need this certificate → Where do I submit it?                        |
| Transport         | Where is platform 2? → I need assistance                               |

## Module E - Human Escalation

- If AI confidence is low or the interaction is complex, do not guess.
- Offer a verified interpreter/volunteer request.
- Queue contains request type, language, institution and urgency-not unnecessary personal data.
- For the hackathon demo, simulate an interpreter with a controlled operator dashboard if a real interpreter network is unavailable.
- Production version can integrate certified interpreter services through a partner API or secure video workflow.

## Module F - ISL Readiness Dashboard

- Institution profile and service counters.
- Number of trained staff.
- Training completion by role.
- Supported service packs.
- Average user feedback score.
- Successful self-service interactions.
- Human escalation count.
- AI confidence/error reports.
- Readiness badge: Starter / Ready / Advanced.
- Anonymous accessibility trend; never expose individual Deaf users.

## Module G - Community Validation

- Deaf users can flag a phrase as incorrect or unclear.
- Community reviewers can propose corrections.
- Content changes require moderation before becoming official.
- Version every phrase pack.
- Maintain provenance: source, reviewer, date and confidence.
- Do not crowdsource medical/legal wording without domain review.

# 7\. Feature Prioritisation for the Hackathon

| **Priority** | **Feature**                     | **Why**                                                    |
| ------------ | ------------------------------- | ---------------------------------------------------------- |
| P0           | ISL Access Point QR flow        | Signature innovation; easy to demonstrate                  |
| P0           | Service-specific phrase packs   | Makes the idea practical instead of generic                |
| P0           | ISL learning micro-course       | Directly answers the 'mainstream ISL learning' requirement |
| P0           | 30-50 sign/intent AI demo       | Shows technical depth without overclaiming                 |
| P0           | Confidence + fallback           | Demonstrates responsible AI                                |
| P0           | Institution readiness dashboard | Adds adoption and policy angle                             |
| P0           | Offline/PWA support             | Strong Tier 2/3/rural differentiator                       |
| P1           | Human escalation mock           | Shows full communication journey                           |
| P1           | Community feedback              | Creates improvement loop                                   |
| P1           | Certificates/badges             | Incentivises learning                                      |
| P2           | NFC support                     | Useful physical deployment enhancement                     |
| P2           | District heatmap                | Scale/policy demonstration                                 |
| P2           | Advanced continuous translation | Research/long-term roadmap, not MVP dependency             |

# 8\. Website / App Information Architecture

| **Route**  | **Purpose**           | **Main UI elements**                                                     |
| ---------- | --------------------- | ------------------------------------------------------------------------ |
| /          | Landing page          | Hero, problem, live demo CTA, how it works, impact counters, partner CTA |
| /access    | Access Point          | Scan/enter code, institution, service selector, phrase board, assistance |
| /learn     | Learning hub          | Tracks, progress, streak, lessons, practice                              |
| /practice  | Camera practice       | Camera frame, sign target, confidence, feedback                          |
| /translate | AI assist             | Camera, recognized intent, confidence, correction/fallback               |
| /services  | Service packs         | Healthcare, education, banking, civic, transport, workplace              |
| /dashboard | Institution dashboard | Readiness score, training, usage, feedback                               |
| /escalate  | Human support         | Request form, queue, status                                              |
| /community | Validation            | Report/correct phrase, moderation status                                 |
| /admin     | Admin                 | Institutions, content, users, model feedback                             |

# 9\. Website Visual Design System

## Design direction

The interface should feel calm, trustworthy and human-not like a flashy AI product. The visual language should communicate dignity, accessibility and clarity.

| **Element**     | **Recommendation**                                                                 |
| --------------- | ---------------------------------------------------------------------------------- |
| Primary visual  | Deep blue/indigo + white/soft neutral surfaces                                     |
| Accent          | Accessible teal or cyan for positive actions                                       |
| Typography      | Inter / Geist / system sans; large readable type                                   |
| Corner radius   | 12-18px; friendly but not childish                                                 |
| Buttons         | Large touch targets; clear verbs: 'Start learning', 'Open service', 'Request help' |
| Icons           | Lucide or accessible SVG icons with labels                                         |
| Cards           | Minimal elevation, strong hierarchy                                                |
| Motion          | Subtle transitions; provide reduced-motion mode                                    |
| Camera UI       | Large framing guide, plain background, confidence state                            |
| Status          | Never rely on color alone; use text + icon                                         |
| Language switch | Always visible, not buried in settings                                             |

## Landing page layout

1. Header: logo, Learn ISL, Access Services, For Institutions, About, language selector, accessibility controls.
2. Hero: 'Make every service ISL-ready.' Subtext explains that the platform connects Deaf citizens, trained staff and service providers.
3. Primary CTA: 'Try an ISL Access Point'. Secondary CTA: 'Learn ISL in 5 minutes'.
4. Interactive demo: user chooses Hospital / College / Government Office and sees a simulated access point.
5. Problem section: communication barrier → service friction → solution.
6. Three pillars: Learn, Access, Measure.
7. Impact section: staff trained, service points enabled, successful interactions, districts reached.
8. Trust section: community validation, responsible AI, privacy.
9. Final CTA: 'Make your institution ISL-ready'.

# 10\. Key User Flows

## Flow 1 - Deaf user at a hospital

1. User sees ISL Access Point QR at reception.
2. Scans QR; service is automatically set to Hospital → Registration.
3. User selects 'New appointment'.
4. The screen shows the validated ISL visual phrase and a text option.
5. Staff selects 'Please wait' or 'Show ID'.
6. If the user needs a complex explanation, they tap 'Need human assistance'.
7. A verified interpreter/volunteer request is created.
8. After completion, user gives a simple success/failure rating.

## Flow 2 - Hearing staff learns

1. Staff scans institution invitation.
2. Selects role: reception / nurse / teacher / bank desk / security.
3. Receives a 5-minute role-specific lesson.
4. Practices 10 critical phrases.
5. Completes camera-based practice.
6. Receives a competency badge.
7. Dashboard counts the staff member toward institution readiness.

## Flow 3 - AI recognition

1. User selects a supported practice sign.
2. Camera opens with framing guidance.
3. MediaPipe extracts landmarks locally.
4. Temporal model predicts the sign/intent.
5. If confidence ≥ threshold, show prediction and related service action.
6. If confidence is below threshold, show 'Not sure' and offer three likely phrases or manual selection.
7. Never silently convert low-confidence recognition into a high-stakes instruction.

# 11\. Technical Architecture

Recommended architecture prioritises speed of development, low operating cost, privacy and easy deployment.

| **Layer**       | **Technology**                                       | **Reason**                                                                     |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| Frontend        | Next.js + TypeScript                                 | Fast development, responsive web/PWA, SEO and clean component architecture     |
| UI              | Tailwind CSS + shadcn/ui                             | Accessible components and fast hackathon UI development                        |
| PWA             | Service Worker + IndexedDB                           | Offline-first service packs and rural connectivity                             |
| Auth            | Supabase Auth                                        | Simple email/OTP/social auth with low operational overhead                     |
| Database        | PostgreSQL / Supabase                                | Relational model for users, institutions, courses, service packs and analytics |
| Storage         | Supabase Storage                                     | Videos, content and institution assets                                         |
| Backend API     | FastAPI + Python                                     | Excellent fit for ML inference and rapid API development                       |
| Realtime        | WebSocket / Supabase Realtime                        | Escalation status and dashboard updates                                        |
| CV              | MediaPipe landmarks                                  | Lightweight pose/hand extraction                                               |
| ML              | PyTorch                                              | Training and experimentation                                                   |
| Inference       | ONNX Runtime / browser inference where feasible      | Lower latency and reduced server cost                                          |
| Temporal model  | GRU / TCN / small Transformer                        | Good fit for sequences of landmarks                                            |
| Maps            | OpenStreetMap + Leaflet                              | Open, low-cost geographic visualisation                                        |
| Notifications   | Firebase Cloud Messaging or browser notifications    | Practical alerts for assistance/training                                       |
| Deployment      | Vercel for frontend + managed Python service for API | Fast deployment and easy demo operations                                       |
| Monitoring      | Sentry + structured application logs                 | Catch demo-breaking errors quickly                                             |
| Version control | GitHub                                               | Team collaboration and CI/CD                                                   |

## Architecture flow

Browser/PWA → Next.js UI → Access Point / Learning / Dashboard → FastAPI → ML inference service → PostgreSQL/Supabase. Camera frames should preferably be converted to landmarks locally before any server call. The service pack itself should be cacheable and usable offline.

For the hackathon, avoid Kubernetes, microservice sprawl, custom authentication servers, or a large cloud architecture. One frontend, one Python API, one database and one model service are enough.

# 12\. Data and AI Strategy

## Training data

Use legally and ethically available research/official resources. ISLRTC's official resources should be treated as a reference and source of authoritative vocabulary/content; licensing and redistribution rights must be checked before bundling videos or datasets into the product.

Potential research resources include iSign, ISLTranslate, INCLUDE/OpenHands-related resources and the large isolated ISL dataset described in recent research. For the hackathon, use a narrow, validated subset and clearly disclose the subset size.

## Recommended MVP model

- Input: 21-30 frames of hand + upper-body landmarks.
- Preprocessing: normalise coordinates relative to torso/shoulder reference; handle missing landmarks; temporal resampling.
- Model: small GRU/TCN with dropout; optional attention layer.
- Output: 30-50 supported intents/signs.
- Training split: signer-independent split, not random frames from the same signer across train/test.
- Metrics: signer-independent accuracy, macro F1, per-class recall, confusion matrix, latency and low-confidence rejection rate.
- Deployment: quantise/export to ONNX where practical.
- Fallback: phrase cards and human support.

## Why signer-independent evaluation matters

Sign recognition can appear highly accurate if the same signer appears in both training and testing. A serious prototype should hold out entire signers to estimate generalisation. This is especially important for a product intended for rural and nationwide deployment.

# 13\. API Requirements

| **API**                    | **Method**    | **Purpose**                              |
| -------------------------- | ------------- | ---------------------------------------- |
| /auth/\*                   | Supabase Auth | Login, OTP and role access               |
| /institutions              | GET/POST      | Institution discovery and management     |
| /access-points/{id}        | GET           | Load location/service context            |
| /service-packs/{id}        | GET           | Fetch phrase pack and offline manifest   |
| /courses                   | GET           | Learning tracks                          |
| /lessons/{id}              | GET           | Lesson content                           |
| /practice/session          | POST          | Record practice result                   |
| /ai/predict                | POST          | Submit landmark sequence for recognition |
| /assistance                | POST          | Request human assistance                 |
| /assistance/{id}           | GET           | Check request status                     |
| /feedback                  | POST          | Submit service/phrase feedback           |
| /readiness/{institutionId} | GET           | Institution readiness metrics            |
| /community/report          | POST          | Report a content/model issue             |
| /analytics/events          | POST          | Privacy-safe product analytics           |

## External APIs / integrations

- Supabase: authentication, database, storage and realtime.
- Firebase Cloud Messaging: notifications if push alerts are required.
- OpenStreetMap/Leaflet: service-point mapping.
- Optional speech-to-text API for hearing users; browser Web Speech API can be used for MVP where supported.
- Optional text-to-speech API/browser speech synthesis for hearing users.
- Optional secure video service for interpreter escalation; for the hackathon, a simulated operator dashboard is acceptable.
- No external AI API should receive raw camera video unless explicitly required and consented to. Landmark-first inference is preferred.

# 14\. Database Schema

| **Table**           | **Important fields**                                                  |
| ------------------- | --------------------------------------------------------------------- |
| users               | id, role, preferred_language, accessibility_preferences, created_at   |
| institutions        | id, name, type, district, state, address, readiness_level             |
| access_points       | id, institution_id, service_type, qr_token, nfc_id, active            |
| staff_profiles      | user_id, institution_id, role, training_level, badge                  |
| courses             | id, category, language, level                                         |
| lessons             | id, course_id, title, video_url, duration, version                    |
| service_packs       | id, service_type, locale, version, content_hash                       |
| phrases             | id, service_pack_id, intent, text, isl_asset, source, reviewed_by     |
| practice_sessions   | id, user_id, phrase_id, score, confidence, created_at                 |
| ai_predictions      | id, session_id, predicted_intent, confidence, accepted, model_version |
| assistance_requests | id, access_point_id, urgency, status, created_at                      |
| feedback            | id, access_point_id, phrase_id, outcome, rating, comment              |
| content_reports     | id, phrase_id, reporter_type, reason, status                          |
| model_versions      | id, version, dataset_version, metrics, deployed_at                    |

# 15\. Security, Privacy and Responsible AI

- Default to no raw camera storage.
- Process landmarks locally when feasible.
- Use explicit consent for any data collection.
- Separate identity data from analytics.
- Do not expose Deaf users' identities on public dashboards.
- Use role-based access control for institution admins and interpreters.
- Encrypt traffic with HTTPS and protect database access through server-side rules.
- Keep audit logs for admin changes and content approvals.
- Medical, legal and emergency content must carry clear limitations and should not be generated freely by an LLM.
- AI must have a visible confidence state and a human fallback.
- Do not present a model prediction as an official interpretation.
- Community and Deaf-user validation should be part of production governance.

# 16\. Accessibility Requirements

- WCAG-oriented design: keyboard support, visible focus, semantic labels, screen-reader compatibility.
- Large touch targets and high-contrast mode.
- Captions on every learning video.
- Do not use audio as the only information channel.
- Do not use colour as the only status indicator.
- Support portrait mobile use and low-end Android devices.
- Provide low-data mode that disables unnecessary animations and video preloading.
- Allow users to download a service pack before entering low-connectivity areas.
- Use simple language and local-language UI.
- Avoid excessive reading requirements for the core access flow.

# 17\. Offline-First / Rural Strategy

The rural requirement should not be a slide claim; it should be visible in the product architecture.

- PWA installable on Android.
- Cache service packs, phrase assets and basic learning content using IndexedDB/service worker.
- Low-resolution media variants.
- Progressive download: only download the selected district/service pack.
- AI recognition can use a lightweight browser model for supported signs.
- When online, sync learning progress and feedback.
- When offline, queue feedback locally and upload later.
- Fallback to a static phrase board even if AI is unavailable.
- Provide a simple short-code/QR access mechanism that works without account creation for basic service access.

# 18\. Gamification and Incentives

The goal is not to turn Deaf accessibility into a game. Gamification should reward the hearing community for learning enough ISL to become useful.

- 5-minute daily learning streak.
- Role-based badges: ISL Ready Receptionist, ISL Ready Teacher, ISL Ready Volunteer.
- Institution leaderboard based on verified training coverage, not raw user count.
- District-level accessibility challenges.
- Certificates after competency checks.
- Community recognition for validated contributions.
- Institution 'ISL Ready' badge only when minimum criteria are met.

## Suggested ISL Readiness Score

Score = 35% trained frontline staff + 25% service coverage + 20% successful user feedback + 10% response to assistance requests + 10% content freshness. Keep the formula transparent and label it as a product metric, not an official government certification.

# 19\. Admin / Institution Dashboard

| **Dashboard area** | **Example**                        |
| ------------------ | ---------------------------------- |
| Readiness          | 72 / 100 - Ready                   |
| Frontline staff    | 28 / 40 trained                    |
| Critical phrases   | 42 / 50 mastered                   |
| Service coverage   | Registration, pharmacy, billing    |
| Recent demand      | 18 access sessions this week       |
| Outcome            | 91% interactions marked successful |
| Issues             | 3 phrases reported this month      |
| Assistance         | 2 requests; median response 3 min  |
| Next action        | Train remaining billing staff      |

# 20\. Demo Scenario for Judges

The demo should tell one human story rather than showing ten disconnected features.

1. Open the landing page and state the problem: a Deaf citizen should not need to find an interpreter for every routine service.
2. Switch to the 'Citizen' experience.
3. Scan the simulated Hospital Reception QR.
4. Show the location-aware service pack.
5. Use the ISL phrase board for appointment/ID/waiting.
6. Switch to AI practice and perform one supported sign.
7. Show a correct prediction with confidence.
8. Perform an unsupported/uncertain sign and show the safe fallback instead of a fabricated translation.
9. Switch to the staff dashboard.
10. Show a staff member completing a 5-minute micro-course.
11. Show the institution readiness score increasing.
12. Trigger 'Need human assistance' and switch to the operator/interpreter dashboard.
13. Finish with the district heatmap / readiness concept: the same access point can be deployed across hospitals, colleges, banks and civic offices.

# 21\. Hackathon MVP Scope

## What we should actually build

- Responsive PWA with 8-10 polished screens.
- One complete Access Point journey for a hospital.
- One complete Access Point journey for a college or government office.
- 30-50 supported signs/intents for AI practice.
- 10-20 validated service phrases for each of two service categories.
- One learning track with 5 short lessons.
- Camera practice with live landmarks and model output.
- Institution dashboard with readiness score.
- Offline cache demonstration.
- Human escalation operator screen.
- Seeded demo data.

## What we should fake/simulate if time is limited

- Real interpreter network: simulate with an operator dashboard.
- Nationwide institution database: seed 10-20 example institutions.
- Advanced continuous translation: show as roadmap, not as a fake working feature.
- Government integration: demonstrate API-ready architecture, not an invented live government API.
- Certification verification: use internal demo credentials.

# 22\. 24-48 Hour Build Plan

| **Time** | **Team work**                            | **Deliverable**       |
| -------- | ---------------------------------------- | --------------------- |
| 0-3 h    | Architecture, database, UI skeleton      | Repo + deployed shell |
| 3-8 h    | Landing, access point, service pack UI   | Core user flow        |
| 6-12 h   | Supabase schema/auth + seeded data       | Working backend       |
| 8-16 h   | AI landmark pipeline + MVP model         | Live practice demo    |
| 12-20 h  | Learning module + dashboard              | Full product story    |
| 18-26 h  | Offline PWA + fallback + escalation      | Rural-ready demo      |
| 24-32 h  | Polish, accessibility, responsive design | Judge-ready UI        |
| 32-38 h  | Testing + performance + model metrics    | Stable build          |
| 38-44 h  | Pitch + demo script + impact metrics     | Presentation          |
| 44-48 h  | Bug fixing + final rehearsal             | Submission build      |

# 23\. Suggested Team Division

| **Role**              | **Responsibility**                                    |
| --------------------- | ----------------------------------------------------- |
| Frontend lead         | Next.js, PWA, UI system, Access Point flow            |
| ML/CV lead            | Landmarks, model, evaluation, ONNX/browser inference  |
| Backend lead          | FastAPI, Supabase schema, APIs, auth                  |
| Product/UX lead       | User flows, accessibility, service packs, research    |
| Dashboard/integration | Institution dashboard, escalation workflow, analytics |
| Pitch/demo lead       | Story, impact, testing, deployment, presentation      |

# 24\. Testing Strategy

- Test on low-end Android devices.
- Test poor-network mode and offline mode.
- Test camera with different lighting/backgrounds.
- Test left/right hand variation where linguistically valid; do not assume mirroring is always linguistically safe.
- Test signer-independent model performance.
- Test false-positive and false-negative behaviour.
- Test accessibility using keyboard navigation and automated checks.
- Run a small usability test with at least one Deaf/HoH participant or domain expert before claiming community validation.
- For the hackathon, clearly label any user testing as pilot/demo testing.

# 25\. Success Metrics

| **Metric**                  | **MVP target**                  | **Long-term direction**                   |
| --------------------------- | ------------------------------- | ----------------------------------------- |
| AI supported-sign accuracy  | Report actual measured result   | Improve signer-independent generalisation |
| Low-confidence rejection    | Visible and safe                | Reduce false confident predictions        |
| Learning completion         | \>70% of started users          | Sustained learning                        |
| Service interaction success | \>85% pilot feedback            | Reliable accessibility                    |
| Offline access              | Core service pack works offline | District-scale offline library            |
| Staff competency            | 10+ demo staff profiles         | Institution-wide coverage                 |
| Time to access service      | <60 seconds from QR scan        | Near-instant service access               |
| User satisfaction           | Simple 1-5 rating               | Track longitudinally                      |

# 26\. Business / Sustainability - Without Losing the Mission

The product should remain free for Deaf citizens for core access. Sustainability can come from institutions, CSR programmes, accessibility grants, training partnerships and enterprise dashboards rather than charging users for basic communication.

- Free: Access Point, core service packs, basic communication and emergency information.
- Institution plan: staff training management, readiness analytics and service customisation.
- CSR/government deployment: district-wide rollouts and hardware/signage.
- Training partners: certified courses and instructor programmes.
- Never paywall urgent accessibility or basic communication.

# 27\. Future Roadmap

| **Phase** | **Expansion**                                                                     |
| --------- | --------------------------------------------------------------------------------- |
| Phase 1   | Hospital + college Access Points, 30-50 AI intents, learning and dashboard        |
| Phase 2   | Banks, government offices, transport and workplaces                               |
| Phase 3   | More Indian languages, district-scale content packs, verified interpreter network |
| Phase 4   | Continuous ISL translation research with larger signer-diverse datasets           |
| Phase 5   | Policy APIs, institutional accessibility reporting and national partner network   |

# 28\. What We Must NOT Do

- Do not call the system a universal ISL translator if it only recognises a small vocabulary.
- Do not claim official government certification.
- Do not store camera video by default.
- Do not make medical/legal decisions using an LLM.
- Do not replace certified interpreters with AI in high-stakes communication.
- Do not build a beautiful dashboard while the Deaf user's core access journey remains difficult.
- Do not invent accuracy numbers. Show measured results.
- Do not treat Deaf users as a target market only; involve them in validation and governance.

# 29\. One-Sentence Pitch

SIGNBRIDGE INDIA turns Indian Sign Language from a resource people have to search for into an accessibility layer built into everyday services-so a Deaf citizen can scan an ISL Access Point, communicate through a validated service flow, learn ISL with the people around them, and get human help whenever technology is not enough.

# 30\. Judge-Facing USP

Most solutions answer: 'How do we translate signs?' SIGNBRIDGE INDIA answers a larger question: 'How do we make an entire service accessible when the person arrives?'

That distinction is the heart of the project. The AI is impressive, but the system is what makes the solution meaningful.

# 31\. Recommended Demo Content Pack

| **Service**       | **10 high-value intents/phrases to prepare**                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Hospital          | appointment, registration, ID, doctor, department, waiting, payment, medicine, emergency, family |
| College           | admission, classroom, office, form, fee, exam, hostel, certificate, teacher, help                |
| Government office | application, document, certificate, token, counter, signature, payment, status, submit, help     |
| Bank              | account, update, ID, document, cash, transfer, signature, PIN, manager, help                     |

# 32\. Source / Research Notes

The following sources were consulted for the current-state landscape and technical feasibility. These should be revisited before final submission because products, policies and datasets can change.

- ISLRTC - Indian Sign Language Dictionary and official resources: <https://islrtc.nic.in/isl-dictionary/>
- ISLRTC - official homepage and programme/resource links: <https://islrtc.nic.in/>
- ISLRTC - FAQ and dictionary access information: <https://islrtc.nic.in/faq/>
- DEPwD - Hearing Impairment resources and listed solutions including SignAble: <https://depwd.gov.in/en/hearing-impairment/>
- DEPwD/ISLRTC dictionary interface: <https://divyangjan.depwd.gov.in/islrtc/>
- DeafTawk - current app/service description: <https://play.google.com/store/apps/details?hl=en_IN&id=com.deaftawk.subscriberapp>
- ISL Connect - current product description: <https://apps.apple.com/in/app/isl-connect/id6761534142>
- iSign benchmark for ISL processing: <https://arxiv.org/abs/2407.05404>
- ISLTranslate dataset: <https://arxiv.org/abs/2307.05440>
- Large-scale isolated ISL recognition dataset/HWGAT: <https://arxiv.org/abs/2407.14224>
- OpenHands sign-language recognition research: <https://arxiv.org/abs/2110.05877>
- Real-time ISL recognition research: <https://arxiv.org/abs/2108.10970>

# 33\. Final Product Checklist

- Clear Deaf-first value proposition
- ISL Access Point QR journey works end-to-end
- At least one service pack works offline
- Learning flow works end-to-end
- AI demo has measurable accuracy and visible confidence
- Low-confidence AI result safely falls back
- Institution dashboard demonstrates adoption
- Human assistance flow is demonstrable
- UI is mobile-first and accessible
- No unsupported claims about universal translation
- Community/Deaf-user validation plan is documented
- Privacy and data handling are explicit
- Deployment URL is stable
- Demo data is seeded
- Pitch tells one coherent human story

# 34\. Final Recommendation

If the team has limited time, build fewer features but make the central loop excellent: QR → service context → ISL phrase communication → AI assist → human fallback → feedback → institution readiness. A polished, trustworthy vertical slice will score better than ten half-working AI features.

The winning narrative is not 'we built an AI translator.' It is 'we built the missing accessibility layer that makes existing ISL knowledge, technology, trained people and public services work together.'