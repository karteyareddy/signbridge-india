from __future__ import annotations

import unittest

import numpy as np

from training.dataset import signer_independent_split
from training.metrics import calibrate_threshold, rejection_metrics


class SignerSplitTests(unittest.TestCase):
    def test_signers_never_cross_partitions(self) -> None:
        signer_ids = np.asarray([f"signer-{index // 3}" for index in range(30)])
        split = signer_independent_split(signer_ids, seed=7)

        train_signers = set(signer_ids[split.train])
        validation_signers = set(signer_ids[split.validation])
        test_signers = set(signer_ids[split.test])
        self.assertTrue(train_signers)
        self.assertTrue(validation_signers)
        self.assertTrue(test_signers)
        self.assertTrue(train_signers.isdisjoint(validation_signers))
        self.assertTrue(train_signers.isdisjoint(test_signers))
        self.assertTrue(validation_signers.isdisjoint(test_signers))

    def test_rejection_metrics_count_false_accepts(self) -> None:
        metrics = rejection_metrics(
            labels=np.asarray([0, 1, 2, 3]),
            predictions=np.asarray([0, 0, 2, 1]),
            confidences=np.asarray([0.95, 0.90, 0.70, 0.40]),
            threshold=0.85,
        )
        self.assertEqual(metrics["rejection_rate"], 0.5)
        self.assertEqual(metrics["false_accept_rate"], 0.5)
        self.assertEqual(metrics["accepted_accuracy"], 0.5)

    def test_threshold_calibration_never_drops_below_safety_floor(self) -> None:
        calibrated = calibrate_threshold(
            labels=np.asarray([0, 1, 2, 3]),
            predictions=np.asarray([0, 1, 0, 3]),
            confidences=np.asarray([0.95, 0.90, 0.86, 0.70]),
            minimum_threshold=0.85,
            target_accepted_accuracy=0.90,
        )
        self.assertGreaterEqual(calibrated["threshold"], 0.85)
        self.assertTrue(calibrated["target_met"])

    def test_split_validation_rejects_missing_class_coverage(self) -> None:
        from training.dataset import DatasetArrays, SignerSplit, validate_signer_split

        dataset = DatasetArrays(
            sequences=np.zeros((6, 30, 225), dtype=np.float32),
            labels=np.asarray([0, 1, 0, 1, 0, 1]),
            signer_ids=np.asarray(["a", "a", "b", "b", "c", "c"]),
            clip_ids=np.asarray([f"clip-{index}" for index in range(6)]),
        )
        split = SignerSplit(
            train=np.asarray([0, 1]),
            validation=np.asarray([2, 3]),
            test=np.asarray([4, 5]),
        )
        with self.assertRaisesRegex(ValueError, "missing class indices"):
            validate_signer_split(dataset, split, class_count=3)


if __name__ == "__main__":
    unittest.main()
