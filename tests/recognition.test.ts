import test from 'node:test';
import assert from 'node:assert/strict';
import { INTENT_BY_ID, SUPPORTED_INTENTS } from '../lib/recognition/intents';

test('recognition scope is constrained to 30-50 unique intents', () => {
  assert.ok(SUPPORTED_INTENTS.length >= 30);
  assert.ok(SUPPORTED_INTENTS.length <= 50);
  assert.equal(new Set(SUPPORTED_INTENTS.map((intent) => intent.id)).size, SUPPORTED_INTENTS.length);
});

test('high-stakes intents are explicitly marked for human confirmation', () => {
  assert.equal(INTENT_BY_ID.get('emergency')?.high_stakes, true);
  assert.equal(INTENT_BY_ID.get('pain')?.high_stakes, true);
  assert.equal(INTENT_BY_ID.get('hello')?.high_stakes, false);
});
