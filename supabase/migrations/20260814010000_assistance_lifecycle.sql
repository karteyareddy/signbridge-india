-- Human assistance lifecycle: request -> accepted -> in_progress -> resolved.
ALTER TABLE public.assistance_requests
  ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tracking_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.assistance_requests
  DROP CONSTRAINT IF EXISTS assistance_requests_status_check,
  ADD CONSTRAINT assistance_requests_status_check
    CHECK (status IN ('pending', 'accepted', 'in_progress', 'resolved')),
  DROP CONSTRAINT IF EXISTS assistance_requests_urgency_check,
  ADD CONSTRAINT assistance_requests_urgency_check
    CHECK (urgency IN ('normal', 'high', 'emergency'));

CREATE INDEX IF NOT EXISTS idx_assistance_operator_status
  ON public.assistance_requests(operator_id, status);

CREATE OR REPLACE FUNCTION public.enforce_assistance_request_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'pending' AND NEW.status = 'accepted') OR
    (OLD.status = 'accepted' AND NEW.status = 'in_progress') OR
    (OLD.status = 'in_progress' AND NEW.status = 'resolved')
  ) THEN
    RAISE EXCEPTION 'Invalid assistance status transition: % -> %', OLD.status, NEW.status;
  END IF;

  IF OLD.operator_id IS NOT NULL AND NEW.operator_id IS DISTINCT FROM OLD.operator_id THEN
    RAISE EXCEPTION 'An assigned assistance request cannot be reassigned';
  END IF;

  IF NEW.status = 'accepted' THEN
    IF NEW.operator_id IS NULL THEN
      RAISE EXCEPTION 'Accepted assistance requests require an operator';
    END IF;
    NEW.accepted_at := COALESCE(NEW.accepted_at, NOW());
  ELSIF NEW.status = 'in_progress' THEN
    NEW.started_at := COALESCE(NEW.started_at, NOW());
  ELSIF NEW.status = 'resolved' THEN
    NEW.resolved_at := COALESCE(NEW.resolved_at, NOW());
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assistance_request_lifecycle ON public.assistance_requests;
CREATE TRIGGER assistance_request_lifecycle
  BEFORE UPDATE ON public.assistance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_assistance_request_lifecycle();

-- Requests are no longer publicly enumerable. Citizens can read their own requests;
-- authenticated interpreters/admins can read the operator queue.
DROP POLICY IF EXISTS "Anyone can read assistance" ON public.assistance_requests;
DROP POLICY IF EXISTS "Staff/Admin can update assistance" ON public.assistance_requests;
DROP POLICY IF EXISTS "Anyone can request assistance" ON public.assistance_requests;

CREATE POLICY "Citizens can create assistance requests"
  ON public.assistance_requests FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Citizens can read own assistance requests"
  ON public.assistance_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Operators can read assistance queue"
  ON public.assistance_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'interpreter')
    )
  );

CREATE POLICY "Assigned operators can update assistance"
  ON public.assistance_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (
          users.role = 'admin' OR
          (users.role = 'interpreter' AND (operator_id IS NULL OR operator_id = auth.uid()))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (
          users.role = 'admin' OR
          (users.role = 'interpreter' AND operator_id = auth.uid())
        )
    )
  );

-- Creates a request and returns its private tracking token without granting
-- anonymous SELECT access to the underlying table.
CREATE OR REPLACE FUNCTION public.create_assistance_request(
  request_access_point_id UUID,
  request_urgency TEXT
)
RETURNS TABLE (
  id UUID,
  access_point_id UUID,
  urgency TEXT,
  status TEXT,
  tracking_token UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF request_urgency NOT IN ('normal', 'high', 'emergency') THEN
    RAISE EXCEPTION 'Invalid urgency level';
  END IF;

  RETURN QUERY
  INSERT INTO public.assistance_requests (
    access_point_id,
    user_id,
    urgency,
    status
  )
  VALUES (
    request_access_point_id,
    auth.uid(),
    request_urgency,
    'pending'
  )
  RETURNING
    assistance_requests.id,
    assistance_requests.access_point_id,
    assistance_requests.urgency,
    assistance_requests.status,
    assistance_requests.tracking_token,
    assistance_requests.created_at,
    assistance_requests.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.create_assistance_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_assistance_request(UUID, TEXT) TO anon, authenticated;

-- Anonymous requesters receive this token only from their own INSERT response.
-- The function reveals status/timestamps only when both the request id and token match.
CREATE OR REPLACE FUNCTION public.get_assistance_request_status(
  request_id UUID,
  request_tracking_token UUID
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    assistance_requests.id,
    assistance_requests.status,
    assistance_requests.accepted_at,
    assistance_requests.started_at,
    assistance_requests.resolved_at,
    assistance_requests.updated_at
  FROM public.assistance_requests
  WHERE assistance_requests.id = request_id
    AND assistance_requests.tracking_token = request_tracking_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_assistance_request_status(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_assistance_request_status(UUID, UUID) TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'assistance_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assistance_requests;
  END IF;
END;
$$;
