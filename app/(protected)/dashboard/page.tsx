'use client';

import { ProtectedRoute } from '../../../components/auth/protected-route';
import { useAuth } from '../../../components/providers/auth-provider';
import {
  DISTRICT_HOSPITAL_READINESS,
  metricPercent,
  ReadinessCountMetric,
} from '../../../lib/readiness/metrics';

function CountMetricCard({
  label,
  metric,
  helpText,
}: {
  label: string;
  metric: ReadinessCountMetric;
  helpText: string;
}) {
  const percent = metricPercent(metric);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">
        {metric.completed}<span className="text-xl text-slate-500">/{metric.total}</span>
      </p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-600">{percent}% · {helpText}</p>
    </article>
  );
}

export default function DashboardPage() {
  const { profile, staffProfile } = useAuth();
  const readiness = DISTRICT_HOSPITAL_READINESS;

  return (
    <ProtectedRoute action="access_staff_dashboard">
      <div className="space-y-6">
        <header className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
          <span className="rounded-full bg-indigo-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">Staff portal</span>
          <h1 className="mt-3 text-2xl font-extrabold text-indigo-950">Institution readiness dashboard</h1>
          <p className="mt-1 text-sm text-indigo-900">
            Role: <span className="font-semibold">{profile?.role}</span> · Institution: <span className="font-semibold">{staffProfile?.institution_id || 'District General Hospital'}</span>
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]" aria-labelledby="readiness-heading">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Institution readiness</p>
            <div className="mt-3 flex items-end gap-2">
              <h2 id="readiness-heading" className="text-5xl font-black">{readiness.score}</h2>
              <span className="pb-1 text-xl font-bold text-indigo-200">/100</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20" aria-label={`Readiness score ${readiness.score} out of 100`}>
              <div className="h-full rounded-full bg-teal-300" style={{ width: `${readiness.score}%` }} aria-hidden="true" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100">
              Product readiness metric based on staff training, service coverage, interaction outcomes, assistance response, and content readiness.
            </p>
            <p className="mt-2 text-xs font-semibold text-amber-200">This is not an official government certification.</p>
          </div>

          <aside className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm" aria-labelledby="next-action-heading">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Next action</p>
            <h2 id="next-action-heading" className="mt-2 text-2xl font-black text-amber-950">{readiness.nextAction.label}</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">{readiness.nextAction.description}</p>
            <a href={readiness.nextAction.href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
              {readiness.nextAction.cta}
            </a>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Readiness metrics">
          <CountMetricCard label="Staff trained" metric={readiness.staffTrained} helpText="frontline staff completed training" />
          <CountMetricCard label="Critical phrases" metric={readiness.criticalPhrases} helpText="validated phrases available" />

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Successful interactions</p>
            <p className="mt-2 text-3xl font-black text-teal-700">{readiness.successfulInteractionsPercent}%</p>
            <p className="mt-4 text-xs leading-5 text-slate-600">Completed interactions reported as successful.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Assistance requests</p>
            <p className="mt-2 text-3xl font-black text-purple-700">{readiness.assistanceRequests}</p>
            <p className="mt-4 text-xs leading-5 text-slate-600">Requests currently recorded for operator follow-up.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="coverage-heading">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Service coverage</p>
            <h2 id="coverage-heading" className="mt-1 text-xl font-extrabold text-slate-950">Enabled service points</h2>
          </div>
          {readiness.serviceCoverage.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {readiness.serviceCoverage.map((service) => (
                <li key={service} className="flex min-h-14 items-center gap-3 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 font-extrabold text-teal-950">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-sm text-white" aria-hidden="true">✓</span>
                  {service}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">No service points are enabled yet.</div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
