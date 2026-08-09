import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { problemById, type Proposal } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { DemoBadge, EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/proposal")({
  head: () => ({
    meta: [
      { title: "Proposal Submission — JGI-SIH Portal" },
      {
        name: "description",
        content: "Draft and submit your Internal SIH proposal: solution, innovation, technical approach, impact and scalability.",
      },
      { property: "og:title", content: "Proposal Submission — JGI-SIH Portal" },
      { property: "og:description", content: "Submit your Internal Smart India Hackathon proposal for AI analysis and faculty review." },
    ],
  }),
  component: ProposalPage,
});

const EMPTY: Proposal = {
  title: "",
  solution: "",
  innovation: "",
  technicalApproach: "",
  techStack: "",
  targetUsers: "",
  impact: "",
  scalability: "",
  implementation: "",
};

const FIELDS: { key: keyof Proposal; label: string; hint: string; rows: number }[] = [
  { key: "solution", label: "Proposed solution", hint: "What exactly are you building, and how does a user experience it?", rows: 5 },
  { key: "innovation", label: "Innovation", hint: "What does your solution do that no other team's does?", rows: 4 },
  { key: "technicalApproach", label: "Technical approach", hint: "Models, architecture, data flow and constraints.", rows: 5 },
  { key: "targetUsers", label: "Target users", hint: "Who uses this, and in what setting?", rows: 3 },
  { key: "impact", label: "Expected impact", hint: "Quantify it — numbers score materially higher.", rows: 3 },
  { key: "scalability", label: "Scalability", hint: "What happens at 10x the users or one more campus/state?", rows: 3 },
  { key: "implementation", label: "Implementation approach", hint: "Week-by-week plan with deliverables.", rows: 4 },
];

function ProposalPage() {
  const { currentTeam, saveProposal } = useStore();
  const [form, setForm] = useState<Proposal>(currentTeam?.proposal ?? EMPTY);
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null);
  const [touched, setTouched] = useState(false);

  if (!currentTeam) {
    return (
      <EmptyState
        icon={FileText}
        title="Register a team first"
        description="Proposal submission unlocks once your team is registered for Internal SIH 2026."
        action={
          <Button asChild>
            <Link to="/team-registration">Register your team</Link>
          </Button>
        }
      />
    );
  }

  const problem = problemById(currentTeam.problemId);
  const set = (k: keyof Proposal, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTouched(true);
  };

  const missing = FIELDS.filter((f) => !form[f.key].trim()).map((f) => f.label);
  const complete = form.title.trim() && form.techStack.trim() && missing.length === 0;

  async function persist(submit: boolean) {
    if (!currentTeam) return;
    if (submit && !complete) {
      toast.error("Complete every section before final submission.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Give your proposal a title.");
      return;
    }
    setBusy(submit ? "submit" : "draft");
    await new Promise((r) => setTimeout(r, 900));
    saveProposal(currentTeam.id, form, submit);
    setBusy(null);
    setTouched(false);
    toast.success(submit ? "Proposal submitted for AI analysis and faculty review." : "Draft saved.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposal submission"
        description={problem ? `${problem.id} — ${problem.title}` : "No problem statement selected yet."}
        icon={FileText}
        actions={
          <>
            <DemoBadge />
            <StatusPill status={currentTeam.proposalStatus} />
          </>
        }
      />

      {!problem ? (
        <div className="surface-card flex flex-wrap items-center gap-3 border-warning/40 bg-warning/10 p-4">
          <p className="text-sm">Select a problem statement before submitting — reviewers evaluate the proposal against it.</p>
          <Button asChild size="sm" variant="outline">
            <Link to="/problems">Choose a problem</Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="surface-card space-y-4 p-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Proposal title</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. KrishiScan — Offline AI Crop Disease Diagnosis" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Technology stack</Label>
              <Input
                value={form.techStack}
                onChange={(e) => set("techStack", e.target.value)}
                placeholder="Flutter, TensorFlow Lite, FastAPI, PostgreSQL, Docker"
              />
            </div>
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <Label className="text-xs font-medium">{f.label}</Label>
                  <span className="text-[11px] text-muted-foreground">
                    {form[f.key].trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <Textarea rows={f.rows} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.hint} />
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Submission</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {missing.length === 0
                ? "All sections are complete. You can submit."
                : `${missing.length} section(s) still empty.`}
            </p>
            {missing.length ? (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {missing.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full gap-1.5" disabled={busy !== null} onClick={() => void persist(false)}>
                <Save className="size-4" /> {busy === "draft" ? "Saving…" : "Save as draft"}
              </Button>
              <Button className="w-full gap-1.5" disabled={busy !== null || !complete} onClick={() => void persist(true)}>
                <Send className="size-4" /> {busy === "submit" ? "Submitting…" : "Submit proposal"}
              </Button>
            </div>
            {touched ? <p className="mt-2 text-center text-[11px] text-warning-foreground">You have unsaved changes.</p> : null}
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Next steps after submission</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Run the <Link to="/analyzer" className="font-medium text-primary hover:underline">AI Proposal Analyzer</Link>.</li>
              <li>2. Run <Link to="/similarity" className="font-medium text-primary hover:underline">Similarity Detection</Link>.</li>
              <li>3. Faculty review your submission online.</li>
              <li>4. The portal generates the shortlist.</li>
              <li>5. Offline faculty presentation decides the final selection.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
