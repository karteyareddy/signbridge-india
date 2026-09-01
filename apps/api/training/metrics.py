from __future__ import annotations

import numpy as np


def confusion_matrix(labels: np.ndarray, predictions: np.ndarray, class_count: int) -> np.ndarray:
    matrix = np.zeros((class_count, class_count), dtype=np.int64)
    for label, prediction in zip(labels, predictions):
        matrix[int(label), int(prediction)] += 1
    return matrix


def classification_metrics(
    labels: np.ndarray,
    predictions: np.ndarray,
    class_count: int,
    class_names: list[str] | None = None,
) -> dict[str, object]:
    if labels.shape != predictions.shape or labels.ndim != 1:
        raise ValueError("Labels and predictions must be equal-length vectors.")
    if labels.size == 0:
        raise ValueError("Metrics require at least one sample.")
    names = class_names or [str(index) for index in range(class_count)]
    if len(names) != class_count:
        raise ValueError("Class names must match the class count.")
    matrix = confusion_matrix(labels, predictions, class_count)
    recalls: list[float] = []
    precisions: list[float] = []
    f1_scores: list[float] = []
    per_class: list[dict[str, object]] = []
    for class_index in range(class_count):
        true_positive = float(matrix[class_index, class_index])
        false_negative = float(matrix[class_index, :].sum() - true_positive)
        false_positive = float(matrix[:, class_index].sum() - true_positive)
        recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 0.0
        precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        recalls.append(recall)
        precisions.append(precision)
        f1_scores.append(f1)
        per_class.append(
            {
                "class_index": class_index,
                "intent_id": names[class_index],
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "support": int(matrix[class_index, :].sum()),
            }
        )

    return {
        "accuracy": float((labels == predictions).mean()),
        "macro_precision": float(np.mean(precisions)),
        "macro_recall": float(np.mean(recalls)),
        "macro_f1": float(np.mean(f1_scores)),
        "per_class_recall": recalls,
        "per_class": per_class,
        "confusion_matrix": matrix.tolist(),
    }


def rejection_metrics(
    labels: np.ndarray,
    predictions: np.ndarray,
    confidences: np.ndarray,
    threshold: float,
) -> dict[str, float]:
    accepted = confidences >= threshold
    rejected = ~accepted
    incorrect = predictions != labels
    correct = ~incorrect
    accepted_count = int(accepted.sum())
    incorrect_count = int(incorrect.sum())
    return {
        "threshold": float(threshold),
        "rejection_rate": float(rejected.mean()),
        "false_accept_rate": float((accepted & incorrect).sum() / incorrect_count) if incorrect_count else 0.0,
        "accepted_accuracy": float((accepted & correct).sum() / accepted_count) if accepted_count else 0.0,
        "coverage": float(accepted.mean()),
    }


def calibrate_threshold(
    labels: np.ndarray,
    predictions: np.ndarray,
    confidences: np.ndarray,
    minimum_threshold: float = 0.85,
    target_accepted_accuracy: float = 0.90,
) -> dict[str, float | bool]:
    """Select a threshold using validation signers only.

    The lowest threshold meeting the target accepted accuracy is selected to
    preserve coverage. If none qualifies, 0.99 is used as a conservative
    fail-closed threshold. The configured safety floor is never lowered.
    """
    if labels.shape != predictions.shape or labels.shape != confidences.shape:
        raise ValueError("Threshold calibration inputs must have identical shapes.")
    if labels.size == 0:
        raise ValueError("Threshold calibration requires validation samples.")
    if not 0.5 <= minimum_threshold <= 0.99:
        raise ValueError("Minimum threshold must be between 0.50 and 0.99.")
    if not 0.5 <= target_accepted_accuracy <= 1.0:
        raise ValueError("Target accepted accuracy must be between 0.50 and 1.00.")

    thresholds = np.unique(
        np.concatenate(
            (
                np.linspace(minimum_threshold, 0.99, 29, dtype=np.float64),
                confidences[(confidences >= minimum_threshold) & (confidences <= 0.99)],
            )
        )
    )
    candidates: list[dict[str, float]] = []
    for threshold in np.sort(thresholds):
        metrics = rejection_metrics(labels, predictions, confidences, float(threshold))
        if metrics["coverage"] > 0 and metrics["accepted_accuracy"] >= target_accepted_accuracy:
            candidates.append(metrics)

    if candidates:
        selected = max(candidates, key=lambda item: (item["coverage"], -item["threshold"]))
        return {
            **selected,
            "target_accepted_accuracy": target_accepted_accuracy,
            "target_met": True,
        }

    selected = rejection_metrics(labels, predictions, confidences, 0.99)
    return {
        **selected,
        "target_accepted_accuracy": target_accepted_accuracy,
        "target_met": False,
    }
