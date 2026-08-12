import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, Database, Loader2, Search, X } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { clearTeamProblem, getMyTeam, selectTeamProblem, type MyTeamResult } from "@/lib/team.functions";
import {
  PS_CATEGORIES,
  PS_DATASET_LABEL,
  PS_DATASET_NOTE,
  PS_DEPARTMENTS,
  PS_ORGANIZATIONS,
  PS_RECORDS,
  filterRecords,
  type PsRecord,
  type PsSortKey,
} from "@/lib/ps-repository";
import { EmptyState, PageHeader, StatCard } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/repository")({
  head: () => ({
    meta: [
      { title: "SIH 2025 Repository — JGI-SIH | JSPM Group Internal SIH" },
      {
        name: "description",
        content:
          "Searchable repository of 101 SIH 2025 records with PS ID, category, organization, department, team and idea IDs, team name and team lead.",
      },
      { property: "og:title", content: "SIH 2025 Repository — 101 records" },
      { property: "og:description", content: "Filter 101 SIH 2025 records by PS ID, category, organization and department." },
    ],
  }),
  component: RepositoryPage,
});

function RepositoryPage() {
  const { role, isSignedIn } = useSession();
  const isStudent = role === "student";
  const queryClient = useQueryClient();
  const fetchMyTeam = useServerFn(getMyTeam);
  const selectFn = useServerFn(selectTeamProblem);
  const clearFn = useServerFn(clearTeamProblem);

  const myTeam = useQuery<MyTeamResult>({
    queryKey: ["my-team"],
    queryFn: () => fetchMyTeam(),
    enabled: isSignedIn && isStudent,
  });
  const selected = myTeam.data?.team ?? null;

  const selectMutation = useMutation({
    mutationFn: (r: PsRecord) =>
      selectFn({ data: { psId: r.psId, psTitle: r.teamName ? `${r.psId} — ${r.organization}` : r.psId, psOrg: r.organization } }),
    onSuccess: () => {
      toast.success("Problem statement selected. Your choice is saved and will persist after refresh.");
      void queryClient.invalidateQueries({ queryKey: ["my-team"] });
      setActive(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save your selection."),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => {
      toast.success("Selection cleared. You can now choose a different problem statement.");
      void queryClient.invalidateQueries({ queryKey: ["my-team"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not clear your selection."),
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [organization, setOrganization] = useState("");
  const [department, setDepartment] = useState("");
  const [team, setTeam] = useState("");
  const [sort, setSort] = useState<PsSortKey>("sno");
  const [active, setActive] = useState<PsRecord | null>(null);

  const rows = useMemo(
    () => filterRecords(PS_RECORDS, { query, category, organization, department, team, sort }),
    [query, category, organization, department, team, sort],
  );

  const hasFilters = Boolean(query || category || organization || department || team);
  const clear = () => {
    setQuery("");
    setCategory("");
    setOrganization("");
    setDepartment("");
    setTeam("");
  };

  const software = PS_RECORDS.filter((r) => r.category === "Software").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="SIH 2025 Repository"
        description={`${PS_DATASET_LABEL}. Separate from the curated problem bank used by the AI modules.`}
        icon={Database}
      />

      {isStudent && selected?.selected_ps_id ? (
        <div className="surface-card flex flex-wrap items-center gap-3 border-success/40 bg-success-soft p-4">
          <CheckCircle2 className="size-5 text-success" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Your team has selected {selected.selected_ps_id}
            </p>
            <p className="truncate text-xs text-muted-foreground">{selected.selected_ps_org ?? selected.selected_ps_title}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            disabled={clearMutation.isPending || !myTeam.data?.isLeader}
            onClick={() => clearMutation.mutate()}
          >
            {clearMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Change selection
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total records" value={PS_RECORDS.length} icon={Database} />
        <StatCard label="Software" value={software} icon={Database} tone="info" />
        <StatCard label="Hardware" value={PS_RECORDS.length - software} icon={Database} tone="warning" />
        <StatCard label="Organizations" value={PS_ORGANIZATIONS.length} icon={Database} tone="success" />
      </div>

      <div className="surface-card space-y-3 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PS ID, organization, department, team, idea ID or team lead…"
            aria-label="Search repository"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {PS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className="field" value={organization} onChange={(e) => setOrganization(e.target.value)} aria-label="Filter by organization">
            <option value="">All organizations</option>
            {PS_ORGANIZATIONS.map((o) => (
              <option key={o} value={o}>
                {o.length > 60 ? `${o.slice(0, 60)}…` : o}
              </option>
            ))}
          </select>
          <select className="field" value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {PS_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d.length > 60 ? `${d.slice(0, 60)}…` : d}
              </option>
            ))}
          </select>
          <input
            className="field"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team name"
            aria-label="Filter by team name"
          />
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value as PsSortKey)} aria-label="Sort records">
            <option value="sno">Sort: S.No</option>
            <option value="psId">Sort: PS ID</option>
            <option value="organization">Sort: Organization</option>
            <option value="teamName">Sort: Team name</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{rows.length}</span> of {PS_RECORDS.length} records
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clear} className="h-7 px-2 text-xs">
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
          <span className="ml-auto max-w-full basis-full text-[11px] sm:basis-auto">{PS_DATASET_NOTE}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching records"
          description="No SIH 2025 record matches the current search and filters. Try clearing one of the filters."
          action={
            <Button size="sm" variant="outline" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">PS ID</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Team ID</th>
                  <th className="px-4 py-3 font-medium">Idea ID</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Team lead</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={`${r.sno}-${r.teamId}`} className="transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{r.sno}</td>
                    <td className="px-4 py-3 font-medium">{r.psId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">{r.category}</span>
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground">{r.organization}</td>
                    <td className="px-4 py-3 tabular-nums">{r.teamId}</td>
                    <td className="px-4 py-3 tabular-nums">{r.ideaId}</td>
                    <td className="px-4 py-3 font-medium">{r.teamName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.teamLead}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setActive(r)}>
                          Details
                        </Button>
                        {isStudent ? (
                          <Button
                            size="sm"
                            variant={selected?.selected_ps_id === r.psId ? "secondary" : "default"}
                            disabled={selectMutation.isPending || selected?.selected_ps_id === r.psId}
                            onClick={() => selectMutation.mutate(r)}
                          >
                            {selected?.selected_ps_id === r.psId ? "Selected" : "Select"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6" onClick={() => setActive(null)}>
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-pop sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Record #{active.sno}</p>
                <h2 className="font-display text-lg font-bold">{active.psId}</h2>
              </div>
              <button onClick={() => setActive(null)} aria-label="Close record details" className="ml-auto rounded-lg p-1.5 hover:bg-accent">
                <X className="size-4" />
              </button>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Category", active.category],
                ["Organization", active.organization],
                ["Department", active.department],
                ["Team ID", active.teamId],
                ["Idea ID", active.ideaId],
                ["Team name", active.teamName],
                ["Team lead", active.teamLead],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {isStudent ? (
              <Button
                className="mt-5 w-full"
                disabled={selectMutation.isPending || selected?.selected_ps_id === active.psId}
                onClick={() => selectMutation.mutate(active)}
              >
                {selectMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {selected?.selected_ps_id === active.psId ? "Already selected by your team" : `Select ${active.psId} for my team`}
              </Button>
            ) : null}
            <p className="mt-5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{PS_DATASET_NOTE}</p>
          </div>
        </div>
      )}
    </div>
  );
}
