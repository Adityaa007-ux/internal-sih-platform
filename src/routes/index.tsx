import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
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
import { demoLogin, type PortalRole } from "@/lib/auth.functions";
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

const ROLE_OPTIONS: { id: PortalRole; label: string; icon: typeof UserRound; note: string }[] = [
  { id: "student", label: "Student", icon: UserRound, note: "Team & proposals" },
  { id: "faculty", label: "Faculty", icon: GraduationCap, note: "Review & shortlist" },
  { id: "mentor", label: "Mentor", icon: Users, note: "Guidance & teams" },
  { id: "admin", label: "Admin", icon: UserCog, note: "Full administration" },
];

function landingFor(role: PortalRole): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const login = useServerFn(demoLogin);

  const [role, setRole] = useState<PortalRole>("student");
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function doLogin() {
    if (busy) return;
    if (!identifier.trim()) {
      toast.error("Enter your email address or mobile number.");
      return;
    }
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
            <h2 className="font-display text-xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose your role, then sign in with your email or mobile number to open your portal.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Role</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(({ id, label, icon: Icon, note }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setRole(id)}
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

            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void doLogin();
              }}
            >
              <Field label="Email address or mobile number" required>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@gmail.com or 9876543210"
                  className="field"
                  autoComplete="username"
                />
              </Field>
              <Field label="Password">
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
                Prototype demo access: sign in with the role you want to review. Your portal shows only the modules for
                that role.
              </p>
            </form>
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
