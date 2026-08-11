import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { listDeadlines } from "@/lib/admin.functions";
import { DEADLINES } from "@/lib/demo-data";
import { EmptyState, PageHeader } from "@/components/common";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/deadlines")({
  head: () => ({
    meta: [
      { title: "Deadlines — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "Key dates for Internal SIH 2026: registration, proposal submission, review, shortlist and presentation." },
      { property: "og:title", content: "JGI-SIH Deadlines" },
      { property: "og:description", content: "Every important Internal Smart India Hackathon date in one timeline." },
    ],
  }),
  component: DeadlinesPage,
});

interface Row {
  id: string;
  label: string;
  description: string;
  due_at: string;
}

function DeadlinesPage() {
  const fetchDeadlines = useServerFn(listDeadlines);
  const { data, isLoading } = useQuery({ queryKey: ["deadlines"], queryFn: () => fetchDeadlines() });

  const remote = (data as Row[] | undefined) ?? [];
  const rows: Row[] =
    remote.length > 0
      ? remote
      : DEADLINES.map((d, i) => ({ id: `local-${i}`, label: d.label, description: "", due_at: `${d.date}T17:00:00.000Z` }));

  const now = Date.now();

  return (
    <div className="space-y-6">
      <PageHeader title="Deadlines" description="The official Internal SIH 2026 timeline across all JSPM Group campuses." icon={CalendarClock} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading timeline…</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No deadlines published" description="The coordination team has not published any dates yet." />
      ) : (
        <ol className="space-y-3">
          {rows.map((d) => {
            const due = new Date(d.due_at).getTime();
            const past = due < now;
            return (
              <li key={d.id} className="surface-card flex items-start gap-4 p-5">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    past ? "bg-success-soft text-success" : "bg-warning/12 text-warning-foreground",
                  )}
                >
                  {past ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold">{d.label}</p>
                  {d.description ? <p className="mt-1 text-sm text-muted-foreground">{d.description}</p> : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {new Date(d.due_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{past ? "Completed" : "Upcoming"}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
