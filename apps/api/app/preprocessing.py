from __future__ import annotations

import math

import numpy as np

from .schemas import LandmarkFrame

POSE_LANDMARK_COUNT = 33
HAND_LANDMARK_COUNT = 21
LANDMARK_COMPONENTS = 3
FEATURE_COUNT = (POSE_LANDMARK_COUNT + 2 * HAND_LANDMARK_COUNT) * LANDMARK_COMPONENTS
SEQUENCE_LENGTH = 30
MIN_SEQUENCE_LENGTH = 21
MIN_SHOULDER_DISTANCE = 1e-4


class PreprocessingError(ValueError):
    reason = "invalid_geometry"


class InsufficientLandmarksError(PreprocessingError):
    reason = "insufficient_landmarks"


class InvalidGeometryError(PreprocessingError):
    reason = "invalid_geometry"


PREPROCESSING_VERSION = "torso-v1"


def _resample_sequence(sequence: np.ndarray, target_length: int = SEQUENCE_LENGTH) -> np.ndarray:
    if sequence.shape[0] == target_length:
        return sequence.astype(np.float32, copy=False)

    positions = np.linspace(0, sequence.shape[0] - 1, target_length, dtype=np.float32)
    lower = np.floor(positions).astype(np.int64)
    upper = np.ceil(positions).astype(np.int64)
    weights = (positions - lower).reshape(-1, 1)
    return ((1.0 - weights) * sequence[lower] + weights * sequence[upper]).astype(np.float32)


def preprocess_landmark_arrays(
    pose: np.ndarray,
    left_hand: np.ndarray | None,
    right_hand: np.ndarray | None,
    left_present: np.ndarray | None = None,
    right_present: np.ndarray | None = None,
) -> np.ndarray:
    """Apply the exact inference transform to a landmark-only clip.

    Inputs contain no images or video. Presence masks distinguish a missing hand
    from a hand whose normalized coordinates happen to contain zeros.
    """
    pose = np.asarray(pose, dtype=np.float32)
    if pose.ndim != 3 or pose.shape[1:] != (POSE_LANDMARK_COUNT, LANDMARK_COMPONENTS):
        raise InvalidGeometryError("Pose landmarks must have shape [frames, 33, 3].")
    frame_count = pose.shape[0]
    if not MIN_SEQUENCE_LENGTH <= frame_count <= SEQUENCE_LENGTH:
        raise InsufficientLandmarksError("A sequence must contain 21 to 30 frames.")
    if not np.isfinite(pose).all():
        raise InvalidGeometryError("Pose landmarks must contain finite values.")

    hand_shape = (frame_count, HAND_LANDMARK_COUNT, LANDMARK_COMPONENTS)

    def prepare_hand(
        hand: np.ndarray | None,
        presence: np.ndarray | None,
        side: str,
    ) -> tuple[np.ndarray, np.ndarray]:
        if hand is None:
            values = np.zeros(hand_shape, dtype=np.float32)
            mask = np.zeros(frame_count, dtype=bool)
        else:
            values = np.asarray(hand, dtype=np.float32)
            if values.shape != hand_shape:
                raise InvalidGeometryError(f"{side} hand landmarks must have shape [frames, 21, 3].")
            mask = (
                np.ones(frame_count, dtype=bool)
                if presence is None
                else np.asarray(presence, dtype=bool)
            )
            if mask.shape != (frame_count,):
                raise InvalidGeometryError(f"{side} hand presence mask must have shape [frames].")
            if mask.any() and not np.isfinite(values[mask]).all():
                raise InvalidGeometryError(f"Visible {side} hand landmarks must contain finite values.")
            values = values.copy()
            values[~mask] = 0.0
        return values, mask

    left_values, left_mask = prepare_hand(left_hand, left_present, "Left")
    right_values, right_mask = prepare_hand(right_hand, right_present, "Right")
    visible_frames = left_mask | right_mask
    if int(visible_frames.sum()) < math.ceil(frame_count * 0.6):
        raise InsufficientLandmarksError("Hands were not visible in enough frames.")

    shoulders = pose[:, [11, 12], :]
    centers = shoulders.mean(axis=1)
    scales = np.linalg.norm(shoulders[:, 0, :] - shoulders[:, 1, :], axis=1)
    if np.any(scales < MIN_SHOULDER_DISTANCE) or not np.isfinite(scales).all():
        raise InvalidGeometryError("Shoulder landmarks are too close to normalise safely.")

    pose_normalized = (pose - centers[:, None, :]) / scales[:, None, None]

    def normalize_hand(values: np.ndarray, mask: np.ndarray) -> np.ndarray:
        normalized = np.zeros_like(values, dtype=np.float32)
        normalized[mask] = (
            values[mask] - centers[mask, None, :]
        ) / scales[mask, None, None]
        return normalized

    left_normalized = normalize_hand(left_values, left_mask)
    right_normalized = normalize_hand(right_values, right_mask)
    flattened = np.concatenate(
        (
            pose_normalized.reshape(frame_count, -1),
            left_normalized.reshape(frame_count, -1),
            right_normalized.reshape(frame_count, -1),
        ),
        axis=1,
    ).astype(np.float32)
    if flattened.shape != (frame_count, FEATURE_COUNT) or not np.isfinite(flattened).all():
        raise InvalidGeometryError("Normalised landmark features are invalid.")

    sequence = _resample_sequence(flattened)
    if sequence.shape != (SEQUENCE_LENGTH, FEATURE_COUNT):
        raise InvalidGeometryError("Preprocessed sequence has an unexpected shape.")
    return sequence


def preprocess_frames(frames: list[LandmarkFrame]) -> np.ndarray:
    pose = np.asarray(
        [[[point.x, point.y, point.z] for point in frame.pose] for frame in frames],
        dtype=np.float32,
    )

    def hand_arrays(side: str) -> tuple[np.ndarray, np.ndarray]:
        values = np.zeros((len(frames), HAND_LANDMARK_COUNT, LANDMARK_COMPONENTS), dtype=np.float32)
        presence = np.zeros(len(frames), dtype=bool)
        for index, frame in enumerate(frames):
            hand = frame.left_hand if side == "left" else frame.right_hand
            if hand is not None:
                values[index] = np.asarray([[point.x, point.y, point.z] for point in hand], dtype=np.float32)
                presence[index] = True
        return values, presence

    left_hand, left_present = hand_arrays("left")
    right_hand, right_present = hand_arrays("right")
    return preprocess_landmark_arrays(
        pose,
        left_hand,
        right_hand,
        left_present,
        right_present,
    )
