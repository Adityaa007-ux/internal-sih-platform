
CREATE TABLE IF NOT EXISTS public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name text NOT NULL,
  short_name text NOT NULL,
  institution_type text NOT NULL DEFAULT 'college',
  university_name text,
  state text,
  city text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  campus_name text NOT NULL,
  campus_code text,
  address text,
  city text,
  state text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campuses_institution_idx ON public.campuses(institution_id);

CREATE TABLE IF NOT EXISTS public.institution_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  domain text NOT NULL,
  verification_status text NOT NULL DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS institution_domains_domain_key ON public.institution_domains(lower(domain));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_id uuid REFERENCES public.campuses(id);
CREATE INDEX IF NOT EXISTS profiles_institution_idx ON public.profiles(institution_id);

GRANT SELECT ON public.institutions TO anon, authenticated;
GRANT SELECT ON public.campuses TO anon, authenticated;
GRANT SELECT ON public.institution_domains TO anon, authenticated;
GRANT ALL ON public.institutions TO service_role;
GRANT ALL ON public.campuses TO service_role;
GRANT ALL ON public.institution_domains TO service_role;

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "institutions readable" ON public.institutions;
CREATE POLICY "institutions readable" ON public.institutions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "institutions admin write" ON public.institutions;
CREATE POLICY "institutions admin write" ON public.institutions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "campuses readable" ON public.campuses;
CREATE POLICY "campuses readable" ON public.campuses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "campuses admin write" ON public.campuses;
CREATE POLICY "campuses admin write" ON public.campuses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "domains readable" ON public.institution_domains;
CREATE POLICY "domains readable" ON public.institution_domains FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "domains admin write" ON public.institution_domains;
CREATE POLICY "domains admin write" ON public.institution_domains FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.institutions (official_name, short_name, institution_type, university_name, state, city)
SELECT 'JSPM Group of Institutes', 'JSPM', 'group', 'JSPM University', 'Maharashtra', 'Pune'
WHERE NOT EXISTS (SELECT 1 FROM public.institutions WHERE short_name = 'JSPM');

INSERT INTO public.campuses (institution_id, campus_name, campus_code, city, state)
SELECT i.id, c.name, c.code, 'Pune', 'Maharashtra'
FROM public.institutions i
CROSS JOIN (VALUES
  ('Wagholi Campus','JSPM-WGH'),
  ('Nere Campus','JSPM-NRE'),
  ('Tathawade Campus','JSPM-TTW'),
  ('Hadapsar Campus','JSPM-HDP'),
  ('Narhe Campus','JSPM-NRH')
) AS c(name, code)
WHERE i.short_name = 'JSPM'
  AND NOT EXISTS (SELECT 1 FROM public.campuses x WHERE x.institution_id = i.id AND x.campus_name = c.name);

INSERT INTO public.institution_domains (institution_id, domain, verification_status)
SELECT i.id, d.domain, 'verified'
FROM public.institutions i
CROSS JOIN (VALUES ('jspmuniversity.ac.in'), ('jspm.edu.in'), ('jspmrscoe.edu.in')) AS d(domain)
WHERE i.short_name = 'JSPM'
  AND NOT EXISTS (SELECT 1 FROM public.institution_domains x WHERE lower(x.domain) = lower(d.domain));

UPDATE public.profiles p
SET institution_id = (SELECT id FROM public.institutions WHERE short_name = 'JSPM' LIMIT 1)
WHERE p.institution_id IS NULL;

UPDATE public.profiles p
SET campus_id = c.id
FROM public.campuses c
WHERE p.campus_id IS NULL AND p.campus IS NOT NULL AND lower(c.campus_name) = lower(p.campus);
