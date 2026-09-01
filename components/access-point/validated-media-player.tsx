'use client';

import { useEffect, useState } from 'react';

interface ValidatedMediaPlayerProps {
  src: string;
  phraseText: string;
}

type MediaState = 'loading' | 'ready' | 'error';

export function ValidatedMediaPlayer({ src, phraseText }: ValidatedMediaPlayerProps) {
  const [mediaState, setMediaState] = useState<MediaState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setMediaState(src ? 'loading' : 'error');
    setAttempt(0);
  }, [src]);

  useEffect(() => {
    if (mediaState !== 'loading') return;
    const timeout = window.setTimeout(() => setMediaState('error'), 8_000);
    return () => window.clearTimeout(timeout);
  }, [attempt, mediaState, src]);

  const retry = () => {
    setMediaState('loading');
    setAttempt((current) => current + 1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-inner">
      <div className="border-b border-slate-700 p-2 text-center font-mono text-[11px] text-slate-300">Validated ISL media</div>
      <div className="relative aspect-video w-full bg-slate-900">
        {src && (
          <video
            key={`${src}-${attempt}`}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            controls
            preload="metadata"
            poster="/isl-video-poster.svg"
            aria-label={`ISL video for: ${phraseText}`}
            onLoadedData={() => setMediaState('ready')}
            onPlaying={() => setMediaState('ready')}
            onError={() => setMediaState('error')}
            className={`h-full w-full object-contain ${mediaState === 'error' ? 'hidden' : 'block'}`}
          />
        )}

        {mediaState === 'loading' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-5 text-center text-white" role="status">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-teal-300 border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold">Loading ISL video…</p>
            <p className="mt-1 text-xs text-slate-300">The written phrase remains available above.</p>
          </div>
        )}

        {mediaState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('/isl-video-poster.svg')] bg-cover bg-center p-5 text-center" role="alert">
            <div className="max-w-sm rounded-xl border border-amber-300 bg-slate-950/95 p-4 text-white shadow-xl">
              <p className="font-extrabold">ISL video unavailable</p>
              <p className="mt-1 text-xs leading-5 text-slate-200">This service pack does not have a reachable, verified video for this phrase. Use the large written response or request human assistance.</p>
              {src && (
                <button onClick={retry} className="mt-3 min-h-11 rounded-lg border border-white/40 bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">Retry video</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
