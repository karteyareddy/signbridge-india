'use client';

import {
  LandmarkFrame,
  RecognitionModelStatus,
  RecognitionResponse,
} from '../../types/recognition';

const API_URL = (process.env.NEXT_PUBLIC_ML_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getRecognitionModelStatus(): Promise<RecognitionModelStatus> {
  const response = await fetchWithTimeout(`${API_URL}/health`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Recognition service status is unavailable.');
  return (await response.json()) as RecognitionModelStatus;
}

export async function predictSupportedIntent(frames: LandmarkFrame[]): Promise<RecognitionResponse> {
  const response = await fetchWithTimeout(`${API_URL}/api/v1/predict`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ frames }),
  });
  if (!response.ok) {
    throw new Error(response.status === 422 ? 'Landmark sequence validation failed.' : 'Recognition service failed.');
  }
  return (await response.json()) as RecognitionResponse;
}
