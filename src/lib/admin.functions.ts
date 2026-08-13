import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Throws unless the caller holds the admin role (checked in the database). */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required.");
}

async function audit(context: { supabase: any; userId: string }, action: string, detail: string) {
  await context.supabase.from("audit_log").insert({ actor: context.userId, action, detail });
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [students, admins, announcements, deadlines, mentors, results, audits] = await Promise.all([
      context.supabase.from("profiles").select("id", { count: "exact", head: true }),
      context.supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
      context.supabase.from("announcements").select("id", { count: "exact", head: true }).eq("archived", false),
      context.supabase.from("deadlines").select("id", { count: "exact", head: true }),
      context.supabase.from("mentors").select("id", { count: "exact", head: true }).eq("active", true),
      context.supabase.from("results").select("id", { count: "exact", head: true }).eq("published", true),
      context.supabase
        .from("audit_log")
        .select("id, actor_label, action, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
    return {
      students: students.count ?? 0,
      admins: admins.count ?? 0,
      announcements: announcements.count ?? 0,
      deadlines: deadlines.count ?? 0,
      mentors: mentors.count ?? 0,
      publishedResults: results.count ?? 0,
      recentAudit: audits.data ?? [],
    };
  });

export const listStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, prn, full_name, email, mobile, department, campus, verified_channel, status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setStudentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["active", "suspended"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("profiles").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "student.status", `${data.id} → ${data.status}`);
    return { ok: true };
  });

/* ---------------- announcements ---------------- */

export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(3).max(160),
        body: z.string().trim().max(2000),
        tag: z.string().trim().max(40),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { error } = id
      ? await context.supabase.from("announcements").update(rest).eq("id", id)
      : await context.supabase.from("announcements").insert(rest);
    if (error) throw new Error(error.message);
    await audit(context, data.id ? "announcement.update" : "announcement.create", data.title);
    return { ok: true };
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("announcements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "announcement.delete", data.id);
    return { ok: true };
  });

/* ---------------- deadlines ---------------- */

export const listDeadlines = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("deadlines").select("*").order("due_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertDeadline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        label: z.string().trim().min(3).max(120),
        description: z.string().trim().max(500),
        due_at: z.string().min(4),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const row = { ...rest, due_at: new Date(data.due_at).toISOString() };
    const { error } = id
      ? await context.supabase.from("deadlines").update(row).eq("id", id)
      : await context.supabase.from("deadlines").insert(row);
    if (error) throw new Error(error.message);
    await audit(context, data.id ? "deadline.update" : "deadline.create", data.label);
    return { ok: true };
  });

export const deleteDeadline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("deadlines").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "deadline.delete", data.id);
    return { ok: true };
  });

/* ---------------- mentors ---------------- */

export const listMentors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("mentors").select("*").order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(2).max(120),
        kind: z.string().trim().max(40),
        department: z.string().trim().max(120),
        expertise: z.string().trim().max(240),
        email: z.string().trim().max(160).nullable(),
        assigned_team: z.string().trim().max(120).nullable(),
        active: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { error } = id
      ? await context.supabase.from("mentors").update(rest).eq("id", id)
      : await context.supabase.from("mentors").insert(rest);
    if (error) throw new Error(error.message);
    await audit(context, data.id ? "mentor.update" : "mentor.create", data.name);
    return { ok: true };
  });

export const deleteMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("mentors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "mentor.delete", data.id);
    return { ok: true };
  });

/* ---------------- results ---------------- */

export const listResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("results")
      .select("*")
      .order("final_score", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        team_ref: z.string().trim().min(1).max(60),
        team_name: z.string().trim().max(160),
        status: z.enum(["Under Review", "Shortlisted", "Selected", "Not Selected"]),
        final_score: z.number().min(0).max(100).nullable(),
        remarks: z.string().trim().max(600),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const row = { ...rest, published_at: data.published ? new Date().toISOString() : null };
    const { error } = id
      ? await context.supabase.from("results").update(row).eq("id", id)
      : await context.supabase.from("results").insert(row);
    if (error) throw new Error(error.message);
    await audit(context, data.id ? "result.update" : "result.create", `${data.team_ref} → ${data.status}`);
    return { ok: true };
  });

export const publishAllResults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ published: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("results")
      .update({ published: data.published, published_at: data.published ? new Date().toISOString() : null })
      .neq("team_ref", "");
    if (error) throw new Error(error.message);
    await audit(context, "result.publish", String(data.published));
    return { ok: true };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ---------------- staff: approvals & team selections ---------------- */

/** Admin OR faculty may approve pending mentor/admin accounts. */
async function assertStaff(context: { supabase: any; userId: string }) {
  const [admin, faculty] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "faculty" }),
  ]);
  if (!admin.data && !faculty.data) throw new Error("Forbidden: faculty or admin access required.");
}

export interface PendingAccount {
  id: string;
  full_name: string;
  email: string | null;
  mobile: string | null;
  approval_status: string;
  created_at: string;
  role: string;
}

export const listPendingApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PendingAccount[]> => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, mobile, approval_status, created_at")
      .neq("approval_status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    if (!rows.length) return [];
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", rows.map((r: any) => r.id));
    const byUser = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
    return rows.map((r: any) => ({ ...r, role: (byUser.get(r.id) as string) ?? "student" }));
  });

export const setApprovalStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("profiles")
      .update({ approval_status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "account.approval", `${data.id} → ${data.status}`);
    return { ok: true };
  });

export interface TeamSelectionRow {
  id: string;
  name: string;
  code: string;
  campus: string | null;
  department: string | null;
  selected_ps_id: string | null;
  selected_ps_title: string | null;
  selected_ps_org: string | null;
  selected_at: string | null;
}

export const listTeamSelections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamSelectionRow[]> => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("teams")
      .select("id, name, code, campus, department, selected_ps_id, selected_ps_title, selected_ps_org, selected_at")
      .order("selected_at", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as TeamSelectionRow[];
  });
