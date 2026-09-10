import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface IndustrialMentor {
  id: string;
  user_id: string;
  full_name: string;
  contact_email: string;
  mobile: string;
  linkedin_url: string;
  designation: string;
  company: string;
  industry: string;
  experience_years: number;
  expertise: string;
  skills: string;
  bio: string;
  photo_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  certifications: string | null;
  mentor_scope: string;
  accepting_requests: boolean;
  status: string;
}

export interface MentorRequest {
  id: string;
  status: RequestStatus;
  message: string;
  response_note: string;
  created_at: string;
  responded_at: string | null;
  mentor_user_id: string;
  student_id: string;
  mentor?: {
    full_name: string;
    company: string;
    designation: string;
    contact_email: string;
    mobile: string;
    linkedin_url: string;
  } | null;
  student?: {
    full_name: string;
    email: string | null;
    department: string | null;
    institution_name: string | null;
    campus_name: string | null;
    team_name: string | null;
  } | null;
}

const linkedin = z
  .string()
  .trim()
  .max(300)
  .refine((v) => /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i.test(v), "Enter a valid LinkedIn profile URL.");

const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Enter your full name.").max(120),
  contact_email: z.string().trim().email("Enter a valid email address.").max(160),
  mobile: z.string().trim().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits."),
  linkedin_url: linkedin,
  designation: z.string().trim().min(2, "Enter your current designation.").max(120),
  company: z.string().trim().min(2, "Enter your company or industry.").max(160),
  industry: z.string().trim().max(120).default(""),
  experience_years: z.coerce.number().int().min(0).max(60),
  expertise: z.string().trim().min(2, "List your areas of expertise.").max(400),
  skills: z.string().trim().min(2, "List your key skills.").max(400),
  bio: z.string().trim().min(20, "Write a short professional bio (20+ characters).").max(2000),
  photo_url: z.string().trim().max(400).optional().or(z.literal("")),
  portfolio_url: z.string().trim().max(400).optional().or(z.literal("")),
  website_url: z.string().trim().max(400).optional().or(z.literal("")),
  certifications: z.string().trim().max(1000).optional().or(z.literal("")),
  mentor_scope: z.enum(["industrial", "both"]).default("industrial"),
  accepting_requests: z.boolean().default(true),
});

async function assertRole(supabase: any, userId: string, allowed: string[]) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => String(r.role));
  if (!roles.some((r: string) => allowed.includes(r))) {
    throw new Error("Your account is not allowed to perform this action.");
  }
  return roles;
}

/* ---------------- Mentor side: profile ---------------- */

export const getMyIndustrialProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IndustrialMentor | null> => {
    const { data } = await context.supabase
      .from("industrial_mentor_profiles")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    return (data as IndustrialMentor) ?? null;
  });

export const saveMyIndustrialProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertRole(context.supabase, context.userId, ["mentor", "faculty", "admin"]);
    const row = {
      user_id: context.userId,
      ...data,
      photo_url: data.photo_url || null,
      portfolio_url: data.portfolio_url || null,
      website_url: data.website_url || null,
      certifications: data.certifications || null,
      status: "active",
    };
    const { error } = await context.supabase
      .from("industrial_mentor_profiles")
      .upsert(row, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Student side: browse ---------------- */

const browseSchema = z.object({
  search: z.string().trim().max(120).default(""),
  expertise: z.string().trim().max(120).default(""),
  page: z.number().int().min(0).max(200).default(0),
  pageSize: z.number().int().min(1).max(24).default(9),
});

export const browseIndustrialMentors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => browseSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ mentors: IndustrialMentor[]; total: number }> => {
    let q = context.supabase
      .from("industrial_mentor_profiles")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(
        `full_name.ilike.${s},company.ilike.${s},designation.ilike.${s},skills.ilike.${s},expertise.ilike.${s}`,
      );
    }
    if (data.expertise) q = q.ilike("expertise", `%${data.expertise}%`);

    const from = data.page * data.pageSize;
    const { data: rows, count } = await q.order("created_at", { ascending: false }).range(from, from + data.pageSize - 1);
    return { mentors: (rows ?? []) as IndustrialMentor[], total: count ?? 0 };
  });

/* ---------------- Requests ---------------- */

export const sendMentorshipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ mentorUserId: z.string().uuid(), message: z.string().trim().max(1000).default("") }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertRole(context.supabase, context.userId, ["student"]);
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("institution_id")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: membership } = await context.supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", context.userId)
      .limit(1)
      .maybeSingle();

    const { error } = await context.supabase.from("mentorship_requests").insert({
      student_id: context.userId,
      mentor_user_id: data.mentorUserId,
      team_id: membership?.team_id ?? null,
      institution_id: profile?.institution_id ?? null,
      message: data.message,
    });
    if (error) {
      if (error.code === "23505") throw new Error("You already have an open request with this mentor.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const cancelMentorshipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mentorship_requests")
      .update({ status: "cancelled", responded_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("student_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const respondToMentorshipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["accepted", "rejected"]),
        note: z.string().trim().max(500).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mentorship_requests")
      .update({ status: data.decision, response_note: data.note, responded_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("mentor_user_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Requests raised by the signed-in student, with mentor details. */
export const listMyMentorshipRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MentorRequest[]> => {
    const { data: rows } = await context.supabase
      .from("mentorship_requests")
      .select("id, status, message, response_note, created_at, responded_at, mentor_user_id, student_id")
      .eq("student_id", context.userId)
      .order("created_at", { ascending: false });
    const list = (rows ?? []) as MentorRequest[];
    if (!list.length) return [];

    const { data: mentors } = await context.supabase
      .from("industrial_mentor_profiles")
      .select("user_id, full_name, company, designation, contact_email, mobile, linkedin_url")
      .in("user_id", list.map((r) => r.mentor_user_id));

    return list.map((r) => {
      const m = (mentors ?? []).find((x) => x.user_id === r.mentor_user_id);
      const connected = r.status === "accepted";
      return {
        ...r,
        mentor: m
          ? {
              full_name: m.full_name,
              company: m.company,
              designation: m.designation,
              // Contact details are released only once the mentor accepts.
              contact_email: connected ? m.contact_email : "",
              mobile: connected ? m.mobile : "",
              linkedin_url: m.linkedin_url,
            }
          : null,
      };
    });
  });

/** Requests addressed to the signed-in industrial mentor, with student context. */
export const listIncomingMentorshipRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MentorRequest[]> => {
    const { data: rows } = await context.supabase
      .from("mentorship_requests")
      .select("id, status, message, response_note, created_at, responded_at, mentor_user_id, student_id, team_id")
      .eq("mentor_user_id", context.userId)
      .order("created_at", { ascending: false });
    const list = (rows ?? []) as (MentorRequest & { team_id: string | null })[];
    if (!list.length) return [];

    // Reading another member's profile requires elevated access; the caller has
    // already been proven to be the mentor these requests belong to.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, department, campus, institution_id")
      .in("id", list.map((r) => r.student_id));
    const { data: institutions } = await supabaseAdmin.from("institutions").select("id, short_name, official_name");
    const teamIds = list.map((r) => r.team_id).filter(Boolean) as string[];
    const { data: teams } = teamIds.length
      ? await supabaseAdmin.from("teams").select("id, name").in("id", teamIds)
      : { data: [] as { id: string; name: string }[] };

    return list.map((r) => {
      const p = (profiles ?? []).find((x) => x.id === r.student_id);
      const inst = (institutions ?? []).find((i) => i.id === p?.institution_id);
      return {
        ...r,
        student: p
          ? {
              full_name: p.full_name,
              email: p.email,
              department: p.department,
              institution_name: inst?.short_name ?? inst?.official_name ?? null,
              campus_name: p.campus,
              team_name: (teams ?? []).find((t) => t.id === r.team_id)?.name ?? null,
            }
          : null,
      };
    });
  });

/* ---------------- Messaging within an accepted connection ---------------- */

export interface MentorMessage {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const listMentorMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ requestId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<MentorMessage[]> => {
    const { data: rows } = await context.supabase
      .from("mentor_messages")
      .select("id, request_id, sender_id, body, created_at")
      .eq("request_id", data.requestId)
      .order("created_at", { ascending: true })
      .limit(200);
    return (rows ?? []) as MentorMessage[];
  });

export const sendMentorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ requestId: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mentor_messages")
      .insert({ request_id: data.requestId, sender_id: context.userId, body: data.body });
    if (error) throw new Error("You can only message a mentor after the request is accepted.");
    return { ok: true };
  });
