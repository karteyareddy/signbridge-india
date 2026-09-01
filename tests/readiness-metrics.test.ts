import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DISTRICT_HOSPITAL_READINESS,
  metricPercent,
} from '../lib/readiness/metrics';

test('readiness snapshot matches the institutional target metrics', () => {
  assert.equal(DISTRICT_HOSPITAL_READINESS.score, 72);
  assert.equal(metricPercent(DISTRICT_HOSPITAL_READINESS.staffTrained), 70);
  assert.equal(metricPercent(DISTRICT_HOSPITAL_READINESS.criticalPhrases), 84);
  assert.deepEqual(DISTRICT_HOSPITAL_READINESS.serviceCoverage, [
    'Registration',
    'Pharmacy',
    'Billing',
  ]);
  assert.equal(DISTRICT_HOSPITAL_READINESS.successfulInteractionsPercent, 91);
  assert.equal(DISTRICT_HOSPITAL_READINESS.assistanceRequests, 2);
  assert.equal(DISTRICT_HOSPITAL_READINESS.nextAction.label, 'Train billing staff');
});

test('metric percentages handle empty and out-of-range counts safely', () => {
  assert.equal(metricPercent({ completed: 1, total: 0 }), 0);
  assert.equal(metricPercent({ completed: 12, total: 10 }), 100);
  assert.equal(metricPercent({ completed: -1, total: 10 }), 0);
});
