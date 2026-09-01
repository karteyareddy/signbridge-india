-- Persist lesson competency separately from phrase-recognition practice sessions.
CREATE TABLE public.learning_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_learning_attempts_user_course
  ON public.learning_attempts(user_id, course_id);

ALTER TABLE public.learning_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own learning attempts"
  ON public.learning_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning attempts"
  ON public.learning_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning attempts"
  ON public.learning_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
