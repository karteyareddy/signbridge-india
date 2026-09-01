'use client';

import type {
  Category,
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
  PoseLandmarker,
} from '@mediapipe/tasks-vision';
import { LandmarkFrame, LandmarkPoint } from '../../types/recognition';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const HAND_MODEL =
  process.env.NEXT_PUBLIC_MEDIAPIPE_HAND_MODEL ||
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const POSE_MODEL =
  process.env.NEXT_PUBLIC_MEDIAPIPE_POSE_MODEL ||
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

function toPoints(landmarks: NormalizedLandmark[] | undefined): LandmarkPoint[] | null {
  if (!landmarks) return null;
  return landmarks.map(({ x, y, z }) => ({ x, y, z }));
}

function handednessLabel(categories: Category[] | undefined): 'left' | 'right' | null {
  const label = categories?.[0]?.categoryName?.toLowerCase();
  if (label === 'left' || label === 'right') return label;
  return null;
}

function splitHands(result: HandLandmarkerResult): {
  left: LandmarkPoint[] | null;
  right: LandmarkPoint[] | null;
} {
  let left: LandmarkPoint[] | null = null;
  let right: LandmarkPoint[] | null = null;
  result.landmarks.forEach((landmarks, index) => {
    const points = toPoints(landmarks);
    const side = handednessLabel(result.handedness[index]);
    if (side === 'left') left = points;
    if (side === 'right') right = points;
  });
  return { left, right };
}

export interface LandmarkExtractor {
  extract(video: HTMLVideoElement, timestamp: number): LandmarkFrame | null;
  close(): void;
}

export async function createLandmarkExtractor(): Promise<LandmarkExtractor> {
  const { FilesetResolver, HandLandmarker, PoseLandmarker } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const [handLandmarker, poseLandmarker] = await Promise.all([
    HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: HAND_MODEL },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    }),
    PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: POSE_MODEL },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      outputSegmentationMasks: false,
    }),
  ]);

  return {
    extract(video: HTMLVideoElement, timestamp: number): LandmarkFrame | null {
      const poseResult = poseLandmarker.detectForVideo(video, timestamp);
      const pose = toPoints(poseResult.landmarks[0]);
      if (!pose || pose.length !== 33) return null;

      const hands = splitHands(handLandmarker.detectForVideo(video, timestamp));
      return {
        timestamp_ms: Math.round(timestamp),
        pose,
        left_hand: hands.left,
        right_hand: hands.right,
      };
    },
    close() {
      handLandmarker.close();
      poseLandmarker.close();
    },
  };
}

export function drawLandmarkOverlay(canvas: HTMLCanvasElement, frame: LandmarkFrame): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const draw = (points: LandmarkPoint[] | null, color: string, radius: number) => {
    if (!points) return;
    context.fillStyle = color;
    for (const point of points) {
      context.beginPath();
      context.arc(point.x * canvas.width, point.y * canvas.height, radius, 0, Math.PI * 2);
      context.fill();
    }
  };
  draw(frame.pose, '#67e8f9', 2);
  draw(frame.left_hand, '#fbbf24', 4);
  draw(frame.right_hand, '#a78bfa', 4);
}
