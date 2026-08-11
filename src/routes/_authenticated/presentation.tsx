import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/presentation")({
  head: () => ({
    meta: [
      { title: "Presentation Round — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "Offline faculty presentation schedule and panel outcomes for shortlisted Internal SIH 2026 teams." },
      { property: "og:title", content: "JGI-SIH Presentation Round" },
      { property: "og:description", content: "Schedules, panels and final outcomes for the offline presentation round." },
    ],
  }),
  component: PresentationPage,
});

function PresentationPage() {
  const { teams, role, schedulePresentation, recordFinalResult } = useStore();
  const shortlisted = teams.filter((t) => t.shortlist === "Shortlisted");
  const canEdit = role === "admin" || role === "faculty";
  const [form, setForm] = useState({ date: "", time: "", venue: "", panel: "" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offline Presentation"
        description="Shortlisted teams present to the faculty panel. The panel decision is the final selection."
        icon={CalendarClock}
      />

      {shortlisted.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No shortlisted teams" description="Teams appear here once they are shortlisted for the offline round." />
      ) : (
        <div className="space-y-4">
          {shortlisted.map((t) => (
            <div key={t.id} className="surface-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-semibold">{t.name}</h2>
                <StatusPill status={t.presentation?.finalResult ?? t.presentation?.status ?? "Not Scheduled"} />
                <span className="ml-auto text-xs text-muted-foreground">{t.regId}</span>
              </div>

              {t.presentation?.date ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.presentation.date} at {t.presentation.time} · {t.presentation.venue} · Panel {t.presentation.panel}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Not scheduled yet.</p>
              )}

              {canEdit && (
                <div className="mt-4 grid gap-2 sm:grid-cols-5">
                  <input className="field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" />
                  <input className="field" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} aria-label="Time" />
                  <input className="field" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
                  <input className="field" placeholder="Panel" value={form.panel} onChange={(e) => setForm({ ...form, panel: e.target.value })} />
                  <Button
                    onClick={() => {
                      if (!form.date || !form.time) {
                        toast.error("Pick a date and time first");
                        return;
                      }
                      schedulePresentation(t.id, { ...form, status: "Scheduled", remarks: "" });
                      toast.success(`Presentation scheduled for ${t.name}`);
                    }}
                  >
                    Schedule
                  </Button>
                </div>
              )}

              {canEdit && t.presentation?.status === "Scheduled" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      recordFinalResult(t.id, "Selected", 88, "Strong demo and clear impact.");
                      toast.success(`${t.name} marked Selected`);
                    }}
                  >
                    Mark Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      recordFinalResult(t.id, "Not Selected", 62, "Idea needs stronger validation.");
                      toast.message(`${t.name} marked Not Selected`);
                    }}
                  >
                    Mark Not Selected
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
