import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  listPendingApprovals,
  listTeamSelections,
  setApprovalStatus,
  type PendingAccount,
  type TeamSelectionRow,
} from "@/lib/admin.functions";
import { EmptyState, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — JGI-SIH | JSPM Group Internal SIH Portal" },
      {
        name: "description",
        content:
          "Faculty and administrators approve pending mentor and administrator accounts and review every team's selected SIH 2025 problem statement.",
      },
      { property: "og:title", content: "JGI-SIH — Account Approvals" },
      { property: "og:description", content: "Approve pending staff accounts and audit team problem-statement selections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { role, isLoading } = useSession();
  const fetchPending = useServerFn(listPendingApprovals);
  const fetchSelections = useServerFn(listTeamSelections);
  const decide = useServerFn(setApprovalStatus);
  const qc = useQueryClient();

  const staff = role === "admin" || role === "faculty";

  const pending = useQuery<PendingAccount[]>({
    queryKey: ["pending-approvals"],
    queryFn: () => fetchPending({}),
    enabled: staff,
  });
  const selections = useQuery<TeamSelectionRow[]>({
    queryKey: ["team-selections"],
    queryFn: () => fetchSelections({}),
    enabled: staff,
  });

  const mutate = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" }) => decide({ data: v }),
    onSuccess: () => {
      toast.success("Account updated.");
      void qc.invalidateQueries({ queryKey: ["pending-approvals"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the account."),
  });

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Checking permissions…</p>;

  if (!staff) {
    return (
      <div className="surface-card mx-auto mt-10 max-w-md p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-lg font-bold">Faculty or admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Approvals are verified in the database, so this area cannot be unlocked from the browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account approvals"
        description="Mentor and administrator sign-ups stay pending until faculty or an administrator approves them."
        icon={BadgeCheck}
      />

      <section className="surface-card p-5">
        <h2 className="font-display text-sm font-bold">Pending accounts</h2>
        {pending.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : !pending.data?.length ? (
          <div className="mt-3">
            <EmptyState icon={BadgeCheck} title="Nothing pending" description="Every mentor and administrator account has been reviewed." />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {pending.data.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2.5 pr-3 font-medium">{p.full_name}</td>
                    <td className="py-2.5 pr-3 capitalize">{p.role}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{p.email ?? p.mobile ?? "—"}</td>
                    <td className="py-2.5 pr-3 capitalize">{p.approval_status}</td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={mutate.isPending}
                          onClick={() => mutate.mutate({ id: p.id, status: "approved" })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mutate.isPending}
                          onClick={() => mutate.mutate({ id: p.id, status: "rejected" })}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-sm font-bold">Team problem-statement selections</h2>
        {selections.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : !selections.data?.length ? (
          <div className="mt-3">
            <EmptyState icon={BadgeCheck} title="No teams yet" description="Team selections from the SIH 2025 repository will appear here." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {selections.data.map((t) => (
              <li key={t.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {t.name} <span className="text-xs font-normal text-muted-foreground">({t.code})</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.selected_at ? new Date(t.selected_at).toLocaleString() : "Not selected yet"}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {t.selected_ps_id ? `${t.selected_ps_id} — ${t.selected_ps_title}` : "No problem statement chosen."}
                </p>
                {t.selected_ps_org ? <p className="text-xs text-muted-foreground">{t.selected_ps_org}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
