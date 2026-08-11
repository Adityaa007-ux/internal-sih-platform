import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useStore, combinedScore } from "@/lib/store";
import { problemById } from "@/lib/demo-data";
import { EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({
    meta: [
      { title: "Submissions — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "All Internal SIH 2026 team proposal submissions with AI scores and similarity risk." },
      { property: "og:title", content: "JGI-SIH Submissions" },
      { property: "og:description", content: "Track every proposal submitted for the JSPM Group Internal SIH." },
    ],
  }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const { teams } = useStore();
  const submitted = teams.filter((t) => t.proposal);

  return (
    <div className="space-y-6">
      <PageHeader title="Submissions" description="Every proposal submitted for Internal SIH 2026, with AI and similarity signals." icon={ClipboardList} />

      {submitted.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No submissions yet" description="Proposals will appear here as teams submit them." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Problem</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">AI</th>
                  <th className="px-4 py-3 font-medium">Similarity</th>
                  <th className="px-4 py-3 font-medium">Combined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submitted.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.regId} · {t.campus}</p>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {t.problemId ? (problemById(t.problemId)?.title ?? t.problemId) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={t.proposalStatus} />
                    </td>
                    <td className="px-4 py-3 tabular-nums">{t.ai ? `${t.ai.overall}` : "—"}</td>
                    <td className="px-4 py-3">{t.similarity ? `${t.similarity.score}% · ${t.similarity.risk}` : "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{combinedScore(t)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/faculty-review">Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
