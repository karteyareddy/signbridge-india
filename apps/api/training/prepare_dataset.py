from __future__ import annotations

import argparse
import json
from pathlib import Path

from training.dataset import preprocess_manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Preprocess landmark-only clips for the constrained ISL model."
    )
    parser.add_argument(
        "manifest",
        type=Path,
        help="CSV with clip_id, clip_path, intent_id, signer_id, consent_confirmed, label_reviewed.",
    )
    parser.add_argument("--output", type=Path, default=Path("data/processed/dataset.npz"))
    parser.add_argument("--report", type=Path, default=Path("data/processed/dataset_report.json"))
    return parser.parse_args()


if __name__ == "__main__":
    arguments = parse_args()
    result = preprocess_manifest(arguments.manifest, arguments.output, arguments.report)
    print(json.dumps(result, indent=2))
