'use client';

import React, { useEffect, useRef, useState } from 'react';
import { INTENT_BY_ID, SUPPORTED_INTENTS } from '../../lib/recognition/intents';
import { getRecognitionModelStatus, predictSupportedIntent } from '../../lib/recognition/client';
import { RECOGNITION_FALLBACK_ACTIONS } from '../../lib/recognition/fallback-actions';
import {
  createLandmarkExtractor,
  drawLandmarkOverlay,
  LandmarkExtractor,
} from '../../lib/recognition/mediapipe';
import {
  LandmarkFrame,
  RecognitionModelStatus,
  RecognitionResponse,
} from '../../types/recognition';

type CameraState =
  | 'checking'
  | 'consent'
  | 'initializing'
  | 'ready'
  | 'capturing'
  | 'predicting'
  | 'result'
  | 'error';

const TARGET_FRAMES = 30;
const FRAME_INTERVAL_MS = 80;
const CAPTURE_TIMEOUT_MS = 12_000;

export function RecognitionCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const extractorRef = useRef<LandmarkExtractor | null>(null);
  const cancelledRef = useRef(false);
  const [state, setState] = useState<CameraState>('checking');
  const [modelStatus, setModelStatus] = useState<RecognitionModelStatus | null>(null);
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [result, setResult] = useState<RecognitionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const closeExtractor = () => {
    extractorRef.current?.close();
    extractorRef.current = null;
  };

  useEffect(() => {
    cancelledRef.current = false;
    getRecognitionModelStatus()
      .then((status) => {
        if (cancelledRef.current) return;
        setModelStatus(status);
        setState(status.ready ? 'consent' : 'error');
        if (!status.ready) {
          setError('The trained recognition model is not configured. Camera capture remains disabled.');
        }
      })
      .catch(() => {
        if (cancelledRef.current) return;
        setError('The constrained recognition service is unavailable. Use a validated phrase or human assistance.');
        setState('error');
      });

    return () => {
      cancelledRef.current = true;
      stopCamera();
      closeExtractor();
    };
  }, []);

  const startCamera = async () => {
    setState('initializing');
    setError(null);
    setResult(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is not supported by this browser.');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (!videoRef.current) throw new Error('Camera preview could not be initialized.');
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      extractorRef.current = await createLandmarkExtractor();
      setState('ready');
    } catch (cause) {
      stopCamera();
      closeExtractor();
      setError(cause instanceof Error ? cause.message : 'Camera or MediaPipe initialization failed.');
      setState('error');
    }
  };

  const captureSequence = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const extractor = extractorRef.current;
    if (!video || !canvas || !extractor) return;

    setState('capturing');
    setCapturedFrames(0);
    setError(null);
    const frames: LandmarkFrame[] = [];
    const startedAt = performance.now();
    let lastCapturedAt = 0;

    while (frames.length < TARGET_FRAMES && performance.now() - startedAt < CAPTURE_TIMEOUT_MS) {
      if (cancelledRef.current) return;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const timestamp = performance.now();
      if (timestamp - lastCapturedAt < FRAME_INTERVAL_MS || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) continue;
      lastCapturedAt = timestamp;
      const frame = extractor.extract(video, timestamp);
      if (!frame) continue;
      frames.push(frame);
      setCapturedFrames(frames.length);
      drawLandmarkOverlay(canvas, frame);
    }

    stopCamera();
    closeExtractor();

    if (frames.length < 21) {
      setError('MediaPipe could not track your shoulders and hands for 21 frames. Reframe and try again.');
      setState('error');
      return;
    }

    setState('predicting');
    try {
      const prediction = await predictSupportedIntent(frames);
      setResult(prediction);
      setState('result');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Prediction failed safely.');
      setState('error');
    }
  };

  const reset = () => {
    stopCamera();
    closeExtractor();
    setCapturedFrames(0);
    setResult(null);
    setError(null);
    setState(modelStatus?.ready ? 'consent' : 'error');
  };

  const acceptedIntent = result?.intent ? INTENT_BY_ID.get(result.intent) : null;
  const showCamera = state === 'initializing' || state === 'ready' || state === 'capturing';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
        <h2 className="font-extrabold">Constrained recognition only</h2>
        <p className="mt-1 text-sm leading-6">
          This tool recognizes only {SUPPORTED_INTENTS.length} configured intents. It does not translate unrestricted ISL and must not replace a qualified interpreter for complex, medical, legal, or emergency communication.
        </p>
      </section>

      {state === 'checking' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center" role="status">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent motion-reduce:animate-none" />
          <p className="mt-3 font-semibold text-slate-700">Checking the trained model…</p>
        </div>
      )}

      {state === 'consent' && (
        <section className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-950">Camera privacy consent</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li>• Video stays in this browser and is never uploaded or stored.</li>
            <li>• MediaPipe extracts hand and pose landmarks locally.</li>
            <li>• Only 21–30 frames of numeric landmark coordinates are sent for inference.</li>
          </ul>
          <button onClick={startCamera} className="mt-5 min-h-11 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            I understand — enable camera
          </button>
        </section>
      )}

      {showCamera && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="relative mx-auto aspect-[4/3] max-w-2xl overflow-hidden rounded-2xl bg-slate-950">
            <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full -scale-x-100 object-cover" aria-label="Live camera preview" />
            <canvas ref={canvasRef} width={640} height={480} className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-3 text-center text-sm font-bold text-white" role="status">
              {state === 'initializing' ? 'Loading local MediaPipe models…' : state === 'capturing' ? `Capturing landmarks ${capturedFrames}/${TARGET_FRAMES}` : 'Keep your upper body and hands visible'}
            </div>
          </div>
          {state === 'ready' && <button onClick={captureSequence} className="mx-auto mt-5 flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-6 py-3 text-sm font-extrabold text-slate-950 hover:bg-teal-400">Record supported sign</button>}
        </section>
      )}

      {state === 'predicting' && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center" role="status">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent motion-reduce:animate-none" />
          <p className="mt-3 font-bold text-indigo-950">Running the temporal model on landmarks…</p>
        </div>
      )}

      {state === 'result' && result && (
        <section className={`overflow-hidden rounded-2xl border shadow-sm ${result.status === 'accepted' ? 'border-teal-300 bg-white' : 'border-amber-300 bg-white'}`} aria-live="polite">
          {result.status === 'accepted' && acceptedIntent ? (
            <>
              <div className="border-b border-teal-200 bg-teal-50 px-6 py-4">
                <p className="text-sm font-extrabold uppercase tracking-wider text-teal-900">High confidence</p>
                <p className="mt-1 text-xs text-teal-950">A supported intent cleared the model threshold.</p>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recognized supported intent</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">“{acceptedIntent.label}”</h2>
                <div className="mt-5" aria-label={`Confidence ${Math.round((result.confidence ?? 0) * 100)} percent`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-slate-700">Confidence</span>
                    <span className="font-black text-teal-800">{Math.round((result.confidence ?? 0) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.round((result.confidence ?? 0) * 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Acceptance threshold {Math.round(result.threshold * 100)}% · Model {result.model_version}</p>
                </div>
                {result.requires_human_confirmation && <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-950">High-stakes intent: confirm with qualified human assistance. Do not act on this prediction alone.</p>}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button onClick={reset} className="min-h-11 rounded-xl border border-slate-400 bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">Try again</button>
                  <a href="/access/hosp-reg-001" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Confirm with phrase board</a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
                <p className="text-sm font-extrabold uppercase tracking-wider text-amber-900">Low confidence</p>
                <p className="mt-1 text-xs text-amber-950">The model did not select an intent.</p>
              </div>
              <div className="p-6">
                <h2 className="text-3xl font-black text-slate-950">I’m not sure.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{result.fallback?.message ?? 'Choose a validated phrase or ask for human assistance.'}</p>
                {result.confidence !== null && <p className="mt-2 text-xs font-semibold text-slate-600">Observed confidence {Math.round(result.confidence * 100)}%; required {Math.round(result.threshold * 100)}%.</p>}

                <div className="mt-6" aria-labelledby="manual-choice-title">
                  <h3 id="manual-choice-title" className="text-sm font-extrabold text-slate-950">Choose manually</h3>
                  <p className="mt-1 text-xs text-slate-600">These are validated actions, not alternative model predictions.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {RECOGNITION_FALLBACK_ACTIONS.map((action) => (
                      <a key={action.label} href={action.href} className="group min-h-11 rounded-xl border border-slate-300 bg-slate-50 p-4 hover:border-indigo-500 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <span className="block font-extrabold text-slate-950 group-hover:text-indigo-800">{action.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-600">{action.description}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button onClick={reset} className="min-h-11 rounded-xl border border-slate-400 bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">Try the camera again</button>
                  <a href="/access/hosp-reg-001" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">View all validated phrases</a>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {state === 'error' && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950" role="alert">
          <h2 className="font-extrabold">Recognition unavailable</h2>
          <p className="mt-2 text-sm leading-6">{error}</p>
          {modelStatus && <p className="mt-2 text-xs">Model status: {modelStatus.model_version} · {modelStatus.supported_intent_count} constrained intents</p>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {modelStatus?.ready && <button onClick={reset} className="min-h-11 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold">Try again</button>}
            <a href="/access/hosp-reg-001" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Open manual phrase board</a>
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-slate-200 bg-white p-5">
        <summary className="min-h-11 cursor-pointer font-bold text-slate-900">View all {SUPPORTED_INTENTS.length} supported intents</summary>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTED_INTENTS.map((intent) => <li key={intent.id} className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">{intent.label}{intent.high_stakes ? ' · human confirmation required' : ''}</li>)}
        </ul>
      </details>
    </div>
  );
}
