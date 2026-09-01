import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSISTANCE_STATUSES,
  assistanceActionLabel,
  canTransitionAssistanceStatus,
  nextAssistanceStatus,
} from '../lib/assistance/lifecycle';

test('assistance lifecycle follows request, accept, in-progress, resolved order', () => {
  assert.deepEqual(ASSISTANCE_STATUSES, ['pending', 'accepted', 'in_progress', 'resolved']);
  assert.equal(nextAssistanceStatus('pending'), 'accepted');
  assert.equal(nextAssistanceStatus('accepted'), 'in_progress');
  assert.equal(nextAssistanceStatus('in_progress'), 'resolved');
  assert.equal(nextAssistanceStatus('resolved'), null);
});

test('assistance lifecycle rejects skipped and backward transitions', () => {
  assert.equal(canTransitionAssistanceStatus('pending', 'resolved'), false);
  assert.equal(canTransitionAssistanceStatus('accepted', 'pending'), false);
  assert.equal(canTransitionAssistanceStatus('pending', 'accepted'), true);
  assert.equal(assistanceActionLabel('resolved'), null);
});
