'use client';

import React, { useState } from 'react';
import { StaffResponseItem } from '../../types/access-point';
import { ValidatedMediaPlayer } from './validated-media-player';

interface StaffResponseBoardProps {
  responses: StaffResponseItem[];
}

export function StaffResponseBoard({ responses }: StaffResponseBoardProps) {
  const [activeResponse, setActiveResponse] = useState<StaffResponseItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <h2 className="text-base font-bold text-indigo-950">Staff visual reply mode</h2>
        <p className="mt-0.5 text-xs text-indigo-800">Tap a response to display its validated text and available ISL media to the Deaf citizen.</p>
      </div>

      {responses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">No staff responses are available in this service pack.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {responses.map((item) => (
            <button key={item.id} onClick={() => setActiveResponse(item)} className="group flex min-h-[85px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              <span className="text-base font-bold text-slate-900 transition group-hover:text-indigo-700">{item.text}</span>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] uppercase text-slate-600">{item.intent}</span>
                <span className="font-semibold text-indigo-700">Show citizen →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="staff-response-title">
          <div className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="rounded-full bg-teal-100 px-3 py-1 font-mono text-xs font-bold text-teal-900">STAFF RESPONSE TO CITIZEN</span>
              <button onClick={() => setActiveResponse(null)} aria-label="Close staff response" className="min-h-11 min-w-11 rounded-lg bg-slate-100 p-2 text-xl text-slate-700 hover:bg-slate-200">×</button>
            </div>

            <div className="rounded-xl border border-teal-300 bg-teal-50 p-6 text-center">
              <div className="text-xs font-bold uppercase text-teal-900">Visual staff reply</div>
              <h3 id="staff-response-title" className="mt-2 text-2xl font-extrabold text-slate-950">“{activeResponse.text}”</h3>
            </div>

            <ValidatedMediaPlayer src={activeResponse.isl_asset} phraseText={activeResponse.text} />

            <button onClick={() => setActiveResponse(null)} className="min-h-11 w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white shadow hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Done / Select another reply</button>
          </div>
        </div>
      )}
    </div>
  );
}
