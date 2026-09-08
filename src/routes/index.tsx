import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loginWithPassword, finalizeRegistration, assertAccountActive, type PortalRole } from "@/lib/auth.functions";
import {
  lookupInstitutionByEmail,
  listCampuses,
  type CampusOption,
  type InstitutionOption,
} from "@/lib/institutions.functions";
import { newHumanChallenge, type HumanChallenge } from "@/lib/human-check.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Internal Smart India Hackathon Platform" },
      {
        name: "description",
        content:
          "Secure sign in and registration for the Internal Smart India Hackathon platform — students, faculty members, mentors and administrators across participating institutions and campuses.",
      },
      { property: "og:title", content: "Internal Smart India Hackathon Platform" },
      {
        property: "og:description",
        content:
          "AI-powered Internal SIH registration, evaluation and selection platform for participating institutions, colleges and campuses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const ROLE_OPTIONS: { id: PortalRole; label: string; icon: typeof UserRound; note: string }[] = [
  { id: "student", label: "Student", icon: UserRound, note: "Team & proposals" },
  { id: "faculty", label: "Faculty Member", icon: GraduationCap, note: "Review & shortlist" },
  { id: "admin", label: "Administrator", icon: UserCog, note: "Platform administration" },
  { id: "mentor", label: "Mentor", icon: Users, note: "Guidance & teams" },
];

const ROLE_LABEL: Record<PortalRole, string> = {
  student: "Student",
  faculty: "Faculty Member",
  admin: "Administrator",
  mentor: "Mentor",
};

function landingFor(role: PortalRole): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

type Mode = "choose" | "login" | "signup";
type SignupStep = "email" | "campus" | "otp" | "password" | "done";
type LoginStep = "credentials" | "otp" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const login = useServerFn(loginWithPassword);
  const register = useServerFn(finalizeRegistration);
  const gate = useServerFn(assertAccountActive);
  const lookup = useServerFn(lookupInstitutionByEmail);
  const campusesFor = useServerFn(listCampuses);
  const humanChallenge = useServerFn(newHumanChallenge);

  const [role, setRole] = useState<PortalRole | null>(null);
  const [mode, setMode] = useState<Mode>("choose");
  const [busy, setBusy] = useState(false);

  // login
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");

  // signup
  const [step, setStep] = useState<SignupStep>("email");
  const [institution, setInstitution] = useState<InstitutionOption | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [recognized, setRecognized] = useState(true);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [campusId, setCampusId] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [prn, setPrn] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [challenge, setChallenge] = useState<HumanChallenge | null>(null);
  const [humanAnswer, setHumanAnswer] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function err(e: unknown, fallback: string) {
    toast.error(e instanceof Error && e.message ? e.message : fallback);
  }

  /* ---------------- login ---------------- */

  async function doLogin() {
    if (busy || !role) return;
    setBusy(true);
    try {
      const res = await login({ data: { role, identifier: email.trim(), password } });
      const { error } = await supabase.auth.setSession({
        access_token: res.accessToken,
        refresh_token: res.refreshToken,
      });
      if (error) throw new Error(error.message);
      toast.success(`Welcome back, ${res.fullName || "there"}.`);
      await navigate({ to: landingFor(res.role) });
    } catch (e) {
      err(e, "Sign in failed. Please check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  async function sendLoginOtp() {
    if (busy || cooldown > 0) return;
    if (!email.trim()) return toast.error("Enter your registered email address.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (error) return toast.error(otpError(error.message));
    setCooldown(45);
    setLoginStep("otp");
    toast.success("A 6-digit code has been emailed to you.");
  }

  async function verifyLoginOtp() {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: loginOtp.trim(),
        type: "email",
      });
      if (error) throw new Error("Incorrect or expired code. Please try again.");
      const info = await gate({ data: {} });
      if (!info.registered) {
        await supabase.auth.signOut();
        throw new Error("Please complete your registration first.");
      }
      toast.success(`Welcome back, ${info.fullName || "there"}.`);
      await navigate({ to: landingFor(info.role) });
    } catch (e) {
      await supabase.auth.signOut().catch(() => undefined);
      err(e, "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReset() {
    if (busy) return;
    if (!email.trim()) return toast.error("Enter your registered email address.");
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    toast.success("If that email is registered, a password reset link is on its way.");
    setLoginStep("credentials");
  }

  /* ---------------- signup ---------------- */

  async function doLookup() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await lookup({ data: { email: email.trim().toLowerCase() } });
      setInstitutions(res.institutions);
      setRecognized(res.recognized);
      setInstitution(res.institution);
      setCampuses(res.campuses);
      setCampusId(res.campuses[0]?.id ?? "");
      setStep("campus");
    } catch (e) {
      err(e, "Enter a valid email address.");
    } finally {
      setBusy(false);
    }
  }

  async function pickInstitution(id: string) {
    const inst = institutions.find((i) => i.id === id) ?? null;
    setInstitution(inst);
    setCampusId("");
    if (!inst) return setCampuses([]);
    const list = await campusesFor({ data: { institutionId: inst.id } });
    setCampuses(list);
    setCampusId(list[0]?.id ?? "");
  }

  async function sendSignupOtp() {
    if (busy || cooldown > 0) return;
    if (fullName.trim().length < 3) return toast.error("Enter your full name.");
    if (!institution) return toast.error("Select your institution.");
    if (!campusId) return toast.error("Select your campus.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return toast.error(otpError(error.message));
    setCooldown(45);
    setStep("otp");
    toast.success("Verification code sent to your email.");
  }

  async function verifySignupOtp() {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw new Error("Incorrect or expired code. Please request a new one.");
      setChallenge(await humanChallenge());
      setHumanAnswer("");
      setStep("password");
      toast.success("Email verified ✓");
    } catch (e) {
      err(e, "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  async function completeRegistration() {
    if (busy || !role || !institution || !challenge) return;
    setBusy(true);
    try {
      const res = await register({
        data: {
          role,
          fullName: fullName.trim(),
          institutionId: institution.id,
          campusId,
          prn: prn.trim() || undefined,
          mobile: mobile.trim() || undefined,
          password: newPw,
          confirmPassword: confirmPw,
          humanToken: challenge.token,
          humanAnswer,
        },
      });
      await supabase.auth.signOut();
      setStep("done");
      toast.success(
        res.approvalStatus === "pending"
          ? "Registration successful — your account is awaiting approval."
          : "Registration successful. Please sign in.",
      );
    } catch (e) {
      setChallenge(await humanChallenge().catch(() => null));
      setHumanAnswer("");
      err(e, "Could not complete registration.");
    } finally {
      setBusy(false);
    }
  }

  function backToLogin() {
    setMode("login");
    setLoginStep("credentials");
    setStep("email");
    setPassword("");
    setNewPw("");
    setConfirmPw("");
    setOtp("");
  }

  /* ---------------- render ---------------- */

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden brand-gradient p-10 text-primary-foreground lg:flex">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight">Internal SIH</p>
            <p className="text-xs opacity-80">Internal Smart India Hackathon Platform</p>
          </div>
        </div>
        <div className="relative max-w-md space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Welcome to Internal Smart India Hackathon
          </h1>
          <p className="text-sm leading-relaxed opacity-90">
            One platform for registration, problem selection, proposal submission, AI evaluation, similarity
            detection, mentoring and final selection across every participating institution and campus.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: BrainCircuit, t: "AI Proposal Analyzer with section-wise scoring" },
              { icon: Sparkles, t: "Idea similarity & duplication detection" },
              { icon: Bot, t: "24×7 AI Assistant for student guidance" },
              { icon: ShieldCheck, t: "Verified email sign up with role-based access" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs opacity-70">© {new Date().getFullYear()} Internal Smart India Hackathon</p>
      </section>

      <section className="flex items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl brand-gradient text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="font-display text-base font-bold">Internal SIH</p>
              <p className="text-xs text-muted-foreground">Internal Smart India Hackathon Platform</p>
            </div>
          </div>

          <div className="surface-card p-6">
            {mode === "choose" && (
              <>
                <h2 className="font-display text-xl font-bold">Welcome to Internal Smart India Hackathon</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select your role to continue.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(({ id, label, icon: Icon, note }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setRole(id)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        role === id
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="size-4" />
                        {label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{note}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button disabled={!role} onClick={() => setMode("login")}>
                    <KeyRound className="size-4" />
                    Login
                  </Button>
                  <Button variant="outline" disabled={!role} onClick={() => setMode("signup")}>
                    Sign Up
                  </Button>
                </div>
                {!role && (
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    Please choose a role before continuing.
                  </p>
                )}
              </>
            )}

            {mode !== "choose" && (
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                {role ? ROLE_LABEL[role] : "Change role"}
              </button>
            )}

            {mode === "login" && loginStep === "credentials" && (
              <>
                <h2 className="font-display text-xl font-bold">Login</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in with your registered email address and password.
                </p>
                <form
                  className="mt-5 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void doLogin();
                  }}
                >
                  <Field label="Email address" required>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@college.edu.in"
                      className="field"
                      autoComplete="username"
                      type="email"
                    />
                  </Field>
                  <Field label="Password" required>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="field pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                    Login
                  </Button>
                </form>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <button className="font-medium text-primary" onClick={() => setLoginStep("forgot")}>
                    Forgot password?
                  </button>
                  <button className="font-medium text-primary" onClick={() => void sendLoginOtp()}>
                    Login with OTP
                  </button>
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  New here?{" "}
                  <button className="font-semibold text-primary" onClick={() => setMode("signup")}>
                    Create an account
                  </button>
                </p>
              </>
            )}

            {mode === "login" && loginStep === "forgot" && (
              <>
                <h2 className="font-display text-xl font-bold">Forgot password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll email a secure, time-limited reset link to your registered address.
                </p>
                <div className="mt-5 space-y-4">
                  <Field label="Email address" required>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field"
                      type="email"
                    />
                  </Field>
                  <Button className="w-full" disabled={busy} onClick={() => void sendReset()}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <MailCheck className="size-4" />}
                    Send reset link
                  </Button>
                  <button
                    className="w-full text-center text-xs font-medium text-primary"
                    onClick={() => setLoginStep("credentials")}
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}

            {mode === "login" && loginStep === "otp" && (
              <>
                <h2 className="font-display text-xl font-bold">Login with OTP</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We've sent a verification code to <span className="font-medium text-foreground">{email}</span>
                </p>
                <div className="mt-5 space-y-4">
                  <Field label="6-digit code" required>
                    <input
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      placeholder="______"
                      className="field text-center text-lg tracking-[0.5em]"
                    />
                  </Field>
                  <Button className="w-full" disabled={busy} onClick={() => void verifyLoginOtp()}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Verify OTP
                  </Button>
                  <button
                    className="w-full text-center text-xs font-medium text-primary disabled:text-muted-foreground"
                    disabled={cooldown > 0}
                    onClick={() => void sendLoginOtp()}
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            {mode === "signup" && step === "email" && (
              <>
                <h2 className="font-display text-xl font-bold">Sign up as {role ? ROLE_LABEL[role] : ""}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your college / institutional email address. We'll identify your institution from it.
                </p>
                <form
                  className="mt-5 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void doLookup();
                  }}
                >
                  <Field label="College / institutional email address" required>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu.in"
                      className="field"
                      type="email"
                      autoComplete="email"
                    />
                  </Field>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                    Continue
                  </Button>
                </form>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Already registered?{" "}
                  <button className="font-semibold text-primary" onClick={backToLogin}>
                    Go to Login
                  </button>
                </p>
              </>
            )}

            {mode === "signup" && step === "campus" && (
              <>
                <h2 className="font-display text-xl font-bold">Select your campus</h2>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5 text-xs text-muted-foreground">
                  <Building2 className="mt-0.5 size-4 shrink-0" />
                  {recognized && institution ? (
                    <span>
                      Institution identified from your email domain:{" "}
                      <span className="font-semibold text-foreground">{institution.official_name}</span>
                    </span>
                  ) : (
                    <span>
                      We couldn't match your email domain to a participating institution. Choose your institution
                      below — staff will verify it before your account is activated.
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-4">
                  {!recognized && (
                    <Field label="Institution" required>
                      <select
                        className="field"
                        value={institution?.id ?? ""}
                        onChange={(e) => void pickInstitution(e.target.value)}
                      >
                        <option value="">Select institution</option>
                        {institutions.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.official_name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field label="Campus" required>
                    <select className="field" value={campusId} onChange={(e) => setCampusId(e.target.value)}>
                      <option value="">Select campus</option>
                      {campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.campus_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Full name" required>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="field" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Mobile number">
                      <input
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="field"
                        inputMode="numeric"
                      />
                    </Field>
                    {role === "student" && (
                      <Field label="PRN">
                        <input value={prn} onChange={(e) => setPrn(e.target.value)} className="field" />
                      </Field>
                    )}
                  </div>
                  <Button className="w-full" disabled={busy} onClick={() => void sendSignupOtp()}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <MailCheck className="size-4" />}
                    Send verification code
                  </Button>
                </div>
              </>
            )}

            {mode === "signup" && step === "otp" && (
              <>
                <h2 className="font-display text-xl font-bold">Verify your email</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We've sent a verification code to <span className="font-medium text-foreground">{email}</span>
                </p>
                <div className="mt-5 space-y-4">
                  <Field label="6-digit code" required>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      placeholder="______"
                      className="field text-center text-lg tracking-[0.5em]"
                    />
                  </Field>
                  <Button className="w-full" disabled={busy} onClick={() => void verifySignupOtp()}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Verify OTP
                  </Button>
                  <button
                    className="w-full text-center text-xs font-medium text-primary disabled:text-muted-foreground"
                    disabled={cooldown > 0}
                    onClick={() => void sendSignupOtp()}
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            {mode === "signup" && step === "password" && (
              <>
                <h2 className="font-display text-xl font-bold">Create your password</h2>
                <p className="mt-1 text-sm text-success">Email verified ✓</p>
                <div className="mt-5 space-y-4">
                  <Field label="Create password" required>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="field pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm password" required>
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="field"
                      autoComplete="new-password"
                    />
                  </Field>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Minimum 8 characters with an uppercase letter, a lowercase letter, a number and a special
                    character.
                  </p>
                  <Field label={`Human verification — ${challenge?.question ?? "loading…"}`} required>
                    <input
                      value={humanAnswer}
                      onChange={(e) => setHumanAnswer(e.target.value)}
                      className="field"
                      inputMode="numeric"
                      placeholder="Your answer"
                    />
                  </Field>
                  <Button className="w-full" disabled={busy} onClick={() => void completeRegistration()}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Create account
                  </Button>
                </div>
              </>
            )}

            {mode === "signup" && step === "done" && (
              <div className="py-4 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-success-soft text-success">
                  <CheckCircle2 className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">Registration successful</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {role === "student"
                    ? "Your account is ready. Please sign in to open your dashboard."
                    : "Your account has been created and is awaiting approval by an authorised approver."}
                </p>
                <Button className="mt-5 w-full" onClick={backToLogin}>
                  Go to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function otpError(message: string): string {
  if (/rate|limit|seconds/i.test(message)) return "Too many requests. Please wait a minute and try again.";
  if (/signups not allowed|not found|User not found/i.test(message))
    return "No account found for this email. Please sign up first.";
  return "Could not send the verification code. Please check the email address and try again.";
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label} {required ? <span className="text-danger">*</span> : null}
      </span>
      {children}
    </label>
  );
}
