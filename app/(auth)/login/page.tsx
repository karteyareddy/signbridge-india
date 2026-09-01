'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../components/providers/auth-provider';
import {
  DEMO_ACCOUNTS,
  DEMO_AUTH_ENABLED,
  getDemoAccount,
  isSafeLocalRedirect,
} from '../../../lib/auth/demo';

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async (targetEmail: string) => {
    setError(null);
    setIsSubmitting(true);
    const result = await signInWithEmail(targetEmail);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message === 'Failed to fetch'
        ? 'Email sign-in is unavailable. Use a local demo account below or configure Supabase.'
        : result.error.message);
      return;
    }

    if (result.method === 'demo') {
      const requestedPath = new URLSearchParams(window.location.search).get('redirectTo');
      const account = getDemoAccount(targetEmail);
      window.location.assign(
        isSafeLocalRedirect(requestedPath) ? requestedPath : account?.destination ?? '/learn',
      );
      return;
    }

    setSubmitted(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (email) await authenticate(email);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md" aria-labelledby="sign-in-title">
        <h1 id="sign-in-title" className="text-2xl font-bold text-slate-900">Sign in to SIGNBRIDGE</h1>
        <p className="mt-1 text-sm text-slate-600">Use a local demo account or enter an email connected to Supabase Auth.</p>

        {DEMO_AUTH_ENABLED && (
          <div className="mt-6 rounded-xl border border-teal-300 bg-teal-50 p-4">
            <h2 className="font-extrabold text-teal-950">Local demo access</h2>
            <p className="mt-1 text-xs leading-5 text-teal-900">No email or password is sent. Demo sessions work only on this device and must remain disabled in production.</p>
            <div className="mt-4 grid gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => void authenticate(account.email)}
                  disabled={isSubmitting}
                  className="min-h-11 rounded-xl border border-teal-400 bg-white px-4 py-3 text-left hover:border-teal-700 hover:bg-teal-100 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <span className="block font-extrabold text-slate-950">Continue as {account.label}</span>
                  <span className="mt-1 block font-mono text-xs text-slate-600">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {submitted ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900" role="status">
            <strong>Magic link sent.</strong> Check your email inbox to complete sign-in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={DEMO_AUTH_ENABLED ? 'staff@signbridge.local' : 'name@institution.org'}
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">{error}</div>}

            <button type="submit" disabled={isSubmitting} className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? 'Signing in…' : 'Send magic link'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
