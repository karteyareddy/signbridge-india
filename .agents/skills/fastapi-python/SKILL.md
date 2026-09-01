---
name: fastapi-python
description: Triggered when working on the Python backend, API endpoints, or ML inference serving.
---
# FastAPI Backend

**Purpose:**
- The Python API is ONLY for serving AI/ML predictions. Do not duplicate standard DB CRUD routes here.

**Rules:**
- **Input**: Receives JSON sequences of normalized hand/pose landmarks.
- **Output**: Returns predicted intent and a confidence score.
- **Stateless**: The API must remain stateless. Telemetry/metrics logging should be done asynchronously to Supabase.
- **Validation**: Strictly validate incoming landmark array shapes before passing to the model.
- **Performance**: Optimize for low latency. Use ONNX Runtime if possible for faster inference.
