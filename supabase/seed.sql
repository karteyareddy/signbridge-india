-- Create some dummy institutions
INSERT INTO public.institutions (id, name, type, district, state, address, readiness_level)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'District General Hospital', 'hospital', 'Central', 'Delhi', '123 Health Way', 80),
  ('22222222-2222-2222-2222-222222222222', 'State Science College', 'college', 'North', 'Delhi', '456 Edu Lane', 60);

-- Create access points
INSERT INTO public.access_points (id, institution_id, service_type, qr_token, active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'registration', 'hosp-reg-001', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'pharmacy', 'hosp-pha-001', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'admission', 'col-adm-001', true);

-- Create learning courses
INSERT INTO public.courses (id, category, language, level, title)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'Healthcare', 'en', 'beginner', 'ISL for Hospital Receptionists');

-- Create the five-lesson hospital receptionist learning track.
INSERT INTO public.lessons (id, course_id, title, video_url, duration)
VALUES
  ('31111111-1111-4111-8111-111111111111', '33333333-3333-3333-3333-333333333333', 'Welcome and respectful attention', 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4', 240),
  ('32222222-2222-4222-8222-222222222222', '33333333-3333-3333-3333-333333333333', 'Appointments and registration', 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4', 300),
  ('33333333-3333-4333-8333-333333333334', '33333333-3333-3333-3333-333333333333', 'Documents and identity', 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4', 270),
  ('34444444-4444-4444-8444-444444444444', '33333333-3333-3333-3333-333333333333', 'Directions and waiting', 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4', 240),
  ('35555555-5555-4555-8555-555555555555', '33333333-3333-3333-3333-333333333333', 'Safety and human assistance', 'https://cdn.pixabay.com/video/2020/05/25/40149-424458399_tiny.mp4', 300)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  video_url = EXCLUDED.video_url,
  duration = EXCLUDED.duration;

-- Create a service pack
INSERT INTO public.service_packs (id, service_type, locale, version, content_hash)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'registration', 'en', 1, 'v1_hash_abc123');

-- Create phrases
INSERT INTO public.phrases (service_pack_id, intent, text, isl_asset)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'need_appointment', 'I need an appointment', 'https://example.com/phrases/appointment.mp4'),
  ('44444444-4444-4444-4444-444444444444', 'show_id', 'Here is my ID', 'https://example.com/phrases/id.mp4'),
  ('44444444-4444-4444-4444-444444444444', 'wait', 'Please wait', 'https://example.com/phrases/wait.mp4');

-- Create model version
INSERT INTO public.model_versions (version, dataset_version, metrics)
VALUES
  ('v1.0-mvp', 'dataset_v1', '{"f1_score": 0.88, "rejected": 0.04}'::jsonb);
