import { RecognitionCamera } from '../../components/recognition/recognition-camera';
import { PipelineOverview } from '../../components/recognition/pipeline-overview';

export default function RecognizePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Camera → landmarks → constrained model</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Supported ISL intent recognition</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-indigo-100">MediaPipe extracts landmarks locally, a temporal model evaluates a 30-frame sequence, and uncertain results are rejected.</p>
      </header>
      <PipelineOverview />
      <RecognitionCamera />
    </div>
  );
}
