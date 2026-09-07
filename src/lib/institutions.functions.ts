import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface CampusOption {
  id: string;
  campus_name: string;
  campus_code: string | null;
  city: string | null;
}

export interface InstitutionOption {
  id: string;
  official_name: string;
  short_name: string;
  city: string | null;
  state: string | null;
}

export interface DomainLookupResult {
  recognized: boolean;
  domain: string;
  institution: InstitutionOption | null;
  campuses: CampusOption[];
  institutions: InstitutionOption[];
}

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address.") });

/** Identify the participating institution behind an email domain. */
export const lookupInstitutionByEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }): Promise<DomainLookupResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const domain = data.email.split("@")[1] ?? "";

    const { data: allInstitutions } = await supabaseAdmin
      .from("institutions")
      .select("id, official_name, short_name, city, state")
      .eq("status", "active")
      .order("short_name");

    const { data: match } = await supabaseAdmin
      .from("institution_domains")
      .select("institution_id")
      .ilike("domain", domain)
      .maybeSingle();

    const institutions = (allInstitutions ?? []) as InstitutionOption[];
    const institution = match ? institutions.find((i) => i.id === match.institution_id) ?? null : null;

    let campuses: CampusOption[] = [];
    if (institution) {
      const { data: rows } = await supabaseAdmin
        .from("campuses")
        .select("id, campus_name, campus_code, city")
        .eq("institution_id", institution.id)
        .eq("status", "active")
        .order("campus_name");
      campuses = (rows ?? []) as CampusOption[];
    }

    return { recognized: Boolean(institution), domain, institution, campuses, institutions };
  });

export const listCampuses = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ institutionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<CampusOption[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("campuses")
      .select("id, campus_name, campus_code, city")
      .eq("institution_id", data.institutionId)
      .eq("status", "active")
      .order("campus_name");
    return (rows ?? []) as CampusOption[];
  });
