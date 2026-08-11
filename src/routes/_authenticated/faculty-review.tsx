import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { problemById, type FacultyReview } from "@/lib/demo-data";
import { EmptyState, PageHeader, ScoreBar, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/faculty-review")({
  head: () => ({
    meta: [
      { title: "Faculty Review — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "Faculty evaluation workspace for Internal SIH 2026 proposals: score, comment and recommend teams." },
      { property: "og:title", content: "JGI-SIH Faculty Review" },
      { property: "og:description", content: "Score and comment on Internal SIH proposals alongside AI signals." },
    ],
  }),
  component: FacultyReviewPage,
});

const CRITERIA = [
  { key: "relevance", label: "Relevance to problem" },
  { key: "innovation", label: "Innovation" },
  { key: "feasibility", label: "Feasibility" },
  { key: "impact", label: "Impact" },
  { key: "presentation", label: "Clarity of presentation" },
  { key: "teamFit", label: "Team capability" },
] as const;

function FacultyReviewPage() {
  const { teams, saveReview } = useStore();
  const queue = teams.filter((t) => t.proposal);
  const [activeId, setActiveId] = useState<string | null>(queue[0]?.id ?? null);
  const active = queue.find((t) => t.id === activeId) ?? null;
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  if (queue.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Faculty Review" description="Evaluate submitted proposals with AI signals alongside." icon={CheckCircle2} />
        <EmptyState icon={CheckCircle2} title="Nothing to review" description="Proposals appear here once teams submit them." />
      </div>
    );
  }

  const total = CRITERIA.reduce((sum, c) => sum + (scores[c.key] ?? 0), 0);

  function submit() {
    if (!active) return;
    const review: FacultyReview = {
      reviewer: "Prof. S. R. Kulkarni",
      reviewedAt: new Date().toISOString(),
      scores: Object.fromEntries(CRITERIA.map((c) => [c.key, scores[c.key] ?? 0])),
      total,
      comments: comment,
    };
    saveReview(active.id, review);
    toast.success(`Evaluation saved for ${active.name}`);
    setScores({});
    setComment("");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty Review" description="Evaluate submitted proposals with AI and similarity signals alongside." icon={CheckCircle2} />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="surface-card overflow-hidden">
          <p className="border-b border-border px-4 py-3 font-display text-sm font-semibold">Review queue ({queue.length})</p>
          <ul className="scrollbar-slim max-h-[520px] divide-y divide-border overflow-y-auto">
            {queue.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={cn("w-full px-4 py-3 text-left transition-colors hover:bg-accent/50", t.id === activeId && "bg-primary-soft/60")}
                >
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.regId} · AI {t.ai?.overall ?? "—"}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {active && (
          <div className="space-y-5">
            <div className="surface-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-bold">{active.name}</h2>
                <StatusPill status={active.proposalStatus} />
                {active.similarity ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Similarity {active.similarity.score}% · {active.similarity.risk}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {active.problemId ? (problemById(active.problemId)?.title ?? active.problemId) : "No problem statement selected"}
              </p>
              {active.proposal ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p className="font-medium">{active.proposal.title}</p>
                  <p className="text-muted-foreground">{active.proposal.solution}</p>
                </div>
              ) : null}
              {active.ai ? (
                <div className="mt-4 space-y-2">
                  {active.ai.breakdown.map((c) => (
                    <ScoreBar key={c.label} label={c.label} score={c.score} />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="surface-card p-5">
              <h3 className="font-display text-sm font-semibold">Faculty evaluation (10 points per criterion)</h3>
              <div className="mt-4 space-y-4">
                {CRITERIA.map((c) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="w-52 shrink-0 text-sm">{c.label}</span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scores[c.key] ?? 0}
                      onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })}
                      className="flex-1 accent-primary"
                      aria-label={c.label}
                    />
                    <span className="w-8 text-right text-sm font-semibold tabular-nums">{scores[c.key] ?? 0}</span>
                  </div>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Comments for the team</span>
                <textarea
                  className="field min-h-24"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Strengths, gaps and what the team should improve before the presentation round…"
                />
              </label>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Total: <span className="font-display text-lg font-bold text-foreground tabular-nums">{total}</span>/60
                </span>
                <Button className="ml-auto" onClick={submit}>
                  Save evaluation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
