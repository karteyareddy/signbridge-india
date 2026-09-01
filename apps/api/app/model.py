from __future__ import annotations

import os
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np

from .intents import SUPPORTED_INTENTS
from .preprocessing import FEATURE_COUNT, PREPROCESSING_VERSION, SEQUENCE_LENGTH


class ModelUnavailableError(RuntimeError):
    pass


class ModelContractError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelPrediction:
    class_index: int
    confidence: float


class IntentModel(Protocol):
    version: str
    ready: bool
    error: str | None

    def predict(self, sequence: np.ndarray) -> ModelPrediction:
        ...


class ONNXIntentModel:
    def __init__(self, model_path: str | None = None, version: str | None = None) -> None:
        requested_version = version or os.getenv("ISL_MODEL_VERSION")
        self.version = requested_version or "unconfigured"
        self.recommended_threshold = 0.85
        self.ready = False
        self.error: str | None = None
        self._session = None
        self._input_name = "landmarks"
        self._output_name = "logits"

        configured_path = model_path or os.getenv("ISL_MODEL_PATH")
        if not configured_path:
            self.error = "ISL_MODEL_PATH is not configured."
            return

        path = Path(configured_path).expanduser().resolve()
        if not path.is_file():
            self.error = "The configured ONNX model file does not exist."
            return

        try:
            import onnxruntime as ort

            self._validate_metadata(path, requested_version)
            self._session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
            self._validate_contract()
            self.ready = True
        except Exception as error:  # Fail closed; expose only a non-sensitive status message.
            self.error = f"Model initialization failed: {type(error).__name__}"
            self._session = None

    @staticmethod
    def _sha256(path: Path) -> str:
        digest = hashlib.sha256()
        with path.open("rb") as source:
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                digest.update(chunk)
        return digest.hexdigest()

    @staticmethod
    def _registry_sha256() -> str:
        registry = Path(__file__).resolve().parents[3] / "shared" / "isl_intents.json"
        return ONNXIntentModel._sha256(registry)

    def _validate_metadata(self, model_path: Path, requested_version: str | None) -> None:
        metadata_path = model_path.with_suffix(".metadata.json")
        if not metadata_path.is_file():
            raise ModelContractError("The ONNX artifact metadata file is missing.")
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        required = {
            "model_version",
            "confidence_threshold",
            "supported_intent_count",
            "intent_registry_sha256",
            "preprocessing_version",
            "onnx_sha256",
            "parity_verified",
        }
        if not required.issubset(metadata):
            raise ModelContractError("The ONNX artifact metadata is incomplete.")
        if metadata["onnx_sha256"] != self._sha256(model_path):
            raise ModelContractError("The ONNX artifact checksum does not match its metadata.")
        if metadata["intent_registry_sha256"] != self._registry_sha256():
            raise ModelContractError("The model intent registry does not match the runtime registry.")
        if metadata["preprocessing_version"] != PREPROCESSING_VERSION:
            raise ModelContractError("The model preprocessing version does not match the runtime.")
        if metadata["supported_intent_count"] != len(SUPPORTED_INTENTS):
            raise ModelContractError("The model class count does not match the runtime registry.")
        if metadata["parity_verified"] is not True:
            raise ModelContractError("PyTorch/ONNX parity was not verified for this artifact.")
        metadata_version = str(metadata["model_version"])
        if requested_version and requested_version != metadata_version:
            raise ModelContractError("Configured model version does not match artifact metadata.")
        threshold = float(metadata["confidence_threshold"])
        if not 0.85 <= threshold <= 0.99:
            raise ModelContractError("Artifact confidence threshold violates the safety range.")
        self.version = metadata_version
        self.recommended_threshold = threshold

    def _validate_contract(self) -> None:
        if self._session is None:
            raise ModelContractError("Model session is unavailable.")
        inputs = self._session.get_inputs()
        outputs = self._session.get_outputs()
        if len(inputs) != 1 or len(outputs) != 1:
            raise ModelContractError("The model must expose exactly one input and one output.")
        self._input_name = inputs[0].name
        self._output_name = outputs[0].name

        input_shape = inputs[0].shape
        if len(input_shape) != 3 or input_shape[-2:] != [SEQUENCE_LENGTH, FEATURE_COUNT]:
            raise ModelContractError("The ONNX input must have shape [batch, 30, 225].")

        output_shape = outputs[0].shape
        if len(output_shape) != 2 or output_shape[-1] != len(SUPPORTED_INTENTS):
            raise ModelContractError("The ONNX output class count does not match the intent registry.")

    def predict(self, sequence: np.ndarray) -> ModelPrediction:
        if not self.ready or self._session is None:
            raise ModelUnavailableError(self.error or "The trained model is unavailable.")
        if sequence.shape != (SEQUENCE_LENGTH, FEATURE_COUNT):
            raise ModelContractError("Inference received an invalid sequence shape.")

        outputs = self._session.run(
            [self._output_name],
            {self._input_name: sequence[np.newaxis, ...].astype(np.float32)},
        )
        logits = np.asarray(outputs[0], dtype=np.float32)
        if logits.shape != (1, len(SUPPORTED_INTENTS)) or not np.isfinite(logits).all():
            raise ModelContractError("The model returned invalid logits.")

        stable_logits = logits[0] - np.max(logits[0])
        probabilities = np.exp(stable_logits) / np.sum(np.exp(stable_logits))
        class_index = int(np.argmax(probabilities))
        return ModelPrediction(class_index=class_index, confidence=float(probabilities[class_index]))
