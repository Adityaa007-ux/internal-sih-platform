import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { RECOMMEND_INTERESTS, RECOMMEND_SKILLS, recommendProblems, type Recommendation } from "@/lib/ai-services";
import { useStore } from "@/lib/store";
import { DemoBadge, EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Problem Recommendations — JGI-SIH Portal" },
      {
        name: "description",
        content: "Get SIH problem statements matched to your team's skills, interests and preferred difficulty, with a match percentage and reasoning.",
      },
      { property: "og:title", content: "AI Problem Recommendations — JGI-SIH Portal" },
      { property: "og:description", content: "Skill-based problem statement recommendations for Internal SIH teams." },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { currentTeam, selectProblem, role } = useStore();
  const [skills, setSkills] = useState<string[]>(["AI/ML", "Full Stack", "Python"]);
  const [interests, setInterests] = useState<string[]>(["Agriculture, FoodTech & Rural Development"]);
  const [difficulty, setDifficulty] = useState("Any");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function run() {
    if (!skills.length) {
      toast.error("Select at least one skill so the recommender has something to match on.");
      return;
    }
    setLoading(true);
    const r = await recommendProblems({ skills, interests, difficulty });
    setRecs(r);
    setLoading(false);
    toast.success(`${r.length} problem statements matched to your team profile.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI problem recommendations"
        description="Tell the recommender what your team can build and cares about; it ranks the SIH problem statements by fit and explains every match."
        icon={Bot}
        actions={<DemoBadge />}
      />

      <div className="surface-card space-y-5 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Team skills &amp; technologies</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {RECOMMEND_SKILLS.map((s) => (
              <button
                key={s}
                onClick={() => toggle(skills, setSkills, s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  skills.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interest areas / themes</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {RECOMMEND_INTERESTS.map((s) => (
              <button
                key={s}
                onClick={() => toggle(interests, setInterests, s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  interests.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-48 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred difficulty</p>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Any", "Easy", "Medium", "Hard"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-1.5" onClick={() => void run()} disabled={loading}>
            <Sparkles className="size-4" /> {loading ? "Matching problem statements…" : "Get AI recommendations"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="surface-card animate-pulse space-y-3 p-5">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !recs ? (
        <EmptyState
          icon={Bot}
          title="No recommendations yet"
          description="Pick your team's skills and interest themes above, then run the recommender to see ranked problem statements with match percentages and reasoning."
        />
      ) : null}

      {!loading && recs ? (
        <div className="grid gap-4 md:grid-cols-2">
          {recs.map((r) => {
            const selected = currentTeam?.problemId === r.problem.id;
            return (
              <article key={r.problem.id} className="surface-card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 font-display text-xs font-bold text-primary">{r.problem.id}</span>
                    <h2 className="mt-2 font-display text-base font-semibold leading-snug">{r.problem.title}</h2>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold tabular-nums text-primary">{r.match}%</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Match</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full brand-gradient" style={{ width: `${r.match}%` }} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <StatusPill status={r.problem.difficulty === "Hard" ? "High" : r.problem.difficulty === "Medium" ? "Moderate" : "Low"} />
                  {r.matchedSkills.map((s) => (
                    <span key={s} className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                      {s}
                    </span>
                  ))}
                </div>
                {role === "student" ? (
                  <Button
                    className="mt-4"
                    size="sm"
                    disabled={selected || !currentTeam}
                    onClick={() => {
                      if (currentTeam) {
                        selectProblem(currentTeam.id, r.problem.id);
                        toast.success(`${r.problem.id} selected for ${currentTeam.name}.`);
                      }
                    }}
                  >
                    {selected ? "Selected by your team" : "Select this problem"}
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
