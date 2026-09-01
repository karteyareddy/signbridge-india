'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JourneySteps } from '../../../../components/learning/journey-steps';
import { getLearningCourse } from '../../../../lib/learning/service';
import { LearningCourse } from '../../../../types/learning';

export default function LessonPage() {
  const params = useParams();
  const courseId = (params?.courseId as string) || '';
  const lessonId = (params?.lessonId as string) || '';
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningCourse(courseId)
      .then((result) => result ? setCourse(result) : setError('Course not found.'))
      .catch(() => setError('Lesson content could not be loaded.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" aria-label="Loading lesson" />;
  const lesson = course?.lessons.find((item) => item.id === lessonId);
  if (error || !course || !lesson) return <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-900" role="alert">{error ?? 'Lesson not found.'}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <a href={`/learn/${course.id}`} className="inline-flex min-h-11 items-center text-sm font-bold text-indigo-700 hover:underline">← Course lessons</a>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><JourneySteps current="Video" /></section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)]">
        <section>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Lesson {lesson.position} of {course.lessons.length}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{lesson.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.description}</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 shadow-lg">
            <video className="aspect-video w-full" controls playsInline preload="metadata" poster="/learning-video-poster.svg">
              <source src={lesson.video_url} type="video/mp4" />
              <track kind="captions" src={lesson.caption_url} srcLang="en" label="English" default />
              Your browser does not support video playback. Use the lesson objectives and transcript instead.
            </video>
          </div>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <strong>Prototype content notice:</strong> this video is a placeholder. Production signs must be recorded and validated by Deaf ISL experts before use.
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold text-slate-950">Learning objectives</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {lesson.objectives.map((objective) => <li key={objective} className="flex gap-2"><span className="font-bold text-teal-700" aria-hidden="true">✓</span><span>{objective}</span></li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <h2 className="font-extrabold text-indigo-950">Ready to practice?</h2>
            <p className="mt-2 text-sm text-indigo-900">Complete a three-question knowledge check. A score of 70% passes this lesson.</p>
            <a href={`/practice/${lesson.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Start practice</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
