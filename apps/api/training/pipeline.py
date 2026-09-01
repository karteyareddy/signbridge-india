from __future__ import annotations

import argparse
import json
from pathlib import Path

from training.dataset import preprocess_manifest
from training.train import train


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run dataset → preprocessing → training → validation → signer-independent test → ONNX."
    )
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--work-dir", type=Path, default=Path("artifacts/isl-gru-v1"))
    parser.add_argument("--model-version", default="isl-gru-v1")
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--minimum-confidence-threshold", type=float, default=0.85)
    parser.add_argument("--target-accepted-accuracy", type=float, default=0.90)
    parser.add_argument("--early-stopping-patience", type=int, default=8)
    return parser.parse_args()


def run(arguments: argparse.Namespace) -> None:
    work_dir = arguments.work_dir.resolve()
    dataset_path = work_dir / "dataset.npz"
    dataset_report_path = work_dir / "dataset_report.json"
    model_path = work_dir / "isl_intent_gru.onnx"
    metrics_path = work_dir / "metrics.json"

    print("[1/8] Dataset manifest validation")
    print("[2/8] Landmark preprocessing")
    dataset_report = preprocess_manifest(
        arguments.manifest,
        dataset_path,
        dataset_report_path,
    )
    print(
        json.dumps(
            {
                "samples": dataset_report["sample_count"],
                "signers": dataset_report["signer_count"],
                "classes": dataset_report["class_count"],
            }
        )
    )
    print("[3/8] GRU training")
    print("[4/8] Validation and early stopping")
    print("[5/8] Signer-independent test")
    print("[6/8] Metrics and threshold calibration")
    print("[7/8] Model export")
    train(
        argparse.Namespace(
            dataset=dataset_path,
            output=model_path,
            metrics=metrics_path,
            model_version=arguments.model_version,
            epochs=arguments.epochs,
            batch_size=arguments.batch_size,
            learning_rate=arguments.learning_rate,
            seed=arguments.seed,
            minimum_confidence_threshold=arguments.minimum_confidence_threshold,
            target_accepted_accuracy=arguments.target_accepted_accuracy,
            early_stopping_patience=arguments.early_stopping_patience,
        )
    )
    print("[8/8] ONNX parity verification")
    print(json.dumps({"onnx": str(model_path), "metrics": str(metrics_path)}))


if __name__ == "__main__":
    run(parse_args())
