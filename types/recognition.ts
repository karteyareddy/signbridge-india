export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface LandmarkFrame {
  timestamp_ms: number;
  pose: LandmarkPoint[];
  left_hand: LandmarkPoint[] | null;
  right_hand: LandmarkPoint[] | null;
}

export interface SupportedIntent {
  id: string;
  label: string;
  category: string;
  high_stakes: boolean;
}

export type FallbackReason =
  | 'low_confidence'
  | 'insufficient_landmarks'
  | 'invalid_geometry'
  | 'model_unavailable';

export interface RecognitionResponse {
  status: 'accepted' | 'fallback' | 'unavailable';
  intent: string | null;
  confidence: number | null;
  threshold: number;
  model_version: string;
  supported_intent_count: number;
  constrained_scope: true;
  requires_human_confirmation: boolean;
  fallback: {
    reason: FallbackReason;
    message: string;
    actions: Array<'manual_phrase_board' | 'human_assistance'>;
  } | null;
}

export interface RecognitionModelStatus {
  ready: boolean;
  model_version: string;
  threshold: number;
  supported_intent_count: number;
  sequence_length: number;
  feature_count: number;
  error: string | null;
}
