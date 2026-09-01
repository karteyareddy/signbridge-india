import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { OfflineOperation } from '../../../lib/offline/shared';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const URGENCY_LEVELS = new Set(['normal', 'high', 'emergency']);
const FEEDBACK_OUTCOMES = new Set(['success', 'failure']);

function isSafeText(value: unknown, maximumLength: number): value is string {
  return typeof value === 'string' && value.length <= maximumLength;
}

function isValidOperation(value: unknown): value is OfflineOperation {
  if (!value || typeof value !== 'object') return false;
  const operation = value as Record<string, unknown>;
  if (!isSafeText(operation.id, 64) || !UUID_PATTERN.test(operation.id)) return false;
  if (!isSafeText(operation.createdAt, 40) || Number.isNaN(Date.parse(operation.createdAt))) return false;
  if (typeof operation.attempts !== 'number' || operation.attempts < 0) return false;
  if (!operation.payload || typeof operation.payload !== 'object') return false;

  const payload = operation.payload as Record<string, unknown>;
  if (!isSafeText(payload.access_point_id, 64) || !UUID_PATTERN.test(payload.access_point_id)) {
    return false;
  }

  if (operation.type === 'assistance') {
    return typeof payload.urgency === 'string' && URGENCY_LEVELS.has(payload.urgency);
  }

  if (operation.type === 'feedback') {
    return (
      typeof payload.outcome === 'string' &&
      FEEDBACK_OUTCOMES.has(payload.outcome) &&
      typeof payload.rating === 'number' &&
      Number.isInteger(payload.rating) &&
      payload.rating >= 1 &&
      payload.rating <= 5 &&
      (payload.phrase_id === undefined ||
        (isSafeText(payload.phrase_id, 64) && UUID_PATTERN.test(payload.phrase_id))) &&
      (payload.comment === undefined || isSafeText(payload.comment, 2000))
    );
  }

  return false;
}

export async function POST(request: Request) {
  let operation: unknown;
  try {
    operation = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidOperation(operation)) {
    return NextResponse.json({ error: 'Invalid offline operation.' }, { status: 400 });
  }

  const supabase = createClient();
  if (operation.type === 'assistance') {
    const { error } = await supabase.from('assistance_requests').upsert(
      {
        id: operation.id,
        access_point_id: operation.payload.access_point_id,
        urgency: operation.payload.urgency,
        status: 'pending',
        created_at: operation.createdAt,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (error) return NextResponse.json({ error: 'Sync temporarily unavailable.' }, { status: 503 });
  } else {
    const { error } = await supabase.from('feedback').upsert(
      {
        id: operation.id,
        access_point_id: operation.payload.access_point_id,
        phrase_id: operation.payload.phrase_id,
        outcome: operation.payload.outcome,
        rating: operation.payload.rating,
        comment: operation.payload.comment,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (error) return NextResponse.json({ error: 'Sync temporarily unavailable.' }, { status: 503 });
  }

  return NextResponse.json({ success: true, operationId: operation.id });
}
