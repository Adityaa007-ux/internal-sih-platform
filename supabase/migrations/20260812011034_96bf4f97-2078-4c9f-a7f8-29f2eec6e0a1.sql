-- profiles additions
ALTER TABLE public.profiles ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_email text;

-- otp challenge additions
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- teams
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  leader_id uuid NOT NULL,
  campus text,
  department text,
  selected_ps_id text,
  selected_ps_title text,
  selected_ps_org text,
  selected_at timestamptz,
  selected_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  member_name text NOT NULL DEFAULT '',
  is_leader boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_team_member(_team_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = _team_id AND tm.user_id = _user_id);
$$;
REVOKE ALL ON FUNCTION public.is_team_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role IN ('admin','faculty','mentor')
  );
$$;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

CREATE POLICY "Members and staff can view teams" ON public.teams
  FOR SELECT TO authenticated
  USING (public.is_team_member(id, auth.uid()) OR leader_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Leaders can create their team" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Leaders and staff can update teams" ON public.teams
  FOR UPDATE TO authenticated
  USING (leader_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (leader_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Members and staff can view team members" ON public.team_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_team_member(team_id, auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Users can join or be added by their leader" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.leader_id = auth.uid())
  );

CREATE POLICY "Leaders can remove members" ON public.team_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.leader_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();