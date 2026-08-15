import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Database,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  GitCompareArrows,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { DEMO_USERS, PROBLEMS, type Role } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AiAssistant } from "@/components/AiAssistant";
import { signOutEverywhere, useSession } from "@/hooks/useSession";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student", "faculty", "mentor", "admin"] },
    ],
  },
  {
    group: "Participation",
    items: [
      { to: "/team-registration", label: "Team Registration", icon: UserPlus, roles: ["student", "admin"] },
      { to: "/my-team", label: "My Team", icon: Users, roles: ["student", "mentor", "admin"] },
      { to: "/problems", label: "Problem Explorer", icon: FileSearch, roles: ["student", "faculty", "mentor", "admin"] },
      { to: "/repository", label: "SIH 2025 Repository", icon: Database, roles: ["student", "faculty", "mentor", "admin"] },
      { to: "/proposal", label: "Proposal Submission", icon: FileText, roles: ["student"] },
    ],
  },
  {
    group: "AI Modules",
    items: [
      { to: "/analyzer", label: "Proposal Analyzer", icon: Sparkles, roles: ["student", "faculty", "mentor", "admin"] },
      { to: "/similarity", label: "Similarity Detection", icon: GitCompareArrows, roles: ["student", "faculty", "mentor", "admin"] },
      { to: "/recommendations", label: "AI Recommendations", icon: Bot, roles: ["student", "mentor"] },
    ],
  },
  {
    group: "Evaluation",
    items: [
      { to: "/submissions", label: "Submissions", icon: ClipboardList, roles: ["faculty", "mentor", "admin"] },
      { to: "/faculty-review", label: "Faculty Review", icon: CheckCircle2, roles: ["faculty", "mentor", "admin"] },
      { to: "/shortlist", label: "Shortlist", icon: ListChecks, roles: ["faculty", "admin", "student"] },
      { to: "/presentation", label: "Presentation", icon: CalendarClock, roles: ["faculty", "admin", "student"] },
      { to: "/results", label: "Results", icon: Trophy, roles: ["student", "faculty", "mentor", "admin"] },
    ],
  },
  {
    group: "Admin Portal",
    items: [
      { to: "/approvals", label: "Account Approvals", icon: BadgeCheck, roles: ["faculty", "admin"] },
      { to: "/admin", label: "Admin Dashboard", icon: ShieldCheck, roles: ["admin"] },
      { to: "/admin/students", label: "Manage Students", icon: Users, roles: ["admin"] },
    ],
  },
  {
    group: "Institution",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["faculty", "admin", "mentor"] },
      { to: "/announcements", label: "Announcements", icon: Megaphone, roles: ["student", "faculty", "mentor", "admin"] },
      { to: "/deadlines", label: "Deadlines", icon: CalendarClock, roles: ["student", "faculty", "mentor", "admin"] },
      { to: "/settings", label: "Settings", icon: Settings, roles: ["student", "faculty", "mentor", "admin"] },
    ],
  },
];

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  faculty: "Faculty",
  mentor: "Mentor",
  admin: "Admin",
};

function useGlobalSearch(query: string) {
  const { teams, announcements } = useStore();
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: { type: string; title: string; sub: string; to: string }[] = [];

    teams.forEach((t) => {
      if (
        t.name.toLowerCase().includes(q) ||
        t.leader.toLowerCase().includes(q) ||
        t.regId.toLowerCase().includes(q) ||
        t.members.some((m) => m.name.toLowerCase().includes(q))
      ) {
        out.push({ type: "Team", title: t.name, sub: `${t.regId} · ${t.campus}`, to: "/faculty-review" });
      }
      if (t.proposal && t.proposal.title.toLowerCase().includes(q)) {
        out.push({ type: "Proposal", title: t.proposal.title, sub: `by ${t.name}`, to: "/faculty-review" });
      }
    });

    PROBLEMS.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.theme.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        out.push({ type: "Problem", title: `${p.id} — ${p.title}`, sub: p.theme, to: "/problems" });
      }
    });

    announcements.forEach((a) => {
      if (a.title.toLowerCase().includes(q)) out.push({ type: "Announcement", title: a.title, sub: "Announcement", to: "/announcements" });
    });

    Object.entries(DEMO_USERS).forEach(([role, u]) => {
      if (u.name.toLowerCase().includes(q)) out.push({ type: "User", title: u.name, sub: `${ROLE_LABEL[role as Role]} · ${u.email}`, to: "/settings" });
    });

    return out.slice(0, 12);
  }, [query, teams, announcements]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role: storeRole, setRole, notifications, markAllRead, currentTeam, resultsPublished } = useStore();
  const session = useSession();
  const role = (session.role ?? storeRole) as Role;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const results = useGlobalSearch(query);
  const demoUser = DEMO_USERS[role];
  const user = {
    ...demoUser,
    name: session.name || demoUser.name,
    initials: session.name ? session.initials : demoUser.initials,
    email: session.email || demoUser.email,
  };
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (session.role && session.role !== storeRole) setRole(session.role as Role);
  }, [session.role, storeRole, setRole]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const groups = NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter(
    (g) => g.items.length,
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl brand-gradient font-display text-sm font-bold text-primary-foreground">
          JGI
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-tight">JGI-SIH Portal</p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">JSPM Group Internal SIH</p>
        </div>
        <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>

      <nav className="scrollbar-slim flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {g.group}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
                      <span className="truncate">{item.label}</span>
                      {item.to === "/results" && resultsPublished ? (
                        <span className="ml-auto size-1.5 rounded-full bg-success" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-sidebar-accent/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Event</p>
          <p className="mt-0.5 font-display text-sm font-semibold">Internal SIH 2026</p>
          <p className="mt-1 text-[11px] text-sidebar-foreground/60">
            {currentTeam ? `${currentTeam.name} · ${currentTeam.regId}` : "No team linked"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[272px]">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>

            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search teams, problems, proposals, users…"
                aria-label="Global search"
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {searchOpen && query.trim().length >= 2 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSearchOpen(false)} />
                  <div className="absolute left-0 right-0 top-11 z-20 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-pop">
                    {results.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No results for “{query}”
                      </p>
                    ) : (
                      results.map((r, i) => (
                        <Link
                          key={`${r.title}-${i}`}
                          to={r.to}
                          onClick={() => {
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="flex items-start gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
                        >
                          <span className="mt-0.5 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {r.type}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{r.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold">
                <Building2 className="size-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">{ROLE_LABEL[role]}</span>
                <span className="sm:hidden">{ROLE_LABEL[role].slice(0, 3)}</span>
              </span>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative rounded-lg p-2 transition-colors hover:bg-accent" aria-label="Notifications">
                    <Bell className="size-4.5" />
                    {unread > 0 && (
                      <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[340px] p-0">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="font-display text-sm font-semibold">Notifications</p>
                    <button onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="scrollbar-slim max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={cn("border-b border-border px-4 py-3 last:border-0", !n.read && "bg-primary-soft/40")}>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {new Date(n.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border p-2">
                    <Link to="/announcements" className="block rounded-md px-3 py-2 text-center text-xs font-medium text-primary hover:bg-accent">
                      View all announcements
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-accent">
                    <span className="flex size-8 items-center justify-center rounded-full brand-gradient text-xs font-bold text-primary-foreground">
                      {user.initials}
                    </span>
                    <span className="hidden text-left md:block">
                      <span className="block text-xs font-semibold leading-tight">{user.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{ROLE_LABEL[role]}</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.title}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings &amp; demo controls</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/announcements">Notification centre</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void signOutEverywhere()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          JSPM Group Internal SIH Portal (JGI-SIH) · Prototype with demo data · Final selection is made by the faculty
          panel in the offline presentation round.
        </footer>
      </div>

      <AiAssistant />
    </div>
  );
}
