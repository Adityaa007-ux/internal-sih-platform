import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, CalendarClock, ClipboardList, Trophy, Users, UserCog } from "lucide-react";
import { adminOverview } from "@/lib/admin.functions";
import { PageHeader, StatCard } from "@/components/common";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Portal — JGI-SIH | JSPM Group Internal SIH" },
      {
        name: "description",
        content:
          "Administrator control centre for the JSPM Group Internal SIH portal: students, announcements, deadlines, mentors and results.",
      },
      { property: "og:title", content: "JGI-SIH Admin Portal" },
      { property: "og:description", content: "Manage the JSPM Group Internal Smart India Hackathon end to end." },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const fetchOverview = useServerFn(adminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview() });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Portal"
        description="Server-verified administrator control centre for Internal SIH 2026 across all JSPM Group campuses."
        icon={UserCog}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered students" value={isLoading ? "…" : (data?.students ?? 0)} icon={Users} />
        <StatCard label="Live announcements" value={isLoading ? "…" : (data?.announcements ?? 0)} icon={Bell} tone="info" />
        <StatCard label="Deadlines" value={isLoading ? "…" : (data?.deadlines ?? 0)} icon={CalendarClock} tone="warning" />
        <StatCard label="Published results" value={isLoading ? "…" : (data?.publishedResults ?? 0)} icon={Trophy} tone="success" />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-sm font-semibold">Recent administrative activity</h2>
        </div>
        {!data?.recentAudit?.length ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.recentAudit.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <ClipboardList className="size-4 text-muted-foreground" />
                <span className="font-medium">{a.action}</span>
                <span className="truncate text-muted-foreground">{a.detail}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/dashboard", label: "Back to main dashboard" },
          { to: "/problems", label: "Problem statements" },
          { to: "/shortlist", label: "Shortlist & evaluation" },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="surface-card p-4 text-sm font-medium hover:border-primary/40">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
