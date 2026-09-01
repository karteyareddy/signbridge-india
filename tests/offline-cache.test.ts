import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCachedServicePackRecord,
  createOfflineOperation,
  getServicePackMediaUrls,
} from '../lib/offline/shared';
import { AccessPointContext, ServicePackContent } from '../types/access-point';

const context: AccessPointContext = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  institution_id: '11111111-1111-1111-1111-111111111111',
  institution_name: 'District Hospital',
  institution_type: 'hospital',
  service_type: 'registration',
  counter_name: 'Registration',
  district: 'Delhi',
  qr_token: 'hospital-registration',
};

const pack: ServicePackContent = {
  id: '44444444-4444-4444-4444-444444444444',
  service_type: 'registration',
  locale: 'en',
  version: 2,
  phrases: [
    {
      id: 'phrase-1',
      intent: 'appointment',
      text: 'I need an appointment.',
      isl_asset: '/media/appointment.mp4',
      category: 'appointment',
    },
  ],
  staff_responses: [
    {
      id: 'response-1',
      intent: 'wait',
      text: 'Please wait.',
      isl_asset: '/media/appointment.mp4',
    },
  ],
};

test('service-pack media list is deduplicated for worker caching', () => {
  assert.deepEqual(getServicePackMediaUrls(pack), ['/media/appointment.mp4']);
});

test('cached service-pack record retains context and cache metadata', () => {
  const cachedAt = '2026-08-13T10:00:00.000Z';
  const record = buildCachedServicePackRecord(context.qr_token, context, pack, cachedAt);

  assert.equal(record.qrToken, context.qr_token);
  assert.equal(record.context.is_offline_cached, true);
  assert.equal(record.pack.version, 2);
  assert.equal(record.cachedAt, cachedAt);
  assert.deepEqual(record.mediaUrls, ['/media/appointment.mp4']);
});

test('offline outbox operations are retryable and timestamped', () => {
  const now = new Date('2026-08-13T10:05:00.000Z');
  const operation = createOfflineOperation(
    'assistance',
    { access_point_id: context.id, urgency: 'high' },
    now
  );

  assert.equal(operation.type, 'assistance');
  assert.equal(operation.createdAt, now.toISOString());
  assert.equal(operation.attempts, 0);
  assert.match(operation.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
