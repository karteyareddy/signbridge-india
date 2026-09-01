'use client';

import { useAuth } from '../components/providers/auth-provider';

export default function HomePage() {
  const { user, profile, isLoading, signOut } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          SIGNBRIDGE INDIA
        </h1>
        <p className="mt-2 max-w-2xl text-indigo-100">
          A Deaf-First Accessibility Network for Indian Sign Language. Connecting citizens, frontline staff, and services.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="/learn"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-950 shadow hover:bg-indigo-50 transition"
          >
            Start Learning ISL
          </a>
          <a
            href="/recognize"
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur hover:bg-white/20 transition"
          >
            Try Constrained Recognition
          </a>
          <a
            href="/access"
            className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 shadow hover:bg-teal-400 transition"
          >
            Try Access Point (No Login Needed)
          </a>
          {!user ? (
            <a
              href="/login"
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              Sign In / Select Role
            </a>
          ) : (
            <button
              onClick={() => signOut()}
              className="rounded-xl border border-red-300/40 bg-red-500/20 px-5 py-3 font-semibold text-red-200 hover:bg-red-500/30 transition"
            >
              Sign Out
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Current Authentication & Session State</h2>
        {isLoading ? (
          <div className="mt-4 text-sm text-slate-500">Checking auth session...</div>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Authenticated:</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {user ? 'Yes' : 'No (Anonymous Citizen)'}
              </span>
            </div>
            {user && (
              <>
                <div>
                  <span className="font-semibold text-slate-700">User ID:</span>{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{user.id}</code>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Active Role:</span>{' '}
                  <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono font-medium text-indigo-800">
                    {profile?.role || 'citizen'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="font-bold text-slate-900">Institution Dashboard</div>
          <p className="mt-1 text-xs text-slate-600">Requires Staff or Admin role.</p>
          <a
            href="/dashboard"
            className="mt-3 inline-block font-semibold text-indigo-600 text-sm hover:underline"
          >
            Go to Dashboard &rarr;
          </a>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="font-bold text-slate-900">Interpreter Escalation</div>
          <p className="mt-1 text-xs text-slate-600">Requires Interpreter or Admin role.</p>
          <a
            href="/escalate"
            className="mt-3 inline-block font-semibold text-indigo-600 text-sm hover:underline"
          >
            Go to Escalation Queue &rarr;
          </a>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="font-bold text-slate-900">System Admin</div>
          <p className="mt-1 text-xs text-slate-600">Requires Admin role.</p>
          <a
            href="/admin"
            className="mt-3 inline-block font-semibold text-indigo-600 text-sm hover:underline"
          >
            Go to Admin &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
