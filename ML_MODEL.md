# Constrained ISL Recognition Model

## Product boundary

This system is a **closed-set intent recognizer**, not unrestricted ISL translation. It may return only one of the 32 stable intent IDs in `shared/isl_intents.json`, and only when the trained model's calibrated confidence meets the configured threshold.

- Supported classes: 32 (must remain between 30 and 50).
- Input: 21–30 consecutive frames captured from one camera session.
- Per frame: 33 MediaPipe pose landmarks, 21 left-hand landmarks, and 21 right-hand landmarks. Each landmark contains only `x`, `y`, and `z`.
- Privacy: MediaPipe runs in the browser. Raw camera frames are never stored, logged, or transmitted.
- Output: accepted supported intent plus confidence, or a safe fallback without a guessed label.
- Default acceptance threshold: 0.85. The threshold must be calibrated on held-out signers and may be raised, never silently lowered in the UI.
- High-stakes intents never replace qualified medical, legal, or emergency communication.

## Preprocessing contract

1. Reject sequences outside 21–30 frames or frames without the full 33-point pose skeleton.
2. Preserve left/right hand channels; zero-fill a missing hand for that frame.
3. Centre all coordinates on the midpoint between pose landmarks 11 and 12 (shoulders).
4. Scale coordinates by shoulder distance; reject degenerate shoulder geometry.
5. Flatten in the stable order `pose → left hand → right hand`, producing 225 features per frame.
6. Linearly resample the temporal dimension to exactly 30 frames.
7. Do not mirror or swap hands during inference.

The model input tensor is `float32 [batch, 30, 225]`. The ONNX output is unnormalised logits `[batch, 32]` in the exact registry order.

## Model architecture

The training implementation uses a small two-layer GRU with a 128-unit hidden state, dropout, temporal mean pooling, and a 32-class linear head. Runtime inference uses ONNX Runtime CPU execution. No placeholder or heuristic classifier is permitted in production.

The API starts safely without a model file but reports `ready: false`; prediction requests then return a model-unavailable fallback. Configure a genuinely trained artifact with `ISL_MODEL_PATH` and its version with `ISL_MODEL_VERSION`.

## Training and evaluation

- Dataset input is landmark-only `.npz`; the pipeline does not accept raw video.
- Every manifest record requires a pseudonymous signer ID, explicit training consent, and reviewed intent label.
- Dataset records must include signer IDs.
- Train, validation, and test partitions are split by signer, never by individual frame or clip.
- Report measured macro F1, per-class recall, confusion matrix, low-confidence rejection rate, false-accept rate, and latency.
- Calibrate the threshold on validation signers and report final metrics once on unseen test signers.
- Export only after PyTorch/ONNX logit parity passes; deploy only the ONNX file together with its checksum-verified metadata sidecar.
- Do not publish an accuracy claim until a Deaf-community-reviewed, signer-diverse evaluation has been completed.

## Safe response contract

- `accepted`: confidence meets threshold; return the supported intent ID.
- `fallback`: confidence is below threshold or landmarks are insufficient; return no intent and offer manual phrases/human assistance.
- `unavailable`: the trained model is missing or failed validation; return no intent.

Every response carries `model_version`, `threshold`, `supported_intent_count`, and a clear notice that this is constrained recognition.
