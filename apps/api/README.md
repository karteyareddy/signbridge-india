# Constrained ISL inference API

This service accepts landmark sequences only. Never send images, video, names, or other identifying information.

## Run safely without a model

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r apps/api/requirements.txt
Set-Location apps/api
..\..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

`GET /health` reports `ready: false` and prediction requests fail closed until `ISL_MODEL_PATH` points to an evaluated ONNX artifact.

## Configure a trained model

Set the variables documented in `.env.example`. The model must match the input/output contract in the repository root `ML_MODEL.md`; startup rejects mismatched artifacts.

## Dataset contract

The pipeline accepts numeric landmark clips only—never raw video. Copy `data/manifest.example.csv` and provide one row per clip with a pseudonymous signer ID, explicit training-consent confirmation, and label-review confirmation.

Each `.npz` clip contains:

- `pose`: float32 `[21–30, 33, 3]`
- `left_hand` and `right_hand`: optional float32 `[21–30, 21, 3]`
- `left_present` and `right_present`: optional boolean `[21–30]`

The manifest preparer hashes every source clip, rejects duplicates and unsupported intent IDs, applies the same torso-normalization code used by inference, and writes an auditable dataset report.

## Train and evaluate

Install `requirements-training.txt`. Supply an NPZ dataset with:

- `sequences`: float32 `[samples, 30, 225]`
- `labels`: int64 `[samples]`, following `shared/isl_intents.json` order
- `signer_ids`: one signer identifier per sample

Run the complete pipeline from `apps/api`:

```powershell
python -m training.pipeline data\manifest.csv --model-version isl-gru-v1
```

The pipeline performs:

1. dataset and consent-manifest validation;
2. shared preprocessing to `[30, 225]`;
3. class-weighted GRU training;
4. validation-based early stopping;
5. validation-only confidence calibration with a minimum threshold of 0.85;
6. one-time signer-independent test evaluation;
7. metrics and provenance export;
8. ONNX export plus PyTorch/ONNX logit-parity verification.

The report contains measured accuracy, macro precision/recall/F1, per-class metrics, confusion matrix, rejection rate, closed-set false-accept rate, accepted accuracy, coverage, latency, signer partitions, hashes, and limitations. It does not claim unrestricted translation performance or out-of-distribution accuracy.
