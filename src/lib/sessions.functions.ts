import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SessionRow {
  id: string;
  device_label: string;
  status: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  current: boolean;
}

function claimSessionId(claims: Record<string, unknown> | undefined): string {
  const id = claims?.["session_id"] ?? claims?.["sid"];
  return typeof id === "string" && id ? id : "";
}

/**
 * Stable identifier for one login on one device. Uses the auth session id when
 * the token carries one, otherwise falls back to a per-user/per-device key so
 * each browser still gets its own session row.
 */
function sessionKey(
  claims: Record<string, unknown> | undefined,
  userId: string,
  userAgent: string,
): string {
  return claimSessionId(claims) || `device:${userId}:${userAgent}`;
}

/**
 * Records (or refreshes) the login session for the signed-in user.
 * One row per device/browser session; permanent app data is never touched here.
 */
export const registerSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: boolean; revoked: boolean }> => {
    const { hashSessionId, deviceLabel } = await import("./sessions.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const userAgent = getRequestHeader("user-agent") ?? "";
    const tokenHash = await hashSessionId(
      sessionKey(context.claims as Record<string, unknown>, context.userId, userAgent),
    );

    const { data: existing } = await supabaseAdmin
      .from("user_sessions")
      .select("id, status, expires_at")
      .eq("session_token_hash", tokenHash)
      .maybeSingle();

    if (existing) {
      if (existing.status !== "active" || new Date(existing.expires_at).getTime() < Date.now()) {
        return { ok: false, revoked: true };
      }
      await supabaseAdmin
        .from("user_sessions")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", existing.id);
      return { ok: true, revoked: false };
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("institution_id")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: roleRows } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId);
    const roles = (roleRows ?? []).map((r) => String(r.role));
    const priority = ["admin", "faculty", "mentor", "student"];

    await supabaseAdmin.from("user_sessions").insert({
      user_id: context.userId,
      session_token_hash: tokenHash,
      role: priority.find((r) => roles.includes(r)) ?? "student",
      institution_id: profile?.institution_id ?? null,
      device_label: deviceLabel(userAgent),
      user_agent: userAgent.slice(0, 400),
    });
    return { ok: true, revoked: false };
  });

export const listMySessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SessionRow[]> => {
    const { hashSessionId } = await import("./sessions.server");
    const sid = claimSessionId(context.claims as Record<string, unknown>);
    const currentHash = sid ? await hashSessionId(sid) : "";

    const { data } = await context.supabase
      .from("user_sessions")
      .select("id, device_label, status, created_at, last_activity_at, expires_at, session_token_hash")
      .eq("user_id", context.userId)
      .order("last_activity_at", { ascending: false })
      .limit(50);

    return (data ?? []).map((r) => ({
      id: r.id,
      device_label: r.device_label,
      status: new Date(r.expires_at).getTime() < Date.now() && r.status === "active" ? "expired" : r.status,
      created_at: r.created_at,
      last_activity_at: r.last_activity_at,
      expires_at: r.expires_at,
      current: r.session_token_hash === currentHash,
    }));
  });

export const revokeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_sessions")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeOtherSessions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { hashSessionId } = await import("./sessions.server");
    const sid = claimSessionId(context.claims as Record<string, unknown>);
    const currentHash = sid ? await hashSessionId(sid) : "none";
    const { error } = await context.supabase
      .from("user_sessions")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("status", "active")
      .neq("session_token_hash", currentHash);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
