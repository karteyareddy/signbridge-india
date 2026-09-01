'use client';

import React, { useEffect, useState } from 'react';
import { JourneySteps } from '../../components/learning/journey-steps';
import { ProgressMeter } from '../../components/learning/progress-meter';
import { calculateLearningProgress } from '../../lib/learning/catalog';
import { getLearningCourses, getLocalLearningAttempts } from '../../lib/learning/service';
import { LearningCourse } from '../../types/learning';

export default function LearnPage() {
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningCourses()
      .then(setCourses)
      .catch(() => setError('Courses could not be loaded. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Learning hub</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Learn useful ISL for everyday service</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
          Watch short lessons, complete competency checks, and earn a role-based badge by demonstrating understanding.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <JourneySteps current="Learn" />
      </section>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading courses">
          {[1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />)}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900" role="alert">{error}</div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-bold text-slate-900">No courses available yet</h2>
          <p className="mt-2 text-sm text-slate-600">New role-based ISL courses will appear here.</p>
        </div>
      )}

      {!loading && !error && courses.map((course) => {
        const progress = calculateLearningProgress(course, getLocalLearningAttempts());
        return (
          <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-800">{course.category}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{course.level}</span>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-teal-900">{course.lessons.length} lessons</span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-950">{course.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{course.description}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <span aria-hidden="true">🏅</span> Badge: <strong>{course.badge_name}</strong>
              </div>
            </div>
            <div className="mt-6"><ProgressMeter value={progress.completionPercent} label={`${progress.completedLessons} of ${progress.totalLessons} lessons passed`} /></div>
            <a href={`/learn/${course.id}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {progress.completedLessons ? 'Continue course' : 'Start course'}
            </a>
          </article>
        );
      })}
    </div>
  );
}
