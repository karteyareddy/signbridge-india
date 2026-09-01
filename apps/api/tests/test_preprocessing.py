from __future__ import annotations

import unittest

import numpy as np

from app.preprocessing import (
    FEATURE_COUNT,
    SEQUENCE_LENGTH,
    InsufficientLandmarksError,
    preprocess_landmark_arrays,
    preprocess_frames,
)
from app.schemas import Landmark, LandmarkFrame


def make_frame(timestamp: int, include_hand: bool = True) -> LandmarkFrame:
    pose = [Landmark(x=0.5, y=0.5, z=0.0) for _ in range(33)]
    pose[11] = Landmark(x=0.4, y=0.4, z=0.0)
    pose[12] = Landmark(x=0.6, y=0.4, z=0.0)
    hand = [Landmark(x=0.45 + index * 0.001, y=0.3, z=0.0) for index in range(21)]
    return LandmarkFrame(
        timestamp_ms=timestamp,
        pose=pose,
        left_hand=hand if include_hand else None,
        right_hand=None,
    )


class PreprocessingTests(unittest.TestCase):
    def test_normalises_and_resamples_sequence(self) -> None:
        frames = [make_frame(index * 80) for index in range(21)]
        sequence = preprocess_frames(frames)

        self.assertEqual(sequence.shape, (SEQUENCE_LENGTH, FEATURE_COUNT))
        self.assertEqual(sequence.dtype.name, "float32")

    def test_rejects_sequence_without_visible_hands(self) -> None:
        frames = [make_frame(index * 80, include_hand=False) for index in range(21)]
        with self.assertRaises(InsufficientLandmarksError):
            preprocess_frames(frames)

    def test_array_preprocessing_matches_api_frame_preprocessing(self) -> None:
        frames = [make_frame(index * 80) for index in range(21)]
        frame_sequence = preprocess_frames(frames)
        pose = np.asarray(
            [[[point.x, point.y, point.z] for point in frame.pose] for frame in frames],
            dtype=np.float32,
        )
        left_hand = np.asarray(
            [[[point.x, point.y, point.z] for point in frame.left_hand] for frame in frames],
            dtype=np.float32,
        )
        array_sequence = preprocess_landmark_arrays(
            pose,
            left_hand,
            None,
            np.ones(21, dtype=bool),
            None,
        )
        np.testing.assert_allclose(frame_sequence, array_sequence)


if __name__ == "__main__":
    unittest.main()
