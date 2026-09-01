'use client';

import React, { useEffect, useState } from 'react';
import { UrgencyLevel, AssistanceRequest } from '../../types/access-point';
import {
  createAssistanceRequest,
  getAssistanceRequest,
  subscribeToAssistanceChanges,
} from '../../lib/access-point/service';
import {
  ASSISTANCE_STATUSES,
  ASSISTANCE_STATUS_LABELS,
} from '../../lib/assistance/lifecycle';

interface HumanEscalationModalProps {
  accessPointId: string;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_MESSAGES = {
  pending: 'Your request is waiting in the operator queue.',
  accepted: 'An operator has accepted your request.',
  in_progress: 'Human assistance is now in progress.',
  resolved: 'The operator marked this request as resolved.',
} as const;

export function HumanEscalationModal({ accessPointId, isOpen, onClose }: HumanEscalationModalProps) {
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!request || request.sync_status === 'queued') return;

    const refreshRequest = async () => {
      const result = await getAssistanceRequest(request);
      if (result.request) setRequest(result.request);
    };
    const unsubscribe = subscribeToAssistanceChanges(() => void refreshRequest());
    const pollTimer = window.setInterval(() => void refreshRequest(), 5_000);
    return () => {
      unsubscribe();
      window.clearInterval(pollTimer);
    };
  }, [request?.id, request?.sync_status]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await createAssistanceRequest(accessPointId, urgency);
    if (result.request) setRequest(result.request);
    else setSubmitError(result.error ?? 'The request could not be sent. Please ask nearby staff for help.');
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setSubmitError(null);
    if (!request || request.status === 'resolved') {
      setRequest(null);
      setUrgency('normal');
    }
    onClose();
  };

  const currentStatusIndex = request ? ASSISTANCE_STATUSES.indexOf(request.status) : -1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="assistance-dialog-title">
      <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <h2 id="assistance-dialog-title" className="font-extrabold text-slate-950">Request human assistance</h2>
          <button onClick={handleReset} aria-label="Close assistance dialog" className="min-h-11 min-w-11 rounded-lg bg-slate-100 p-2 text-xl text-slate-700 hover:bg-slate-200">×</button>
        </div>

        {!request ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-700">
              Ask for a qualified ISL interpreter or trained operator when recognition and validated phrases are not enough.
            </p>

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Urgency level</legend>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'high', 'emergency'] as UrgencyLevel[]).map((level) => (
                  <button key={level} type="button" onClick={() => setUrgency(level)} aria-pressed={urgency === level} className={`min-h-11 rounded-lg border px-3 py-2.5 text-xs font-bold capitalize ${urgency === level ? 'border-amber-600 bg-amber-50 text-amber-950' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </fieldset>

            {urgency === 'emergency' && (
              <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-950">
                This request is not an emergency service. Alert nearby staff or contact local emergency services now.
              </p>
            )}

            {submitError && <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950" role="alert">{submitError}</p>}

            <button onClick={handleSubmit} disabled={isSubmitting} className="min-h-11 w-full rounded-xl bg-amber-500 px-4 py-3 font-extrabold text-slate-950 shadow hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? 'Sending request…' : 'Send assistance request'}
            </button>
          </div>
        ) : (
          <div className="space-y-5" aria-live="polite">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Request ID</p>
              <code className="mt-1 block break-all rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-800">{request.id}</code>
            </div>

            {request.sync_status === 'queued' ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                <h3 className="font-extrabold">Saved for reconnect</h3>
                <p className="mt-1 text-sm leading-6">This device will send the request when internet access returns. Ask nearby staff directly if the need is urgent.</p>
              </div>
            ) : (
              <>
                <ol className="grid gap-2 sm:grid-cols-4" aria-label="Assistance request progress">
                  {ASSISTANCE_STATUSES.map((status, index) => {
                    const reached = index <= currentStatusIndex;
                    return (
                      <li key={status} aria-current={index === currentStatusIndex ? 'step' : undefined} className={`rounded-xl border p-3 ${reached ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-slate-50'}`}>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${reached ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-600'}`} aria-hidden="true">{index + 1}</span>
                        <p className="mt-2 text-xs font-bold text-slate-900">{ASSISTANCE_STATUS_LABELS[status]}</p>
                      </li>
                    );
                  })}
                </ol>

                <div className="rounded-xl border border-purple-300 bg-purple-50 p-4 text-purple-950" role="status">
                  <h3 className="font-extrabold">{ASSISTANCE_STATUS_LABELS[request.status]}</h3>
                  <p className="mt-1 text-sm">{STATUS_MESSAGES[request.status]}</p>
                </div>
              </>
            )}

            <button onClick={handleReset} className="min-h-11 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">
              {request.status === 'resolved' ? 'Done' : 'Keep tracking in background'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
