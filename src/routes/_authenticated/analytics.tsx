import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Building2, FileText, Sparkles, Users } from "lucide-react";
import { combinedScore, useStore } from "@/lib/store";
import { CAMPUSES } from "@/lib/demo-data";
import { PageHeader, StatCard } from "@/components/common";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "Participation, submission and evaluation analytics across JSPM Group campuses for Internal SIH 2026." },
      { property: "og:title", content: "JGI-SIH Analytics" },
      { property: "og:description", content: "Campus-wise participation and evaluation insights for the Internal SIH." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { teams } = useStore();
  const submitted = teams.filter((t) => t.proposal);
  const analysed = teams.filter((t) => t.ai);
  const avgAi = analysed.length ? Math.round(analysed.reduce((s, t) => s + (t.ai?.overall ?? 0), 0) / analysed.length) : 0;
  const members = teams.reduce((s, t) => s + t.members.length, 0);

  const byCampus = CAMPUSES.map((c) => ({
    campus: c,
    count: teams.filter((t) => t.campus === c).length,
  }));
  const max = Math.max(1, ...byCampus.map((c) => c.count));

  const top = [...submitted].sort((a, b) => combinedScore(b) - combinedScore(a)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Participation and evaluation insights across all JSPM Group campuses." icon={BarChart3} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered teams" value={teams.length} icon={Users} />
        <StatCard label="Participants" value={members} icon={Users} tone="info" />
        <StatCard label="Proposals submitted" value={submitted.length} icon={FileText} tone="warning" />
        <StatCard label="Average AI score" value={avgAi} icon={Sparkles} tone="success" />
      </div>

      <div className="surface-card p-5">
        <h2 className="font-display text-sm font-semibold">Teams per campus</h2>
        <ul className="mt-4 space-y-3">
          {byCampus.map((c) => (
            <li key={c.campus} className="flex items-center gap-3">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="w-56 shrink-0 truncate text-sm">{c.campus}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full brand-gradient" style={{ width: `${(c.count / max) * 100}%` }} />
              </span>
              <span className="w-8 text-right text-sm font-semibold tabular-nums">{c.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-card overflow-hidden">
        <p className="border-b border-border px-5 py-4 font-display text-sm font-semibold">Top ranked teams</p>
        {top.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No evaluated teams yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {top.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="font-display font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.campus}</span>
                <span className="ml-auto font-semibold tabular-nums">{combinedScore(t)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
