import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GitCompareArrows, ShieldAlert, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { SIMILARITY_STEPS, detectSimilarity } from "@/lib/ai-services";
import { useStore } from "@/lib/store";
import { AiProcessing, DemoBadge, EmptyState, PageHeader, ScoreRing, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/similarity")({
  head: () => ({
    meta: [
      { title: "AI Similarity Detection — JGI-SIH Portal" },
      {
        name: "description",
        content:
          "Detect duplicate or highly similar Internal SIH ideas with semantic similarity scoring, matching concept extraction and duplication risk classification.",
      },
      { property: "og:title", content: "AI Similarity & Duplicate Detection — JGI-SIH Portal" },
      { property: "og:description", content: "Semantic duplicate-idea detection helping faculty spot overlapping Internal SIH submissions." },
    ],
  }),
  component: SimilarityPage,
});

function SimilarityPage() {
  const { currentTeam, teams, setCurrentTeamId, setSimilarity, role } = useStore();
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  if (!currentTeam) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title="No team selected"
        description="Select or register a team to run duplicate-idea detection."
        action={
          <Button asChild>
            <Link to="/team-registration">Register a team</Link>
          </Button>
        }
      />
    );
  }

  const result = currentTeam.similarity;

  async function run() {
    if (!currentTeam?.proposal) {
      toast.error("A saved proposal is required before similarity analysis.");
      return;
    }
    setRunning(true);
    setStep(0);
    const r = await detectSimilarity(currentTeam, teams, (i) => setStep(i));
    setSimilarity(currentTeam.id, r);
    setRunning(false);
    setStep(-1);
    toast.success(`Similarity analysis complete — ${r.score}% (${r.risk}).`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI similarity & duplicate detection"
        description="Every submitted idea is embedded and compared against the full cohort. This helps faculty identify duplicate or highly similar ideas before the review round."
        icon={GitCompareArrows}
        actions={
          <>
            <DemoBadge />
            <Button onClick={() => void run()} disabled={running}>
              {running ? "Processing…" : result ? "Re-run similarity analysis" : "Run similarity analysis"}
            </Button>
          </>
        }
      />

      {role !== "student" ? (
        <div className="surface-card flex flex-wrap items-center gap-2 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Team</span>
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTeamId(t.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                t.id === currentTeam.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/50"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      ) : null}

      {running ? <AiProcessing steps={SIMILARITY_STEPS} activeIndex={step} title="Comparing idea against submitted cohort" /> : null}

      {!running && !result ? (
        <EmptyState
          icon={GitCompareArrows}
          title="No similarity analysis yet"
          description="Run the check to see your similarity score, duplication risk classification, the most similar proposals and the exact concepts that overlap."
          action={
            <Button onClick={() => void run()} disabled={!currentTeam.proposal}>
              Run similarity analysis
            </Button>
          }
        />
      ) : null}

      {!running && result ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="surface-card flex flex-col items-center justify-center gap-3 p-6">
              <ScoreRing value={result.score} label="Similarity" />
              <StatusPill status={result.risk} />
              <p className="text-xs text-muted-foreground">
                {new Date(result.analyzedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>

            <div className="lg:col-span-2">
              <div
                className={`surface-card p-6 ${
                  result.risk === "Potential Duplicate" || result.risk === "High" ? "border-destructive/40 bg-destructive/5" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.risk === "Low" ? (
                    <ShieldAlert className="size-4 text-success" />
                  ) : (
                    <TriangleAlert className="size-4 text-destructive" />
                  )}
                  <h2 className="font-display text-sm font-semibold">Risk assessment — {result.risk}</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>

                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {(["Low", "Moderate", "High", "Potential Duplicate"] as const).map((r) => (
                    <div key={r} className="text-center">
                      <div
                        className={`h-1.5 rounded-full ${
                          r === result.risk
                            ? r === "Low"
                              ? "bg-success"
                              : r === "Moderate"
                                ? "bg-warning"
                                : "bg-destructive"
                            : "bg-muted"
                        }`}
                      />
                      <p className={`mt-1 text-[10px] ${r === result.risk ? "font-semibold" : "text-muted-foreground"}`}>{r}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Common keywords / concepts</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.keywords.map((k) => (
                      <span key={k} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold">Most similar proposals</h2>
            <p className="text-sm text-muted-foreground">Visual comparison of the closest matches found in the cohort.</p>
            {result.matches.length === 0 ? (
              <div className="surface-card mt-4 px-6 py-10 text-center text-sm text-muted-foreground">
                No comparable submissions found — your idea is unique in this cohort.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {result.matches.map((m) => (
                  <article
                    key={m.teamName}
                    className={`surface-card p-5 ${m.score >= 78 ? "border-destructive/50" : m.score >= 60 ? "border-warning/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold">{m.teamName}</p>
                        <p className="text-xs text-muted-foreground">Problem {m.problemId}</p>
                      </div>
                      <span
                        className={`font-display text-2xl font-bold tabular-nums ${
                          m.score >= 78 ? "text-destructive" : m.score >= 60 ? "text-warning-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {m.score}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${m.score >= 78 ? "bg-destructive" : m.score >= 60 ? "bg-warning" : "bg-primary"}`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matching concepts</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.concepts.map((c) => (
                        <span key={c} className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.reason}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
