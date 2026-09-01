import assert from 'node:assert/strict';
import test from 'node:test';
import { RECOGNITION_FALLBACK_ACTIONS } from '../lib/recognition/fallback-actions';

test('recognition fallback exposes only validated manual and human-help actions', () => {
  assert.deepEqual(
    RECOGNITION_FALLBACK_ACTIONS.map((action) => action.label),
    ['Appointment', 'Registration', 'Need help'],
  );
  assert.match(RECOGNITION_FALLBACK_ACTIONS[0].href, /intent=need_appointment$/);
  assert.match(RECOGNITION_FALLBACK_ACTIONS[1].href, /intent=opd_ticket$/);
  assert.match(RECOGNITION_FALLBACK_ACTIONS[2].href, /help=1$/);
});
