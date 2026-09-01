'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { AuthSessionState, UserProfile, StaffProfile, UserRole, PermissionAction } from '../../types/auth';
import { hasPermission, isRoleAtLeast } from '../../lib/auth/roles';
import {
  createDemoAuthState,
  DEMO_AUTH_COOKIE,
  DEMO_AUTH_ENABLED,
  DEMO_AUTH_STORAGE_KEY,
  getDemoAccount,
} from '../../lib/auth/demo';

interface AuthContextType extends AuthSessionState {
  signInWithEmail: (email: string) => Promise<{ error: Error | null; method: 'demo' | 'magic_link' }>;
  signOut: () => Promise<{ error: Error | null }>;
  hasPermission: (action: PermissionAction) => boolean;
  isRoleAtLeast: (minRole: UserRole) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthSessionState>({
    user: null,
    profile: null,
    staffProfile: null,
    isLoading: true,
    error: null,
  });

  const supabase = createClient();

  const readStoredDemoAccount = () => {
    if (!DEMO_AUTH_ENABLED || typeof window === 'undefined') return null;
    try {
      const email = window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
      return email ? getDemoAccount(email) : null;
    } catch {
      return null;
    }
  };

  const fetchProfileAndStaff = async (userId: string) => {
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Could not fetch user profile:', profileErr.message);
      }

      const userProfile: UserProfile = profile || {
        id: userId,
        role: 'citizen',
        preferred_language: 'en',
        created_at: new Date().toISOString(),
      };

      let staffProfile: StaffProfile | null = null;
      if (userProfile.role === 'staff' || userProfile.role === 'admin') {
        const { data: staff } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        staffProfile = staff || null;
      }

      return { profile: userProfile, staffProfile };
    } catch (err: any) {
      return {
        profile: {
          id: userId,
          role: 'citizen' as UserRole,
          preferred_language: 'en',
          created_at: new Date().toISOString(),
        },
        staffProfile: null,
      };
    }
  };

  const refreshProfile = async () => {
    if (!state.user?.id) return;
    const { profile, staffProfile } = await fetchProfileAndStaff(state.user.id);
    setState((prev) => ({ ...prev, profile, staffProfile }));
  };

  useEffect(() => {
    const initAuth = async () => {
      const demoAccount = readStoredDemoAccount();
      if (demoAccount) {
        setState(createDemoAuthState(demoAccount));
        return;
      }
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { profile, staffProfile } = await fetchProfileAndStaff(session.user.id);
          setState({
            user: { id: session.user.id, email: session.user.email },
            profile,
            staffProfile,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            profile: null,
            staffProfile: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to initialize authentication',
        }));
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const demoAccount = readStoredDemoAccount();
      if (demoAccount) {
        setState(createDemoAuthState(demoAccount));
        return;
      }
      if (session?.user) {
        const { profile, staffProfile } = await fetchProfileAndStaff(session.user.id);
        setState({
          user: { id: session.user.id, email: session.user.email },
          profile,
          staffProfile,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          profile: null,
          staffProfile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    const demoAccount = DEMO_AUTH_ENABLED ? getDemoAccount(email) : null;
    if (demoAccount) {
      try {
        window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, demoAccount.email);
        document.cookie = `${DEMO_AUTH_COOKIE}=${demoAccount.role}; Path=/; Max-Age=28800; SameSite=Lax`;
        setState(createDemoAuthState(demoAccount));
        return { error: null, method: 'demo' as const };
      } catch {
        return { error: new Error('Local demo storage is unavailable in this browser.'), method: 'demo' as const };
      }
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error, method: 'magic_link' as const };
    } catch (err: any) {
      return { error: err as Error, method: 'magic_link' as const };
    }
  };

  const signOut = async () => {
    const demoAccount = readStoredDemoAccount();
    if (demoAccount) {
      window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
      document.cookie = `${DEMO_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
      setState({ user: null, profile: null, staffProfile: null, isLoading: false, error: null });
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const checkPermission = (action: PermissionAction) => {
    return hasPermission(state.profile?.role, action);
  };

  const checkRoleAtLeast = (minRole: UserRole) => {
    return isRoleAtLeast(state.profile?.role, minRole);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithEmail,
        signOut,
        hasPermission: checkPermission,
        isRoleAtLeast: checkRoleAtLeast,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
