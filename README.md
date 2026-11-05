# SIGNBRIDGE INDIA 🤟🇮🇳

> **A Deaf-First Accessibility Network for Indian Sign Language (ISL)**  
> *Connecting Deaf citizens with services through ISL Access Points, role-based micro-learning, constrained AI sign recognition, and institutional readiness tracking.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?style=flat-square&logo=pytorch)](https://pytorch.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📌 Executive Summary

**SIGNBRIDGE INDIA** is a digital accessibility layer designed to bridge the everyday communication gap between Deaf citizens and public/private services across India (hospitals, railway stations, banks, government desks, and educational institutions).

Rather than promising an unconstrained, universal real-time translator—which can fail dangerously in high-stakes environments—SignBridge India introduces **ISL Access Points**: context-aware QR/NFC physical entry markers paired with offline-first service packs, constrained landmark-based AI sign recognition, human interpreter escalation, and an institutional **ISL Readiness Score**.

---

## ✨ Core Features & Innovation

| Feature | Description |
| :--- | :--- |
| **📍 ISL Access Points** | Physical QR/NFC markers at counters (e.g. Hospital Registration). Scanning launches location-specific phrase cards, form guidance, and instant visual tools without requiring app download or mandatory account creation. |
| **📦 Offline Service Packs** | Pre-packaged domain vocabulary (medical, transport, emergency) cached via IndexedDB & Service Worker for Tier 2/3 and rural areas with weak connectivity. |
| **🧠 Constrained AI Sign Recognition** | Browser-side MediaPipe landmark extraction coupled with a Python FastAPI inference backend. Constrained to high-value intent phrases with strict confidence thresholds (`>85%`). |
| **🛡️ Safe AI Fallback** | Low-confidence predictions (`<85%`) immediately route users to safe visual phrase selection or text input to prevent dangerous misinterpretations. |
| **🆘 Human Escalation Queue** | One-tap escalation to certified ISL interpreters or trained volunteers when complex or high-stakes communication is required. |
| **🎓 Role-Based Micro-Learning** | 5 to 10-minute targeted micro-courses and gamified practice for hearing staff at service desks to learn essential counter-specific ISL phrases. |
| **📊 Institutional Readiness Dashboard** | Measures and tracks institutional accessibility based on trained staff counts, average response times, and anonymous user feedback ratings. |

---

## 🏗️ Technical Architecture

SignBridge India uses a pragmatic 3-tier architecture optimized for speed, reliability, and privacy.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (PWA)                             │
│  Next.js 14 (App Router) + MediaPipe JS + Service Workers + IndexedDB   │
│  - Instant QR scan access (no login required for basic access)          │
│  - Extracts 3D Pose & Hand Landmarks in the browser (Zero Frame Storage)│
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    │ Normalized                      │ Direct REST / WSS
                    │ Landmarks                       │ 
                    ▼                                 ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│            AI API TIER               │ │       DATA & BAAS TIER         │
│  FastAPI (Python) + PyTorch / ONNX   │ │   Supabase (PostgreSQL + RLS)  │
│  - Stateless `/ai/predict` endpoint  │ │   - Auth & Role Management     │
│  - Temporal CNN / GRU Model          │ │   - Courses & Service Packs    │
│  - Returns Intent & Confidence Score │ │   - Realtime Escalation Queue  │
└──────────────────────────────────────┘ └────────────────────────────────┘
```

### Privacy & Security Guarantee
- 🔒 **Zero Frame Storage**: Raw camera frames are processed exclusively in client RAM via MediaPipe JS and discarded immediately.
- 🔒 **Landmark-Only Transmission**: Only numerical coordinate arrays `(x, y, z)` are transmitted to the inference endpoint.

---

### Data model (Supabase / PostgreSQL)

Defined in `supabase/migrations/` (three migrations, 26 RLS policies). Key tables:

| Table | Purpose | Important fields |
| :--- | :--- | :--- |
| `users` | Profile linked to `auth.users` | `role` (`citizen` default; `staff`, `interpreter`, `admin`), `preferred_language`, `accessibility_preferences` |
| `institutions` | Hospitals, stations, banks | `name`, `type`, `district`, `state`, `readiness_level` |
| `access_points` | Physical ISL Access Points | `institution_id`, `service_type`, `qr_token` (unique), `nfc_id`, `active` |
| `staff_profiles` | Staff membership per institution | `user_id`, `institution_id`, `role`, `training_level`, `badge` |
| `courses`, `lessons`, `learning_attempts` | Micro-learning content and progress | course/lesson hierarchy, per-user attempts |
| `service_packs`, `phrases` | Offline domain vocabulary | pack metadata, phrase text/media |
| `practice_sessions`, `ai_predictions` | Practice logs and recognition telemetry | user, intent, confidence |
| `assistance_requests` | Human escalation queue with lifecycle states | requester, institution, status timestamps |
| `feedback`, `content_reports`, `model_versions` | Ratings, moderation, model registry | — |

See [DATABASE.md](DATABASE.md) for the full schema and policy text.

---

## 📁 Repository Structure

```
ISL/
├── app/                        # Next.js 14 Frontend App Router Pages
│   ├── (auth)/                 # Login & authentication routes
│   ├── (protected)/            # Dashboard, admin, & escalation queue
│   ├── access/                 # QR entry point & counter service UI
│   ├── learn/                  # Staff micro-learning & course modules
│   ├── practice/               # Interactive ISL sign practice
│   ├── recognize/              # Live camera landmark sign recognition
│   └── api/                    # Next.js local API handlers
├── apps/
│   └── api/                    # Python FastAPI AI Inference Service
│       ├── app/                # FastAPI application & model inference
│       ├── models/             # PyTorch / ONNX trained models
│       ├── training/           # Dataset prep & model training scripts
│       └── tests/              # Pytest backend test suite
├── components/                 # Reusable React UI components
├── lib/                        # Supabase client, MediaPipe & utility functions
├── public/                     # Static assets, icons, manifest.json
├── shared/                     # Cross-tier TypeScript interfaces & schemas
├── supabase/                   # Supabase migrations, seed data, & RLS policies
├── tests/                      # Frontend unit & integration tests
├── API.md                      # Detailed API documentation
├── ARCHITECTURE.md             # System architecture blueprint
├── DATABASE.md                 # Supabase schema & RLS rules
├── ML_MODEL.md                 # AI model spec & dataset guidelines
└── PRD.md                      # Master Product Requirements Document
```

---

## 🚀 Quick Start & Development Setup

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or higher
- **Python**: `3.10` or higher
- **Git**

---

### 1. Frontend Setup (Next.js)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karteyareddy/ISL.git
   cd ISL
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_ML_API_URL=http://127.0.0.1:8000
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Backend Setup (FastAPI AI Inference)

1. **Navigate to the API directory:**
   ```bash
   cd apps/api
   ```

2. **Create and activate a Virtual Environment:**
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🖥️ Usage

### Frontend routes

| Route | Who | Purpose |
| :--- | :--- | :--- |
| `/` | Everyone | Landing page |
| `/access`, `/access/[qrToken]` | Deaf citizens (no login) | Scan/enter an Access Point token; phrase cards, form guidance, escalation |
| `/recognize` | Everyone | Live camera landmark recognition with confidence display |
| `/learn`, `/learn/[courseId]`, `/learn/progress` | Hearing staff | Role-based micro-courses and progress |
| `/practice/[lessonId]` | Staff | Sign practice drills |
| `/login` | Staff, interpreters, admins | Supabase Auth |
| `/dashboard`, `/escalate`, `/admin` | Authenticated roles (via `middleware.ts` session refresh + RLS) | Readiness dashboard, escalation queue, administration |
| `/api/offline-sync` | Client | Next.js route handler used by the PWA to sync offline data |

### AI inference API (`apps/api`, FastAPI)

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| GET | `/health` | none | Model readiness, version, threshold, sequence/feature sizes |
| GET | `/api/v1/intents` | none | Constrained list of supported intents with `high_stakes` flag |
| POST | `/api/v1/predict` | none (CORS-restricted origins) | 21–30 landmark frames in; `status` (`accepted` / `fallback` / `unavailable`), `intent`, `confidence`, `threshold` out. Below the 0.85 threshold `status` is `fallback` with guidance |

Example request body (each frame: `timestamp_ms`, 33 `pose` landmarks, optional 21-point `left_hand` / `right_hand`):

```json
{
  "frames": [
    { "timestamp_ms": 0,  "pose": [{ "x": 0.51, "y": 0.32, "z": -0.1 }, "...33 items"], "right_hand": ["...21 items"] },
    { "timestamp_ms": 33, "pose": ["..."], "right_hand": ["..."] }
  ]
}
```

Full request/response schemas are in [API.md](API.md).

---

## 🧪 Testing & Code Quality

Run tests and linting before submitting pull requests:

### Frontend Tests & Type Checking
```bash
# Run TypeScript compilation check
npm run build

# Run ESLint
npm run lint

# Run Unit Tests
npm test
```

### Backend Tests (Pytest)
```bash
cd apps/api
pytest
```

---

## ⚖️ Responsible AI & Ethical Framework

SignBridge India adheres strictly to Deaf-first ethical guidelines:
1. **AI as an Augmentation, Not Replacement**: Certified interpreters and Deaf community experts remain central. AI provides assistance for routine interactions only.
2. **No False Guarantees**: We do not claim universal translation. All predictions display a visual confidence score.
3. **Safe Fallback**: Any low-confidence output defaults to visual card selection or human escalation.
4. **Data Dignity**: Landmark coordinates are ephemeral. No personal biometric images are retained.

---

## 🚢 Deployment

- **Frontend**: Vercel (import the repo; set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ML_API_URL`). `npm run build` runs `tsc --noEmit` before `next build`.
- **AI API**: any Python host (Render, Railway, or a container running `uvicorn app.main:app --port 8000`); set the allowed CORS origins to the frontend domain.
- **Database**: Supabase project; apply `supabase/migrations/*.sql` in order and optionally `supabase/seed.sql`.

See [ARCHITECTURE.md](ARCHITECTURE.md) section 12 for the target topology.

---

## 🚧 Limitations & Roadmap

- Recognition is intentionally limited to a fixed intent set; it is not a general ISL translator.
- The inference API has no authentication of its own; it relies on CORS and should sit behind a gateway in production.
- Several tables allow anonymous inserts (`feedback`, `ai_predictions`, `assistance_requests`, `content_reports`) by design for no-login access; rate limiting is not yet implemented.
- Model quality depends on the landmark dataset supplied to `apps/api/training/`; no public pretrained weights are bundled.
- Next steps: interpreter availability/scheduling, richer offline packs, model versioning rollout via `model_versions`.

---

## 📚 Project Documentation

For deeper details, consult our technical documentation:
- 📖 [Product Requirements Document (PRD)](PRD.md)
- 📐 [Technical Architecture Guide](ARCHITECTURE.md)
- 🔌 [API Specification](API.md)
- 🗄️ [Database & RLS Schema](DATABASE.md)
- 🤖 [ML Model & Landmark Pipeline](ML_MODEL.md)

---

## 🤝 Contributing

We welcome contributions from developers, designers, Deaf community advocates, and ISL linguists! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## 🙏 Acknowledgements

MediaPipe Tasks Vision (landmark extraction), PyTorch / ONNX Runtime, FastAPI, Next.js, Supabase. Built with input from the Deaf-first principles described in [PRD.md](PRD.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

Kristipati Karteya Reddy — GitHub [@karteyareddy](https://github.com/karteyareddy)

---

<p align="center">
  <i>Built with ❤️ for an accessible, inclusive India.</i>
</p>
