
CREATE TABLE IF NOT EXISTS public.industrial_mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  contact_email text NOT NULL,
  mobile text NOT NULL,
  linkedin_url text NOT NULL,
  designation text NOT NULL,
  company text NOT NULL,
  industry text NOT NULL DEFAULT '',
  experience_years integer NOT NULL DEFAULT 0,
  expertise text NOT NULL DEFAULT '',
  skills text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text,
  portfolio_url text,
  website_url text,
  certifications text,
  mentor_scope text NOT NULL DEFAULT 'industrial',
  accepting_requests boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS imp_status_idx ON public.industrial_mentor_profiles(status);
CREATE INDEX IF NOT EXISTS imp_company_idx ON public.industrial_mentor_profiles(lower(company));

GRANT SELECT, INSERT, UPDATE ON public.industrial_mentor_profiles TO authenticated;
GRANT ALL ON public.industrial_mentor_profiles TO service_role;
ALTER TABLE public.industrial_mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browse active industrial mentors" ON public.industrial_mentor_profiles
  FOR SELECT TO authenticated
  USING (status = 'active' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mentor creates own industrial profile" ON public.industrial_mentor_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "mentor updates own industrial profile" ON public.industrial_mentor_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER industrial_mentor_profiles_updated_at BEFORE UPDATE ON public.industrial_mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES public.institutions(id),
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  response_note text NOT NULL DEFAULT '',
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS mentorship_requests_open_idx
  ON public.mentorship_requests(student_id, mentor_user_id)
  WHERE status IN ('pending','accepted');
CREATE INDEX IF NOT EXISTS mentorship_requests_mentor_idx ON public.mentorship_requests(mentor_user_id, status);
CREATE INDEX IF NOT EXISTS mentorship_requests_student_idx ON public.mentorship_requests(student_id, status);

GRANT SELECT, INSERT, UPDATE ON public.mentorship_requests TO authenticated;
GRANT ALL ON public.mentorship_requests TO service_role;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants read requests" ON public.mentorship_requests
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR mentor_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "student creates request" ON public.mentorship_requests
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "participants update request" ON public.mentorship_requests
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR mentor_user_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR mentor_user_id = auth.uid());

CREATE TRIGGER mentorship_requests_updated_at BEFORE UPDATE ON public.mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.is_request_participant(_request_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mentorship_requests r
    WHERE r.id = _request_id AND r.status = 'accepted'
      AND (r.student_id = _user_id OR r.mentor_user_id = _user_id)
  );
$$;

CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mentor_messages_request_idx ON public.mentor_messages(request_id, created_at);

GRANT SELECT, INSERT ON public.mentor_messages TO authenticated;
GRANT ALL ON public.mentor_messages TO service_role;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connection reads messages" ON public.mentor_messages
  FOR SELECT TO authenticated USING (public.is_request_participant(request_id, auth.uid()));
CREATE POLICY "connection sends messages" ON public.mentor_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_request_participant(request_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  role text,
  institution_id uuid REFERENCES public.institutions(id),
  device_label text NOT NULL DEFAULT 'Unknown device',
  user_agent text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON public.user_sessions(user_id, status);

GRANT SELECT, UPDATE ON public.user_sessions TO authenticated;
GRANT ALL ON public.user_sessions TO service_role;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own sessions read" ON public.user_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own sessions revoke" ON public.user_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
