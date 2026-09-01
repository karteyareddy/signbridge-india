from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .inference import RecognitionEngine
from .intents import SUPPORTED_INTENTS
from .model import ONNXIntentModel
from .preprocessing import FEATURE_COUNT, SEQUENCE_LENGTH
from .schemas import ModelStatusResponse, PredictionRequest, PredictionResponse


def _allowed_origins() -> list[str]:
    configured = os.getenv("ISL_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


model = ONNXIntentModel()
configured_threshold = float(os.getenv("ISL_CONFIDENCE_THRESHOLD", "0.85"))
threshold = max(0.85, configured_threshold, model.recommended_threshold)
engine = RecognitionEngine(model=model, threshold=threshold)

app = FastAPI(
    title="SIGNBRIDGE Constrained ISL Recognition API",
    version="1.0.0",
    description="Closed-set recognition for 32 supported ISL intents. This is not unrestricted translation.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["content-type"],
)


@app.get("/health", response_model=ModelStatusResponse)
def health() -> ModelStatusResponse:
    return ModelStatusResponse(
        ready=model.ready,
        model_version=model.version,
        threshold=engine.threshold,
        supported_intent_count=len(SUPPORTED_INTENTS),
        sequence_length=SEQUENCE_LENGTH,
        feature_count=FEATURE_COUNT,
        error=model.error,
    )


@app.get("/api/v1/intents")
def list_intents() -> dict[str, object]:
    return {
        "count": len(SUPPORTED_INTENTS),
        "constrained_scope": True,
        "intents": [
            {
                "id": intent.id,
                "label": intent.label,
                "category": intent.category,
                "high_stakes": intent.high_stakes,
            }
            for intent in SUPPORTED_INTENTS
        ],
    }


@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    return engine.predict(request.frames)
