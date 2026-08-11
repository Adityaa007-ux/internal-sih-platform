import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy } from "lucide-react";
import { listResults } from "@/lib/admin.functions";
import { combinedScore, useStore } from "@/lib/store";
import { EmptyState, PageHeader, ScoreRing, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({
    meta: [
      { title: "Submission Result — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "View your Internal SIH 2026 submission result, final score and panel remarks." },
      { property: "og:title", content: "JGI-SIH Submission Results" },
      { property: "og:description", content: "Final Internal Smart India Hackathon results for JSPM Group teams." },
    ],
  }),
  component: ResultsPage,
});

interface ResultRow {
  id: string;
  team_ref: string;
  team_name: string;
  status: string;
  final_score: number | null;
  remarks: string;
  published: boolean;
}

function ResultsPage() {
  const fetchResults = useServerFn(listResults);
  const { currentTeam } = useStore();
  const { data, isLoading } = useQuery({ queryKey: ["results"], queryFn: () => fetchResults() });
  const rows = ((data as ResultRow[] | undefined) ?? []).filter((r) => r.published);

  const myResult = currentTeam?.presentation?.finalResult ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Submission Result" description="AI score, faculty evaluation and the final panel decision for Internal SIH 2026." icon={Trophy} />

      {currentTeam ? (
        <div className="surface-card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <ScoreRing value={Math.round(combinedScore(currentTeam))} label="Combined score" />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-bold">{currentTeam.name}</h2>
              <StatusPill status={myResult ?? currentTeam.proposalStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              Registration ID <span className="font-medium text-foreground">{currentTeam.regId}</span> · Stage{" "}
              <span className="font-medium text-foreground">{currentTeam.stage}</span>
            </p>
            <dl className="grid gap-2 pt-1 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">AI proposal score</dt>
                <dd className="font-semibold tabular-nums">{currentTeam.ai ? `${currentTeam.ai.overall}/100` : "Not analysed"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Faculty score</dt>
                <dd className="font-semibold tabular-nums">{currentTeam.review ? `${currentTeam.review.total}/60` : "Pending"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Similarity risk</dt>
                <dd className="font-semibold">{currentTeam.similarity?.risk ?? "Not checked"}</dd>
              </div>
            </dl>
            {currentTeam.presentation?.remarks ? (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Panel remarks: </span>
                {currentTeam.presentation.remarks}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" variant="outline">
                <Link to="/analyzer">Open AI analysis</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/proposal">View submission</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          title="No team linked yet"
          description="Register your team to track your submission result here."
          action={
            <Button asChild size="sm">
              <Link to="/team-registration">Register a team</Link>
            </Button>
          }
        />
      )}

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-sm font-semibold">Published results</h2>
        </div>
        {isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading published results…</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Results have not been published yet. You will be notified once the panel publishes them.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Team</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium">{r.team_name || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.team_ref}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5 py-3 tabular-nums">{r.final_score ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
