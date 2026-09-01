import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BADGE_SCORE,
  calculateLearningProgress,
  DEMO_COURSES,
  isLessonUnlocked,
  PASSING_SCORE,
  scorePractice,
} from '../lib/learning/catalog';
import { LearningAttempt } from '../types/learning';

const course = DEMO_COURSES[0];

test('practice score is calculated from correct answers', () => {
  const questions = course.lessons[0].practice_questions;
  assert.equal(scorePractice(questions.map((question) => question.correctOption), questions), 100);
  assert.equal(scorePractice([questions[0].correctOption, -1, -1], questions), 33);
});

test('a passing score unlocks the next lesson', () => {
  const attempts: LearningAttempt[] = [{
    courseId: course.id,
    lessonId: course.lessons[0].id,
    score: PASSING_SCORE,
    completedAt: '2026-08-14T00:00:00.000Z',
  }];
  const progress = calculateLearningProgress(course, attempts);

  assert.equal(progress.completedLessons, 1);
  assert.equal(isLessonUnlocked(course, 2, progress), true);
  assert.equal(isLessonUnlocked(course, 3, progress), false);
});

test('best lesson score is retained across retries', () => {
  const lessonId = course.lessons[0].id;
  const progress = calculateLearningProgress(course, [
    { courseId: course.id, lessonId, score: 100, completedAt: '2026-08-14T00:00:00.000Z' },
    { courseId: course.id, lessonId, score: 33, completedAt: '2026-08-14T00:01:00.000Z' },
  ]);

  assert.equal(progress.lessonScores[lessonId], 100);
});

test('competency badge requires all lessons and the target average', () => {
  const attempts = course.lessons.map((lesson) => ({
    courseId: course.id,
    lessonId: lesson.id,
    score: BADGE_SCORE,
    completedAt: '2026-08-14T00:00:00.000Z',
  }));
  const progress = calculateLearningProgress(course, attempts);

  assert.equal(progress.completionPercent, 100);
  assert.equal(progress.averageScore, BADGE_SCORE);
  assert.equal(progress.badge, 'ISL Ready Receptionist');
});
