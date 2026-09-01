import { UserRole, PermissionAction, UserProfile, StaffProfile } from '@/types/auth';

/**
 * Role Hierarchy mapping.
 * Higher levels inherit capabilities of lower levels where appropriate,
 * though specialized roles (interpreter vs staff) have distinct operational domains.
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  citizen: 1,
  staff: 2,
  interpreter: 2,
  admin: 3,
};

/**
 * Permission matrix defining explicit capabilities per role.
 */
const PERMISSION_MATRIX: Record<PermissionAction, UserRole[]> = {
  view_public_access: ['citizen', 'staff', 'interpreter', 'admin'],
  view_learning: ['citizen', 'staff', 'interpreter', 'admin'],
  access_staff_dashboard: ['staff', 'admin'],
  access_escalation_queue: ['interpreter', 'admin'],
  access_admin_panel: ['admin'],
  manage_institution_staff: ['staff', 'admin'],
  manage_service_packs: ['admin'],
};

/**
 * Checks whether a given role possesses permission for a specific action.
 */
export function hasPermission(role: UserRole | null | undefined, action: PermissionAction): boolean {
  // Unauthenticated/guest users can access basic public features
  const effectiveRole: UserRole = role || 'citizen';
  const allowedRoles = PERMISSION_MATRIX[action] || [];
  return allowedRoles.includes(effectiveRole);
}

/**
 * Validates if a user role meets or exceeds a target role requirement.
 */
export function isRoleAtLeast(currentRole: UserRole | null | undefined, minRequiredRole: UserRole): boolean {
  if (!currentRole) return false;
  return (ROLE_HIERARCHY[currentRole] || 0) >= (ROLE_HIERARCHY[minRequiredRole] || 0);
}

/**
 * Validates access to an institution's scope.
 * Admin has global access; Staff can access their assigned institution.
 */
export function canAccessInstitution(
  profile: UserProfile | null,
  staffProfile: StaffProfile | null,
  targetInstitutionId: string
): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  if (profile.role === 'staff' && staffProfile) {
    return staffProfile.institution_id === targetInstitutionId;
  }
  return false;
}

/**
 * Determines route accessibility for middleware & server guards.
 */
export function getRouteAccessStatus(
  pathname: string,
  userRole: UserRole | null
): { allowed: boolean; redirectTo?: string; requiredRole?: UserRole } {
  // Public routes (no auth required)
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/access') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/recognize') ||
    pathname.startsWith('/api/public')
  ) {
    return { allowed: true };
  }

  // Require authentication for all protected routes below
  if (!userRole) {
    return { allowed: false, redirectTo: '/login' };
  }

  // Dashboard routes (/dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    if (hasPermission(userRole, 'access_staff_dashboard')) {
      return { allowed: true };
    }
    return { allowed: false, redirectTo: '/access', requiredRole: 'staff' };
  }

  // Escalation routes (/escalate/*)
  if (pathname.startsWith('/escalate')) {
    if (hasPermission(userRole, 'access_escalation_queue')) {
      return { allowed: true };
    }
    return { allowed: false, redirectTo: '/access', requiredRole: 'interpreter' };
  }

  // Admin routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (hasPermission(userRole, 'access_admin_panel')) {
      return { allowed: true };
    }
    return { allowed: false, redirectTo: '/access', requiredRole: 'admin' };
  }

  // Default allow for other authenticated paths
  return { allowed: true };
}
