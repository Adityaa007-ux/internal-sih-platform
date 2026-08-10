-- Roles
CREATE TYPE public.app_role AS ENUM ('student','admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prn TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  mobile TEXT,
  verified_channel TEXT NOT NULL DEFAULT 'email',
  department TEXT,
  campus TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- Admin allowlist (service role only)
CREATE TABLE public.admin_allowlist (
  email TEXT PRIMARY KEY,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
INSERT INTO public.admin_allowlist (email, note) VALUES
  ('admin@jspm.edu.in','Prototype JGI-SIH administrator'),
  ('coordinator@jspm.edu.in','Prototype JGI-SIH coordinator');

-- OTP challenges (service role only)
CREATE TABLE public.otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  contact TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'signup',
  prn TEXT,
  full_name TEXT,
  code_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  consumed BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.otp_challenges TO service_role;
ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;
CREATE INDEX otp_contact_idx ON public.otp_challenges (contact, created_at DESC);

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT 'General',
  published BOOLEAN NOT NULL DEFAULT true,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published announcements" ON public.announcements FOR SELECT TO authenticated
  USING ((published AND NOT archived) OR public.has_role(auth.uid(),'admin'));

-- Deadlines
CREATE TABLE public.deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_at TIMESTAMPTZ NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.deadlines TO authenticated;
GRANT ALL ON public.deadlines TO service_role;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published deadlines" ON public.deadlines FOR SELECT TO authenticated
  USING (published OR public.has_role(auth.uid(),'admin'));

-- Mentors / faculty coordinators
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Mentor',
  department TEXT NOT NULL DEFAULT '',
  expertise TEXT NOT NULL DEFAULT '',
  email TEXT,
  assigned_team TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mentors TO authenticated;
GRANT ALL ON public.mentors TO service_role;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read mentors" ON public.mentors FOR SELECT TO authenticated USING (true);

-- Results
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_ref TEXT NOT NULL,
  team_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Under Review',
  final_score NUMERIC,
  remarks TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published results" ON public.results FOR SELECT TO authenticated
  USING (published OR public.has_role(auth.uid(),'admin'));

-- Audit log (admins read; server writes)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID,
  actor_label TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- Prototype seed data
INSERT INTO public.announcements (title, body, tag) VALUES
  ('JGI-SIH 2026 registrations are open','Teams of 4-6 members can register through the portal. PRN is mandatory for every member.','Registration'),
  ('Problem statement repository published','The SIH 2025 Grand Finale source records are available in the Repository module for reference.','Repository'),
  ('Proposal submission window','Submit your proposal before the internal deadline. AI analysis runs automatically after submission.','Submission'),
  ('Mentor allocation in progress','Faculty coordinators are assigning mentors campus-wise. Check My Team for your allocation.','Mentorship');

INSERT INTO public.deadlines (label, description, due_at) VALUES
  ('Team registration closes','Lock your team membership before this date.', now() + interval '10 days'),
  ('Problem statement selection','Each team must lock one problem statement.', now() + interval '16 days'),
  ('Proposal submission','Final proposal submission for AI analysis and faculty review.', now() + interval '24 days'),
  ('Internal presentation round','Offline presentation before the evaluation panel.', now() + interval '35 days');

INSERT INTO public.mentors (name, kind, department, expertise, email) VALUES
  ('Dr. Anjali Deshpande','Faculty Coordinator','Computer Engineering','AI/ML, Data Science','anjali.deshpande@jspm.edu.in'),
  ('Prof. Rahul Kulkarni','Mentor','Information Technology','Web Platforms, Cloud','rahul.kulkarni@jspm.edu.in'),
  ('Dr. Sneha Patil','Mentor','Electronics & Telecom','IoT, Embedded Systems','sneha.patil@jspm.edu.in'),
  ('Prof. Amit Jadhav','Mentor','Mechanical Engineering','Robotics, Hardware Prototyping','amit.jadhav@jspm.edu.in'),
  ('Dr. Priya Nair','Faculty Coordinator','Computer Engineering','Cybersecurity, Blockchain','priya.nair@jspm.edu.in');