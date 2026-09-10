import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Briefcase, Building2, Linkedin, Mail, Phone, Search, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  browseIndustrialMentors,
  cancelMentorshipRequest,
  listMentorMessages,
  listMyMentorshipRequests,
  sendMentorMessage,
  sendMentorshipRequest,
  type IndustrialMentor,
} from "@/lib/industrial-mentor.functions";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/industrial-mentor")({
  head: () => ({
    meta: [
      { title: "Industrial Mentor — Internal SIH Platform" },
      {
        name: "description",
        content:
          "Discover industry professionals, request industrial mentorship and stay in touch with your connected mentors on the Internal SIH Platform.",
      },
      { property: "og:title", content: "Industrial Mentor — Internal SIH Platform" },
      {
        property: "og:description",
        content: "Browse industrial mentors, send mentorship requests and message your connected mentors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndustrialMentorPage,
});

const PAGE_SIZE = 9;

function IndustrialMentorPage() {
  const qc = useQueryClient();
  const browse = useServerFn(browseIndustrialMentors);
  const request = useServerFn(sendMentorshipRequest);
  const cancel = useServerFn(cancelMentorshipRequest);
  const myRequests = useServerFn(listMyMentorshipRequests);

  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<IndustrialMentor | null>(null);
  const [note, setNote] = useState("");

  const list = useQuery({
    queryKey: ["industrial-mentors", search, expertise, page],
    queryFn: () => browse({ data: { search, expertise, page, pageSize: PAGE_SIZE } }),
  });
  const requests = useQuery({ queryKey: ["my-mentorship-requests"], queryFn: () => myRequests() });

  const send = useMutation({
    mutationFn: (mentorUserId: string) => request({ data: { mentorUserId, message: note } }),
    onSuccess: () => {
      toast.success("Mentorship request sent.");
      setActive(null);
      setNote("");
      void qc.invalidateQueries({ queryKey: ["my-mentorship-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const withdraw = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => {
      toast.success("Request withdrawn.");
      void qc.invalidateQueries({ queryKey: ["my-mentorship-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = requests.data ?? [];
  const statusFor = (userId: string) => rows.find((r) => r.mentor_user_id === userId && (r.status === "pending" || r.status === "accepted"));
  const total = list.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industrial Mentor"
        description="Connect with industry professionals for guidance on your Internal SIH idea. Your college mentor stays assigned separately."
        icon={Briefcase}
      />

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse mentors</TabsTrigger>
          <TabsTrigger value="requests">My requests ({rows.length})</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, company, designation or skill"
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <Input
              className="sm:max-w-56"
              placeholder="Filter by expertise"
              value={expertise}
              onChange={(e) => {
                setPage(0);
                setExpertise(e.target.value);
              }}
            />
          </div>

          {list.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading mentors…</p>
          ) : (list.data?.mentors.length ?? 0) === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No industrial mentors yet"
              description="Industry professionals who join the platform as industrial mentors will appear here."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.data?.mentors.map((m) => {
                const open = statusFor(m.user_id);
                return (
                  <article key={m.id} className="surface-card flex flex-col gap-3 p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">
                        {m.full_name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{m.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.designation} · {m.company}
                        </p>
                      </div>
                    </div>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{m.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((s) => (
                          <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                            {s}
                          </span>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.experience_years} yrs experience</p>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="size-4" /> LinkedIn
                        </a>
                      </Button>
                      {open ? (
                        <StatusPill status={open.status} />
                      ) : (
                        <Button size="sm" onClick={() => setActive(m)} disabled={!m.accepting_requests}>
                          Request mentorship
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {total > PAGE_SIZE ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 pt-4">
          {rows.length === 0 ? (
            <EmptyState icon={Users} title="No pending requests" description="Requests you send to industrial mentors appear here." />
          ) : (
            rows.map((r) => (
              <div key={r.id} className="surface-card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.mentor?.full_name ?? "Industrial mentor"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.mentor?.designation} · {r.mentor?.company} · sent {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.response_note ? <p className="mt-1 text-sm">“{r.response_note}”</p> : null}
                </div>
                <StatusPill status={r.status} />
                {r.status === "pending" ? (
                  <Button variant="outline" size="sm" onClick={() => withdraw.mutate(r.id)}>
                    Withdraw
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="connected" className="space-y-4 pt-4">
          {rows.filter((r) => r.status === "accepted").length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No industrial mentor connected"
              description="Once a mentor accepts your request you can contact them here."
            />
          ) : (
            rows
              .filter((r) => r.status === "accepted")
              .map((r) => (
                <div key={r.id} className="surface-card space-y-3 p-5">
                  <div>
                    <p className="font-semibold">{r.mentor?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.mentor?.designation} · {r.mentor?.company}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {r.mentor?.contact_email ? (
                        <a className="inline-flex items-center gap-1" href={`mailto:${r.mentor.contact_email}`}>
                          <Mail className="size-3.5" /> {r.mentor.contact_email}
                        </a>
                      ) : null}
                      {r.mentor?.mobile ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3.5" /> {r.mentor.mobile}
                        </span>
                      ) : null}
                      {r.mentor?.linkedin_url ? (
                        <a
                          className="inline-flex items-center gap-1"
                          href={r.mentor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="size-3.5" /> LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <MentorChat requestId={r.id} />
                </div>
              ))
          )}
        </TabsContent>
      </Tabs>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setActive(null)}>
          <div className="surface-card w-full max-w-md space-y-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="font-display text-lg font-bold">Request mentorship</h2>
              <p className="text-sm text-muted-foreground">
                {active.full_name} — {active.designation}, {active.company}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4" /> {active.industry || active.company}
              </p>
              <p className="text-muted-foreground">Expertise: {active.expertise}</p>
            </div>
            <Textarea
              rows={4}
              placeholder="Tell the mentor about your problem statement and what guidance you need."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActive(null)}>
                Cancel
              </Button>
              <Button onClick={() => send.mutate(active.user_id)} disabled={send.isPending}>
                {send.isPending ? "Sending…" : "Send request"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MentorChat({ requestId }: { requestId: string }) {
  const qc = useQueryClient();
  const session = useSession();
  const list = useServerFn(listMentorMessages);
  const send = useServerFn(sendMentorMessage);
  const [body, setBody] = useState("");

  const messages = useQuery({
    queryKey: ["mentor-messages", requestId],
    queryFn: () => list({ data: { requestId } }),
    refetchInterval: 15_000,
  });

  const post = useMutation({
    mutationFn: () => send({ data: { requestId, body } }),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["mentor-messages", requestId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="max-h-56 space-y-2 overflow-y-auto">
        {(messages.data ?? []).length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No messages yet — say hello.</p>
        ) : (
          messages.data?.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.sender_id === session.data?.userId ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              {m.body}
            </div>
          ))
        )}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) post.mutate();
        }}
      >
        <Input placeholder="Write a message…" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button type="submit" size="icon" disabled={post.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
