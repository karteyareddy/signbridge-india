import React from 'react';

const STEPS = ['Learn', 'Course', 'Lesson', 'Video', 'Practice', 'Score', 'Progress', 'Badge'];

export function JourneySteps({ current }: { current: string }) {
  const activeIndex = Math.max(STEPS.indexOf(current), 0);

  return (
    <nav aria-label="Learning journey" className="overflow-x-auto pb-1">
      <ol className="flex min-w-[680px] items-center" role="list">
        {STEPS.map((step, index) => (
          <li key={step} className="flex flex-1 items-center">
            <div
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 text-sm font-bold ${
                index <= activeIndex
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-500'
              }`}
              aria-current={index === activeIndex ? 'step' : undefined}
              aria-label={`${step}${index < activeIndex ? ', completed' : index === activeIndex ? ', current step' : ''}`}
            >
              {index < activeIndex ? '✓' : index + 1}
            </div>
            <span className={`ml-2 text-xs font-semibold ${index <= activeIndex ? 'text-slate-900' : 'text-slate-500'}`}>
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <span className={`mx-2 h-0.5 flex-1 ${index < activeIndex ? 'bg-indigo-600' : 'bg-slate-200'}`} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
