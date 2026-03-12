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
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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
  suffix,
  borderColor,
  iconBg,
  iconColor,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  index: number;
}) {
  return (
    <div
      className={`hover-lift animate-fade-up flex items-center gap-3 rounded-xl border border-t-2 ${borderColor} bg-card p-4`}
      style={{ "--stagger": index } as React.CSSProperties}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">
          {typeof value === "number" ? (
            <AnimatedNumber value={value} suffix={suffix} />
          ) : value}
        </p>
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
    <div className="hover-lift flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
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
          <div
            key={`${a.job_id}-${a.type}-${i}`}
            style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300"
          >
            <ActionCard action={a} />
          </div>
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
    <div className="mx-auto max-w-2xl lg:max-w-4xl space-y-8">
      {/* Header */}
      <div className="animate-header-in">
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
          <StatCard icon={Briefcase} label="Total jobs"       value={data.stats.total_jobs}
            borderColor="border-t-blue-500/40" iconBg="bg-blue-500/10" iconColor="text-blue-600 dark:text-blue-400" index={0} />
          <StatCard icon={BarChart2} label="Active pipeline"  value={data.stats.active_applications}
            borderColor="border-t-violet-500/40" iconBg="bg-violet-500/10" iconColor="text-violet-600 dark:text-violet-400" index={1} />
          <StatCard icon={Trophy}    label="Offers"           value={data.stats.offers}
            borderColor="border-t-amber-500/40" iconBg="bg-amber-500/10" iconColor="text-amber-600 dark:text-amber-400" index={2} />
          <StatCard
            icon={Sparkles}
            label="Avg fit score"
            value={data.stats.avg_fit_score !== null ? data.stats.avg_fit_score : "—"}
            suffix={data.stats.avg_fit_score !== null ? "%" : undefined}
            borderColor="border-t-green-500/40" iconBg="bg-green-500/10" iconColor="text-green-600 dark:text-green-400" index={3}
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
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/10 py-14">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Trophy className="h-6 w-6 text-primary/60" />
            </div>
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
          <ScrollReveal><ActionSection priority="urgent" actions={urgent} /></ScrollReveal>
          <ScrollReveal delay={100}><ActionSection priority="high"   actions={high} /></ScrollReveal>
          <ScrollReveal delay={200}><ActionSection priority="medium" actions={medium} /></ScrollReveal>
        </div>
      )}
    </div>
  );
}
