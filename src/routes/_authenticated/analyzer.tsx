import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, ListPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ANALYSIS_STEPS, analyzeProposal } from "@/lib/ai-services";
import { useStore } from "@/lib/store";
import { problemById } from "@/lib/demo-data";
import { AiProcessing, DemoBadge, EmptyState, PageHeader, ScoreBar, ScoreRing, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/analyzer")({
  head: () => ({
    meta: [
      { title: "AI Proposal Analyzer — JGI-SIH Portal" },
      {
        name: "description",
        content:
          "Run AI analysis on an Internal SIH proposal to get an overall quality score, strengths, weaknesses, missing sections and improvement recommendations.",
      },
      { property: "og:title", content: "AI Proposal Analyzer — JGI-SIH Portal" },
      { property: "og:description", content: "AI-powered proposal quality evaluation as decision support for faculty reviewers." },
    ],
  }),
  component: AnalyzerPage,
});

function AnalyzerPage() {
  const { currentTeam, teams, setCurrentTeamId, setAnalysis, role } = useStore();
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  if (!currentTeam) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No team selected"
        description="Register or select a team to analyse its proposal."
        action={
          <Button asChild>
            <Link to="/team-registration">Register a team</Link>
          </Button>
        }
      />
    );
  }

  const analysis = currentTeam.ai;

  async function run() {
    if (!currentTeam?.proposal) {
      toast.error("Write and save a proposal before running AI analysis.");
      return;
    }
    setRunning(true);
    setStep(0);
    const result = await analyzeProposal(currentTeam.proposal, problemById(currentTeam.problemId), (i) => setStep(i));
    setAnalysis(currentTeam.id, result);
    setRunning(false);
    setStep(-1);
    toast.success(`AI analysis complete — score ${result.overall}/100.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI proposal analyzer"
        description="Automated quality evaluation across seven criteria. This is decision support for faculty — the final selection is made by the panel in the offline round."
        icon={Sparkles}
        actions={
          <>
            <DemoBadge />
            <Button onClick={() => void run()} disabled={running}>
              {running ? "Analyzing…" : analysis ? "Re-analyze proposal" : "Analyze proposal with AI"}
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

      <div className="surface-card flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{currentTeam.proposal?.title ?? "No proposal written yet"}</p>
          <p className="text-xs text-muted-foreground">
            {currentTeam.name} · {currentTeam.problemId ?? "No problem selected"}
          </p>
        </div>
        <StatusPill status={currentTeam.proposalStatus} />
      </div>

      {running ? <AiProcessing steps={ANALYSIS_STEPS} activeIndex={step} title="Analyzing proposal quality" /> : null}

      {!running && !analysis ? (
        <EmptyState
          icon={Sparkles}
          title="No AI analysis yet"
          description="Run the analyzer to score problem understanding, innovation, feasibility, technical strength, impact, scalability and clarity — and to get specific improvement recommendations."
          action={
            <Button onClick={() => void run()} disabled={!currentTeam.proposal}>
              Analyze proposal with AI
            </Button>
          }
        />
      ) : null}

      {!running && analysis ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="surface-card flex flex-col items-center justify-center gap-2 p-6">
              <ScoreRing value={analysis.overall} label="Overall" />
              <p className="text-xs text-muted-foreground">
                Analysed {new Date(analysis.analyzedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <StatusPill status={analysis.overall >= 80 ? "Shortlisted" : analysis.overall >= 60 ? "Under Review" : "Not Selected"} />
            </div>
            <div className="surface-card space-y-3.5 p-6 lg:col-span-2">
              <h2 className="font-display text-sm font-semibold">Evaluation breakdown</h2>
              {analysis.breakdown.map((b) => (
                <ScoreBar key={b.label} label={b.label} score={b.score} />
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-display text-sm font-semibold">AI summary</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FeedbackCard title="Strengths" icon={CheckCircle2} tone="success" items={analysis.strengths} />
            <FeedbackCard title="Weaknesses" icon={AlertTriangle} tone="danger" items={analysis.weaknesses} />
            <FeedbackCard title="Recommendations" icon={Lightbulb} tone="info" items={analysis.recommendations} />
            <FeedbackCard title="Missing information" icon={ListPlus} tone="warning" items={analysis.missing} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function FeedbackCard({
  title,
  icon: Icon,
  tone,
  items,
}: {
  title: string;
  icon: typeof CheckCircle2;
  tone: "success" | "danger" | "info" | "warning";
  items: string[];
}) {
  const tones = {
    success: "bg-success/12 text-success",
    danger: "bg-destructive/12 text-destructive",
    info: "bg-info/12 text-info",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2">
        <span className={`flex size-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing flagged here.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it} className="flex gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
