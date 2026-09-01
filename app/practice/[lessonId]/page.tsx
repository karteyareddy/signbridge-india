'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../components/providers/auth-provider';
import { JourneySteps } from '../../../components/learning/journey-steps';
import { calculateLearningProgress, findLesson, PASSING_SCORE, scorePractice } from '../../../lib/learning/catalog';
import { getLocalLearningAttempts, saveLearningAttempt, saveLearningBadge } from '../../../lib/learning/service';

export default function PracticePage() {
  const params = useParams();
  const lessonId = (params?.lessonId as string) || '';
  const learningItem = useMemo(() => findLesson(lessonId), [lessonId]);
  const { user } = useAuth();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  if (!learningItem) {
    return <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-900" role="alert">Practice lesson not found.</div>;
  }

  const { course, lessonIndex } = learningItem;
  const lesson = course.lessons[lessonIndex];
  const question = lesson.practice_questions[questionIndex];
  const isCorrect = selectedOption === question?.correctOption;

  const checkAnswer = () => {
    if (selectedOption === null) return;
    setChecked(true);
  };

  const continuePractice = async () => {
    if (selectedOption === null) return;
    const nextAnswers = [...answers, selectedOption];
    setAnswers(nextAnswers);

    if (questionIndex < lesson.practice_questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelectedOption(null);
      setChecked(false);
      return;
    }

    const finalScore = scorePractice(nextAnswers, lesson.practice_questions);
    setScore(finalScore);
    setSaving(true);
    const result = await saveLearningAttempt(
      { courseId: course.id, lessonId: lesson.id, score: finalScore, completedAt: new Date().toISOString() },
      user?.id
    );
    const updatedProgress = calculateLearningProgress(course, getLocalLearningAttempts());
    if (updatedProgress.badge) {
      await saveLearningBadge(updatedProgress.badge, user?.id);
    }
    setSavedLocally(!result.synced);
    setSaving(false);
  };

  const retry = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setChecked(false);
    setScore(null);
    setSavedLocally(false);
  };

  if (score !== null) {
    const passed = score >= PASSING_SCORE;
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><JourneySteps current="Score" /></section>
        <section className={`rounded-2xl border p-6 text-center shadow-sm sm:p-8 ${passed ? 'border-teal-200 bg-teal-50' : 'border-amber-200 bg-amber-50'}`} aria-live="polite">
          <div className="text-5xl" aria-hidden="true">{passed ? '✓' : '↻'}</div>
          <p className="mt-3 text-sm font-bold uppercase tracking-wider text-slate-700">Practice score</p>
          <h1 className="mt-1 text-5xl font-black text-slate-950">{score}%</h1>
          <h2 className="mt-3 text-xl font-extrabold text-slate-950">{passed ? 'Lesson passed' : 'Keep practicing'}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-700">
            {passed ? 'Your progress has been recorded and the next lesson is now unlocked.' : `You need ${PASSING_SCORE}% to pass. Review the lesson and try again.`}
          </p>
          {saving && <p className="mt-3 text-sm font-semibold text-slate-600" role="status">Saving progress…</p>}
          {!saving && savedLocally && <p className="mt-3 text-xs text-slate-600" role="status">Saved on this device. Sign in with configured cloud access to sync across devices.</p>}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {!passed && <button onClick={retry} className="min-h-11 rounded-xl border border-slate-400 bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">Retry practice</button>}
            <a href="/learn/progress" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">View progress and badge</a>
            {passed && <a href={`/learn/${course.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-indigo-300 bg-white px-5 py-3 text-sm font-bold text-indigo-800 hover:bg-indigo-50">Next lesson</a>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <a href={`/learn/${course.id}/${lesson.id}`} className="inline-flex min-h-11 items-center text-sm font-bold text-indigo-700 hover:underline">← Back to video</a>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><JourneySteps current="Practice" /></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-bold text-indigo-700">Question {questionIndex + 1} of {lesson.practice_questions.length}</span>
          <span className="text-slate-500">{lesson.title}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true"><div className="h-full bg-indigo-600" style={{ width: `${((questionIndex + 1) / lesson.practice_questions.length) * 100}%` }} /></div>
        <fieldset className="mt-8" disabled={checked}>
          <legend className="text-xl font-extrabold leading-8 text-slate-950">{question.prompt}</legend>
          <div className="mt-5 space-y-3">
            {question.options.map((option, index) => {
              const selected = selectedOption === index;
              const revealCorrect = checked && index === question.correctOption;
              const revealIncorrect = checked && selected && !isCorrect;
              return (
                <label key={option} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-sm font-semibold ${revealCorrect ? 'border-teal-600 bg-teal-50 text-teal-950' : revealIncorrect ? 'border-red-500 bg-red-50 text-red-950' : selected ? 'border-indigo-600 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'}`}>
                  <input type="radio" name="answer" value={index} checked={selected} onChange={() => setSelectedOption(index)} className="h-5 w-5 accent-indigo-600" />
                  <span>{option}</span>
                  {revealCorrect && <span className="ml-auto" aria-label="Correct answer">✓ Correct</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
        {checked && (
          <div className={`mt-5 rounded-xl border p-4 text-sm ${isCorrect ? 'border-teal-200 bg-teal-50 text-teal-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`} role="status">
            <strong>{isCorrect ? 'Correct.' : 'Not quite.'}</strong> {question.explanation}
          </div>
        )}
        <button onClick={checked ? continuePractice : checkAnswer} disabled={selectedOption === null} className="mt-6 min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          {checked ? (questionIndex === lesson.practice_questions.length - 1 ? 'See score' : 'Next question') : 'Check answer'}
        </button>
      </section>
    </div>
  );
}
