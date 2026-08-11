import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { listStudents, setStudentStatus } from "@/lib/admin.functions";
import { EmptyState, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — JGI-SIH Admin | JSPM Group Internal SIH" },
      { name: "description", content: "Administrator view of all registered Internal SIH students with account status controls." },
      { property: "og:title", content: "JGI-SIH Admin — Students" },
      { property: "og:description", content: "Manage registered student accounts for the Internal SIH." },
    ],
  }),
  component: StudentsPage,
});

interface Student {
  id: string;
  prn: string;
  full_name: string;
  email: string | null;
  mobile: string | null;
  department: string | null;
  campus: string | null;
  verified_channel: string;
  status: string;
  created_at: string;
}

function StudentsPage() {
  const fetchStudents = useServerFn(listStudents);
  const changeStatus = useServerFn(setStudentStatus);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-students"], queryFn: () => fetchStudents() });
  const mutation = useMutation({
    mutationFn: (v: { id: string; status: "active" | "suspended" }) => changeStatus({ data: v }),
    onSuccess: () => {
      toast.success("Student status updated");
      void qc.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = ((data as Student[] | undefined) ?? []).filter((s) =>
    q.trim() ? `${s.prn} ${s.full_name} ${s.email ?? ""} ${s.department ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description="Every account registered on the JGI-SIH portal, with server-verified controls." icon={Users} />

      <input
        className="field max-w-md"
        placeholder="Search PRN, name, email or department…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search students"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading students…</p>
      ) : isError ? (
        <EmptyState icon={Users} title="Could not load students" description="Refresh the page or check your administrator access." />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="No registered account matches your search." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">PRN</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Campus / Dept</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{s.prn}</td>
                    <td className="px-4 py-3">{s.full_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.email ?? "—"}
                      <br />
                      {s.mobile ?? ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.campus ?? "—"}
                      <br />
                      {s.department ?? ""}
                    </td>
                    <td className="px-4 py-3 capitalize">{s.verified_channel}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.status === "active"
                            ? "rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success"
                            : "rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger"
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ id: s.id, status: s.status === "active" ? "suspended" : "active" })}
                      >
                        {s.status === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                    </td>
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
