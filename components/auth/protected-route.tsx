'use client';

import React from 'react';
import { useAuth } from '../providers/auth-provider';
import { PermissionAction, UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  action?: PermissionAction;
  minRole?: UserRole;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  action,
  minRole,
  fallback,
}: ProtectedRouteProps) {
  const { isLoading, profile, hasPermission, isRoleAtLeast } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6 text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span>Verifying authentication & permissions...</span>
        </div>
      </div>
    );
  }

  let isAuthorized = true;

  if (action && !hasPermission(action)) {
    isAuthorized = false;
  }

  if (minRole && !isRoleAtLeast(minRole)) {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="mx-auto my-8 max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <div className="mb-2 text-lg font-semibold text-red-800">Access Restricted</div>
        <p className="mb-4 text-sm text-red-600">
          Your current account role (
          <span className="font-mono font-medium">{profile?.role || 'unauthenticated'}</span>
          ) does not have authorization to view this resource.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
        >
          Sign In as Authorized User
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
