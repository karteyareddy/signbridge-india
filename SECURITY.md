# Security & Privacy Policy 🛡️

At **SignBridge India**, privacy and security are fundamental principles—especially given that our application processes human landmark data and handles accessibility services in sensitive environments like hospitals, banks, and government offices.

---

## 🔒 Security Commitments & Architectural Guarantees

1. **Zero Camera Frame Logging / Storage**:
   - Camera video feeds are processed **exclusively in client memory** using MediaPipe JS inside the user's web browser.
   - Raw video frames or images are **never recorded, stored, or transmitted** to any server.

2. **Landmark-Only Transmission**:
   - The AI inference engine (`/ai/predict`) accepts only anonymized, numerical 3D spatial coordinate arrays `(x, y, z)`.
   - Coordinates contain zero biometric imagery or facial identification markers.

3. **Database Access & Row Level Security (RLS)**:
   - Supabase PostgreSQL is secured with strict Row Level Security (RLS) policies.
   - Public users have read-only access to published courses and service packs.
   - Anonymous citizens can access counter phrase cards without account creation.
   - Service-role keys are strictly kept server-side and never exposed in client bundles.

4. **Service Pack Integrity**:
   - Downloaded offline service packs are validated via content hashes to prevent tampering.

---

## 📋 Supported Versions

We provide security updates for the following active branches:

| Version | Supported |
| :--- | :--- |
| `0.1.x` (Main / MVP) | ✅ Supported |
| `< 0.1.0` | ❌ End of Life |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or potential privacy leak within SignBridge India:

1. **Do NOT open a public GitHub issue.**
2. Send an email detailing the vulnerability to `security@signbridge.in`.
3. Include the following details:
   - Description of the vulnerability and potential impact.
   - Step-by-step instructions or proof-of-concept script to reproduce.
   - Affected routes, endpoints, or components.

### Our Response Process:
- **Acknowledgement**: Within 24-48 hours.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Patch**: Security patches will be released promptly, and researchers credited upon resolution.

Thank you for helping keep SignBridge India secure and private for all citizens!
