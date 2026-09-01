'use client';

import React, { useState } from 'react';
import { submitInteractionFeedback } from '../../lib/access-point/service';

interface FeedbackModalProps {
  accessPointId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ accessPointId, isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [outcome, setOutcome] = useState<'success' | 'failure'>('success');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [wasQueued, setWasQueued] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitInteractionFeedback({
      access_point_id: accessPointId,
      outcome,
      rating,
      comment,
    });
    setWasQueued(result.queued);
    setSubmitted(true);
  };

  const handleDone = () => {
    setSubmitted(false);
    setWasQueued(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900">Service Communication Rating</h3>
          <button
            onClick={handleDone}
            aria-label="Close feedback dialog"
            className="min-h-11 min-w-11 rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Was communication successful?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome('success')}
                  className={`rounded-xl border p-3 font-bold text-xs transition ${
                    outcome === 'success'
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  ✅ Yes, Successful
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('failure')}
                  className={`rounded-xl border p-3 font-bold text-xs transition ${
                    outcome === 'failure'
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  ❌ Had Difficulties
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Overall Rating (1 to 5 Stars)
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                  onClick={() => setRating(star)}
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    aria-pressed={rating === star}
                    className={`min-h-11 min-w-11 text-2xl transition motion-safe:hover:scale-110 ${
                      rating >= star ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Optional Feedback / Flag Issue
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share any comments or flag incorrect signs..."
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white shadow hover:bg-indigo-700 transition text-sm"
            >
              Submit Feedback
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="text-4xl">🎉</div>
            <h4 className="text-lg font-bold text-slate-900">
              {wasQueued ? 'Feedback saved on this device' : 'Thank You!'}
            </h4>
            <p className="text-xs text-slate-600">
              {wasQueued
                ? 'You are offline. This feedback is queued and will sync automatically after reconnection.'
                : "Your feedback directly updates the institution's ISL Readiness Score and improves service phrase quality."}
            </p>
            <button
              onClick={handleDone}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
