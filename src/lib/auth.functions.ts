import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const startSchema = z.object({
  mode: z.enum(["login", "signup"]),
  prn: z.string().trim().min(4).max(30),
  channel: z.enum(["email", "mobile"]),
  contact: z.string().trim().min(5).max(120),
  fullName: z.string().trim().max(120).optional(),
});

const verifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export interface StartOtpResult {
  challengeId: string;
  maskedContact: string;
  demo: boolean;
  demoCode?: string;
  expiresAt: string;
  cooldownSeconds: number;
}

function mask(channel: "email" | "mobile", contact: string): string {
  if (channel === "mobile") return `+91 ••••• ${contact.slice(-4)}`;
  const [user = "", domain = ""] = contact.split("@");
  return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export const startOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => startSchema.parse(data))
  .handler(async ({ data }): Promise<StartOtpResult> => {
    const {
      isEmail,
      isMobile,
      normalizeMobile,
      normalizePrn,
      isDemoDelivery,
      generateOtp,
      hashOtp,
      OTP_TTL_MINUTES,
      RESEND_COOLDOWN_SECONDS,
    } = await import("./auth.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const prn = normalizePrn(data.prn);
    const contact =
      data.channel === "email" ? data.contact.trim().toLowerCase() : normalizeMobile(data.contact);

    if (data.channel === "email" && !isEmail(contact)) throw new Error("Enter a valid email address.");
    if (data.channel === "mobile" && !isMobile(contact))
      throw new Error("Enter a valid 10-digit Indian mobile number.");

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, prn, email, mobile")
      .eq("prn", prn)
      .maybeSingle();

    if (data.mode === "signup" && existing) {
      throw new Error("This PRN is already registered. Please use Login instead.");
    }
    if (data.mode === "login") {
      if (!existing) throw new Error("No account found for this PRN. Please sign up first.");
      const onFile = data.channel === "email" ? existing.email : existing.mobile;
      if (!onFile || onFile !== contact) {
        throw new Error(
          `This ${data.channel === "email" ? "email" : "mobile number"} does not match the one registered for this PRN.`,
        );
      }
    }

    // Simple resend throttle
    const { data: recent } = await supabaseAdmin
      .from("otp_challenges")
      .select("created_at")
      .eq("contact", contact)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent) {
      const age = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
      if (age < RESEND_COOLDOWN_SECONDS) {
        throw new Error(`Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - age)}s before requesting a new code.`);
      }
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();
    const insert = await supabaseAdmin
      .from("otp_challenges")
      .insert({
        channel: data.channel,
        contact,
        purpose: data.mode,
        prn,
        full_name: data.fullName ?? null,
        code_hash: await hashOtp(code, contact),
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (insert.error || !insert.data) throw new Error("Could not start verification. Please try again.");

    const demo = isDemoDelivery();
    // A real provider integration would dispatch the code here.
    return {
      challengeId: insert.data.id,
      maskedContact: mask(data.channel, contact),
      demo,
      ...(demo ? { demoCode: code } : {}),
      expiresAt,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    };
  });

export interface VerifyOtpResult {
  tokenHash: string;
  email: string;
  role: "student" | "admin";
}

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }): Promise<VerifyOtpResult> => {
    const { hashOtp, authEmailFor, OTP_MAX_ATTEMPTS } = await import("./auth.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: challenge } = await supabaseAdmin
      .from("otp_challenges")
      .select("*")
      .eq("id", data.challengeId)
      .maybeSingle();
    if (!challenge) throw new Error("Verification request not found. Please request a new code.");
    if (challenge.consumed) throw new Error("This code has already been used. Please request a new one.");
    if (new Date(challenge.expires_at).getTime() < Date.now())
      throw new Error("This code has expired. Please resend the OTP.");
    if (challenge.attempts >= OTP_MAX_ATTEMPTS)
      throw new Error("Too many incorrect attempts. Please request a new code.");

    const expected = await hashOtp(data.code, challenge.contact);
    if (expected !== challenge.code_hash) {
      await supabaseAdmin
        .from("otp_challenges")
        .update({ attempts: challenge.attempts + 1 })
        .eq("id", challenge.id);
      const left = OTP_MAX_ATTEMPTS - (challenge.attempts + 1);
      throw new Error(`Incorrect code. ${left > 0 ? `${left} attempt(s) left.` : "Please request a new code."}`);
    }

    const channel = challenge.channel === "mobile" ? "mobile" : "email";
    const prn = challenge.prn ?? "";
    const authEmail = authEmailFor(channel, challenge.contact, prn);

    // Create the auth user on first verification; ignore "already registered".
    const created = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
      user_metadata: { prn, full_name: challenge.full_name ?? "" },
    });
    let userId = created.data.user?.id ?? null;

    if (!userId) {
      const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: authEmail });
      userId = link.data.user?.id ?? null;
    }
    if (!userId) throw new Error("Could not complete verification. Please try again.");

    // Role: admin only when the contact email is on the server-side allowlist.
    const { data: allow } =
      channel === "email"
        ? await supabaseAdmin.from("admin_allowlist").select("email").eq("email", challenge.contact).maybeSingle()
        : { data: null };
    const role: "student" | "admin" = allow ? "admin" : "student";

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        prn,
        full_name: challenge.full_name ?? "",
        ...(channel === "email" ? { email: challenge.contact } : { mobile: challenge.contact }),
        verified_channel: channel,
      },
      { onConflict: "id" },
    );
    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    await supabaseAdmin.from("otp_challenges").update({ consumed: true }).eq("id", challenge.id);
    await supabaseAdmin.from("audit_log").insert({
      actor: userId,
      actor_label: prn,
      action: challenge.purpose === "signup" ? "account.signup" : "account.login",
      detail: `${channel} verified`,
    });

    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: authEmail });
    const tokenHash = link.data.properties?.hashed_token;
    if (!tokenHash) throw new Error("Could not create a session. Please try again.");

    return { tokenHash, email: authEmail, role };
  });

export interface SessionInfo {
  userId: string;
  role: "student" | "admin";
  profile: {
    prn: string;
    full_name: string;
    email: string | null;
    mobile: string | null;
    department: string | null;
    campus: string | null;
    verified_channel: string;
    status: string;
  } | null;
}

export const getSessionInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SessionInfo> => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("prn, full_name, email, mobile, department, campus, verified_channel, status")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const role = (roles ?? []).some((r) => r.role === "admin") ? "admin" : "student";
    return { userId, role, profile: profile ?? null };
  });

const profileSchema = z.object({
  full_name: z.string().trim().max(120),
  department: z.string().trim().max(120).nullable(),
  campus: z.string().trim().max(120).nullable(),
  mobile: z.string().trim().max(20).nullable(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
