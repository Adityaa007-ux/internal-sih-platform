import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Mail, Phone, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { problemById } from "@/lib/demo-data";
import { DemoBadge, EmptyState, PageHeader, StagePipeline, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/my-team")({
  head: () => ({
    meta: [
      { title: "My Team — JGI-SIH Portal" },
      {
        name: "description",
        content: "View your Internal SIH team profile, locked member list, selected problem statement and current selection stage.",
      },
      { property: "og:title", content: "My Team — JGI-SIH Portal" },
      { property: "og:description", content: "Team profile and selection progress in the JSPM Group Internal SIH Portal." },
    ],
  }),
  component: MyTeam,
});

function MyTeam() {
  const { currentTeam, teams, setCurrentTeamId, role } = useStore();

  if (!currentTeam) {
    return (
      <EmptyState
        icon={Users}
        title="No team linked"
        description="Register a team first, or pick an existing demo team to view."
        action={
          <Button asChild>
            <Link to="/team-registration">Register a team</Link>
          </Button>
        }
      />
    );
  }

  const problem = problemById(currentTeam.problemId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentTeam.name}
        description={`${currentTeam.regId} · ${currentTeam.campus} · ${currentTeam.department}`}
        icon={Users}
        actions={
          <>
            <DemoBadge />
            {currentTeam.locked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">
                <Lock className="size-3.5" /> Membership locked
              </span>
            ) : null}
            <Button asChild variant="outline">
              <Link to="/proposal">Proposal</Link>
            </Button>
          </>
        }
      />

      {role !== "student" && teams.length > 1 ? (
        <div className="surface-card flex flex-wrap items-center gap-2 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Viewing team</span>
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTeamId(t.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                t.id === currentTeam.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/50"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="surface-card p-5">
        <h2 className="font-display text-sm font-semibold">Selection stage</h2>
        <div className="mt-4">
          <StagePipeline current={currentTeam.stage} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold">Team members ({currentTeam.members.length})</h2>
          </div>
          <ul className="divide-y divide-border">
            {currentTeam.members.map((m, i) => (
              <li key={m.prn} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft font-display text-xs font-bold text-primary">
                  {m.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {m.name} {i === 0 ? <span className="ml-1 text-[10px] font-bold uppercase text-primary">Leader</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.prn} · {m.department} · {m.year}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{m.skills}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Contact</h2>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" /> {currentTeam.email}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" /> {currentTeam.phone}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Mentor: {currentTeam.mentor ?? "Not assigned yet"}</p>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Status summary</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Proposal" value={<StatusPill status={currentTeam.proposalStatus} />} />
              <Row label="AI score" value={currentTeam.ai ? `${currentTeam.ai.overall}/100` : "Not analysed"} />
              <Row
                label="Similarity"
                value={currentTeam.similarity ? `${currentTeam.similarity.score}% (${currentTeam.similarity.risk})` : "Not checked"}
              />
              <Row label="Faculty score" value={currentTeam.review ? `${currentTeam.review.total}/60` : "Pending"} />
              <Row label="Shortlist" value={<StatusPill status={currentTeam.shortlist} />} />
            </dl>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Problem statement</h2>
            {problem ? (
              <div className="mt-3">
                <span className="rounded-md bg-primary-soft px-2 py-0.5 font-display text-xs font-bold text-primary">{problem.id}</span>
                <p className="mt-2 text-sm font-medium">{problem.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{problem.organization}</p>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Not selected yet.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link to="/problems">Choose a problem</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
