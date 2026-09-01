import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDemoAuthState,
  getDemoAccount,
  isSafeLocalRedirect,
} from '../lib/auth/demo';

test('demo emails map to their constrained local roles', () => {
  const staff = getDemoAccount('STAFF@signbridge.local');
  assert.equal(staff?.role, 'staff');
  assert.equal(createDemoAuthState(staff!).profile?.role, 'staff');
  assert.equal(getDemoAccount('unknown@example.com'), null);
});

test('demo redirect accepts local paths and rejects external or protocol-relative URLs', () => {
  assert.equal(isSafeLocalRedirect('/practice/lesson-1'), true);
  assert.equal(isSafeLocalRedirect('//example.com/steal'), false);
  assert.equal(isSafeLocalRedirect('https://example.com'), false);
});
