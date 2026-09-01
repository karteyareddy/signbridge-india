import {
  LearningAttempt,
  LearningCourse,
  LearningProgress,
  PracticeQuestion,
} from '../../types/learning';

const COURSE_ID = '33333333-3333-3333-3333-333333333333';
const DEMO_VIDEO = 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4';

function questions(
  lesson: string,
  items: Array<[string, string[], number, string]>
): PracticeQuestion[] {
  return items.map(([prompt, options, correctOption, explanation], index) => ({
    id: `${lesson}-q${index + 1}`,
    prompt,
    options,
    correctOption,
    explanation,
  }));
}

export const DEMO_COURSES: LearningCourse[] = [
  {
    id: COURSE_ID,
    category: 'Healthcare',
    language: 'English + ISL',
    level: 'Beginner',
    title: 'ISL for Hospital Receptionists',
    description:
      'Five short lessons for respectful, routine communication at a hospital reception counter.',
    badge_name: 'ISL Ready Receptionist',
    lessons: [
      {
        id: '31111111-1111-4111-8111-111111111111',
        course_id: COURSE_ID,
        title: 'Welcome and respectful attention',
        description: 'Learn how to greet a Deaf visitor and establish their preferred way to communicate.',
        video_url: DEMO_VIDEO,
        caption_url: '/captions/welcome.vtt',
        duration: 240,
        position: 1,
        objectives: ['Get attention respectfully', 'Introduce yourself', 'Ask communication preference'],
        practice_questions: questions('welcome', [
          ['What is the respectful first step?', ['Wave directly in their face', 'Move into view and make eye contact', 'Speak more loudly'], 1, 'Move into the person’s field of view and establish eye contact without startling them.'],
          ['What should reception staff ask?', ['Preferred communication method', 'Why they cannot hear', 'Whether a family member can answer'], 0, 'Ask the person whether they prefer ISL, writing, captions, or another available method.'],
          ['Which behavior supports clear communication?', ['Covering your mouth', 'Looking at the computer', 'Facing the visitor in good light'], 2, 'Face the visitor with your expression and hands visible.'],
        ]),
      },
      {
        id: '32222222-2222-4222-8222-222222222222',
        course_id: COURSE_ID,
        title: 'Appointments and registration',
        description: 'Use essential concepts for appointments, registration, names, and patient numbers.',
        video_url: DEMO_VIDEO,
        caption_url: '/captions/appointments.vtt',
        duration: 300,
        position: 2,
        objectives: ['Confirm an appointment', 'Request a patient number', 'Explain registration'],
        practice_questions: questions('appointments', [
          ['Which detail should be confirmed visually?', ['Appointment date and time', 'Only the doctor’s surname', 'The visitor’s disability'], 0, 'Show the appointment date and time in writing as well as signing it.'],
          ['If a sign is not understood, what is safest?', ['Guess the meaning', 'Use the validated phrase board or writing', 'End the interaction'], 1, 'A validated phrase or written clarification is safer than guessing.'],
          ['What should remain visible while signing?', ['Hands and face', 'Only the hands', 'Only printed forms'], 0, 'ISL communication uses hand movement together with facial and body information.'],
        ]),
      },
      {
        id: '33333333-3333-4333-8333-333333333334',
        course_id: COURSE_ID,
        title: 'Documents and identity',
        description: 'Explain which documents are needed without taking control away from the visitor.',
        video_url: DEMO_VIDEO,
        caption_url: '/captions/documents.vtt',
        duration: 270,
        position: 3,
        objectives: ['Request identification', 'Explain missing documents', 'Protect private information'],
        practice_questions: questions('documents', [
          ['How should missing documents be explained?', ['Point vaguely at the form', 'List the exact documents visually or in writing', 'Ask another patient to explain'], 1, 'A specific visual or written list reduces ambiguity.'],
          ['What is appropriate when checking identification?', ['Display it publicly', 'Keep it private and return it promptly', 'Photograph it on a personal phone'], 1, 'Identity documents contain private information and should be handled discreetly.'],
          ['Who should answer questions about the visitor?', ['The visitor whenever possible', 'Any hearing companion', 'Another person in the queue'], 0, 'Address and involve the Deaf visitor directly.'],
        ]),
      },
      {
        id: '34444444-4444-4444-8444-444444444444',
        course_id: COURSE_ID,
        title: 'Directions and waiting',
        description: 'Give visual directions, explain queue status, and make waiting information accessible.',
        video_url: DEMO_VIDEO,
        caption_url: '/captions/directions.vtt',
        duration: 240,
        position: 4,
        objectives: ['Give visual directions', 'Explain queue position', 'Confirm understanding'],
        practice_questions: questions('directions', [
          ['What makes directions clearer?', ['A visual landmark and counter number', 'Pointing quickly', 'Repeating the same sentence louder'], 0, 'Use visible landmarks, floor information, and a written counter number.'],
          ['How should a Deaf visitor be called from a queue?', ['Audio announcement only', 'Visual display or direct visual attention', 'Ask them to keep checking every minute'], 1, 'Queue information must have a visual channel.'],
          ['How do you confirm directions were understood?', ['Assume they were clear', 'Ask the visitor to confirm the destination', 'Ask a companion instead'], 1, 'A brief confirmation catches misunderstandings respectfully.'],
        ]),
      },
      {
        id: '35555555-5555-4555-8555-555555555555',
        course_id: COURSE_ID,
        title: 'Safety and human assistance',
        description: 'Recognize when a validated phrase is insufficient and connect appropriate human support.',
        video_url: DEMO_VIDEO,
        caption_url: '/captions/safety.vtt',
        duration: 300,
        position: 5,
        objectives: ['Avoid guessing', 'Escalate complex communication', 'Handle emergencies visibly'],
        practice_questions: questions('safety', [
          ['When should staff request qualified human support?', ['For complex or high-stakes communication', 'For every greeting', 'Only after the visitor leaves'], 0, 'Medical consent, diagnosis, or complex decisions need qualified communication support.'],
          ['What should an uncertain AI result be treated as?', ['A confirmed interpretation', 'A prompt to clarify or use a fallback', 'An official medical instruction'], 1, 'Uncertain predictions must never be presented as confirmed interpretation.'],
          ['During an emergency, what is essential?', ['Use visual instructions and summon trained help', 'Rely only on a loudspeaker', 'Wait for a family member'], 0, 'Provide immediate visual information while following the institution’s emergency process.'],
        ]),
      },
    ],
  },
];

export const PASSING_SCORE = 70;
export const BADGE_SCORE = 80;

export function scorePractice(answers: number[], questionsToScore: PracticeQuestion[]): number {
  if (questionsToScore.length === 0) return 0;
  const correct = questionsToScore.reduce(
    (total, question, index) => total + (answers[index] === question.correctOption ? 1 : 0),
    0
  );
  return Math.round((correct / questionsToScore.length) * 100);
}

export function calculateLearningProgress(
  course: LearningCourse,
  attempts: LearningAttempt[]
): LearningProgress {
  const lessonScores: Record<string, number> = {};
  for (const attempt of attempts.filter((item) => item.courseId === course.id)) {
    lessonScores[attempt.lessonId] = Math.max(lessonScores[attempt.lessonId] ?? 0, attempt.score);
  }

  const completedLessons = course.lessons.filter(
    (lesson) => (lessonScores[lesson.id] ?? 0) >= PASSING_SCORE
  ).length;
  const passingScores = Object.values(lessonScores).filter((score) => score >= PASSING_SCORE);
  const averageScore = passingScores.length
    ? Math.round(passingScores.reduce((sum, score) => sum + score, 0) / passingScores.length)
    : 0;
  const isBadgeEarned =
    completedLessons === course.lessons.length && averageScore >= BADGE_SCORE;

  return {
    courseId: course.id,
    completedLessons,
    totalLessons: course.lessons.length,
    completionPercent: course.lessons.length
      ? Math.round((completedLessons / course.lessons.length) * 100)
      : 0,
    averageScore,
    lessonScores,
    badge: isBadgeEarned ? course.badge_name : null,
  };
}

export function isLessonUnlocked(
  course: LearningCourse,
  lessonPosition: number,
  progress: LearningProgress
): boolean {
  if (lessonPosition <= 1) return true;
  const previousLesson = course.lessons.find((lesson) => lesson.position === lessonPosition - 1);
  return previousLesson ? (progress.lessonScores[previousLesson.id] ?? 0) >= PASSING_SCORE : false;
}

export function findLesson(lessonId: string): { course: LearningCourse; lessonIndex: number } | null {
  for (const course of DEMO_COURSES) {
    const lessonIndex = course.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (lessonIndex >= 0) return { course, lessonIndex };
  }
  return null;
}
