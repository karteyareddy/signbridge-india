'use client';

import React, { useEffect, useState } from 'react';
import { JourneySteps } from '../../../components/learning/journey-steps';
import { ProgressMeter } from '../../../components/learning/progress-meter';
import { BADGE_SCORE, calculateLearningProgress, PASSING_SCORE } from '../../../lib/learning/catalog';
import { getLearningCourses, getLocalLearningAttempts } from '../../../lib/learning/service';
import { LearningCourse } from '../../../types/learning';

export default function LearningProgressPage() {
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningCourses()
      .then((courses) => courses.length ? setCourse(courses[0]) : setError('No course progress is available.'))
      .catch(() => setError('Progress could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" aria-label="Loading progress" />;
  if (error || !course) return <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center"><h1 className="font-bold text-slate-950">No progress yet</h1><p className="mt-2 text-sm text-slate-600">{error}</p><a href="/learn" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white">Browse courses</a></div>;

  const progress = calculateLearningProgress(course, getLocalLearningAttempts());

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><JourneySteps current={progress.badge ? 'Badge' : 'Progress'} /></section>
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-teal-300">Learning progress</p>
        <h1 className="mt-2 text-3xl font-extrabold">{course.title}</h1>
        <div className="mt-6 rounded-xl bg-white p-4"><ProgressMeter value={progress.completionPercent} label={`${progress.completedLessons} of ${progress.totalLessons} lessons passed`} /></div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-4"><div className="text-xs text-indigo-200">Average passing score</div><div className="mt-1 text-3xl font-black">{progress.averageScore}%</div></div>
          <div className="rounded-xl bg-white/10 p-4"><div className="text-xs text-indigo-200">Badge target</div><div className="mt-1 text-3xl font-black">{BADGE_SCORE}%</div></div>
        </div>
      </section>

      <section className={`rounded-2xl border p-6 text-center shadow-sm ${progress.badge ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`} aria-live="polite">
        <div className="text-6xl" aria-hidden="true">{progress.badge ? '🏅' : '🔒'}</div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-600">Competency badge</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-950">{progress.badge ?? course.badge_name}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-700">
          {progress.badge ? 'Earned by passing every lesson and reaching the required average score.' : `Pass all ${course.lessons.length} lessons with an average passing score of at least ${BADGE_SCORE}%. Each lesson needs ${PASSING_SCORE}% to count.`}
        </p>
      </section>

      <section aria-labelledby="score-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="score-heading" className="text-xl font-extrabold text-slate-950">Lesson scores</h2>
        <ul className="mt-4 divide-y divide-slate-200">
          {course.lessons.map((lesson) => {
            const score = progress.lessonScores[lesson.id];
            return <li key={lesson.id} className="flex items-center justify-between gap-4 py-4"><div><div className="font-bold text-slate-900">{lesson.position}. {lesson.title}</div><div className="mt-1 text-xs text-slate-500">{score === undefined ? 'Practice not completed' : score >= PASSING_SCORE ? 'Passed' : 'Retry needed'}</div></div><div className="text-lg font-black text-indigo-700">{score === undefined ? '—' : `${score}%`}</div></li>;
          })}
        </ul>
      </section>
      <a href={`/learn/${course.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Continue learning</a>
    </div>
  );
}
