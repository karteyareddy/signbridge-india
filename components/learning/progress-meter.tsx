import React from 'react';

export function ProgressMeter({ value, label }: { value: number; label: string }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-800">{label}</span>
        <span className="font-bold text-indigo-700">{safeValue}%</span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div className="h-full rounded-full bg-indigo-600 transition-[width] motion-reduce:transition-none" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
