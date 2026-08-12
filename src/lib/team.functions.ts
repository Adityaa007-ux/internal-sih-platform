import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface TeamRecord {
  id: string;
  name: string;
  code: string;
  leader_id: string;
  campus: string | null;
  department: string | null;
  selected_ps_id: string | null;
  selected_ps_title: string | null;
  selected_ps_org: string | null;
  selected_at: string | null;
  created_at: string;
}

export interface MyTeamResult {
  team: TeamRecord | null;
  isLeader: boolean;
  members: { user_id: string; member_name: string; is_leader: boolean }[];
}

/** The signed-in student's team, with the persisted problem-statement selection. */
export const getMyTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyTeamResult> => {
    const { supabase, userId } = context;
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    let teamId = membership?.team_id ?? null;
    if (!teamId) {
      const { data: owned } = await supabase.from("teams").select("id").eq("leader_id", userId).limit(1).maybeSingle();
      teamId = owned?.id ?? null;
    }
    if (!teamId) return { team: null, isLeader: false, members: [] };

    const [{ data: team }, { data: members }] = await Promise.all([
      supabase.from("teams").select("*").eq("id", teamId).maybeSingle(),
      supabase.from("team_members").select("user_id, member_name, is_leader").eq("team_id", teamId),
    ]);
    if (!team) return { team: null, isLeader: false, members: [] };
    return {
      team: team as TeamRecord,
      isLeader: team.leader_id === userId,
      members: members ?? [],
    };
  });

const selectSchema = z.object({
  psId: z.string().trim().min(2).max(40),
  psTitle: z.string().trim().min(2).max(400),
  psOrg: z.string().trim().max(400).optional(),
  teamName: z.string().trim().max(120).optional(),
});

/**
 * Persists the team's problem-statement selection. One active problem per team;
 * re-selecting replaces it. Creates the student's team on first selection.
 */
export const selectTeamProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => selectSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { teamCode } = await import("./auth.server");

    // Students only — staff browse but do not select.
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (roleRows ?? []).map((r) => String(r.role));
    if (!roles.includes("student")) throw new Error("Only student accounts can select a problem statement.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, campus, department")
      .eq("id", userId)
      .maybeSingle();

    const { getMyTeamFor } = await import("./team.server");
    const existing = await getMyTeamFor(supabase, userId);
    let teamId = existing?.id ?? null;

    if (!teamId) {
      const name = (data.teamName ?? "").trim() || `${(profile?.full_name || "My").split(" ")[0]}'s Team`;
      const insert = await supabase
        .from("teams")
        .insert({
          name,
          code: teamCode(),
          leader_id: userId,
          campus: profile?.campus ?? null,
          department: profile?.department ?? null,
        })
        .select("id")
        .single();
      if (insert.error || !insert.data) throw new Error(insert.error?.message ?? "Could not create your team.");
      teamId = insert.data.id;
      await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: userId,
        member_name: profile?.full_name ?? "",
        is_leader: true,
      });
    }

    const { error } = await supabase
      .from("teams")
      .update({
        selected_ps_id: data.psId,
        selected_ps_title: data.psTitle,
        selected_ps_org: data.psOrg ?? null,
        selected_at: new Date().toISOString(),
        selected_by: userId,
      })
      .eq("id", teamId);
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor: userId,
      actor_label: profile?.full_name || "",
      action: "team.problem_selected",
      detail: `${data.psId} — ${data.psTitle.slice(0, 120)}`,
    });

    return { ok: true, teamId };
  });

/** Clears the team's current selection so a different problem can be chosen. */
export const clearTeamProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { getMyTeamFor } = await import("./team.server");
    const team = await getMyTeamFor(supabase, userId);
    if (!team) throw new Error("No team found.");
    if (team.leader_id !== userId) throw new Error("Only the team leader can change the selected problem statement.");
    const { error } = await supabase
      .from("teams")
      .update({ selected_ps_id: null, selected_ps_title: null, selected_ps_org: null, selected_at: null })
      .eq("id", team.id);
    if (error) throw new Error(error.message);
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
  members: string[];
}

/** Faculty / Mentor / Admin view of every team and the problem it selected. */
export const listTeamSelections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamSelectionRow[]> => {
    const { supabase, userId } = context;
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (roleRows ?? []).map((r) => String(r.role));
    if (!roles.some((r) => ["admin", "faculty", "mentor"].includes(r))) {
      throw new Error("Forbidden: staff access required.");
    }
    const [{ data: teams }, { data: members }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at", { ascending: false }),
      supabase.from("team_members").select("team_id, member_name, is_leader"),
    ]);
    return (teams ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      campus: t.campus,
      department: t.department,
      selected_ps_id: t.selected_ps_id,
      selected_ps_title: t.selected_ps_title,
      selected_ps_org: t.selected_ps_org,
      selected_at: t.selected_at,
      members: (members ?? [])
        .filter((m) => m.team_id === t.id)
        .map((m) => `${m.member_name || "Member"}${m.is_leader ? " (Leader)" : ""}`),
    }));
  });

