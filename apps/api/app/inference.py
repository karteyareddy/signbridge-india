from __future__ import annotations

from .intents import SUPPORTED_INTENTS
from .model import IntentModel, ModelContractError, ModelUnavailableError
from .preprocessing import PreprocessingError, preprocess_frames
from .schemas import FallbackGuidance, LandmarkFrame, PredictionResponse


class RecognitionEngine:
    def __init__(self, model: IntentModel, threshold: float = 0.85) -> None:
        if not 0.5 <= threshold <= 0.99:
            raise ValueError("Confidence threshold must be between 0.50 and 0.99.")
        self.model = model
        self.threshold = threshold

    def _fallback(
        self,
        status: str,
        reason: str,
        message: str,
        confidence: float | None = None,
    ) -> PredictionResponse:
        return PredictionResponse(
            status=status,
            intent=None,
            confidence=confidence,
            threshold=self.threshold,
            model_version=self.model.version,
            supported_intent_count=len(SUPPORTED_INTENTS),
            fallback=FallbackGuidance(
                reason=reason,
                message=message,
                actions=["manual_phrase_board", "human_assistance"],
            ),
        )

    def predict(self, frames: list[LandmarkFrame]) -> PredictionResponse:
        if not self.model.ready:
            return self._fallback(
                "unavailable",
                "model_unavailable",
                "The trained recognition model is not available. Use a validated phrase or human assistance.",
            )

        try:
            sequence = preprocess_frames(frames)
            prediction = self.model.predict(sequence)
        except PreprocessingError as error:
            return self._fallback(
                "fallback",
                error.reason,
                "Hands or shoulders were not tracked reliably. Reframe and try again, or use a validated fallback.",
            )
        except (ModelUnavailableError, ModelContractError):
            return self._fallback(
                "unavailable",
                "model_unavailable",
                "The trained recognition model could not make a safe prediction.",
            )

        if prediction.confidence < self.threshold:
            return self._fallback(
                "fallback",
                "low_confidence",
                "Confidence was below the safety threshold. No intent was selected.",
                confidence=prediction.confidence,
            )

        if not 0 <= prediction.class_index < len(SUPPORTED_INTENTS):
            return self._fallback(
                "unavailable",
                "model_unavailable",
                "The trained recognition model returned an invalid class index.",
            )

        intent = SUPPORTED_INTENTS[prediction.class_index]
        return PredictionResponse(
            status="accepted",
            intent=intent.id,
            confidence=prediction.confidence,
            threshold=self.threshold,
            model_version=self.model.version,
            supported_intent_count=len(SUPPORTED_INTENTS),
            requires_human_confirmation=intent.high_stakes,
        )
