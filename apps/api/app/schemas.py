from __future__ import annotations

import math
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class Landmark(BaseModel):
    x: float
    y: float
    z: float

    @field_validator("x", "y", "z")
    @classmethod
    def validate_coordinate(cls, value: float) -> float:
        if not math.isfinite(value) or abs(value) > 4.0:
            raise ValueError("Landmark coordinates must be finite and within the accepted range.")
        return value


class LandmarkFrame(BaseModel):
    timestamp_ms: int = Field(ge=0)
    pose: list[Landmark] = Field(min_length=33, max_length=33)
    left_hand: list[Landmark] | None = Field(default=None, min_length=21, max_length=21)
    right_hand: list[Landmark] | None = Field(default=None, min_length=21, max_length=21)


class PredictionRequest(BaseModel):
    frames: list[LandmarkFrame] = Field(min_length=21, max_length=30)

    @model_validator(mode="after")
    def validate_timestamps(self) -> "PredictionRequest":
        timestamps = [frame.timestamp_ms for frame in self.frames]
        if any(current <= previous for previous, current in zip(timestamps, timestamps[1:])):
            raise ValueError("Frame timestamps must be strictly increasing.")
        return self


class FallbackGuidance(BaseModel):
    reason: Literal[
        "low_confidence",
        "insufficient_landmarks",
        "invalid_geometry",
        "model_unavailable",
    ]
    message: str
    actions: list[Literal["manual_phrase_board", "human_assistance"]]


class PredictionResponse(BaseModel):
    status: Literal["accepted", "fallback", "unavailable"]
    intent: str | None
    confidence: float | None
    threshold: float
    model_version: str
    supported_intent_count: int
    constrained_scope: Literal[True] = True
    requires_human_confirmation: bool = False
    fallback: FallbackGuidance | None = None


class ModelStatusResponse(BaseModel):
    ready: bool
    model_version: str
    threshold: float
    supported_intent_count: int
    sequence_length: int
    feature_count: int
    error: str | None = None
