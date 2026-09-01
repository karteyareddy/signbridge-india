import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAccessPointData,
  createAssistanceRequest,
  submitInteractionFeedback,
  DEMO_ACCESS_POINTS,
} from '../lib/access-point/service';

test('QR Token Resolution - Valid Token', async () => {
  const result = await getAccessPointData('hosp-reg-001');

  assert.equal(result.error, null);
  assert.notEqual(result.context, null);
  assert.notEqual(result.pack, null);

  assert.equal(result.context?.institution_name, 'District General Hospital');
  assert.equal(result.context?.service_type, 'registration');
  assert.equal(result.pack?.service_type, 'registration');
  assert.equal(result.source, 'bundled');

  // Verify phrases are loaded
  assert.ok(result.pack!.phrases.length >= 3);
  assert.equal(result.pack!.phrases[0].intent, 'need_appointment');

  // Verify staff responses are loaded
  assert.ok(result.pack!.staff_responses.length >= 2);
  assert.equal(result.pack!.staff_responses[0].intent, 'please_wait');
});

test('QR Token Resolution - Invalid Token', async () => {
  const result = await getAccessPointData('invalid-unknown-qr-999');

  assert.equal(result.context, null);
  assert.equal(result.pack, null);
  assert.notEqual(result.error, null);
  assert.ok(result.error!.includes('not recognized'));
});

test('Human Assistance Escalation Creation', async () => {
  const apId = DEMO_ACCESS_POINTS['hosp-reg-001'].context.id;
  const res = await createAssistanceRequest(apId, 'high');

  assert.equal(res.error, null);
  assert.notEqual(res.request, null);
  assert.equal(res.request?.access_point_id, apId);
  assert.equal(res.request?.urgency, 'high');
  assert.equal(res.request?.status, 'pending');
});

test('Interaction Feedback Submission', async () => {
  const apId = DEMO_ACCESS_POINTS['hosp-reg-001'].context.id;
  const res = await submitInteractionFeedback({
    access_point_id: apId,
    phrase_id: 'p-1',
    outcome: 'success',
    rating: 5,
    comment: 'Counter staff responded quickly with visual phrase.',
  });

  assert.equal(res.error, null);
  assert.equal(res.success, true);
  assert.equal(res.queued, true);
});
