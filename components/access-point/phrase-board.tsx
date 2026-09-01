'use client';

import React, { useEffect, useState } from 'react';
import { PhraseItem, PhraseCategory } from '../../types/access-point';
import { ValidatedMediaPlayer } from './validated-media-player';

interface PhraseBoardProps {
  phrases: PhraseItem[];
  initialIntent?: string | null;
  onSelectPhrase?: (phrase: PhraseItem) => void;
}

export function PhraseBoard({ phrases, initialIntent, onSelectPhrase }: PhraseBoardProps) {
  const [activeCategory, setActiveCategory] = useState<PhraseCategory | 'all'>('all');
  const [selectedPhrase, setSelectedPhrase] = useState<PhraseItem | null>(null);

  const categories: Array<{ id: PhraseCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Phrases' },
    { id: 'appointment', label: 'Appointment' },
    { id: 'documents', label: 'Documents & ID' },
    { id: 'payment', label: 'Payment & Fees' },
    { id: 'emergency', label: 'Emergency' },
  ];

  const filteredPhrases = phrases.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  useEffect(() => {
    if (!initialIntent) return;
    const initialPhrase = phrases.find((phrase) => phrase.intent === initialIntent);
    if (initialPhrase) setSelectedPhrase(initialPhrase);
  }, [initialIntent, phrases]);

  const handleCardClick = (phrase: PhraseItem) => {
    setSelectedPhrase(phrase);
    if (onSelectPhrase) onSelectPhrase(phrase);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Phrase Cards */}
      {filteredPhrases.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No phrases found for category "{activeCategory}".
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredPhrases.map((phrase) => (
            <button
              key={phrase.id}
              onClick={() => handleCardClick(phrase)}
              className="flex min-h-[90px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-indigo-500 hover:shadow-md transition group"
            >
              <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {phrase.text}
              </span>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] uppercase text-slate-600">
                  {phrase.intent}
                </span>
                <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition">
                  Show ISL Sign &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Visual ISL Phrase Player Modal */}
      {selectedPhrase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="selected-phrase-title">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="rounded-full bg-indigo-100 px-3 py-1 font-mono text-xs font-bold text-indigo-800">
                INTENT: {selectedPhrase.intent}
              </span>
              <button
                onClick={() => setSelectedPhrase(null)}
                className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                aria-label="Close selected phrase"
              >
                ✕
              </button>
            </div>

            {/* High contrast text for showing counter staff */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center">
              <div className="text-xs uppercase font-bold text-indigo-700">Display to Staff:</div>
              <div id="selected-phrase-title" className="mt-1 text-xl font-extrabold text-slate-950">
                "{selectedPhrase.text}"
              </div>
            </div>

            <ValidatedMediaPlayer src={selectedPhrase.isl_asset} phraseText={selectedPhrase.text} />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPhrase(null)}
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 shadow"
              >
                Done / Select Another Phrase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
