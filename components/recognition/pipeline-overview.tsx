const PIPELINE_STEPS = [
  { label: 'Camera', detail: 'Short sign capture' },
  { label: 'MediaPipe', detail: 'Runs in this browser' },
  { label: 'Landmarks', detail: 'Hands and upper body' },
  { label: 'ONNX model', detail: 'Constrained intents only' },
  { label: 'Prediction', detail: 'One supported intent' },
  { label: 'Confidence', detail: 'Accept or ask for help' },
] as const;

export function PipelineOverview() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6" aria-labelledby="pipeline-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">How recognition works</p>
          <h2 id="pipeline-title" className="mt-1 text-xl font-extrabold">From camera to confidence</h2>
        </div>
        <p className="text-xs text-slate-300">No unrestricted ISL translation</p>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {PIPELINE_STEPS.map((step, index) => (
          <li key={step.label} className="relative flex min-h-24 items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-3 xl:block">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-300 text-xs font-black text-slate-950" aria-hidden="true">
              {index + 1}
            </span>
            <div className="xl:mt-3">
              <p className="font-extrabold text-white">{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">{step.detail}</p>
            </div>
            {index < PIPELINE_STEPS.length - 1 && (
              <span className="absolute -bottom-3 left-6 z-10 text-teal-300 sm:hidden" aria-hidden="true">↓</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
