'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JourneySteps } from '../../../components/learning/journey-steps';
import { ProgressMeter } from '../../../components/learning/progress-meter';
import { calculateLearningProgress, isLessonUnlocked, PASSING_SCORE } from '../../../lib/learning/catalog';
import { getLearningCourse, getLocalLearningAttempts } from '../../../lib/learning/service';
import { LearningCourse } from '../../../types/learning';

export default function CoursePage() {
  const params = useParams();
  const courseId = (params?.courseId as string) || '';
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningCourse(courseId)
      .then((result) => result ? setCourse(result) : setError('This course was not found.'))
      .catch(() => setError('The course could not be loaded.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <div className="mx-auto h-80 max-w-5xl animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" aria-label="Loading course" />;
  if (error || !course) return <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-900" role="alert">{error ?? 'Course unavailable.'}</div>;

  const progress = calculateLearningProgress(course, getLocalLearningAttempts());

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <a href="/learn" className="inline-flex min-h-11 items-center text-sm font-bold text-indigo-700 hover:underline">← All courses</a>
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">{course.category} · {course.level}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-indigo-950">{course.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-900">{course.description}</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><JourneySteps current="Course" /></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ProgressMeter value={progress.completionPercent} label={`Course progress: ${progress.completedLessons} of ${progress.totalLessons} passed`} /></section>

      <section aria-labelledby="lessons-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><h2 id="lessons-heading" className="text-2xl font-extrabold text-slate-950">Lessons</h2><p className="mt-1 text-sm text-slate-600">Score at least {PASSING_SCORE}% to unlock the next lesson.</p></div>
          <a href="/learn/progress" className="text-sm font-bold text-indigo-700 hover:underline">View progress</a>
        </div>
        <ol className="space-y-3">
          {course.lessons.map((lesson) => {
            const score = progress.lessonScores[lesson.id];
            const unlocked = isLessonUnlocked(course, lesson.position, progress);
            const passed = (score ?? 0) >= PASSING_SCORE;
            return (
              <li key={lesson.id} className={`rounded-2xl border p-5 ${unlocked ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-100'}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-extrabold ${passed ? 'bg-teal-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>{passed ? '✓' : lesson.position}</span>
                    <div><h3 className="font-extrabold text-slate-950">{lesson.title}</h3><p className="mt-1 text-sm text-slate-600">{lesson.description}</p><p className="mt-2 text-xs font-semibold text-slate-500">{Math.ceil(lesson.duration / 60)} min · {score !== undefined ? `Best score ${score}%` : 'Not attempted'}</p></div>
                  </div>
                  {unlocked ? (
                    <a href={`/learn/${course.id}/${lesson.id}`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">{passed ? 'Review lesson' : 'Open lesson'}</a>
                  ) : (
                    <span className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-slate-200 px-4 text-sm font-bold text-slate-600" aria-label="Lesson locked">🔒 Locked</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
