import { AuthSessionState, StaffProfile, UserProfile, UserRole } from '../../types/auth';

export const DEMO_AUTH_COOKIE = 'signbridge-demo-role';
export const DEMO_AUTH_STORAGE_KEY = 'signbridge-demo-session';
export const DEMO_AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true';

export interface DemoAccount {
  email: string;
  role: Extract<UserRole, 'staff' | 'interpreter' | 'admin'>;
  label: string;
  destination: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'staff@signbridge.local', role: 'staff', label: 'Hospital staff', destination: '/dashboard' },
  { email: 'interpreter@signbridge.local', role: 'interpreter', label: 'ISL operator', destination: '/escalate' },
  { email: 'admin@signbridge.local', role: 'admin', label: 'Administrator', destination: '/admin' },
];

export function getDemoAccount(email: string): DemoAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((account) => account.email === normalizedEmail) ?? null;
}

export function createDemoAuthState(account: DemoAccount): AuthSessionState {
  const idByRole: Record<DemoAccount['role'], string> = {
    staff: '10000000-0000-4000-8000-000000000001',
    interpreter: '10000000-0000-4000-8000-000000000002',
    admin: '10000000-0000-4000-8000-000000000003',
  };
  const userId = idByRole[account.role];
  const profile: UserProfile = {
    id: userId,
    role: account.role,
    preferred_language: 'en',
    created_at: new Date(0).toISOString(),
  };
  const staffProfile: StaffProfile | null = account.role === 'staff' || account.role === 'admin'
    ? {
        id: `demo-${account.role}`,
        user_id: userId,
        institution_id: 'District General Hospital',
        role: account.role === 'admin' ? 'administrator' : 'frontline_staff',
        training_level: 1,
      }
    : null;

  return {
    user: { id: userId, email: account.email },
    profile,
    staffProfile,
    isLoading: false,
    error: null,
  };
}

export function isSafeLocalRedirect(value: string | null): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//'));
}
