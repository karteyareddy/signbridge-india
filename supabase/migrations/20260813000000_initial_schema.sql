-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2.1 Core Identity & Access
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'citizen',
  preferred_language TEXT DEFAULT 'en',
  accessibility_preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Institutional Data
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  readiness_level INTEGER DEFAULT 0
);

CREATE TABLE public.access_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  nfc_id TEXT UNIQUE,
  active BOOLEAN DEFAULT true
);

CREATE TABLE public.staff_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  training_level INTEGER DEFAULT 0,
  badge TEXT,
  UNIQUE (user_id, institution_id)
);

-- 2.3 Learning Ecosystem
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  version INTEGER DEFAULT 1
);

-- 2.4 Service & Phrase Dictionary
CREATE TABLE public.service_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  content_hash TEXT NOT NULL,
  UNIQUE (service_type, locale, version)
);

CREATE TABLE public.phrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_pack_id UUID NOT NULL REFERENCES public.service_packs(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  text TEXT NOT NULL,
  isl_asset TEXT NOT NULL,
  source TEXT DEFAULT 'official',
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 2.5 Telemetry & Practice
CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  phrase_id UUID NOT NULL REFERENCES public.phrases(id) ON DELETE CASCADE,
  score INTEGER,
  confidence NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  predicted_intent TEXT NOT NULL,
  confidence NUMERIC(5,2) NOT NULL,
  accepted BOOLEAN NOT NULL,
  model_version TEXT NOT NULL
);

-- 2.6 Realtime & Escalation
CREATE TABLE public.assistance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_point_id UUID NOT NULL REFERENCES public.access_points(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Feedback & Community
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_point_id UUID REFERENCES public.access_points(id) ON DELETE SET NULL,
  phrase_id UUID REFERENCES public.phrases(id) ON DELETE SET NULL,
  outcome TEXT NOT NULL,
  rating INTEGER,
  comment TEXT
);

CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phrase_id UUID NOT NULL REFERENCES public.phrases(id) ON DELETE CASCADE,
  reporter_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open'
);

-- 2.8 AI Model Governance
CREATE TABLE public.model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT UNIQUE NOT NULL,
  dataset_version TEXT NOT NULL,
  metrics JSONB NOT NULL,
  deployed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX idx_access_points_qr ON public.access_points(qr_token);
CREATE INDEX idx_service_packs_lookup ON public.service_packs(service_type, locale, version);
CREATE INDEX idx_phrases_spack ON public.phrases(service_pack_id);
CREATE INDEX idx_assistance_status ON public.assistance_requests(status);
CREATE INDEX idx_feedback_ap ON public.feedback(access_point_id);

-- 5. Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read for institutions" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Public read for access_points" ON public.access_points FOR SELECT USING (true);
CREATE POLICY "Public read for courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read for lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public read for service_packs" ON public.service_packs FOR SELECT USING (true);
CREATE POLICY "Public read for phrases" ON public.phrases FOR SELECT USING (true);
CREATE POLICY "Public read for model_versions" ON public.model_versions FOR SELECT USING (true);

-- Personal data policies
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own practice" ON public.practice_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice" ON public.practice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own staff profile" ON public.staff_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own staff profile" ON public.staff_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Escalation/Assistance policies
CREATE POLICY "Anyone can request assistance" ON public.assistance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read assistance" ON public.assistance_requests FOR SELECT USING (true);
CREATE POLICY "Staff/Admin can update assistance" ON public.assistance_requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE users.id = auth.uid() AND (users.role IN ('admin', 'staff', 'interpreter'))
  )
);

-- Telemetry policies
CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert ai predictions" ON public.ai_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert content report" ON public.content_reports FOR INSERT WITH CHECK (true);

-- RPC for Readiness
CREATE OR REPLACE FUNCTION get_institution_readiness(inst_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  tot_staff INT;
  trn_staff INT;
  succ_interact INT;
  escal_count INT;
BEGIN
  SELECT COUNT(*) INTO tot_staff FROM public.staff_profiles WHERE institution_id = inst_id;
  SELECT COUNT(*) INTO trn_staff FROM public.staff_profiles WHERE institution_id = inst_id AND training_level > 0;
  SELECT COUNT(*) INTO succ_interact FROM public.feedback f JOIN public.access_points ap ON f.access_point_id = ap.id WHERE ap.institution_id = inst_id AND f.outcome = 'success';
  SELECT COUNT(*) INTO escal_count FROM public.assistance_requests ar JOIN public.access_points ap ON ar.access_point_id = ap.id WHERE ap.institution_id = inst_id;
  
  result := jsonb_build_object(
    'total_staff', tot_staff,
    'trained_staff', trn_staff,
    'successful_interactions', succ_interact,
    'escalation_count', escal_count,
    'readiness_score', CASE WHEN tot_staff > 0 THEN (trn_staff * 100 / tot_staff) ELSE 0 END
  );
  RETURN result;
END;
$$;
