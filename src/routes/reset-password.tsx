import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Internal Smart India Hackathon" },
      {
        name: "description",
        content:
          "Set a new password for your Internal Smart India Hackathon account after verifying the secure reset link sent to your registered email address.",
      },
      { property: "og:title", content: "Reset password — Internal Smart India Hackathon" },
      {
        property: "og:description",
        content: "Securely set a new password for your Internal SIH portal account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    const strong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
    if (!strong) {
      toast.error("Use at least 8 characters with uppercase, lowercase, a number and a special character.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("This reset link has expired. Please request a new one.");
      return;
    }
    await supabase.auth.signOut();
    toast.success("Password updated. Please sign in.");
    void navigate({ to: "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="surface-card w-full max-w-md p-6">
        <span className="flex size-11 items-center justify-center rounded-xl brand-gradient text-primary-foreground">
          <ShieldCheck className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">Create a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password for your Internal SIH account.
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">New password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Confirm password</span>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="field"
              autoComplete="new-password"
            />
          </label>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Update password
          </Button>
        </form>
      </div>
    </main>
  );
}
