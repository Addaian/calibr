"use client";

import Link from "next/link";
import useSWR from "swr";
import {
  Briefcase, FileText, Trophy, BarChart2,
  Clock, AlertCircle, Bell, Ghost, Star,
  ChevronRight, Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { DashboardData, ActionItem } from "@/app/api/dashboard/route";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const ACTION_META: Record<
  ActionItem["type"],
  { icon: React.ElementType; color: string; bgColor: string; actionLabel: string; href: (id: string) => string }
> = {
  deadline_overdue: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    actionLabel: "Apply now",
    href: (id) => `/jobs/${id}/tailor`,
  },
  deadline_soon: {
    icon: Clock,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    actionLabel: "Apply now",
    href: (id) => `/jobs/${id}/tailor`,
  },
  offer_pending: {
    icon: Trophy,
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-500/10",
    actionLabel: "View offer",
    href: (id) => `/jobs/${id}`,
  },
  follow_up_due: {
    icon: Bell,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    actionLabel: "View job",
    href: (id) => `/jobs/${id}`,
  },
  interview_upcoming: {
    icon: Star,
    color: "text-violet-700 dark:text-violet-400",
    bgColor: "bg-violet-500/10",
    actionLabel: "Prep resume",
    href: (id) => `/jobs/${id}/tailor`,
  },
  ghosted: {
    icon: Ghost,
    color: "text-muted-foreground",
    bgColor: "bg-muted/60",
    actionLabel: "View job",
    href: (id) => `/jobs/${id}`,
  },
  no_resume: {
    icon: FileText,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    actionLabel: "Tailor resume",
    href: (id) => `/jobs/${id}/tailor`,
  },
};

const PRIORITY_LABELS = {
  urgent: { label: "Urgent", color: "text-red-600 dark:text-red-400" },
  high:   { label: "Needs attention", color: "text-amber-700 dark:text-amber-400" },
  medium: { label: "Suggested", color: "text-blue-700 dark:text-blue-400" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────

function ActionCard({ action }: { action: ActionItem }) {
  const meta = ACTION_META[action.type];
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.bgColor}`}>
        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {action.company ?? action.job_title}
          {action.company && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {action.job_title}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{action.message}</p>
      </div>
      <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" asChild>
        <Link href={meta.href(action.job_id)}>
          {meta.actionLabel}
          <ChevronRight className="ml-0.5 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}

// ─── Priority Section ─────────────────────────────────────────────────────────

function ActionSection({
  priority,
  actions,
}: {
  priority: ActionItem["priority"];
  actions: ActionItem[];
}) {
  if (actions.length === 0) return null;
  const { label, color } = PRIORITY_LABELS[priority];

  return (
    <div className="space-y-2">
      <p className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{label}</p>
      <div className="space-y-1.5">
        {actions.map((a, i) => (
          <ActionCard key={`${a.job_id}-${a.type}-${i}`} action={a} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, error } = useSWR<DashboardData>("/api/dashboard", fetcher);

  const urgent = data?.actions.filter((a) => a.priority === "urgent") ?? [];
  const high   = data?.actions.filter((a) => a.priority === "high") ?? [];
  const medium = data?.actions.filter((a) => a.priority === "medium") ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{greeting()}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Briefcase} label="Total jobs"       value={data.stats.total_jobs} />
          <StatCard icon={BarChart2} label="Active pipeline"  value={data.stats.active_applications} />
          <StatCard icon={Trophy}    label="Offers"           value={data.stats.offers} />
          <StatCard
            icon={Sparkles}
            label="Avg fit score"
            value={data.stats.avg_fit_score !== null ? `${data.stats.avg_fit_score}%` : "—"}
          />
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">Failed to load dashboard. Please refresh.</p>
      )}

      {/* Actions */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : data && data.actions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">You&apos;re all caught up!</p>
          <p className="text-xs text-muted-foreground">
            Add jobs and tailor resumes to see action items here.
          </p>
          <Button asChild size="sm" className="mt-1">
            <Link href="/jobs">View jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ActionSection priority="urgent" actions={urgent} />
          <ActionSection priority="high"   actions={high} />
          <ActionSection priority="medium" actions={medium} />
        </div>
      )}
    </div>
  );
}
