---
name: project-architecture
description: Triggered when working on overall system architecture, project structure, or cross-tier integrations.
---
# Project Architecture (SIGNBRIDGE INDIA)

**Core Tenets:**
- **3-Tier Simplicity**: Next.js (Client/PWA) + FastAPI (ML Inference) + Supabase (BaaS).
- **Monorepo**: Keep both Next.js and Python code in the same repository for the MVP.
- **Direct DB Access**: Next.js frontend calls Supabase directly for standard CRUD and Auth. Do NOT build custom API routes for database queries unless strictly necessary.
- **FastAPI Isolation**: The Python backend is reserved EXCLUSIVELY for PyTorch/ONNX ML inference.
- **No Unnecessary Abstractions**: Avoid Kubernetes, complex microservices, or custom Auth servers.

**References:**
Always ensure new components align with `ARCHITECTURE.md`.
