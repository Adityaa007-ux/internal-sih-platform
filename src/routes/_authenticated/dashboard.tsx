import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  GitCompareArrows,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  TriangleAlert,
  Trophy,
  Users,
} from "lucide-react";
import { useStore, combinedScore } from "@/lib/store";
import { DEADLINES, DEMO_USERS, problemById } from "@/lib/demo-data";
import { DemoBadge, EmptyState, PageHeader, StagePipeline, StatCard, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — JGI-SIH | JSPM Group Internal SIH Portal" },
      {
        name: "description",
        content:
          "Track your Internal SIH team status, AI proposal score, similarity risk and selection stage in the JSPM Group Internal SIH Portal.",
      },
      { property: "og:title", content: "JGI-SIH Dashboard — JSPM Group Internal SIH Portal" },
      {
        property: "og:description",
        content: "AI-powered Internal Smart India Hackathon management and evaluation platform for JSPM Group campuses.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role } = useStore();
  if (role === "student") return <StudentDashboard />;
  if (role === "faculty") return <FacultyDashboard />;
  if (role === "mentor") return <MentorDashboard />;
  return <AdminDashboard />;
}

function QuickAction({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Users }) {
  return (
    <Link
      to={to}
      className="surface-card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4.5" />
      </span>
      <span className="text-sm font-medium">{label}</span>
      <ArrowRight className="ml-auto size-4 text-muted-foreground" />
    </Link>
  );
}

function UpcomingDeadlines() {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2">
        <CalendarClock className="size-4 text-primary" />
        <h2 className="font-display text-sm font-semibold">Deadlines</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {DEADLINES.map((d) => (
          <li key={d.label} className="flex items-center gap-3">
            <span
              className={`size-2 shrink-0 rounded-full ${d.done ? "bg-success" : "bg-warning"}`}
              aria-hidden
            />
            <span className={`flex-1 text-sm ${d.done ? "text-muted-foreground line-through" : "font-medium"}`}>
              {d.label}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnnouncementList({ limit = 4 }: { limit?: number }) {
  const { announcements } = useStore();
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-primary" />
        <h2 className="font-display text-sm font-semibold">Important announcements</h2>
        <Link to="/announcements" className="ml-auto text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <ul className="mt-4 space-y-3">
        {announcements.slice(0, limit).map((a) => (
          <li key={a.id} className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium">{a.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
            <p className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {new Date(a.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudentDashboard() {
  const { currentTeam } = useStore();
  const user = DEMO_USERS.student;

  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Welcome, ${user.name.split(" ")[0]}`}
          description="You have not registered a team for Internal SIH 2026 yet."
          icon={LayoutDashboard}
        />
        <EmptyState
          icon={Users}
          title="No team registered"
          description="Register your team to unlock problem selection, proposal submission and the AI evaluation modules."
          action={
            <Button asChild>
              <Link to="/team-registration">Register your team</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const problem = problemById(currentTeam.problemId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${currentTeam.name} · ${currentTeam.campus} · Internal SIH 2026`}
        icon={LayoutDashboard}
        actions={
          <>
            <DemoBadge />
            <Button asChild variant="outline">
              <Link to="/my-team">My team</Link>
            </Button>
            <Button asChild>
              <Link to="/analyzer">Run AI analysis</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registration ID" value={<span className="text-base">{currentTeam.regId}</span>} hint={currentTeam.locked ? "Team locked" : "Editable"} icon={Users} />
        <StatCard label="Proposal status" value={<StatusPill status={currentTeam.proposalStatus} />} hint={problem ? problem.id : "No problem selected"} icon={FileText} tone="info" />
        <StatCard
          label="AI proposal score"
          value={currentTeam.ai ? `${currentTeam.ai.overall}/100` : "—"}
          hint={currentTeam.ai ? "Decision support only" : "Not analysed yet"}
          icon={Sparkles}
          tone={currentTeam.ai && currentTeam.ai.overall >= 80 ? "success" : "default"}
        />
        <StatCard
          label="Similarity risk"
          value={currentTeam.similarity ? <StatusPill status={currentTeam.similarity.risk} /> : "—"}
          hint={currentTeam.similarity ? `${currentTeam.similarity.score}% similarity` : "Not checked yet"}
          icon={GitCompareArrows}
          tone={currentTeam.similarity && currentTeam.similarity.score >= 60 ? "danger" : "success"}
        />
      </div>

      <div className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-semibold">Selection pipeline</h2>
            <p className="text-xs text-muted-foreground">
              Current stage: <span className="font-medium text-foreground">{currentTeam.stage}</span>
            </p>
          </div>
          <StatusPill status={currentTeam.shortlist} />
        </div>
        <div className="mt-5">
          <StagePipeline current={currentTeam.stage} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Selected problem statement</h2>
            {problem ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 font-display text-xs font-bold text-primary">{problem.id}</span>
                  <StatusPill status={problem.difficulty === "Hard" ? "High" : problem.difficulty === "Medium" ? "Moderate" : "Low"} />
                  <span className="text-xs text-muted-foreground">{problem.organization}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">{problem.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{problem.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {problem.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">No problem statement selected yet.</p>
                <Button asChild size="sm">
                  <Link to="/problems">Explore problems</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction to="/problems" label="Explore problem statements" icon={FileSearch} />
            <QuickAction to="/proposal" label="Edit / submit proposal" icon={FileText} />
            <QuickAction to="/analyzer" label="Analyze proposal with AI" icon={Sparkles} />
            <QuickAction to="/similarity" label="Run similarity detection" icon={GitCompareArrows} />
            <QuickAction to="/recommendations" label="Get AI recommendations" icon={BarChart3} />
            <QuickAction to="/presentation" label="Presentation schedule" icon={CalendarClock} />
          </div>
        </div>

        <div className="space-y-4">
          <UpcomingDeadlines />
          <AnnouncementList />
        </div>
      </div>
    </div>
  );
}

function FacultyDashboard() {
  const { teams } = useStore();
  const submitted = teams.filter((t) => t.proposal && t.proposalStatus !== "Draft");
  const pending = submitted.filter((t) => !t.review);
  const highRisk = teams.filter((t) => t.similarity && t.similarity.score >= 60);
  const shortlisted = teams.filter((t) => t.shortlist === "Shortlisted");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty dashboard"
        description="Review submitted proposals with AI decision support, record evaluation scores and manage the shortlist."
        icon={CheckCircle2}
        actions={
          <>
            <DemoBadge />
            <Button asChild>
              <Link to="/faculty-review">Open review queue</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Submitted proposals" value={submitted.length} hint={`${teams.length} teams registered`} icon={ClipboardList} />
        <StatCard label="Pending your review" value={pending.length} hint="Awaiting faculty score" icon={CheckCircle2} tone="warning" />
        <StatCard label="High similarity cases" value={highRisk.length} hint="Need side-by-side comparison" icon={TriangleAlert} tone="danger" />
        <StatCard label="Shortlisted" value={shortlisted.length} hint="Proceeding to offline round" icon={ListChecks} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold">Review queue</h2>
            <Link to="/faculty-review" className="text-xs font-medium text-primary hover:underline">
              Go to Faculty Review
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">All submitted proposals have been reviewed.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.proposal?.title} · {t.problemId}
                    </p>
                  </div>
                  <span className="text-xs">
                    AI <strong className="font-display tabular-nums">{t.ai?.overall ?? "—"}</strong>
                  </span>
                  {t.similarity ? <StatusPill status={t.similarity.risk} /> : null}
                  <Button asChild size="sm" variant="outline">
                    <Link to="/faculty-review">Review</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <UpcomingDeadlines />
          <AnnouncementList limit={3} />
        </div>
      </div>
    </div>
  );
}

function MentorDashboard() {
  const { teams } = useStore();
  const mine = teams.filter((t) => t.mentor === DEMO_USERS.mentor.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor dashboard"
        description="Track the teams assigned to you, review their proposals and share improvement feedback."
        icon={Users}
        actions={<DemoBadge />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned teams" value={mine.length} icon={Users} />
        <StatCard label="Proposals submitted" value={mine.filter((t) => t.proposal && t.proposalStatus !== "Draft").length} icon={FileText} tone="info" />
        <StatCard label="AI analysed" value={mine.filter((t) => t.ai).length} icon={Sparkles} />
        <StatCard label="Shortlisted" value={mine.filter((t) => t.shortlist === "Shortlisted").length} icon={ListChecks} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {mine.map((t) => (
            <div key={t.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t.regId} · {t.campus} · {t.members.length} members
                  </p>
                </div>
                <StatusPill status={t.proposalStatus} />
              </div>
              <p className="mt-3 text-sm">{t.proposal?.title ?? "Proposal not started"}</p>
              <div className="mt-3">
                <StagePipeline current={t.stage} compact />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/faculty-review">Open proposal</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/analyzer">AI analysis</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <UpcomingDeadlines />
          <AnnouncementList limit={3} />
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { teams, resultsPublished } = useStore();
  const ranked = [...teams].sort((a, b) => combinedScore(b) - combinedScore(a)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Internal SIH 2026 across four JSPM Group campuses — registrations, evaluation progress and result publication."
        icon={Trophy}
        actions={
          <>
            <DemoBadge />
            <Button asChild variant="outline">
              <Link to="/analytics">Analytics</Link>
            </Button>
            <Button asChild>
              <Link to="/results">Manage results</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered teams" value={teams.length} hint="Across 4 campuses" icon={Users} />
        <StatCard label="Proposals submitted" value={teams.filter((t) => t.proposal && t.proposalStatus !== "Draft").length} icon={FileText} tone="info" />
        <StatCard label="AI analyses run" value={teams.filter((t) => t.ai).length} icon={Sparkles} />
        <StatCard
          label="Results"
          value={resultsPublished ? "Published" : "Unpublished"}
          hint={resultsPublished ? "Visible to all users" : "Publish from Results page"}
          icon={Trophy}
          tone={resultsPublished ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold">Top ranked teams (combined evaluation)</h2>
            <Link to="/shortlist" className="text-xs font-medium text-primary hover:underline">
              Shortlist
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {ranked.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft font-display text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.campus} · {t.problemId ?? "No problem"}
                  </p>
                </div>
                <span className="font-display text-sm font-bold tabular-nums">{combinedScore(t)}</span>
                <StatusPill status={t.shortlist} />
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <UpcomingDeadlines />
          <AnnouncementList limit={3} />
        </div>
      </div>
    </div>
  );
}
