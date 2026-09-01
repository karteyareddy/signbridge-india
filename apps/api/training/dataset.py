from __future__ import annotations

import csv
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.intents import SUPPORTED_INTENTS
from app.preprocessing import PREPROCESSING_VERSION, preprocess_landmark_arrays


@dataclass(frozen=True)
class DatasetArrays:
    sequences: np.ndarray
    labels: np.ndarray
    signer_ids: np.ndarray
    clip_ids: np.ndarray


@dataclass(frozen=True)
class SignerSplit:
    train: np.ndarray
    validation: np.ndarray
    test: np.ndarray


@dataclass(frozen=True)
class ManifestRecord:
    clip_id: str
    clip_path: Path
    intent_id: str
    signer_id: str


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_manifest(path: Path) -> list[ManifestRecord]:
    path = path.resolve()
    records: list[ManifestRecord] = []
    with path.open("r", encoding="utf-8-sig", newline="") as manifest_file:
        reader = csv.DictReader(manifest_file)
        required = {
            "clip_id",
            "clip_path",
            "intent_id",
            "signer_id",
            "consent_confirmed",
            "label_reviewed",
        }
        if not reader.fieldnames or not required.issubset(reader.fieldnames):
            raise ValueError(f"Dataset manifest must contain columns: {sorted(required)}.")
        for row_number, row in enumerate(reader, start=2):
            if not all(row.get(field, "").strip() for field in required):
                raise ValueError(f"Manifest row {row_number} has an empty required field.")
            if row["consent_confirmed"].strip().lower() != "true":
                raise ValueError(f"Manifest row {row_number} lacks explicit training consent.")
            if row["label_reviewed"].strip().lower() != "true":
                raise ValueError(f"Manifest row {row_number} has not passed label review.")
            clip_path = (path.parent / row["clip_path"].strip()).resolve()
            records.append(
                ManifestRecord(
                    clip_id=row["clip_id"].strip(),
                    clip_path=clip_path,
                    intent_id=row["intent_id"].strip(),
                    signer_id=row["signer_id"].strip(),
                )
            )

    if not records:
        raise ValueError("Dataset manifest contains no clips.")
    clip_ids = [record.clip_id for record in records]
    if len(clip_ids) != len(set(clip_ids)):
        raise ValueError("Dataset clip IDs must be unique.")
    allowed_intents = {intent.id for intent in SUPPORTED_INTENTS}
    unknown = sorted({record.intent_id for record in records} - allowed_intents)
    if unknown:
        raise ValueError(f"Manifest contains unsupported intent IDs: {unknown}.")
    return records


def _optional_array(archive: np.lib.npyio.NpzFile, key: str) -> np.ndarray | None:
    return archive[key] if key in archive.files else None


def preprocess_manifest(
    manifest_path: Path,
    output_path: Path,
    report_path: Path | None = None,
) -> dict[str, object]:
    """Convert landmark-only clip files into the stable training tensor.

    Each clip NPZ must contain `pose [T,33,3]` and may contain
    `left_hand`, `right_hand`, `left_present`, and `right_present`.
    Raw video is intentionally unsupported.
    """
    records = load_manifest(manifest_path)
    label_by_id = {intent.id: index for index, intent in enumerate(SUPPORTED_INTENTS)}
    sequences: list[np.ndarray] = []
    labels: list[int] = []
    signer_ids: list[str] = []
    clip_ids: list[str] = []
    clip_hashes: dict[str, str] = {}

    for record in records:
        if record.clip_path.suffix.lower() != ".npz":
            raise ValueError(f"Clip {record.clip_id} must be a landmark-only NPZ file.")
        if not record.clip_path.is_file():
            raise FileNotFoundError(f"Clip file not found: {record.clip_path}")
        with np.load(record.clip_path, allow_pickle=False) as archive:
            if "pose" not in archive.files:
                raise ValueError(f"Clip {record.clip_id} is missing the pose array.")
            sequence = preprocess_landmark_arrays(
                pose=archive["pose"],
                left_hand=_optional_array(archive, "left_hand"),
                right_hand=_optional_array(archive, "right_hand"),
                left_present=_optional_array(archive, "left_present"),
                right_present=_optional_array(archive, "right_present"),
            )
        sequences.append(sequence)
        labels.append(label_by_id[record.intent_id])
        signer_ids.append(record.signer_id)
        clip_ids.append(record.clip_id)
        clip_hashes[record.clip_id] = _sha256(record.clip_path)

    duplicate_hashes = sorted(
        digest for digest in set(clip_hashes.values()) if list(clip_hashes.values()).count(digest) > 1
    )
    if duplicate_hashes:
        raise ValueError("Duplicate landmark clips were detected by content hash.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        output_path,
        sequences=np.stack(sequences).astype(np.float32),
        labels=np.asarray(labels, dtype=np.int64),
        signer_ids=np.asarray(signer_ids, dtype=str),
        clip_ids=np.asarray(clip_ids, dtype=str),
        preprocessing_version=np.asarray(PREPROCESSING_VERSION),
    )

    class_counts = {
        intent.id: int(sum(record.intent_id == intent.id for record in records))
        for intent in SUPPORTED_INTENTS
    }
    report = {
        "manifest": str(manifest_path.resolve()),
        "manifest_sha256": _sha256(manifest_path.resolve()),
        "processed_dataset": str(output_path.resolve()),
        "processed_dataset_sha256": _sha256(output_path.resolve()),
        "preprocessing_version": PREPROCESSING_VERSION,
        "sample_count": len(records),
        "signer_count": len({record.signer_id for record in records}),
        "class_count": len(SUPPORTED_INTENTS),
        "class_counts": class_counts,
        "clip_sha256": clip_hashes,
        "contains_raw_video": False,
        "all_training_consent_confirmed": True,
        "all_labels_reviewed": True,
    }
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def load_dataset(path: Path) -> DatasetArrays:
    with np.load(path, allow_pickle=False) as archive:
        sequences = archive["sequences"].astype(np.float32)
        labels = archive["labels"].astype(np.int64)
        signer_ids = archive["signer_ids"].astype(str)
        clip_ids = archive["clip_ids"].astype(str)
        preprocessing_version = str(archive["preprocessing_version"].item())

    if sequences.ndim != 3 or sequences.shape[1:] != (30, 225):
        raise ValueError("Dataset sequences must have shape [samples, 30, 225].")
    expected_vector_shape = (sequences.shape[0],)
    if labels.shape != expected_vector_shape or signer_ids.shape != expected_vector_shape or clip_ids.shape != expected_vector_shape:
        raise ValueError("Labels, signer IDs, and clip IDs must have one value per sample.")
    if preprocessing_version != PREPROCESSING_VERSION:
        raise ValueError(
            f"Dataset preprocessing version {preprocessing_version!r} does not match {PREPROCESSING_VERSION!r}."
        )
    if len(set(clip_ids.tolist())) != clip_ids.size:
        raise ValueError("Processed dataset clip IDs must be unique.")
    return DatasetArrays(sequences=sequences, labels=labels, signer_ids=signer_ids, clip_ids=clip_ids)


def signer_independent_split(signer_ids: np.ndarray, seed: int = 42) -> SignerSplit:
    unique_signers = np.unique(signer_ids)
    if unique_signers.size < 5:
        raise ValueError("At least five distinct signers are required for train/validation/test splits.")

    shuffled = unique_signers.copy()
    np.random.default_rng(seed).shuffle(shuffled)
    test_count = max(1, round(shuffled.size * 0.15))
    validation_count = max(1, round(shuffled.size * 0.15))
    test_signers = set(shuffled[:test_count])
    validation_signers = set(shuffled[test_count : test_count + validation_count])
    train_signers = set(shuffled[test_count + validation_count :])

    if not train_signers:
        raise ValueError("The signer split left no training signers.")

    train = np.flatnonzero(np.isin(signer_ids, list(train_signers)))
    validation = np.flatnonzero(np.isin(signer_ids, list(validation_signers)))
    test = np.flatnonzero(np.isin(signer_ids, list(test_signers)))
    return SignerSplit(train=train, validation=validation, test=test)


def validate_signer_split(dataset: DatasetArrays, split: SignerSplit, class_count: int) -> dict[str, object]:
    partitions = {"train": split.train, "validation": split.validation, "test": split.test}
    signer_sets = {name: set(dataset.signer_ids[indices]) for name, indices in partitions.items()}
    if signer_sets["train"] & signer_sets["validation"] or signer_sets["train"] & signer_sets["test"] or signer_sets["validation"] & signer_sets["test"]:
        raise ValueError("Signer leakage detected between dataset partitions.")

    coverage: dict[str, object] = {}
    all_classes = set(range(class_count))
    for name, indices in partitions.items():
        if indices.size == 0:
            raise ValueError(f"{name.title()} partition is empty.")
        present = set(dataset.labels[indices].tolist())
        missing = sorted(all_classes - present)
        coverage[name] = {
            "samples": int(indices.size),
            "signer_count": len(signer_sets[name]),
            "present_class_count": len(present),
            "missing_class_indices": missing,
        }

    for name in ("train", "validation", "test"):
        missing = coverage[name]["missing_class_indices"]
        if missing:
            raise ValueError(
                f"{name.title()} partition is missing class indices: {missing}. "
                "Every reported partition must cover all constrained classes."
            )
    return {"signer_independent": True, "partitions": coverage}
