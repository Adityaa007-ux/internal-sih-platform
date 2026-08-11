import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { LogOut, RotateCcw, Settings as SettingsIcon, User } from "lucide-react";
import { toast } from "sonner";
import { updateMyProfile } from "@/lib/auth.functions";
import { useSession, signOutEverywhere } from "@/hooks/useSession";
import { useStore } from "@/lib/store";
import { CAMPUSES, DEPARTMENTS } from "@/lib/demo-data";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "Manage your JGI-SIH profile details, campus, department and account controls." },
      { property: "og:title", content: "JGI-SIH Settings" },
      { property: "og:description", content: "Profile and account controls for the JSPM Group Internal SIH Portal." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, role, isLoading } = useSession();
  const queryClient = useQueryClient();
  const saveProfile = useServerFn(updateMyProfile);
  const { resetDemo, resultsPublished } = useStore();

  const [form, setForm] = useState({ full_name: "", department: "", campus: "", mobile: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        department: profile.department ?? "",
        campus: profile.campus ?? "",
        mobile: profile.mobile ?? "",
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () =>
      saveProfile({
        data: {
          full_name: form.full_name.trim(),
          department: form.department.trim() || null,
          campus: form.campus.trim() || null,
          mobile: form.mobile.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["session-info"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your account profile, portal preferences and demo controls." icon={SettingsIcon} />

      <div className="surface-card p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <User className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading account…" : `PRN ${profile?.prn ?? "—"} · Role: ${role === "admin" ? "Administrator" : "Student"}`}
            </p>
          </div>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Full name</span>
            <input className="field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Mobile number</span>
            <input className="field" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Campus</span>
            <select className="field" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })}>
              <option value="">Select campus</option>
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Department</span>
            <select className="field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>

        <dl className="mt-5 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Registered email</dt>
            <dd className="font-medium">{profile?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Verified channel</dt>
            <dd className="font-medium capitalize">{profile?.verified_channel ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Account status</dt>
            <dd className="font-medium capitalize">{profile?.status ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="surface-card p-6">
        <h2 className="font-display text-sm font-semibold">Portal controls</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Results are currently {resultsPublished ? "published" : "not published"} in this workspace view.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetDemo();
              toast.success("Workspace demo data reset");
            }}
          >
            <RotateCcw className="size-4" />
            Reset demo workspace
          </Button>
          <Button variant="destructive" onClick={() => void signOutEverywhere()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
