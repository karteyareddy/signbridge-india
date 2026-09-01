'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '../../../components/auth/protected-route';
import { useAuth } from '../../../components/providers/auth-provider';
import {
  listAssistanceRequests,
  subscribeToAssistanceChanges,
  transitionAssistanceRequest,
} from '../../../lib/access-point/service';
import {
  ASSISTANCE_STATUSES,
  ASSISTANCE_STATUS_LABELS,
  assistanceActionLabel,
  nextAssistanceStatus,
} from '../../../lib/assistance/lifecycle';
import { AssistanceRequest, AssistanceStatus } from '../../../types/access-point';

const STATUS_STYLES: Record<AssistanceStatus, string> = {
  pending: 'border-amber-300 bg-amber-50 text-amber-950',
  accepted: 'border-blue-300 bg-blue-50 text-blue-950',
  in_progress: 'border-purple-300 bg-purple-50 text-purple-950',
  resolved: 'border-teal-300 bg-teal-50 text-teal-950',
};

function formatRequestTime(timestamp: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export default function EscalationPage() {
  const { profile, user } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadQueue = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    const result = await listAssistanceRequests();
    setRequests(result.requests);
    setLoadError(result.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQueue(true);
    return subscribeToAssistanceChanges(() => void loadQueue());
  }, [loadQueue]);

  const counts = useMemo(
    () => Object.fromEntries(
      ASSISTANCE_STATUSES.map((status) => [
        status,
        requests.filter((request) => request.status === status).length,
      ]),
    ) as Record<AssistanceStatus, number>,
    [requests],
  );

  const handleTransition = async (request: AssistanceRequest) => {
    const nextStatus = nextAssistanceStatus(request.status);
    if (!nextStatus) return;

    setUpdatingId(request.id);
    setActionError(null);
    const result = await transitionAssistanceRequest(request, nextStatus);
    if (result.request) {
      setRequests((current) => current.map((item) => (
        item.id === result.request?.id ? result.request : item
      )));
    } else {
      setActionError(result.error ?? 'The request could not be updated.');
      await loadQueue();
    }
    setUpdatingId(null);
  };

  return (
    <ProtectedRoute action="access_escalation_queue">
      <div className="space-y-6">
        <header className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
          <span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            Operator dashboard
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-purple-950">Human assistance requests</h1>
          <p className="mt-1 text-sm text-purple-900">
            Signed in as <span className="font-semibold">{profile?.role}</span>. Requests update live.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white" aria-labelledby="lifecycle-title">
          <h2 id="lifecycle-title" className="font-extrabold">Request lifecycle</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {ASSISTANCE_STATUSES.map((status, index) => (
              <li key={status} className="relative rounded-xl border border-white/15 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-300 text-xs font-black text-slate-950" aria-hidden="true">{index + 1}</span>
                  <div>
                    <p className="font-bold">{ASSISTANCE_STATUS_LABELS[status]}</p>
                    <p className="text-xs text-slate-300">{counts[status]} {counts[status] === 1 ? 'request' : 'requests'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {actionError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-950" role="alert">
            {actionError}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="queue-title">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="queue-title" className="text-lg font-extrabold text-slate-950">Operator queue</h2>
              <p className="mt-1 text-xs text-slate-600">No citizen identity is shown. Work only on your assigned requests.</p>
            </div>
            <button onClick={() => void loadQueue(true)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700">
              Refresh queue
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-slate-600" role="status">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-purple-700 border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
              Loading assistance requests…
            </div>
          ) : loadError ? (
            <div className="my-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-950" role="alert">
              <h3 className="font-extrabold">Queue unavailable</h3>
              <p className="mt-1 text-sm">{loadError}</p>
              <button onClick={() => void loadQueue(true)} className="mt-4 min-h-11 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Try again</button>
            </div>
          ) : requests.length === 0 ? (
            <div className="my-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="font-extrabold text-slate-900">No assistance requests</h3>
              <p className="mt-1 text-sm text-slate-600">New requests will appear here automatically.</p>
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {requests.map((request) => {
                const actionLabel = assistanceActionLabel(request.status);
                const assignedElsewhere = profile?.role !== 'admin'
                  && Boolean(request.operator_id)
                  && request.operator_id !== user?.id;

                return (
                  <li key={request.id} className="rounded-xl border border-slate-200 p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${STATUS_STYLES[request.status]}`}>
                            {ASSISTANCE_STATUS_LABELS[request.status]}
                          </span>
                          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-800">
                            {request.urgency} urgency
                          </span>
                        </div>
                        <h3 className="mt-3 font-extrabold text-slate-950">
                          {request.location?.institution_name ?? 'Assistance service point'}
                        </h3>
                        <p className="mt-1 text-sm capitalize text-slate-600">
                          {request.location?.service_type ?? 'Service request'} · Requested {formatRequestTime(request.created_at)}
                        </p>
                        <p className="mt-2 font-mono text-xs text-slate-500">Request {request.id}</p>
                      </div>

                      <div className="lg:text-right">
                        {assignedElsewhere ? (
                          <p className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Assigned to another operator</p>
                        ) : actionLabel ? (
                          <button
                            onClick={() => void handleTransition(request)}
                            disabled={updatingId === request.id}
                            className="min-h-11 w-full rounded-xl bg-purple-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 lg:w-auto"
                          >
                            {updatingId === request.id ? 'Updating…' : actionLabel}
                          </button>
                        ) : (
                          <p className="font-bold text-teal-800">Completed</p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
