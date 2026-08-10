import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  BrainCircuit,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { startOtp, verifyOtp, type StartOtpResult } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — JGI-SIH | JSPM Group Internal SIH Portal" },
      {
        name: "description",
        content:
          "Secure PRN and OTP verified sign in for students and administrators of the JSPM Group Internal Smart India Hackathon portal.",
      },
      { property: "og:title", content: "JGI-SIH — JSPM Group Internal SIH Portal" },
      {
        property: "og:description",
        content: "AI-powered Internal Smart India Hackathon registration, evaluation and selection platform for JSPM Group.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup";
type Channel = "email" | "mobile";

function AuthPage() {
  const navigate = useNavigate();
  const start = useServerFn(startOtp);
  const verify = useServerFn(verifyOtp);

  const [mode, setMode] = useState<Mode>("login");
  const [channel, setChannel] = useState<Channel>("email");
  const [prn, setPrn] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
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

  async function requestOtp() {
    if (busy) return;
    if (!prn.trim()) {
      toast.error("PRN is required.");
      return;
    }
    if (!contact.trim()) {
      toast.error(channel === "email" ? "Email ID is required." : "Mobile number is required.");
      return;
    }
    if (mode === "signup" && fullName.trim().length < 3) {
      toast.error("Enter your full name.");
      return;
    }
    setBusy(true);
    try {
      const res = await start({
        data: { mode, prn, channel, contact, ...(mode === "signup" ? { fullName } : {}) },
      });
      setChallenge(res);
      setCode("");
      setSeconds(res.cooldownSeconds);
      toast.success(res.demo ? `Demo OTP: ${res.demoCode}` : `OTP sent to ${res.maskedContact}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the OTP.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp() {
    if (busy || !challenge) return;
    setBusy(true);
    try {
      const res = await verify({ data: { challengeId: challenge.challengeId, code } });
      const { error } = await supabase.auth.verifyOtp({ token_hash: res.tokenHash, type: "email" });
      if (error) throw new Error(error.message);
      toast.success(res.role === "admin" ? "Signed in to the Admin Portal." : "Verification successful.");
      await navigate({ to: res.role === "admin" ? "/admin" : "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed.");
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
              { icon: ShieldCheck, t: "PRN + OTP verified access, role-based portals" },
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

          {!challenge ? (
            <div className="surface-card p-6">
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
                {(["login", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
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
                PRN is mandatory. Verify with either your Email ID or Mobile Number.
              </p>

              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void requestOtp();
                }}
              >
                <Field label="PRN (Permanent Registration Number)" required>
                  <input
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    placeholder="e.g. 72158847K"
                    className="field"
                    autoComplete="username"
                  />
                </Field>

                {mode === "signup" && (
                  <Field label="Full name" required>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="As per college records"
                      className="field"
                    />
                  </Field>
                )}

                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Verification method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: "email" as Channel, label: "Email ID", icon: Mail },
                      { id: "mobile" as Channel, label: "Mobile number", icon: Smartphone },
                    ]).map(({ id, label, icon: Icon }) => (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setChannel(id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                          channel === id
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label={channel === "email" ? "Email ID" : "Mobile number"} required>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={channel === "email" ? "name@jspm.edu.in" : "10-digit mobile number"}
                    inputMode={channel === "mobile" ? "numeric" : "email"}
                    className="field"
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              </form>

              <p className="mt-4 rounded-lg bg-secondary px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                Administrator accounts are granted from a server-side allowlist — signing in with an approved
                institutional email automatically opens the Admin Portal.
              </p>
            </div>
          ) : (
            <div className="surface-card p-6">
              <button
                onClick={() => setChallenge(null)}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Change details
              </button>
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <BadgeCheck className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Verify your identity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a 6-digit code to <strong className="text-foreground">{challenge.maskedContact}</strong>. It is
                valid for 10 minutes.
              </p>
              {challenge.demo && challenge.demoCode ? (
                <p className="mt-3 rounded-lg border border-warning/40 bg-warning-soft px-3 py-2 text-xs">
                  Demo delivery mode — your code is <strong className="font-display tracking-widest">{challenge.demoCode}</strong>
                </p>
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
                  Verify & continue
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
          )}
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
