export type UserRole = 'citizen' | 'staff' | 'interpreter' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  preferred_language: string;
  accessibility_preferences?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
    fontSize?: 'normal' | 'large' | 'xlarge';
  } | null;
  created_at: string;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  institution_id: string;
  role: string; // e.g. 'receptionist', 'nurse'
  training_level: number;
  badge?: string | null;
}

export interface AuthSessionState {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: UserProfile | null;
  staffProfile: StaffProfile | null;
  isLoading: boolean;
  error: string | null;
}

export type PermissionAction =
  | 'view_public_access'
  | 'view_learning'
  | 'access_staff_dashboard'
  | 'access_escalation_queue'
  | 'access_admin_panel'
  | 'manage_institution_staff'
  | 'manage_service_packs';
