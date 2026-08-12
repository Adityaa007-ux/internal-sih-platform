// Server-only team helpers.
import type { TeamRecord } from "./team.functions";

export async function getMyTeamFor(supabase: any, userId: string) {
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  const id =
    membership?.team_id ??
    (await supabase.from("teams").select("id").eq("leader_id", userId).limit(1).maybeSingle()).data?.id ??
    null;
  if (!id) return null;
  const { data } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
  return data as TeamRecord | null;
}
