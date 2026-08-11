import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone } from "lucide-react";
import { listAnnouncements } from "@/lib/admin.functions";
import { useStore } from "@/lib/store";
import { EmptyState, PageHeader } from "@/components/common";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — JGI-SIH | JSPM Group Internal SIH" },
      { name: "description", content: "All official Internal SIH 2026 announcements and notices for JSPM Group participants." },
      { property: "og:title", content: "JGI-SIH Announcements" },
      { property: "og:description", content: "Official notices for the JSPM Group Internal Smart India Hackathon." },
    ],
  }),
  component: AnnouncementsPage,
});

interface Row {
  id: string;
  title: string;
  body: string;
  tag: string;
  created_at: string;
}

function AnnouncementsPage() {
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const { announcements } = useStore();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => fetchAnnouncements(),
  });

  const rows: Row[] =
    (data as Row[] | undefined)?.filter((a) => a.title) ??
    announcements.map((a) => ({ id: a.id, title: a.title, body: a.body, tag: a.type, created_at: a.date }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Official notices published by the Internal SIH coordination team."
        icon={Megaphone}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading announcements…</p>
      ) : isError && rows.length === 0 ? (
        <EmptyState icon={Megaphone} title="Could not load announcements" description="Please refresh the page to try again." />
      ) : rows.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Notices published by the coordination team will appear here." />
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="surface-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">{a.tag}</span>
                <h2 className="font-display text-sm font-semibold">{a.title}</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
