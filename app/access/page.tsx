'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessPointIndexPage() {
  const router = useRouter();
  const [inputToken, setInputToken] = useState('');

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      router.push(`/access/${inputToken.trim()}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-teal-500 px-3 py-1 font-bold text-xs text-slate-950 uppercase tracking-wider">
            Signature Innovation
          </span>
          <span className="text-xs text-teal-200">No Account Required</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          ISL Access Point Scanner
        </h1>
        <p className="mt-2 text-sm text-teal-100 max-w-xl">
          Scan any participating service counter QR/NFC code to instantly open location-aware ISL phrase boards, staff visual response mode, and human assistance escalation.
        </p>
      </div>

      {/* Manual Token / QR Code Entry Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Simulate QR Code Scan</h2>
        <form onSubmit={handleSimulateScan} className="flex gap-2">
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Enter QR token code (e.g. hosp-reg-001)"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white shadow hover:bg-indigo-700 transition text-sm"
          >
            Scan & Open
          </button>
        </form>
      </div>

      {/* Preset Demo Service Counters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Available Location Access Points</h2>
        <p className="text-xs text-slate-500">Select any physical service location to launch its Access Point flow:</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="/access/hosp-reg-001"
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 uppercase">
                  Hospital
                </span>
                <span className="text-xs font-mono text-slate-500">#hosp-reg-001</span>
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                District General Hospital
              </div>
              <div className="text-xs text-slate-600">Registration Counter #1 • Central Delhi</div>
            </div>
            <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1">
              <span>Open Service Pack</span>
              <span>&rarr;</span>
            </div>
          </a>

          <a
            href="/access/col-adm-001"
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                  College
                </span>
                <span className="text-xs font-mono text-slate-500">#col-adm-001</span>
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                State Science College
              </div>
              <div className="text-xs text-slate-600">Admissions Office Counter • North Delhi</div>
            </div>
            <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1">
              <span>Open Service Pack</span>
              <span>&rarr;</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
