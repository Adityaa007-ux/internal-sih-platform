import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = ["student", "faculty", "mentor", "admin"] as const;
export type PortalRole = (typeof ROLES)[number];

const signupSchema = z.object({
  role: z.enum(ROLES),
  fullName: z.string().trim().min(3, "Enter your full name.").max(120),
  email: z.string().trim().max(160),
  mobile: z.string().trim().max(20),
  prn: z.string().trim().max(30).optional(),
});

const verifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

const completeSchema = z.object({
  challengeId: z.string().uuid(),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
});

const loginSchema = z.object({
  role: z.enum(ROLES),
  identifier: z.string().trim().min(4).max(160),
  password: z.string().min(1).max(200),
});

export interface StartOtpResult {
  challengeId: string;
  maskedEmail: string;
  maskedMobile: string;
  demo: boolean;
  demoCode?: string;
  expiresAt: string;
  cooldownSeconds: number;
}

function maskEmail(contact: string): string {
  const [user = "", domain = ""] = contact.split("@");
  return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

/* ------------------------------------------------------------------ */
/* Signup: step 1 — details + demo OTP                                  */
/* ------------------------------------------------------------------ */

export const startSignupOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }): Promise<StartOtpResult> => {
    const {
      isEmail,
      isMobile,
      normalizeEmail,
      normalizeMobile,
      normalizePrn,
      isDemoDelivery,
      generateOtp,
      hashOtp,
      OTP_TTL_MINUTES,
      RESEND_COOLDOWN_SECONDS,
    } = await import("./auth.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = normalizeEmail(data.email);
    const mobile = normalizeMobile(data.mobile);
    if (!isEmail(email)) throw new Error("Enter a valid email address (for example name@gmail.com).");
    if (!isMobile(mobile)) throw new Error("Mobile number must be exactly 10 digits.");

    const { data: byEmail } = await supabaseAdmin.from("profiles").select("id").eq("email", email).maybeSingle();
    if (byEmail) throw new Error("An account already exists with this email. Please log in instead.");
    const { data: byMobile } = await supabaseAdmin.from("profiles").select("id").eq("mobile", mobile).maybeSingle();
    if (byMobile) throw new Error("An account already exists with this mobile number. Please log in instead.");

    const { data: recent } = await supabaseAdmin
      .from("otp_challenges")
      .select("created_at")
      .eq("contact", email)
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
        channel: "email",
        contact: email,
        purpose: "signup",
        role: data.role,
        email,
        mobile,
        prn: data.prn ? normalizePrn(data.prn) : null,
        full_name: data.fullName.trim(),
        code_hash: await hashOtp(code, email),
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (insert.error || !insert.data) throw new Error("Could not start verification. Please try again.");

    return {
      challengeId: insert.data.id,
      maskedEmail: maskEmail(email),
      maskedMobile: `••••• ${mobile.slice(-4)}`,
      demo: isDemoDelivery(),
      demoCode: code,
      expiresAt,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    };
  });

/* ------------------------------------------------------------------ */
/* Signup: step 2 — OTP check                                           */
/* ------------------------------------------------------------------ */

export const verifySignupOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { hashOtp, OTP_MAX_ATTEMPTS } = await import("./auth.server");
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
      throw new Error(`Incorrect OTP. ${left > 0 ? `${left} attempt(s) left.` : "Please request a new code."}`);
    }

    await supabaseAdmin.from("otp_challenges").update({ verified_at: new Date().toISOString() }).eq("id", challenge.id);
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Signup: step 3 — password creation & account                         */
/* ------------------------------------------------------------------ */

export interface CompleteSignupResult {
  role: PortalRole;
  approvalStatus: "approved" | "pending";
  email: string;
  fullName: string;
}

export const completeSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => completeSchema.parse(data))
  .handler(async ({ data }): Promise<CompleteSignupResult> => {
    const { validatePassword, needsApproval, SIGNUP_TICKET_MINUTES } = await import("./auth.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.password !== data.confirmPassword) throw new Error("Passwords do not match.");
    const pwError = validatePassword(data.password);
    if (pwError) throw new Error(pwError);

    const { data: challenge } = await supabaseAdmin
      .from("otp_challenges")
      .select("*")
      .eq("id", data.challengeId)
      .maybeSingle();
    if (!challenge) throw new Error("Verification request not found. Please start again.");
    if (challenge.consumed) throw new Error("This signup has already been completed. Please log in.");
    if (!challenge.verified_at) throw new Error("Please verify the OTP before creating a password.");
    if (Date.now() - new Date(challenge.verified_at).getTime() > SIGNUP_TICKET_MINUTES * 60_000)
      throw new Error("Verification expired. Please start the signup again.");

    const role = (challenge.role ?? "student") as PortalRole;
    const email = (challenge.email ?? challenge.contact).toLowerCase();
    const mobile = challenge.mobile ?? null;
    const fullName = challenge.full_name ?? "";

    // Faculty/Admin bootstrap: the very first staff account is auto-approved so the
    // approval workflow has an owner. Allowlisted institutional emails too.
    const { count: staffCount } = await supabaseAdmin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .in("role", ["admin", "faculty"]);
    const { data: allowlisted } = await supabaseAdmin
      .from("admin_allowlist")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    let approvalStatus: "approved" | "pending" = needsApproval(role) ? "pending" : "approved";
    if (allowlisted) approvalStatus = "approved";
    if (role === "faculty") approvalStatus = (staffCount ?? 0) === 0 || allowlisted ? "approved" : "pending";
    if (role === "admin" && (staffCount ?? 0) === 0) approvalStatus = "approved";

    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create the account. Please try again.");
    }
    const userId = created.data.user.id;

    const profile = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        prn: challenge.prn ?? null,
        full_name: fullName,
        email,
        mobile,
        auth_email: email,
        verified_channel: "email",
        approval_status: approvalStatus,
      },
      { onConflict: "id" },
    );
    if (profile.error) throw new Error(profile.error.message);

    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    await supabaseAdmin.from("otp_challenges").update({ consumed: true }).eq("id", challenge.id);
    await supabaseAdmin.from("audit_log").insert({
      actor: userId,
      actor_label: fullName,
      action: "account.signup",
      detail: `${role} account created (${approvalStatus})`,
    });

    return { role, approvalStatus, email, fullName };
  });

/* ------------------------------------------------------------------ */
/* Login with password + server-verified role                           */
/* ------------------------------------------------------------------ */

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  role: PortalRole;
  fullName: string;
}

export const loginWithPassword = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }): Promise<LoginResult> => {
    const { isEmail, isMobile, normalizeEmail, normalizeMobile } = await import("./auth.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createClient } = await import("@supabase/supabase-js");

    const raw = data.identifier.trim();
    const asEmail = normalizeEmail(raw);
    const asMobile = normalizeMobile(raw);

    let query = supabaseAdmin.from("profiles").select("id, full_name, email, auth_email, approval_status, status");
    if (isEmail(asEmail)) query = query.eq("email", asEmail);
    else if (isMobile(asMobile)) query = query.eq("mobile", asMobile);
    else throw new Error("Enter your registered email address or 10-digit mobile number.");

    const { data: profile } = await query.maybeSingle();
    if (!profile) throw new Error("No account found. Please sign up first.");

    const authEmail = profile.auth_email ?? profile.email;
    if (!authEmail) throw new Error("This account cannot sign in with a password. Please contact an administrator.");

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const anon = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const signIn = await anon.auth.signInWithPassword({ email: authEmail, password: data.password });
    if (signIn.error || !signIn.data.session) throw new Error("Incorrect email/mobile or password.");

    // Role is read from the database — never from what the user picked on screen.
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", profile.id);
    const actual = (roles ?? []).map((r) => String(r.role));
    const priority: PortalRole[] = ["admin", "faculty", "mentor", "student"];
    const dbRole = priority.find((r) => actual.includes(r)) ?? "student";

    if (!actual.includes(data.role)) {
      await anon.auth.signOut();
      throw new Error(
        `This account is registered as ${dbRole.charAt(0).toUpperCase() + dbRole.slice(1)}. Select the correct role and try again.`,
      );
    }
    if (profile.approval_status === "pending") {
      await anon.auth.signOut();
      throw new Error("Your account is awaiting Faculty approval. You will be able to sign in once approved.");
    }
    if (profile.approval_status === "rejected" || profile.status === "suspended") {
      await anon.auth.signOut();
      throw new Error("This account is not active. Please contact the SIH coordination cell.");
    }

    await supabaseAdmin.from("audit_log").insert({
      actor: profile.id,
      actor_label: profile.full_name,
      action: "account.login",
      detail: `${data.role} signed in`,
    });

    return {
      accessToken: signIn.data.session.access_token,
      refreshToken: signIn.data.session.refresh_token,
      role: data.role,
      fullName: profile.full_name,
    };
  });

/* ------------------------------------------------------------------ */
/* Session                                                              */
/* ------------------------------------------------------------------ */

export interface SessionInfo {
  userId: string;
  role: PortalRole;
  roles: PortalRole[];
  profile: {
    prn: string | null;
    full_name: string;
    email: string | null;
    mobile: string | null;
    department: string | null;
    campus: string | null;
    verified_channel: string;
    status: string;
    approval_status: string;
  } | null;
}

export const getSessionInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SessionInfo> => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("prn, full_name, email, mobile, department, campus, verified_channel, status, approval_status")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roles = (roleRows ?? []).map((r) => String(r.role) as PortalRole);
    const priority: PortalRole[] = ["admin", "faculty", "mentor", "student"];
    const role = priority.find((r) => roles.includes(r)) ?? "student";
    return { userId, role, roles: roles.length ? roles : ["student"], profile: profile ?? null };
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

/* ------------------------------------------------------------------ */
/* Demo login — presentation mode                                       */
/* Any email / mobile + any password signs in as the selected role.     */
/* ------------------------------------------------------------------ */

const demoLoginSchema = z.object({
  role: z.enum(ROLES),
  identifier: z.string().trim().min(1).max(160),
  password: z.string().max(200).optional(),
});

export const demoLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => demoLoginSchema.parse(data))
  .handler(async ({ data }): Promise<LoginResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createClient } = await import("@supabase/supabase-js");

    const DEMO_PASSWORD = "JGI-SIH-demo-2026!";
    const demoSlug = (value: string): string => {
      const base = value.trim().toLowerCase().split("@")[0] ?? "guest";
      return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "guest";
    };
    const titleCase = (value: string): string =>
      value
        .split(/[-_.]+/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");

    const raw = data.identifier.trim();
    const slug = demoSlug(raw);
    const authEmail = `${data.role}.${slug}@jgi-sih.demo`;
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw);
    const isMobile = /^\d{10}$/.test(raw.replace(/\D/g, "")) && !isEmail;

    let userId: string | null = null;
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("auth_email", authEmail)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
    } else {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { role: data.role },
      });
      if (created.error || !created.data.user) {
        throw new Error(created.error?.message ?? "Could not sign in. Please try again.");
      }
      userId = created.data.user.id;
      await supabaseAdmin.from("profiles").upsert(
        {
          id: userId,
          full_name: titleCase(slug),
          email: isEmail ? raw.toLowerCase() : null,
          mobile: isMobile ? raw.replace(/\D/g, "") : null,
          auth_email: authEmail,
          verified_channel: isMobile ? "mobile" : "email",
          approval_status: "approved",
          status: "active",
        },
        { onConflict: "id" },
      );
    }

    await supabaseAdmin
      .from("profiles")
      .update({ approval_status: "approved", status: "active" })
      .eq("id", userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const anon = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const signIn = await anon.auth.signInWithPassword({ email: authEmail, password: DEMO_PASSWORD });
    if (signIn.error || !signIn.data.session) throw new Error("Could not sign in. Please try again.");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    return {
      accessToken: signIn.data.session.access_token,
      refreshToken: signIn.data.session.refresh_token,
      role: data.role,
      fullName: profile?.full_name || titleCase(slug),
    };
  });
