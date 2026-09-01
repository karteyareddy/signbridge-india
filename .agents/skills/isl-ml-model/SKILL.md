---
name: isl-ml-model
description: Triggered when training, evaluating, or deploying the PyTorch/ONNX sign language recognition model.
---
# ISL Machine Learning Model

**Model Constraints:**
- **Scope**: Constrained MVP recognizing 30-50 high-value intents/signs. Do NOT build a universal sentence translator.
- **Architecture**: Small Temporal Convolutional Network (TCN) or GRU capable of processing 21-30 frame sequences.
- **Safety First**: Every prediction must output a confidence score.
- **Strict Fallback**: If confidence is below the threshold (e.g., 85%), trigger a safe fallback (manual selection) rather than guessing. Never fabricate accuracy.
- **Evaluation**: Must use signer-independent train/test splits to ensure the model generalizes to new users.
- **Versioning**: Always track the `model_version` in the database for every prediction.
