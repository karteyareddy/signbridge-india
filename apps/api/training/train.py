from __future__ import annotations

import argparse
import json
import random
import time
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

from app.intents import SUPPORTED_INTENTS
from app.preprocessing import PREPROCESSING_VERSION
from training.dataset import (
    load_dataset,
    signer_independent_split,
    validate_signer_split,
)
from training.export import export_and_verify_onnx, sha256_file
from training.metrics import calibrate_threshold, classification_metrics, rejection_metrics
from training.model import ConstrainedISLGRU


def _loader(sequences: np.ndarray, labels: np.ndarray, batch_size: int, shuffle: bool) -> DataLoader:
    dataset = TensorDataset(torch.from_numpy(sequences), torch.from_numpy(labels))
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)


def _predict(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, float]:
    labels: list[np.ndarray] = []
    predictions: list[np.ndarray] = []
    confidences: list[np.ndarray] = []
    sample_count = 0
    started_at = time.perf_counter()
    model.eval()
    with torch.inference_mode():
        for features, batch_labels in loader:
            logits = model(features.to(device))
            probabilities = torch.softmax(logits, dim=1)
            labels.append(batch_labels.numpy())
            confidence, prediction = probabilities.max(dim=1)
            predictions.append(prediction.cpu().numpy())
            confidences.append(confidence.cpu().numpy())
            sample_count += int(features.shape[0])
    elapsed_ms = (time.perf_counter() - started_at) * 1000.0
    latency_ms_per_sample = elapsed_ms / sample_count if sample_count else 0.0
    return (
        np.concatenate(labels),
        np.concatenate(predictions),
        np.concatenate(confidences),
        latency_ms_per_sample,
    )


def _intent_registry_sha256() -> str:
    registry_path = Path(__file__).resolve().parents[3] / "shared" / "isl_intents.json"
    return sha256_file(registry_path)


def _class_weights(labels: np.ndarray, class_count: int) -> torch.Tensor:
    counts = np.bincount(labels, minlength=class_count).astype(np.float64)
    if np.any(counts == 0):
        raise ValueError("Training data must contain every constrained class.")
    weights = labels.size / (class_count * counts)
    return torch.from_numpy(weights.astype(np.float32))


def train(args: argparse.Namespace) -> None:
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)

    dataset = load_dataset(args.dataset)
    if not 0.5 <= args.minimum_confidence_threshold <= 0.99:
        raise ValueError("Minimum confidence threshold must be between 0.50 and 0.99.")
    split = signer_independent_split(dataset.signer_ids, seed=args.seed)
    if dataset.labels.min() < 0 or dataset.labels.max() >= len(SUPPORTED_INTENTS):
        raise ValueError("Dataset labels do not match the constrained intent registry.")
    split_report = validate_signer_split(dataset, split, len(SUPPORTED_INTENTS))

    train_loader = _loader(dataset.sequences[split.train], dataset.labels[split.train], args.batch_size, True)
    validation_loader = _loader(dataset.sequences[split.validation], dataset.labels[split.validation], args.batch_size, False)
    test_loader = _loader(dataset.sequences[split.test], dataset.labels[split.test], args.batch_size, False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = ConstrainedISLGRU(class_count=len(SUPPORTED_INTENTS)).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss(
        weight=_class_weights(dataset.labels[split.train], len(SUPPORTED_INTENTS)).to(device)
    )
    best_validation_f1 = -1.0
    best_state: dict[str, torch.Tensor] | None = None
    best_epoch = 0
    epochs_without_improvement = 0
    history: list[dict[str, float | int]] = []

    for epoch in range(1, args.epochs + 1):
        model.train()
        epoch_loss = 0.0
        epoch_samples = 0
        for features, labels in train_loader:
            optimizer.zero_grad(set_to_none=True)
            loss = criterion(model(features.to(device)), labels.to(device))
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            epoch_loss += float(loss.detach().cpu()) * int(features.shape[0])
            epoch_samples += int(features.shape[0])

        validation_labels, validation_predictions, _, _ = _predict(model, validation_loader, device)
        validation_metrics = classification_metrics(
            validation_labels,
            validation_predictions,
            len(SUPPORTED_INTENTS),
            [intent.id for intent in SUPPORTED_INTENTS],
        )
        history.append(
            {
                "epoch": epoch,
                "train_loss": epoch_loss / epoch_samples,
                "validation_macro_f1": float(validation_metrics["macro_f1"]),
                "validation_accuracy": float(validation_metrics["accuracy"]),
            }
        )
        if validation_metrics["macro_f1"] > best_validation_f1:
            best_validation_f1 = float(validation_metrics["macro_f1"])
            best_state = {name: tensor.detach().cpu().clone() for name, tensor in model.state_dict().items()}
            best_epoch = epoch
            epochs_without_improvement = 0
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= args.early_stopping_patience:
                break

    if best_state is None:
        raise RuntimeError("Training did not produce a model checkpoint.")
    model.load_state_dict(best_state)
    model.cpu().eval()

    validation_labels, validation_predictions, validation_confidences, validation_latency = _predict(
        model, validation_loader, torch.device("cpu")
    )
    validation_metrics = classification_metrics(
        validation_labels,
        validation_predictions,
        len(SUPPORTED_INTENTS),
        [intent.id for intent in SUPPORTED_INTENTS],
    )
    calibrated = calibrate_threshold(
        validation_labels,
        validation_predictions,
        validation_confidences,
        minimum_threshold=args.minimum_confidence_threshold,
        target_accepted_accuracy=args.target_accepted_accuracy,
    )
    threshold = float(calibrated["threshold"])

    # The held-out signer test partition is evaluated exactly once after all
    # model selection and threshold calibration decisions are complete.
    test_labels, test_predictions, test_confidences, test_latency = _predict(
        model, test_loader, torch.device("cpu")
    )
    test_metrics = classification_metrics(
        test_labels,
        test_predictions,
        len(SUPPORTED_INTENTS),
        [intent.id for intent in SUPPORTED_INTENTS],
    )
    test_metrics["rejection"] = rejection_metrics(
        test_labels,
        test_predictions,
        test_confidences,
        threshold,
    )
    test_metrics["cpu_latency_ms_per_sample"] = test_latency

    report = {
        "model_version": args.model_version,
        "scope": "closed_set_supported_intents_only",
        "supported_intent_count": len(SUPPORTED_INTENTS),
        "intent_registry_sha256": _intent_registry_sha256(),
        "preprocessing_version": PREPROCESSING_VERSION,
        "processed_dataset_sha256": sha256_file(args.dataset.resolve()),
        "seed": args.seed,
        "best_epoch": best_epoch,
        "training_history": history,
        "split": split_report,
        "validation": {
            **validation_metrics,
            "cpu_latency_ms_per_sample": validation_latency,
            "threshold_calibration": calibrated,
        },
        "signer_independent_test": test_metrics,
        "limitations": [
            "Metrics describe only the configured closed set; they do not measure unrestricted ISL translation.",
            "Out-of-distribution false acceptance requires a separately curated unsupported-sign test set.",
            "Deployment requires Deaf-community review and signer-diverse data governance.",
        ],
    }

    args.metrics.parent.mkdir(parents=True, exist_ok=True)
    export_metadata = export_and_verify_onnx(
        model=model,
        output_path=args.output,
        verification_sequences=dataset.sequences[split.test],
        class_count=len(SUPPORTED_INTENTS),
        metadata={
            "model_version": args.model_version,
            "confidence_threshold": threshold,
            "supported_intent_count": len(SUPPORTED_INTENTS),
            "intent_registry_sha256": report["intent_registry_sha256"],
            "preprocessing_version": PREPROCESSING_VERSION,
            "metrics_path": str(args.metrics.resolve()),
        },
    )
    report["export"] = export_metadata
    args.metrics.write_text(json.dumps(report, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the constrained 32-intent ISL GRU.")
    parser.add_argument("dataset", type=Path, help="NPZ containing sequences, labels, and signer_ids.")
    parser.add_argument("--output", type=Path, default=Path("models/isl_intent_gru.onnx"))
    parser.add_argument("--metrics", type=Path, default=Path("models/metrics.json"))
    parser.add_argument("--model-version", default="isl-gru-v1")
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--minimum-confidence-threshold", type=float, default=0.85)
    parser.add_argument("--target-accepted-accuracy", type=float, default=0.90)
    parser.add_argument("--early-stopping-patience", type=int, default=8)
    return parser.parse_args()


if __name__ == "__main__":
    train(parse_args())
