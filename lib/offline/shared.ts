import {
  AccessPointContext,
  FeedbackSubmission,
  ServicePackContent,
  UrgencyLevel,
} from '../../types/access-point';

export const OFFLINE_DB_NAME = 'signbridge-offline';
export const OFFLINE_DB_VERSION = 1;
export const SERVICE_PACK_STORE = 'service-packs';
export const OUTBOX_STORE = 'outbox';
export const BACKGROUND_SYNC_TAG = 'signbridge-outbox-sync';

export interface CachedServicePackRecord {
  qrToken: string;
  context: AccessPointContext;
  pack: ServicePackContent;
  mediaUrls: string[];
  cachedAt: string;
}

export type OfflineOperation =
  | {
      id: string;
      type: 'feedback';
      payload: FeedbackSubmission;
      createdAt: string;
      attempts: number;
    }
  | {
      id: string;
      type: 'assistance';
      payload: { access_point_id: string; urgency: UrgencyLevel };
      createdAt: string;
      attempts: number;
    };

export function getServicePackMediaUrls(pack: ServicePackContent): string[] {
  return Array.from(
    new Set(
      [...pack.phrases, ...pack.staff_responses]
        .map((item) => item.isl_asset)
        .filter((url): url is string => Boolean(url))
    )
  );
}

export function buildCachedServicePackRecord(
  qrToken: string,
  context: AccessPointContext,
  pack: ServicePackContent,
  cachedAt = new Date().toISOString()
): CachedServicePackRecord {
  return {
    qrToken,
    context: { ...context, is_offline_cached: true },
    pack,
    mediaUrls: getServicePackMediaUrls(pack),
    cachedAt,
  };
}

export function createOfflineOperation(
  type: 'feedback',
  payload: FeedbackSubmission,
  now?: Date
): OfflineOperation;
export function createOfflineOperation(
  type: 'assistance',
  payload: { access_point_id: string; urgency: UrgencyLevel },
  now?: Date
): OfflineOperation;
export function createOfflineOperation(
  type: OfflineOperation['type'],
  payload: FeedbackSubmission | { access_point_id: string; urgency: UrgencyLevel },
  now = new Date()
): OfflineOperation {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  const id = randomUUID
    ? randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
        const randomValue = Math.floor(Math.random() * 16);
        const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8;
        return value.toString(16);
      });
  return {
    id,
    type,
    payload,
    createdAt: now.toISOString(),
    attempts: 0,
  } as OfflineOperation;
}
