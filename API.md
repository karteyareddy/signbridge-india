# SIGNBRIDGE INDIA - API Contract

This document outlines the API contract for the MVP. Because the architecture heavily utilizes Supabase, the majority of these endpoints (excluding `/ai/predict`) are exposed via Supabase's auto-generated PostgREST API. The frontend will interact with these via the `@supabase/supabase-js` client, but they are documented here as standard REST endpoints for clarity and contract definition.

---

## 1. Authentication (`/auth/*`)

*Note: Handled entirely by Supabase Auth (GoTrue).*

### POST `/auth/v1/magiclink`
- **Method**: POST
- **Authentication**: None
- **Authorization**: None
- **Request Body**:
  ```json
  { "email": "staff@hospital.com" }
  ```
- **Validation**: Email must be a valid format.
- **Response**: `200 OK` (Empty body on success)
- **Errors**:
  - `400 Bad Request`: Invalid email format.
  - `429 Too Many Requests`: Rate limit exceeded.

---

## 2. Access Points & Service Context

### GET `/rest/v1/access_points?qr_token=eq.{token}`
- **Purpose**: Fetch location and service context when a user scans a QR code.
- **Authentication**: None (Anonymous allowed)
- **Authorization**: None (Public table via RLS)
- **Request**: Query parameter `qr_token`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "institution_id": "uuid",
      "service_type": "registration",
      "active": true
    }
  ]
  ```
- **Errors**: 
  - `404 Not Found`: Empty array returned if token does not exist.

### GET `/rest/v1/service_packs?service_type=eq.{type}&locale=eq.{locale}`
- **Purpose**: Fetch the version and metadata of a service pack (used to check if PWA needs to download updates).
- **Authentication**: None
- **Authorization**: None
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "service_type": "registration",
      "locale": "en",
      "version": 2,
      "content_hash": "abc123hash"
    }
  ]
  ```

### GET `/rest/v1/phrases?service_pack_id=eq.{id}`
- **Purpose**: Fetch all communication phrases for a specific service pack.
- **Authentication**: None
- **Authorization**: None
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "intent": "need_appointment",
      "text": "I need an appointment",
      "isl_asset": "https://storage.../asset.mp4"
    }
  ]
  ```

---

## 3. ML Inference (FastAPI Backend)

This API is a closed-set recognizer for the 32 IDs in `shared/isl_intents.json`. It is not an unrestricted ISL translation API. Raw camera frames are prohibited; the browser sends only MediaPipe landmark coordinates.

### POST `https://api.signbridge.in/api/v1/predict`
- **Purpose**: Receive a sequence of normalized hand/pose landmarks and return the predicted intent.
- **Authentication**: None (for basic offline/anonymous access) or Bearer Token (if logged in).
- **Authorization**: None
- **Request Body**:
  ```json
  {
    "frames": [{
      "timestamp_ms": 0,
      "pose": [{"x": 0.5, "y": 0.4, "z": -0.1}],
      "left_hand": [{"x": 0.4, "y": 0.3, "z": -0.05}],
      "right_hand": null
    }]
  }
  ```
- **Validation**:
  - `frames` must contain 21–30 strictly time-ordered elements.
  - Every frame has exactly 33 pose landmarks and either zero or exactly 21 landmarks per hand.
  - The server normalises coordinates around the shoulders and resamples to 30 frames.
- **Response (200 OK)**:
  ```json
  {
    "status": "accepted",
    "intent": "appointment",
    "confidence": 0.89,
    "threshold": 0.85,
    "model_version": "isl-gru-v1",
    "supported_intent_count": 32,
    "constrained_scope": true,
    "requires_human_confirmation": false,
    "fallback": null
  }
  ```
- Low confidence returns `status: "fallback"`, `intent: null`, and manual/human fallback actions. A missing trained artifact returns `status: "unavailable"` and never a placeholder prediction.
- **Errors**:
  - `400 Bad Request`: "Invalid landmark sequence shape."
  - `422 Unprocessable Entity`: Validation error on payload structure.
  - `500 Internal Server Error`: Model inference failure.

---

## 4. Human Escalation (Realtime)

### POST `/rest/v1/assistance_requests`
- **Purpose**: Request help from a human operator/interpreter.
- **Authentication**: Optional
- **Authorization**: Insert allowed via RLS for anyone.
- **Request Body**:
  ```json
  {
    "access_point_id": "uuid",
    "urgency": "normal"
  }
  ```
- **Response (201 Created)**: (Empty body, headers contain location)
- **Errors**:
  - `400 Bad Request`: Missing `access_point_id` or invalid `urgency`.

### GET `/rest/v1/assistance_requests?id=eq.{id}`
- **Purpose**: Client polls or subscribes to this row for status updates (handled via Supabase Realtime).
- **Authentication**: Optional
- **Authorization**: Allowed via RLS for the creator, Admins, or Interpreters.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "access_point_id": "uuid",
      "urgency": "normal",
      "status": "accepted",
      "created_at": "2026-08-14T00:00:00Z"
    }
  ]
  ```

---

## 5. Telemetry & Practice

### POST `/rest/v1/practice_sessions`
- **Purpose**: Log a user's practice attempt and the AI's confidence score.
- **Authentication**: Required (Bearer Token)
- **Authorization**: User can only insert their own `user_id`.
- **Request Body**:
  ```json
  {
    "user_id": "uuid",
    "phrase_id": "uuid",
    "confidence": 0.85
  }
  ```
- **Response (201 Created)**

### POST `/rest/v1/feedback`
- **Purpose**: Submit interaction ratings.
- **Authentication**: Optional
- **Authorization**: Insert allowed via RLS.
- **Request Body**:
  ```json
  {
    "access_point_id": "uuid",
    "phrase_id": "uuid",
    "outcome": "success",
    "rating": 5
  }
  ```
- **Validation**: Rating must be between 1 and 5. Outcome must be 'success' or 'failure'.
- **Response (201 Created)**

---

## 6. Institution Dashboard & Readiness

### GET `/rest/v1/rpc/get_institution_readiness`
- **Purpose**: Fetch aggregated metrics for a specific institution (Custom PostgreSQL RPC function).
- **Authentication**: Required
- **Authorization**: RLS restricts execution to Admins or Staff associated with the `institution_id`.
- **Request Body**:
  ```json
  { "inst_id": "uuid" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "readiness_score": 85,
    "total_staff": 40,
    "trained_staff": 28,
    "successful_interactions": 142,
    "escalation_count": 5
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: User does not have permission to view this institution.

---

## 7. Community & Content

### POST `/rest/v1/content_reports`
- **Purpose**: Deaf users/community flag a phrase.
- **Authentication**: Required
- **Authorization**: Insert allowed via RLS.
- **Request Body**:
  ```json
  {
    "phrase_id": "uuid",
    "reporter_type": "citizen",
    "reason": "Sign is regionally inaccurate for South India."
  }
  ```
- **Response (201 Created)**
- **Errors**:
  - `400 Bad Request`: Missing phrase ID or reason.

---

## 8. General Error Responses

All Supabase PostgREST endpoints share a common error structure:
```json
{
  "code": "42P01",
  "details": null,
  "hint": null,
  "message": "relation \"public.non_existent_table\" does not exist"
}
```
Standard HTTP Status Codes used across the API:
- `200 OK`: Success (GET, POST with return representation)
- `201 Created`: Resource successfully created
- `400 Bad Request`: Malformed JSON or validation failure
- `401 Unauthorized`: Authentication required but missing/invalid
- `403 Forbidden`: Authenticated, but lacks RLS permissions
- `404 Not Found`: Resource does not exist (or hidden by RLS)
- `409 Conflict`: Unique constraint violation
- `422 Unprocessable Entity`: Validation failure (FastAPI payload)
- `500 Internal Server Error`: Unexpected backend failure
