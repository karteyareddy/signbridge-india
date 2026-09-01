from __future__ import annotations

import csv
import tempfile
import unittest
from pathlib import Path

import numpy as np

from training.dataset import load_dataset, preprocess_manifest


class DatasetPipelineTests(unittest.TestCase):
    def test_manifest_preprocessing_emits_auditable_landmark_dataset(self) -> None:
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as temporary:
            root = Path(temporary)
            clip_path = root / "clip.npz"
            pose = np.full((21, 33, 3), 0.5, dtype=np.float32)
            pose[:, 11, :] = np.asarray([0.4, 0.4, 0.0])
            pose[:, 12, :] = np.asarray([0.6, 0.4, 0.0])
            hand = np.full((21, 21, 3), 0.45, dtype=np.float32)
            np.savez_compressed(clip_path, pose=pose, left_hand=hand)

            manifest_path = root / "manifest.csv"
            with manifest_path.open("w", encoding="utf-8", newline="") as manifest_file:
                writer = csv.DictWriter(
                    manifest_file,
                    fieldnames=[
                        "clip_id",
                        "clip_path",
                        "intent_id",
                        "signer_id",
                        "consent_confirmed",
                        "label_reviewed",
                    ],
                )
                writer.writeheader()
                writer.writerow(
                    {
                        "clip_id": "clip-1",
                        "clip_path": "clip.npz",
                        "intent_id": "hello",
                        "signer_id": "signer-1",
                        "consent_confirmed": "true",
                        "label_reviewed": "true",
                    }
                )

            output_path = root / "processed.npz"
            report = preprocess_manifest(manifest_path, output_path)
            dataset = load_dataset(output_path)

            self.assertEqual(dataset.sequences.shape, (1, 30, 225))
            self.assertEqual(dataset.clip_ids.tolist(), ["clip-1"])
            self.assertEqual(report["contains_raw_video"], False)
            self.assertEqual(report["all_training_consent_confirmed"], True)

    def test_manifest_rejects_missing_training_consent(self) -> None:
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as temporary:
            root = Path(temporary)
            manifest_path = root / "manifest.csv"
            manifest_path.write_text(
                "clip_id,clip_path,intent_id,signer_id,consent_confirmed,label_reviewed\n"
                "clip-1,clip.npz,hello,signer-1,false,true\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "explicit training consent"):
                preprocess_manifest(manifest_path, root / "processed.npz")


if __name__ == "__main__":
    unittest.main()
