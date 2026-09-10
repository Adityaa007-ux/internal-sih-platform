import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Briefcase, Inbox, Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMyIndustrialProfile,
  listIncomingMentorshipRequests,
  respondToMentorshipRequest,
  saveMyIndustrialProfile,
} from "@/lib/industrial-mentor.functions";
import { MentorChat } from "@/routes/_authenticated/industrial-mentor";

export const Route = createFileRoute("/_authenticated/mentor-hub")({
  head: () => ({
    meta: [
      { title: "Industrial Mentor Hub — Internal SIH Platform" },
      {
        name: "description",
        content:
          "Manage your industrial mentor profile, review student mentorship requests and guide connected teams on the Internal SIH Platform.",
      },
      { property: "og:title", content: "Industrial Mentor Hub — Internal SIH Platform" },
      { property: "og:description", content: "Industrial mentor profile, incoming requests and connected students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MentorHub,
});

const EMPTY = {
  full_name: "",
  contact_email: "",
  mobile: "",
  linkedin_url: "",
  designation: "",
  company: "",
  industry: "",
  experience_years: 0,
  expertise: "",
  skills: "",
  bio: "",
  photo_url: "",
  portfolio_url: "",
  website_url: "",
  certifications: "",
  mentor_scope: "industrial" as "industrial" | "both",
  accepting_requests: true,
};

function MentorHub() {
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyIndustrialProfile);
  const saveProfile = useServerFn(saveMyIndustrialProfile);
  const incoming = useServerFn(listIncomingMentorshipRequests);
  const respond = useServerFn(respondToMentorshipRequest);

  const profile = useQuery({ queryKey: ["my-industrial-profile"], queryFn: () => getProfile() });
  const requests = useQuery({ queryKey: ["incoming-mentorship-requests"], queryFn: () => incoming() });
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (profile.data) {
      setForm({
        ...EMPTY,
        ...profile.data,
        photo_url: profile.data.photo_url ?? "",
        portfolio_url: profile.data.portfolio_url ?? "",
        website_url: profile.data.website_url ?? "",
        certifications: profile.data.certifications ?? "",
        mentor_scope: (profile.data.mentor_scope as "industrial" | "both") ?? "industrial",
      });
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () => saveProfile({ data: form }),
    onSuccess: () => {
      toast.success("Industrial mentor profile saved. Students can now find you.");
      void qc.invalidateQueries({ queryKey: ["my-industrial-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decide = useMutation({
    mutationFn: (v: { id: string; decision: "accepted" | "rejected" }) =>
      respond({ data: { id: v.id, decision: v.decision, note: "" } }),
    onSuccess: () => {
      toast.success("Request updated.");
      void qc.invalidateQueries({ queryKey: ["incoming-mentorship-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = requests.data ?? [];
  const pending = rows.filter((r) => r.status === "pending");
  const connected = rows.filter((r) => r.status === "accepted");
  const field = (k: keyof typeof form) => ({
    value: String(form[k] ?? ""),
    onChange: (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [k]: k === "experience_years" ? Number(e.target.value || 0) : e.target.value })),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industrial Mentor Hub"
        description="Opt in as an industrial mentor, review student requests and guide connected teams. Your university mentoring duties are unchanged."
        icon={Briefcase}
      />

      <Tabs defaultValue={profile.data ? "requests" : "profile"}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="requests">Incoming ({pending.length})</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-4">
          <form
            className="surface-card grid gap-4 p-6 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <Labelled label="Full name *">
              <Input required {...field("full_name")} />
            </Labelled>
            <Labelled label="Email (Gmail or work) *">
              <Input required type="email" {...field("contact_email")} />
            </Labelled>
            <Labelled label="Mobile number *">
              <Input required inputMode="numeric" maxLength={10} {...field("mobile")} />
            </Labelled>
            <Labelled label="LinkedIn profile URL *">
              <Input required placeholder="https://www.linkedin.com/in/…" {...field("linkedin_url")} />
            </Labelled>
            <Labelled label="Current designation *">
              <Input required {...field("designation")} />
            </Labelled>
            <Labelled label="Company / industry *">
              <Input required {...field("company")} />
            </Labelled>
            <Labelled label="Industry sector">
              <Input {...field("industry")} />
            </Labelled>
            <Labelled label="Professional experience (years) *">
              <Input required type="number" min={0} max={60} {...field("experience_years")} />
            </Labelled>
            <Labelled label="Areas of expertise *" full>
              <Input required placeholder="AI/ML, Cloud architecture, Product strategy" {...field("expertise")} />
            </Labelled>
            <Labelled label="Skills *" full>
              <Input required placeholder="Python, System design, Mentoring" {...field("skills")} />
            </Labelled>
            <Labelled label="Professional bio *" full>
              <Textarea required rows={4} {...field("bio")} />
            </Labelled>
            <Labelled label="Profile photo URL (optional)">
              <Input {...field("photo_url")} />
            </Labelled>
            <Labelled label="Portfolio (optional)">
              <Input {...field("portfolio_url")} />
            </Labelled>
            <Labelled label="Website (optional)">
              <Input {...field("website_url")} />
            </Labelled>
            <Labelled label="Certifications (optional)">
              <Input {...field("certifications")} />
            </Labelled>
            <div className="md:col-span-2 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.mentor_scope === "both"}
                  onChange={(e) => setForm((f) => ({ ...f, mentor_scope: e.target.checked ? "both" : "industrial" }))}
                />
                I also mentor as a university mentor
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.accepting_requests}
                  onChange={(e) => setForm((f) => ({ ...f, accepting_requests: e.target.checked }))}
                />
                Accepting new mentorship requests
              </label>
              <Button className="ml-auto" type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : profile.data ? "Update profile" : "Publish profile"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 pt-4">
          {pending.length === 0 ? (
            <EmptyState icon={Inbox} title="No pending requests" description="Student mentorship requests will appear here." />
          ) : (
            pending.map((r) => (
              <div key={r.id} className="surface-card space-y-3 p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.student?.full_name ?? "Student"}</p>
                    <p className="text-xs text-muted-foreground">
                      {[r.student?.institution_name, r.student?.campus_name, r.student?.department, r.student?.team_name]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-xs text-muted-foreground">Requested {new Date(r.created_at).toLocaleString()}</p>
                    {r.message ? <p className="mt-2 text-sm">“{r.message}”</p> : null}
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide.mutate({ id: r.id, decision: "accepted" })}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: r.id, decision: "rejected" })}>
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="connected" className="space-y-4 pt-4">
          {connected.length === 0 ? (
            <EmptyState icon={Users} title="No connected students" description="Accepted students appear here with a message thread." />
          ) : (
            connected.map((r) => (
              <div key={r.id} className="surface-card space-y-3 p-5">
                <div>
                  <p className="font-semibold">{r.student?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[r.student?.institution_name, r.student?.team_name, r.student?.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <MentorChat requestId={r.id} />
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Labelled({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`space-y-1.5 text-sm font-medium ${full ? "md:col-span-2" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
