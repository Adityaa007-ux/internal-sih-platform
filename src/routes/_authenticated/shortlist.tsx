import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { combinedScore, useStore } from "@/lib/store";
import { EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/shortlist")({
  head: () => ({
    meta: [
      { title: "Shortlist — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "Ranked Internal SIH 2026 shortlist combining AI proposal scores, faculty evaluation and similarity risk." },
      { property: "og:title", content: "JGI-SIH Shortlist" },
      { property: "og:description", content: "Ranked teams advancing to the offline presentation round." },
    ],
  }),
  component: ShortlistPage,
});

function ShortlistPage() {
  const { teams, role, setShortlist } = useStore();
  const ranked = [...teams].filter((t) => t.proposal).sort((a, b) => combinedScore(b) - combinedScore(a));
  const canEdit = role === "admin" || role === "faculty";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shortlist"
        description="Ranking combines AI proposal quality (45%), faculty evaluation (55%) and a similarity-risk penalty."
        icon={ListChecks}
      />

      {ranked.length === 0 ? (
        <EmptyState icon={ListChecks} title="Nothing to rank yet" description="Teams appear once proposals are submitted and evaluated." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">AI</th>
                  <th className="px-4 py-3 font-medium">Faculty</th>
                  <th className="px-4 py-3 font-medium">Combined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {canEdit && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranked.map((t, i) => (
                  <tr key={t.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3 font-display font-bold tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.regId} · {t.campus}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{t.ai?.overall ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{t.review ? `${t.review.total}/60` : "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{combinedScore(t)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={t.shortlist} />
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShortlist(t.id, "Shortlisted");
                              toast.success(`${t.name} shortlisted`);
                            }}
                          >
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShortlist(t.id, "Not Shortlisted");
                              toast.message(`${t.name} marked not shortlisted`);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    )}
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
