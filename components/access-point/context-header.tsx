'use client';

import React from 'react';
import { AccessPointContext } from '../../types/access-point';

interface ContextHeaderProps {
  context: AccessPointContext;
  mode: 'user' | 'staff';
  onToggleMode: (mode: 'user' | 'staff') => void;
  onRequestHelp: () => void;
}

export function ContextHeader({
  context,
  mode,
  onToggleMode,
  onRequestHelp,
}: ContextHeaderProps) {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'college':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bank':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Top row: Badges and offline indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getBadgeStyle(context.institution_type)}`}>
            {context.institution_type}
          </span>
          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-xs font-semibold text-indigo-700">
            {context.service_type}
          </span>
        </div>

        {context.is_offline_cached && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500 motion-safe:animate-pulse" aria-hidden="true" />
            Saved on this device
          </span>
        )}
      </div>

      {/* Main title and location */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {context.institution_name}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          📍 {context.counter_name} • {context.district}
        </p>
      </div>

      {/* Control bar: Mode Switcher & Human Assistance CTA */}
      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Mode Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 shadow-inner">
          <button
            onClick={() => onToggleMode('user')}
            aria-pressed={mode === 'user'}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${
              mode === 'user'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🤟 Deaf Citizen (Show Signs)
          </button>
          <button
            onClick={() => onToggleMode('staff')}
            aria-pressed={mode === 'staff'}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${
              mode === 'staff'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍💼 Staff Response Mode
          </button>
        </div>

        {/* Human Assistance CTA */}
        <button
          onClick={onRequestHelp}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 transition"
        >
          <span>🆘</span>
          <span>Need Human Assistance</span>
        </button>
      </div>
    </div>
  );
}
