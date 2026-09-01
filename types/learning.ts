export interface PracticeQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface LearningLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  caption_url: string;
  duration: number;
  position: number;
  objectives: string[];
  practice_questions: PracticeQuestion[];
}

export interface LearningCourse {
  id: string;
  category: string;
  language: string;
  level: string;
  title: string;
  description: string;
  badge_name: string;
  lessons: LearningLesson[];
}

export interface LearningAttempt {
  courseId: string;
  lessonId: string;
  score: number;
  completedAt: string;
}

export interface LearningProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  averageScore: number;
  lessonScores: Record<string, number>;
  badge: string | null;
}
