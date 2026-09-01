'use client';

import { createClient } from '../supabase/client';
import { LearningAttempt, LearningCourse } from '../../types/learning';
import { DEMO_COURSES } from './catalog';

const PROGRESS_STORAGE_KEY = 'signbridge-learning-attempts-v1';

function hasConfiguredSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getLearningCourses(): Promise<LearningCourse[]> {
  if (!hasConfiguredSupabase()) return DEMO_COURSES;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('courses').select('id').limit(20);
    if (error || !data?.length) return DEMO_COURSES;

    const availableIds = new Set(data.map((course) => course.id));
    const enrichedCourses = DEMO_COURSES.filter((course) => availableIds.has(course.id));
    return enrichedCourses.length ? enrichedCourses : DEMO_COURSES;
  } catch {
    return DEMO_COURSES;
  }
}

export async function getLearningCourse(courseId: string): Promise<LearningCourse | null> {
  const courses = await getLearningCourses();
  return courses.find((course) => course.id === courseId) ?? null;
}

export function getLocalLearningAttempts(): LearningAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LearningAttempt[]) : [];
  } catch {
    return [];
  }
}

export async function saveLearningAttempt(
  attempt: LearningAttempt,
  userId?: string
): Promise<{ synced: boolean }> {
  if (typeof window !== 'undefined') {
    const attempts = getLocalLearningAttempts();
    attempts.push(attempt);
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(attempts));
    window.dispatchEvent(new CustomEvent('signbridge:learning-progress'));
  }

  if (!userId || !hasConfiguredSupabase()) return { synced: false };

  try {
    const supabase = createClient();
    const { error } = await supabase.from('learning_attempts').upsert(
      {
        user_id: userId,
        course_id: attempt.courseId,
        lesson_id: attempt.lessonId,
        score: attempt.score,
        completed_at: attempt.completedAt,
      },
      { onConflict: 'user_id,lesson_id' }
    );
    return { synced: !error };
  } catch {
    return { synced: false };
  }
}

export async function saveLearningBadge(badge: string, userId?: string): Promise<boolean> {
  if (!userId || !hasConfiguredSupabase()) return false;
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('staff_profiles')
      .update({ badge, training_level: 1 })
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}
