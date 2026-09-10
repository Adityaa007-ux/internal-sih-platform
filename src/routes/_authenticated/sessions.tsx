import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { listMySessions, revokeOtherSessions, revokeSession } from "@/lib/sessions.functions";

export const Route = createFileRoute("/_authenticated/sessions")({
  head: () => ({
    meta: [
      { title: "Devices & Sessions — Internal SIH Platform" },
      {
        name: "description",
        content: "Review every device signed in to your Internal SIH Platform account and sign out sessions you no longer use.",
      },
      { property: "og:title", content: "Devices & Sessions — Internal SIH Platform" },
      { property: "og:description", content: "Review and revoke active login sessions on your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listMySessions);
  const revoke = useServerFn(revokeSession);
  const revokeOthers = useServerFn(revokeOtherSessions);

  const sessions = useQuery({ queryKey: ["my-sessions"], queryFn: () => list() });

  const end = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      toast.success("Session signed out.");
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const endAll = useMutation({
    mutationFn: () => revokeOthers(),
    onSuccess: () => {
      toast.success("All other devices signed out.");
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = sessions.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices & Sessions"
        description="Each sign-in creates its own secure session. Ending a session only signs that device out — your teams, submissions and account data stay safe."
        icon={MonitorSmartphone}
        actions={
          <Button variant="outline" onClick={() => endAll.mutate()} disabled={endAll.isPending}>
            Sign out other devices
          </Button>
        }
      />

      {sessions.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading sessions…</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={MonitorSmartphone} title="No sessions recorded" description="Your current sign-in will be listed here shortly." />
      ) : (
        <div className="space-y-3">
          {rows.map((s) => (
            <div key={s.id} className="surface-card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {s.device_label}
                  {s.current ? <span className="ml-2 text-xs font-medium text-primary">This device</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  Signed in {new Date(s.created_at).toLocaleString()} · last active {new Date(s.last_activity_at).toLocaleString()} ·
                  expires {new Date(s.expires_at).toLocaleDateString()}
                </p>
              </div>
              <StatusPill status={s.status} />
              {s.status === "active" && !s.current ? (
                <Button size="sm" variant="outline" onClick={() => end.mutate(s.id)}>
                  Sign out
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
