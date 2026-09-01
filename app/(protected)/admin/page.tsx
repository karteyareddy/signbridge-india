'use client';

import { ProtectedRoute } from '../../../components/auth/protected-route';
import { useAuth } from '../../../components/providers/auth-provider';

export default function AdminPage() {
  const { profile } = useAuth();

  return (
    <ProtectedRoute action="access_admin_panel">
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <span className="rounded-full bg-red-600 px-3 py-1 font-semibold text-xs text-white uppercase tracking-wider">
            System Administration
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-red-950">
            Platform Management & Moderation
          </h1>
          <p className="mt-1 text-sm text-red-800">
            Role: <span className="font-semibold">{profile?.role}</span> • Global System Controls
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">System Controls</h2>
          <p className="text-xs text-slate-500 mb-4">Manage service packs, user roles, and model deployment metrics.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-semibold text-slate-900 text-sm">Institution Management</div>
              <div className="text-xs text-slate-500 mt-1">Deploy access points and register institutions.</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-semibold text-slate-900 text-sm">Service Pack Moderation</div>
              <div className="text-xs text-slate-500 mt-1">Review community phrase corrections & versioning.</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
