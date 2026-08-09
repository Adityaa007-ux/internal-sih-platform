import { cn } from "@/lib/utils";
import { STAGES, type SimilarityRisk, type Team, type TeamStage } from "@/lib/demo-data";
import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        {Icon ? (
          <span className="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary sm:flex">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const toneCls: Record<string, string> = {
    default: "bg-primary-soft text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/18 text-warning-foreground",
    danger: "bg-destructive/12 text-destructive",
    info: "bg-info/12 text-info",
  };
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneCls[tone])}>
            <Icon className="size-4.5" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

const statusTones: Record<string, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-info/12 text-info",
  "Under AI Analysis": "bg-primary-soft text-primary",
  "Under Faculty Review": "bg-warning/20 text-warning-foreground",
  Shortlisted: "bg-success/14 text-success",
  Presentation: "bg-accent text-accent-foreground",
  Selected: "bg-success/16 text-success",
  "Not Selected": "bg-destructive/12 text-destructive",
  "Under Review": "bg-muted text-muted-foreground",
  "Not Shortlisted": "bg-destructive/12 text-destructive",
  Scheduled: "bg-info/12 text-info",
  Completed: "bg-success/14 text-success",
  "Not Scheduled": "bg-muted text-muted-foreground",
  Low: "bg-success/14 text-success",
  Moderate: "bg-warning/20 text-warning-foreground",
  High: "bg-destructive/12 text-destructive",
  "Potential Duplicate": "bg-destructive text-destructive-foreground",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        statusTones[status] ?? "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}

export function RiskPill({ risk }: { risk: SimilarityRisk }) {
  return <StatusPill status={risk} />;
}

export function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const tone = pct >= 80 ? "bg-success" : pct >= 60 ? "bg-primary" : pct >= 45 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-display font-semibold tabular-nums">
          {score}
          <span className="text-xs text-muted-foreground">/{max}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-700", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScoreRing({ value, label, size = 132 }: { value: number; label?: string; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const tone = value >= 80 ? "var(--success)" : value >= 60 ? "var(--primary)" : value >= 45 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular-nums">{value}</span>
        {label ? <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span> : null}
      </div>
    </div>
  );
}

export function StagePipeline({ current, compact = false }: { current: TeamStage; compact?: boolean }) {
  const idx = STAGES.indexOf(current);
  return (
    <ol className={cn("grid gap-2", compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8")}>
      {STAGES.map((stage, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={stage} className="relative">
            <div
              className={cn(
                "h-1.5 w-full rounded-full",
                done ? "bg-primary" : active ? "brand-gradient" : "bg-muted",
              )}
            />
            <div className="mt-2 flex items-start gap-1.5">
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-2.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  active ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {stage}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function AiProcessing({
  steps,
  activeIndex,
  title,
}: {
  steps: { label: string }[];
  activeIndex: number;
  title: string;
}) {
  const pct = Math.round(((activeIndex + 1) / steps.length) * 100);
  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 items-center justify-center rounded-xl brand-gradient text-primary-foreground">
          <span className="absolute inset-0 animate-ping rounded-xl bg-primary/30" />
          <svg viewBox="0 0 24 24" className="size-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.2-8.6" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="font-display font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Demo AI engine running locally — no data leaves this browser.</p>
        </div>
        <span className="ml-auto font-display text-xl font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full brand-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <li
            key={s.label}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              i < activeIndex ? "text-muted-foreground" : i === activeIndex ? "font-medium text-foreground" : "text-muted-foreground/50",
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full text-[9px]",
                i < activeIndex ? "bg-success text-success-foreground" : i === activeIndex ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {i < activeIndex ? <Check className="size-2.5" /> : i === activeIndex ? "•" : ""}
            </span>
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground",
        className,
      )}
    >
      Demo data
    </span>
  );
}

export function teamProgressLabel(team: Team): string {
  if (team.presentation?.finalResult) return team.presentation.finalResult;
  return team.stage;
}
