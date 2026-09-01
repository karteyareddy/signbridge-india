from __future__ import annotations

import unittest

from app.inference import RecognitionEngine
from app.model import ModelPrediction
from tests.test_preprocessing import make_frame


class FakeModel:
    version = "test-model"
    error = None

    def __init__(self, confidence: float, class_index: int = 0, ready: bool = True) -> None:
        self.confidence = confidence
        self.class_index = class_index
        self.ready = ready

    def predict(self, sequence):
        return ModelPrediction(class_index=self.class_index, confidence=self.confidence)


class InferenceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.frames = [make_frame(index * 80) for index in range(21)]

    def test_accepts_only_above_threshold(self) -> None:
        response = RecognitionEngine(FakeModel(0.91), threshold=0.85).predict(self.frames)
        self.assertEqual(response.status, "accepted")
        self.assertEqual(response.intent, "hello")
        self.assertAlmostEqual(response.confidence or 0.0, 0.91)

    def test_low_confidence_returns_no_guessed_intent(self) -> None:
        response = RecognitionEngine(FakeModel(0.60), threshold=0.85).predict(self.frames)
        self.assertEqual(response.status, "fallback")
        self.assertIsNone(response.intent)
        self.assertEqual(response.fallback.reason, "low_confidence")

    def test_missing_model_fails_closed(self) -> None:
        response = RecognitionEngine(FakeModel(0.99, ready=False), threshold=0.85).predict(self.frames)
        self.assertEqual(response.status, "unavailable")
        self.assertIsNone(response.intent)
        self.assertEqual(response.fallback.reason, "model_unavailable")


if __name__ == "__main__":
    unittest.main()
