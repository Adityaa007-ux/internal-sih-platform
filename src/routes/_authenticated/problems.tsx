import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, CheckCircle2, FileSearch, Search, Tag } from "lucide-react";
import { toast } from "sonner";
import { PROBLEMS, type Problem } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { DemoBadge, PageHeader, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/problems")({
  head: () => ({
    meta: [
      { title: "Problem Explorer — JGI-SIH Portal" },
      {
        name: "description",
        content:
          "Browse SIH problem statements by theme, category and difficulty, read full details and select a statement for your Internal SIH team.",
      },
      { property: "og:title", content: "SIH Problem Statement Explorer — JGI-SIH Portal" },
      { property: "og:description", content: "Search and filter Smart India Hackathon problem statements for JSPM Group teams." },
    ],
  }),
  component: ProblemExplorer,
});

const THEMES = ["All themes", ...Array.from(new Set(PROBLEMS.map((p) => p.theme)))];
const CATEGORIES = ["All categories", ...Array.from(new Set(PROBLEMS.map((p) => p.category)))];
const DIFFICULTIES = ["All levels", "Easy", "Medium", "Hard"];
const SORTS = ["Relevance", "Difficulty (low to high)", "Difficulty (high to low)", "Title (A-Z)"];

const diffRank = { Easy: 1, Medium: 2, Hard: 3 } as const;

function ProblemExplorer() {
  const { currentTeam, selectProblem, role } = useStore();
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("All themes");
  const [category, setCategory] = useState("All categories");
  const [difficulty, setDifficulty] = useState("All levels");
  const [sort, setSort] = useState("Relevance");
  const [open, setOpen] = useState<Problem | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = PROBLEMS.filter((p) => {
      if (theme !== "All themes" && p.theme !== theme) return false;
      if (category !== "All categories" && p.category !== category) return false;
      if (difficulty !== "All levels" && p.difficulty !== difficulty) return false;
      if (!term) return true;
      return (
        p.title.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.organization.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
    if (sort === "Difficulty (low to high)") out = [...out].sort((a, b) => diffRank[a.difficulty] - diffRank[b.difficulty]);
    if (sort === "Difficulty (high to low)") out = [...out].sort((a, b) => diffRank[b.difficulty] - diffRank[a.difficulty]);
    if (sort === "Title (A-Z)") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [q, theme, category, difficulty, sort]);

  function choose(p: Problem) {
    if (!currentTeam) {
      toast.error("Register a team before selecting a problem statement.");
      return;
    }
    selectProblem(currentTeam.id, p.id);
    setOpen(null);
    toast.success(`${p.id} selected for ${currentTeam.name}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problem statement explorer"
        description="Official SIH-style problem statements available for JSPM Group Internal SIH 2026. Search, filter and select the statement your team will work on."
        icon={FileSearch}
        actions={<DemoBadge />}
      />

      <div className="surface-card grid gap-3 p-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, ID, tag or ministry…" className="pl-9" />
        </div>
        <FilterSelect value={theme} onChange={setTheme} options={THEMES} />
        <FilterSelect value={category} onChange={setCategory} options={CATEGORIES} />
        <FilterSelect value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
        <FilterSelect value={sort} onChange={setSort} options={SORTS} />
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{list.length}</strong> of {PROBLEMS.length} problem statements
        {currentTeam?.problemId ? (
          <>
            {" "}
            · your team has selected <strong className="text-foreground">{currentTeam.problemId}</strong>
          </>
        ) : null}
      </p>

      {list.length === 0 ? (
        <div className="surface-card px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold">No problem statements match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try clearing the search term or widening the theme filter.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQ("");
              setTheme("All themes");
              setCategory("All categories");
              setDifficulty("All levels");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const selected = currentTeam?.problemId === p.id;
            return (
              <article
                key={p.id}
                className={`surface-card flex flex-col p-5 transition-all hover:-translate-y-0.5 ${selected ? "border-primary ring-2 ring-primary/20" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 font-display text-xs font-bold text-primary">{p.id}</span>
                  <StatusPill status={p.difficulty === "Hard" ? "High" : p.difficulty === "Medium" ? "Moderate" : "Low"} />
                  {selected ? (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <CheckCircle2 className="size-3.5" /> Selected
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 font-display text-base font-semibold leading-snug">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="size-3.5" /> {p.organization}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tag className="size-3.5" /> {p.theme} · {p.category}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(p)}>
                    View details
                  </Button>
                  {role === "student" ? (
                    <Button size="sm" className="flex-1" disabled={selected} onClick={() => choose(p)}>
                      {selected ? "Selected" : "Select"}
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {open ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 font-display text-xs font-bold text-primary">{open.id}</span>
                  <StatusPill status={open.difficulty === "Hard" ? "High" : open.difficulty === "Medium" ? "Moderate" : "Low"} />
                  <span className="text-xs text-muted-foreground">{open.category}</span>
                </div>
                <DialogTitle className="mt-2 text-left font-display text-xl">{open.title}</DialogTitle>
                <DialogDescription className="text-left">{open.organization} · {open.theme}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
                  <p className="mt-1.5 text-sm leading-relaxed">{open.description}</p>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected skills</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {open.tags.map((t) => (
                      <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
                <section className="rounded-xl bg-muted p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What reviewers look for</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• A clear restatement of the constraint that defines this problem.</li>
                    <li>• A named differentiator versus other teams choosing the same statement.</li>
                    <li>• Evidence of feasibility: dataset, hardware or API access already secured.</li>
                  </ul>
                </section>
                {role === "student" ? (
                  <Button className="w-full" disabled={currentTeam?.problemId === open.id} onClick={() => choose(open)}>
                    {currentTeam?.problemId === open.id ? "Already selected by your team" : `Select ${open.id} for my team`}
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
