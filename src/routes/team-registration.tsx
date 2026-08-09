import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { CAMPUSES, DEPARTMENTS, PROBLEMS, type TeamMember } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { DemoBadge, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/team-registration")({
  head: () => ({
    meta: [
      { title: "Team Registration — JGI-SIH Portal" },
      {
        name: "description",
        content:
          "Register your Internal SIH team: add 4-6 members, choose a campus and department, and get an auto-generated registration ID.",
      },
      { property: "og:title", content: "Team Registration — JGI-SIH Portal" },
      { property: "og:description", content: "Register a team for the JSPM Group Internal Smart India Hackathon 2026." },
    ],
  }),
  component: TeamRegistration,
});

interface FormErrors {
  name?: string;
  leader?: string;
  email?: string;
  phone?: string;
  campus?: string;
  department?: string;
  members?: string;
}

const emptyMember = (): TeamMember => ({ name: "", prn: "", department: "", year: "TE", skills: "" });

function TeamRegistration() {
  const { registerTeam, setCurrentTeamId } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    leader: "",
    email: "",
    phone: "",
    campus: "",
    department: "",
    problemId: "",
  });
  const [members, setMembers] = useState<TeamMember[]>([emptyMember(), emptyMember(), emptyMember(), emptyMember()]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ regId: string; id: string } | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setMember = (i: number, k: keyof TeamMember, v: string) =>
    setMembers((m) => m.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));

  function validate() {
    const e: FormErrors = {};
    if (form.name.trim().length < 3) e.name = "Team name must be at least 3 characters.";
    if (!form.leader.trim()) e.leader = "Team leader name is required.";
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email)) e.email = "Enter a valid college email address.";
    if (!/^[+\d][\d\s-]{8,}$/.test(form.phone)) e.phone = "Enter a valid contact number.";
    if (!form.campus) e.campus = "Select your campus.";
    if (!form.department) e.department = "Select your department.";
    const filled = members.filter((m) => m.name.trim());
    if (filled.length < 4) e.members = "A team needs at least 4 members (maximum 6).";
    if (filled.some((m) => !m.prn.trim())) e.members = "Every listed member needs a PRN.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    const team = registerTeam({
      name: form.name.trim(),
      leader: form.leader.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      campus: form.campus,
      department: form.department,
      members: members.filter((m) => m.name.trim()),
      problemId: form.problemId || null,
      locked: true,
      stage: form.problemId ? "Problem Selection" : "Registration",
      proposalStatus: "Not Started",
      proposal: null,
      ai: null,
      similarity: null,
      review: null,
      shortlist: "Under Review",
      presentation: null,
      mentor: null,
    });
    setSubmitting(false);
    setDone({ regId: team.regId, id: team.id });
    setCurrentTeamId(team.id);
    toast.success(`Team registered — ${team.regId}`);
  }

  if (done) {
    return (
      <div className="space-y-6">
        <PageHeader title="Registration successful" description="Your team is registered for Internal SIH 2026." icon={UserPlus} />
        <div className="surface-card mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/14 text-success">
            <Lock className="size-7" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold">{form.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Registration completed and team membership is now locked.</p>
          <dl className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">Registration ID</dt>
              <dd className="font-display font-semibold">{done.regId}</dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">Team ID</dt>
              <dd className="font-display font-semibold">{done.id}</dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">Campus</dt>
              <dd className="text-sm font-medium">{form.campus}</dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">Members</dt>
              <dd className="text-sm font-medium">{members.filter((m) => m.name.trim()).length}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate({ to: "/my-team" })}>Go to team dashboard</Button>
            <Button variant="outline" onClick={() => navigate({ to: "/problems" })}>
              Select a problem statement
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filledCount = members.filter((m) => m.name.trim()).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team registration"
        description="Register your team for JSPM Group Internal SIH 2026. Team membership is locked once registration is submitted."
        icon={UserPlus}
        actions={<DemoBadge />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="surface-card p-6">
            <h2 className="font-display text-base font-semibold">Team details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Team name" error={errors.name}>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Team Innovexa" />
              </Field>
              <Field label="Team leader" error={errors.leader}>
                <Input value={form.leader} onChange={(e) => set("leader", e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="College email" error={errors.email}>
                <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@jspm.edu.in" />
              </Field>
              <Field label="Contact number" error={errors.phone}>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98xxx xxxxx" />
              </Field>
              <Field label="Campus" error={errors.campus}>
                <Select value={form.campus} onValueChange={(v) => set("campus", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPUSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Department" error={errors.department}>
                <Select value={form.department} onValueChange={(v) => set("department", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Problem statement (optional — can be selected later)">
                  <Select value={form.problemId} onValueChange={(v) => set("problemId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a problem statement" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROBLEMS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.id} — {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </section>

          <section className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-semibold">Team members</h2>
                <p className="text-xs text-muted-foreground">Minimum 4, maximum 6 members including the leader.</p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{filledCount}/6 added</span>
            </div>

            {errors.members ? <p className="mt-3 text-xs font-medium text-destructive">{errors.members}</p> : null}

            <div className="mt-4 space-y-4">
              {members.map((m, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Member {i + 1} {i === 0 ? "(Leader)" : ""}
                    </p>
                    {members.length > 4 && (
                      <button
                        onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Remove member ${i + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Input placeholder="Full name" value={m.name} onChange={(e) => setMember(i, "name", e.target.value)} />
                    <Input placeholder="PRN" value={m.prn} onChange={(e) => setMember(i, "prn", e.target.value)} />
                    <Select value={m.department} onValueChange={(v) => setMember(i, "department", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={m.year} onValueChange={(v) => setMember(i, "year", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {["FE", "SE", "TE", "BE"].map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Skills" value={m.skills} onChange={(e) => setMember(i, "skills", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="mt-4 gap-1.5"
              disabled={members.length >= 6}
              onClick={() => setMembers((m) => [...m, emptyMember()])}
            >
              <Plus className="size-4" /> Add member
            </Button>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Before you submit</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Team membership is <strong className="text-foreground">locked</strong> after registration — this mirrors the actual JSPM process.</li>
              <li>• Your Team ID and Registration Number are generated automatically.</li>
              <li>• A problem statement can be selected now or later from Problem Explorer.</li>
              <li>• Proposal submission unlocks after registration is complete.</li>
            </ul>
            <Button className="mt-5 w-full" onClick={() => void submit()} disabled={submitting}>
              {submitting ? "Registering team…" : "Submit registration & lock team"}
            </Button>
            {submitting ? (
              <p className="mt-2 text-center text-xs text-muted-foreground">Validating members and generating IDs…</p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
