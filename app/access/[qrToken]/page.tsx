'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AccessPointContext, ServicePackContent } from '../../../types/access-point';
import {
  AccessPointDataSource,
  getAccessPointData,
} from '../../../lib/access-point/service';
import { ContextHeader } from '../../../components/access-point/context-header';
import { PhraseBoard } from '../../../components/access-point/phrase-board';
import { StaffResponseBoard } from '../../../components/access-point/staff-response-board';
import { HumanEscalationModal } from '../../../components/access-point/human-escalation-modal';
import { FeedbackModal } from '../../../components/access-point/feedback-modal';

export default function AccessPointQRPage() {
  const params = useParams();
  const qrToken = (params?.qrToken as string) || '';

  const [context, setContext] = useState<AccessPointContext | null>(null);
  const [pack, setPack] = useState<ServicePackContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<AccessPointDataSource | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  const [mode, setMode] = useState<'user' | 'staff'>('user');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [requestedIntent, setRequestedIntent] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setRequestedIntent(query.get('intent'));
    if (query.get('help') === '1') setShowHelpModal(true);
  }, []);

  useEffect(() => {
    if (!qrToken) return;

    async function loadData() {
      setLoading(true);
      setError(null);

      const res = await getAccessPointData(qrToken);
      if (res.error || !res.context || !res.pack) {
        setError(res.error || 'Unable to load Access Point context.');
        setContext(null);
        setPack(null);
        setDataSource(null);
      } else {
        setContext(res.context);
        setPack(res.pack);
        setDataSource(res.source);
        setCachedAt(res.cachedAt ?? null);
      }
      setLoading(false);
    }

    loadData();
  }, [qrToken]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium">Resolving Access Point QR Context...</p>
      </div>
    );
  }

  // 2. Empty / Error State (Invalid QR Code)
  if (error || !context || !pack) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h2 className="text-lg font-bold text-amber-950">Access Point Not Found</h2>
            <p className="text-xs text-amber-800">{error}</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 uppercase">Try Demo Access Points:</div>
          <div className="flex flex-col gap-2">
            <a
              href="/access/hosp-reg-001"
              className="rounded-lg bg-indigo-50 p-3 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition"
            >
              🏥 District Hospital - Registration Counter (#hosp-reg-001)
            </a>
            <a
              href="/access/col-adm-001"
              className="rounded-lg bg-blue-50 p-3 text-xs font-bold text-blue-800 hover:bg-blue-100 transition"
            >
              🎓 State Science College - Admissions Counter (#col-adm-001)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Success State (Full interactive Access Point flow)
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          dataSource === 'cache'
            ? 'border-amber-300 bg-amber-50 text-amber-950'
            : 'border-emerald-200 bg-emerald-50 text-emerald-950'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="font-bold">
          {dataSource === 'cache' ? 'Offline service pack in use.' : 'Service pack saved for offline use.'}
        </span>{' '}
        {dataSource === 'cache'
          ? `This static phrase board was saved on ${
              cachedAt ? new Date(cachedAt).toLocaleString() : 'this device'
            }.`
          : 'Its phrase data and available media will remain accessible after the connection drops.'}
      </div>

      {/* Context Header */}
      <ContextHeader
        context={context}
        mode={mode}
        onToggleMode={setMode}
        onRequestHelp={() => setShowHelpModal(true)}
      />

      {/* Main Communication Interface */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {mode === 'user' ? (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Deaf Citizen Phrase Board</h2>
                <p className="text-xs text-slate-500">
                  Tap any service card to view validated ISL video and display text to counter staff.
                </p>
              </div>
            </div>
            <PhraseBoard phrases={pack.phrases} initialIntent={requestedIntent} />
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Frontline Staff Response Board</h2>
                <p className="text-xs text-slate-500">
                  Select a pre-validated visual reply to display text + ISL video to the Deaf citizen.
                </p>
              </div>
            </div>
            <StaffResponseBoard responses={pack.staff_responses} />
          </div>
        )}
      </div>

      {/* Footer Bar for Interaction Feedback */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-4 text-xs">
        <span className="text-slate-600">Finished service interaction at this counter?</span>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white shadow hover:bg-indigo-700 transition"
        >
          Rate Interaction / Complete
        </button>
      </div>

      {/* Human Escalation Modal */}
      <HumanEscalationModal
        accessPointId={context.id}
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Interaction Feedback Modal */}
      <FeedbackModal
        accessPointId={context.id}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
