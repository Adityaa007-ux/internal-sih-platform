import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  BrainCircuit,
  GraduationCap,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  completeSignup,
  loginWithPassword,
  startSignupOtp,
  verifySignupOtp,
  type PortalRole,
  type StartOtpResult,
} from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — JGI-SIH | JSPM Group Internal SIH Portal" },
      {
        name: "description",
        content:
          "Role-based sign in with demo OTP verification and password login for students, faculty, mentors and administrators of the JSPM Group Internal Smart India Hackathon portal.",
      },
      { property: "og:title", content: "JGI-SIH — JSPM Group Internal SIH Portal" },
      {
        property: "og:description",
        content: "AI-powered Internal Smart India Hackathon registration, evaluation and selection platform for JSPM Group.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup";
type Step = "details" | "otp" | "password";

const ROLE_OPTIONS: { id: PortalRole; label: string; icon: typeof UserRound; note: string }[] = [
  { id: "student", label: "Student", icon: UserRound, note: "Self sign-up" },
  { id: "faculty", label: "Faculty", icon: GraduationCap, note: "Faculty workflow" },
  { id: "mentor", label: "Mentor", icon: Users, note: "Faculty approval" },
  { id: "admin", label: "Admin", icon: UserCog, note: "Faculty approval" },
];

function landingFor(role: PortalRole): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const startOtp = useServerFn(startSignupOtp);
  const verifyOtpFn = useServerFn(verifySignupOtp);
  const finishSignup = useServerFn(completeSignup);
  const login = useServerFn(loginWithPassword);

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<PortalRole>("student");
  const [step, setStep] = useState<Step>("details");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [prn, setPrn] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [challenge, setChallenge] = useState<StartOtpResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function resetSignup() {
    setStep("details");
    setChallenge(null);
    setCode("");
    setPassword("");
    setConfirmPassword("");
  }

  async function requestOtp() {
    if (busy) return;
    if (fullName.trim().length < 3) { toast.error("Enter your full name."); return; }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim()))
      { toast.error("Enter a valid email address (for example name@gmail.com)."); return; }
    if (!/^\d{10}$/.test(mobile.trim())) { toast.error("Mobile number must be exactly 10 digits."); return; }

    setBusy(true);
    try {
      const res = await startOtp({
        data: { role, fullName, email, mobile, ...(prn.trim() ? { prn } : {}) },
      });
      setChallenge(res);
      setCode("");
      setStep("otp");
      setSeconds(res.cooldownSeconds);
      toast.success("Demo OTP generated — it is shown on screen.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start verification.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp() {
    if (busy || !challenge) return;
    setBusy(true);
    try {
      await verifyOtpFn({ data: { challengeId: challenge.challengeId, code } });
      setStep("password");
      toast.success("OTP verified. Create your password.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function createAccount() {
    if (busy || !challenge) return;
    if (password !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    try {
      const res = await finishSignup({ data: { challengeId: challenge.challengeId, password, confirmPassword } });
      if (res.approvalStatus === "pending") {
        toast.success("Account created. It is awaiting Faculty approval before first sign in.");
      } else {
        toast.success("Account created. Please log in with your new password.");
      }
      resetSignup();
      setMode("login");
      setIdentifier(res.email);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  async function doLogin() {
    if (busy) return;
    if (!identifier.trim()) { toast.error("Enter your registered email or mobile number."); return; }
    if (!loginPassword) { toast.error("Enter your password."); return; }
    setBusy(true);
    try {
      const res = await login({ data: { role, identifier, password: loginPassword } });
      const { error } = await supabase.auth.setSession({
        access_token: res.accessToken,
        refresh_token: res.refreshToken,
      });
      if (error) throw new Error(error.message);
      toast.success(`Welcome back, ${res.fullName || "there"}.`);
      await navigate({ to: landingFor(res.role) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden brand-gradient p-10 text-primary-foreground lg:flex">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">JGI-SIH</p>
              <p className="text-xs opacity-80">JSPM Group Internal SIH Portal</p>
            </div>
          </div>
        </div>
        <div className="relative max-w-md space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            AI-powered Internal Smart India Hackathon management
          </h1>
          <p className="text-sm leading-relaxed opacity-90">
            One platform for registration, problem selection, proposal submission, AI evaluation, similarity detection,
            mentoring and final selection across all JSPM Group campuses.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: BrainCircuit, t: "AI Proposal Analyzer with section-wise scoring" },
              { icon: Sparkles, t: "Idea similarity & duplication detection" },
              { icon: Bot, t: "24×7 AI Assistant for student guidance" },
              { icon: ShieldCheck, t: "Role-verified access with OTP + password sign in" },
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
        <p className="relative text-xs opacity-70">© {new Date().getFullYear()} JSPM Group · Internal SIH 2026</p>
      </section>

      <section className="flex items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl brand-gradient text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="font-display text-base font-bold">JGI-SIH</p>
              <p className="text-xs text-muted-foreground">JSPM Group Internal SIH Portal</p>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    resetSignup();
                  }}
                  className={cn(
                    "rounded-md py-2 text-sm font-semibold transition-colors",
                    mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

            <h2 className="font-display text-xl font-bold">
              {mode === "login" ? "Welcome back" : "Create your JGI-SIH account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login"
                ? "Select your role, then sign in with your registered email or mobile and password."
                : "Verify with a demo OTP, then create the password you will use to sign in."}
            </p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Role</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(({ id, label, icon: Icon, note }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      setRole(id);
                      resetSignup();
                    }}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      role === id ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
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
            </div>

            {mode === "login" ? (
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void doLogin();
                }}
              >
                <Field label="Registered email or mobile number" required>
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@gmail.com or 9876543210"
                    className="field"
                    autoComplete="username"
                  />
                </Field>
                <Field label="Password" required>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    className="field"
                    autoComplete="current-password"
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                  Sign in
                </Button>
                <p className="rounded-lg bg-secondary px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  Your role is verified against the database. Selecting a different role on this screen never changes
                  the permissions of your account.
                </p>
              </form>
            ) : step === "details" ? (
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void requestOtp();
                }}
              >
                <Field label="Full name" required>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="As per college records"
                    className="field"
                  />
                </Field>
                <Field label="Email ID" required>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    inputMode="email"
                    className="field"
                  />
                </Field>
                <Field label="Mobile number (10 digits)" required>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    inputMode="numeric"
                    className="field"
                  />
                </Field>
                {role === "student" && (
                  <Field label="PRN (optional)">
                    <input
                      value={prn}
                      onChange={(e) => setPrn(e.target.value)}
                      placeholder="e.g. 72158847K"
                      className="field"
                    />
                  </Field>
                )}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Verify
                </Button>
                {(role === "mentor" || role === "admin") && (
                  <p className="rounded-lg bg-secondary px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                    {role === "mentor" ? "Mentor" : "Admin"} requests are created immediately but stay pending until a
                    Faculty account approves them.
                  </p>
                )}
              </form>
            ) : step === "otp" && challenge ? (
              <div className="mt-5">
                <button
                  onClick={resetSignup}
                  className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" /> Change details
                </button>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <BadgeCheck className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Verify your identity</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verification for <strong className="text-foreground">{challenge.maskedEmail}</strong> and mobile{" "}
                  <strong className="text-foreground">{challenge.maskedMobile}</strong>. Valid for 10 minutes.
                </p>
                {challenge.demoCode ? (
                  <div className="mt-3 rounded-lg border border-warning/40 bg-warning-soft px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Demo OTP — for prototype testing only
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold tracking-[0.35em]">{challenge.demoCode}</p>
                  </div>
                ) : null}

                <form
                  className="mt-5 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submitOtp();
                  }}
                >
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    inputMode="numeric"
                    autoFocus
                    className="field text-center font-display text-2xl tracking-[0.5em]"
                  />
                  <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                    Verify OTP
                  </Button>
                </form>

                <button
                  onClick={() => void requestOtp()}
                  disabled={seconds > 0 || busy}
                  className="mt-4 w-full text-center text-xs font-medium text-primary disabled:text-muted-foreground"
                >
                  {seconds > 0 ? `Resend code in ${seconds}s` : "Resend OTP"}
                </button>
              </div>
            ) : (
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void createAccount();
                }}
              >
                <div className="rounded-lg border border-success/40 bg-success-soft px-3 py-2 text-xs">
                  OTP verified. Create the password you will use for every future login.
                </div>
                <Field label="Password" required>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters, with a letter and a number"
                    className="field"
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm password" required>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="field"
                    autoComplete="new-password"
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Create account
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
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
