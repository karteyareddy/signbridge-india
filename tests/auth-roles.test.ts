import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasPermission,
  isRoleAtLeast,
  canAccessInstitution,
  getRouteAccessStatus,
} from '../lib/auth/roles';
import { UserRole, UserProfile, StaffProfile } from '../types/auth';

test('Permission Matrix Verification', () => {
  // Public access permissions
  assert.equal(hasPermission('citizen', 'view_public_access'), true);
  assert.equal(hasPermission(null, 'view_public_access'), true);

  // Staff Dashboard permissions
  assert.equal(hasPermission('citizen', 'access_staff_dashboard'), false);
  assert.equal(hasPermission('interpreter', 'access_staff_dashboard'), false);
  assert.equal(hasPermission('staff', 'access_staff_dashboard'), true);
  assert.equal(hasPermission('admin', 'access_staff_dashboard'), true);

  // Escalation Queue permissions
  assert.equal(hasPermission('citizen', 'access_escalation_queue'), false);
  assert.equal(hasPermission('staff', 'access_escalation_queue'), false);
  assert.equal(hasPermission('interpreter', 'access_escalation_queue'), true);
  assert.equal(hasPermission('admin', 'access_escalation_queue'), true);

  // Admin Panel permissions
  assert.equal(hasPermission('citizen', 'access_admin_panel'), false);
  assert.equal(hasPermission('staff', 'access_admin_panel'), false);
  assert.equal(hasPermission('interpreter', 'access_admin_panel'), false);
  assert.equal(hasPermission('admin', 'access_admin_panel'), true);
});

test('Role Hierarchy Checks', () => {
  assert.equal(isRoleAtLeast('citizen', 'citizen'), true);
  assert.equal(isRoleAtLeast('citizen', 'staff'), false);
  assert.equal(isRoleAtLeast('staff', 'citizen'), true);
  assert.equal(isRoleAtLeast('admin', 'staff'), true);
  assert.equal(isRoleAtLeast(null, 'citizen'), false);
});

test('Institution Access Control', () => {
  const targetInst = 'inst-hospital-123';
  const otherInst = 'inst-college-999';

  const adminProfile: UserProfile = {
    id: 'usr-admin',
    role: 'admin',
    preferred_language: 'en',
    created_at: new Date().toISOString(),
  };

  const staffProfile: UserProfile = {
    id: 'usr-staff',
    role: 'staff',
    preferred_language: 'en',
    created_at: new Date().toISOString(),
  };

  const staffDetail: StaffProfile = {
    id: 'stf-1',
    user_id: 'usr-staff',
    institution_id: targetInst,
    role: 'receptionist',
    training_level: 1,
  };

  const citizenProfile: UserProfile = {
    id: 'usr-citizen',
    role: 'citizen',
    preferred_language: 'en',
    created_at: new Date().toISOString(),
  };

  // Admin has global access
  assert.equal(canAccessInstitution(adminProfile, null, targetInst), true);
  assert.equal(canAccessInstitution(adminProfile, null, otherInst), true);

  // Staff can only access their assigned institution
  assert.equal(canAccessInstitution(staffProfile, staffDetail, targetInst), true);
  assert.equal(canAccessInstitution(staffProfile, staffDetail, otherInst), false);

  // Citizen has no staff institution access
  assert.equal(canAccessInstitution(citizenProfile, null, targetInst), false);
  assert.equal(canAccessInstitution(null, null, targetInst), false);
});

test('Route Guard Security Checks', () => {
  // Public Access Point (/access) - Accessible to everyone including unauthenticated
  assert.equal(getRouteAccessStatus('/access', null).allowed, true);
  assert.equal(getRouteAccessStatus('/access', 'citizen').allowed, true);
  assert.equal(getRouteAccessStatus('/recognize', null).allowed, true);

  // Unauthenticated user attempting protected routes
  assert.equal(getRouteAccessStatus('/dashboard', null).allowed, false);
  assert.equal(getRouteAccessStatus('/dashboard', null).redirectTo, '/login');

  assert.equal(getRouteAccessStatus('/escalate', null).allowed, false);
  assert.equal(getRouteAccessStatus('/admin', null).allowed, false);

  // Citizen attempting protected routes -> Rejected
  assert.equal(getRouteAccessStatus('/dashboard', 'citizen').allowed, false);
  assert.equal(getRouteAccessStatus('/escalate', 'citizen').allowed, false);
  assert.equal(getRouteAccessStatus('/admin', 'citizen').allowed, false);

  // Staff attempting protected routes -> Dashboard allowed, Escalation/Admin rejected
  assert.equal(getRouteAccessStatus('/dashboard', 'staff').allowed, true);
  assert.equal(getRouteAccessStatus('/escalate', 'staff').allowed, false);
  assert.equal(getRouteAccessStatus('/admin', 'staff').allowed, false);

  // Interpreter attempting protected routes -> Escalation allowed, Dashboard/Admin rejected
  assert.equal(getRouteAccessStatus('/dashboard', 'interpreter').allowed, false);
  assert.equal(getRouteAccessStatus('/escalate', 'interpreter').allowed, true);
  assert.equal(getRouteAccessStatus('/admin', 'interpreter').allowed, false);

  // Admin attempting protected routes -> Everything allowed
  assert.equal(getRouteAccessStatus('/dashboard', 'admin').allowed, true);
  assert.equal(getRouteAccessStatus('/escalate', 'admin').allowed, true);
  assert.equal(getRouteAccessStatus('/admin', 'admin').allowed, true);
});
