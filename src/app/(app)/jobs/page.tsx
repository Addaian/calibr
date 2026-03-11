"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
  Plus, Building2, MapPin, Trash2, Calendar, AlignJustify,
  List, LayoutGrid, GitFork, ArrowUp, ArrowDown, ChevronsUpDown,
  Clock, AlertCircle, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusSwitcher, type Status } from "@/components/jobs/status-switcher";
import { InlineText, InlineDate, InlineSource, InlinePriority } from "@/components/jobs/job-cells";

const JobKanbanBoard = dynamic(() => import("@/components/jobs/job-kanban-board").then(m => ({ default: m.JobKanbanBoard })), {
  loading: () => <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading board…</div>,
  ssr: false,
});

const JobSankeyView = dynamic(() => import("@/components/jobs/job-sankey").then(m => ({ default: m.JobSankeyView })), {
  loading: () => <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading pipeline…</div>,
  ssr: false,
});
import type { JobPosting } from "@/types/jobs";
import type { GeneratedResume } from "@/types/resumes";

// ─── Sorting ──────────────────────────────────────────────────────────────────
type SortKey =
  | "priority" | "status" | "status_date" | "follow_up_date" | "deadline"
  | "company" | "title" | "location" | "source"
  | "recruiter_name" | "salary_range" | "fit";
type SortDir = "asc" | "desc";
interface SortState { key: SortKey; dir: SortDir; }

// Columns that default to descending when first clicked
const DESC_FIRST: SortKey[] = ["status_date", "follow_up_date", "deadline", "priority", "fit"];

const STATUS_ORDER: Record<string, number> = {
  active: 0, applying: 1, applied: 2, screening: 3, interview: 4,
  assessment: 5, final_round: 6, offer: 7, negotiating: 8, accepted: 9,
  rejected: 10, withdrawn: 11, ghosted: 12, declined: 13,
};

function sortJobs(jobs: JobPosting[], sort: SortState, bestScoreByJob: Map<string, number>): JobPosting[] {
  return [...jobs].sort((a, b) => {
    let cmp = 0;

    if (sort.key === "fit") {
      const sa = bestScoreByJob.get(a.id) ?? -1;
      const sb = bestScoreByJob.get(b.id) ?? -1;
      cmp = sa - sb;
    } else if (sort.key === "priority") {
      if (a.priority === null && b.priority === null) return 0;
      if (a.priority === null) return 1;
      if (b.priority === null) return -1;
      cmp = a.priority - b.priority;
    } else if (sort.key === "status") {
      cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    } else if (sort.key === "status_date" || sort.key === "follow_up_date" || sort.key === "deadline") {
      const da = a[sort.key] ?? "";
      const db = b[sort.key] ?? "";
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      cmp = da.localeCompare(db);
    } else {
      const av = ((a as unknown as Record<string, unknown>)[sort.key] as string ?? "").toLowerCase();
      const bv = ((b as unknown as Record<string, unknown>)[sort.key] as string ?? "").toLowerCase();
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      cmp = av.localeCompare(bv);
    }

    return sort.dir === "asc" ? cmp : -cmp;
  });
}

// ─── Column header ────────────────────────────────────────────────────────────
function ColHeader({ label, col, sort, onSort }: {
  label: string; col: SortKey; sort: SortState; onSort: (k: SortKey) => void;
}) {
  const active = sort.key === col;
  return (
    <button
      onClick={() => onSort(col)}
      className={`flex items-center gap-1 whitespace-nowrap text-xs font-medium transition-colors hover:text-foreground select-none ${active ? "text-foreground" : "text-muted-foreground"}`}
    >
      {label}
      {active
        ? sort.dir === "asc"
          ? <ArrowUp className="h-3 w-3 shrink-0" />
          : <ArrowDown className="h-3 w-3 shrink-0" />
        : <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-40" />}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fetcher = (url: string) =>
  fetch(url).then(res => { if (!res.ok) throw new Error(); return res.json(); });

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

// Shared grid columns — 14 columns
// Priority | Status | Company | Role | Location | Source | Recruiter | Applied | Follow-up | Deadline | Salary | Fit | Notes | Actions
const GRID = "grid-cols-[80px_140px_110px_160px_110px_140px_110px_92px_92px_92px_100px_50px_170px_72px]";
const MIN_W = 1523;

// Row base classes — divide-x gives Excel-style column lines, [&>*] applies per-cell padding
// items-start so text stays at top when a cell expands on hover
const ROW_CELLS = "[&>*]:flex [&>*]:items-start [&>*]:px-3 [&>*:first-child]:pl-4 [&>*:last-child]:pr-3";

type ViewMode = "list" | "compact" | "kanban" | "sankey";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const [sort, setSort] = useState<SortState>({ key: "status_date", dir: "desc" });
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    const saved = localStorage.getItem("calibr:jobs-view") as ViewMode | null;
    if (saved) setViewMode(saved);
  }, []);

  const { data, error, isLoading, mutate } = useSWR<JobPosting[]>("/api/jobs", fetcher);
  const { data: resumes } = useSWR<GeneratedResume[]>("/api/resumes", fetcher);

  const bestScoreByJob = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of resumes ?? []) {
      if (r.job_posting_id && r.fit_score !== null) {
        const prev = map.get(r.job_posting_id) ?? -1;
        if (r.fit_score > prev) map.set(r.job_posting_id, r.fit_score);
      }
    }
    return map;
  }, [resumes]);

  const jobsWithResume = useMemo(() => {
    const set = new Set<string>();
    for (const r of resumes ?? []) {
      if (r.job_posting_id) set.add(r.job_posting_id);
    }
    return set;
  }, [resumes]);

  function handleViewMode(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem("calibr:jobs-view", mode);
  }

  function handleSort(key: SortKey) {
    setSort(s => ({
      key,
      dir: s.key === key
        ? (s.dir === "asc" ? "desc" : "asc")
        : DESC_FIRST.includes(key) ? "desc" : "asc",
    }));
  }

  function handleStatusChange(jobId: string, newStatus: Status, statusDate: string) {
    mutate(jobs => jobs?.map(j => j.id === jobId ? { ...j, status: newStatus, status_date: statusDate } : j), false);
    fetch(`/api/jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, status_date: statusDate }),
    });
  }

  function handleFieldUpdate(jobId: string, fields: Partial<JobPosting>) {
    mutate(jobs => jobs?.map(j => j.id === jobId ? { ...j, ...fields } : j), false);
    fetch(`/api/jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    }).catch(() => {
      toast.error("Failed to save");
      mutate();
    });
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate(jobs => jobs?.filter(j => j.id !== id), false);
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  }

  const compact = viewMode === "compact";
  const sorted = useMemo(() => sortJobs(data ?? [], sort, bestScoreByJob), [data, sort, bestScoreByJob]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="size-4" />
            Add Job
          </Link>
        </Button>
      </div>

      {/* View toggles */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border p-0.5">
          {([
            { mode: "list" as const,    icon: <List className="h-3.5 w-3.5" />,         title: "List" },
            { mode: "compact" as const, icon: <AlignJustify className="h-3.5 w-3.5" />, title: "Compact" },
            { mode: "kanban" as const,  icon: <LayoutGrid className="h-3.5 w-3.5" />,   title: "Kanban" },
            { mode: "sankey" as const,  icon: <GitFork className="h-3.5 w-3.5" />,      title: "Pipeline" },
          ] as const).map(({ mode, icon, title }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => handleViewMode(mode)}
              title={title}
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="divide-y rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="h-5 w-24 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-4 w-24 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load job postings. Please try again.
        </div>
      )}

      {/* Empty */}
      {data && data.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground">No job postings yet</p>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="size-4" />
              Add Your First Job
            </Link>
          </Button>
        </div>
      )}

      {/* Kanban */}
      {viewMode === "kanban" && data && data.length > 0 && (
        <JobKanbanBoard jobs={data} onStatusChange={handleStatusChange} />
      )}

      {/* Sankey */}
      {viewMode === "sankey" && data && (
        <JobSankeyView jobs={data} />
      )}

      {/* List / Compact */}
      {(viewMode === "list" || viewMode === "compact") && sorted.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: MIN_W }}>

              {/* Header row */}
              <div className={`grid ${GRID} ${ROW_CELLS} border-b bg-muted/50 divide-x divide-border/40 ${compact ? "[&>*]:py-1.5" : "[&>*]:py-2"}`}>
                <ColHeader label="Priority"  col="priority"       sort={sort} onSort={handleSort} />
                <ColHeader label="Status"    col="status"         sort={sort} onSort={handleSort} />
                <ColHeader label="Company"   col="company"        sort={sort} onSort={handleSort} />
                <ColHeader label="Role"      col="title"          sort={sort} onSort={handleSort} />
                <ColHeader label="Location"  col="location"       sort={sort} onSort={handleSort} />
                <ColHeader label="Source"    col="source"         sort={sort} onSort={handleSort} />
                <ColHeader label="Recruiter" col="recruiter_name" sort={sort} onSort={handleSort} />
                <ColHeader label="Applied"   col="status_date"    sort={sort} onSort={handleSort} />
                <ColHeader label="Follow-up" col="follow_up_date" sort={sort} onSort={handleSort} />
                <ColHeader label="Deadline"  col="deadline"       sort={sort} onSort={handleSort} />
                <ColHeader label="Salary"    col="salary_range"   sort={sort} onSort={handleSort} />
                <div className="flex justify-center w-full"><ColHeader label="Fit" col="fit" sort={sort} onSort={handleSort} /></div>
                <span className="text-xs font-medium text-muted-foreground">Notes</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y">
                {sorted.map(job => {
                  const fitScore = bestScoreByJob.get(job.id);
                  return (
                    <div
                      key={job.id}
                      className={`grid ${GRID} ${ROW_CELLS} divide-x divide-border/20 ${compact ? "[&>*]:py-1" : "[&>*]:py-2.5"}`}
                    >
                      {/* Priority */}
                      <div>
                        <InlinePriority
                          value={job.priority}
                          onSave={v => handleFieldUpdate(job.id, { priority: v })}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <StatusSwitcher
                          jobId={job.id}
                          status={job.status}
                          statusDate={job.status_date}
                          onUpdate={(s, d) => mutate(
                            jobs => jobs?.map(j => j.id === job.id ? { ...j, status: s, status_date: d } : j),
                            false
                          )}
                        />
                      </div>

                      {/* Company */}
                      <div className="group/cell flex gap-1 text-xs text-muted-foreground min-w-0">
                        {job.company
                          ? <><Building2 className="h-3 w-3 shrink-0 mt-0.5" /><span className="truncate group-hover/cell:whitespace-normal group-hover/cell:overflow-visible">{job.company}</span></>
                          : <span className="text-muted-foreground/30">—</span>}
                      </div>

                      {/* Role */}
                      <div className="group/cell min-w-0">
                        <Link href={`/jobs/${job.id}`} className="text-xs font-medium hover:underline truncate group-hover/cell:whitespace-normal group-hover/cell:overflow-visible w-full min-w-0">
                          {job.title}
                        </Link>
                      </div>

                      {/* Location */}
                      <div className="group/cell flex gap-1 text-xs text-muted-foreground min-w-0">
                        {job.location
                          ? <><MapPin className="h-3 w-3 shrink-0 mt-0.5" /><span className="truncate group-hover/cell:whitespace-normal group-hover/cell:overflow-visible">{job.location}</span></>
                          : <span className="text-muted-foreground/30">—</span>}
                      </div>

                      {/* Source */}
                      <div className="group/cell">
                        <InlineSource
                          value={job.source}
                          onSave={v => handleFieldUpdate(job.id, { source: v })}
                        />
                      </div>

                      {/* Recruiter */}
                      <div className="group/cell">
                        <InlineText
                          value={job.recruiter_name}
                          placeholder="—"
                          onSave={v => handleFieldUpdate(job.id, { recruiter_name: v })}
                          className="group-hover/cell:whitespace-normal group-hover/cell:overflow-visible"
                        />
                      </div>

                      {/* Applied date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {job.status_date
                          ? <><Calendar className="h-3 w-3 shrink-0" /><span>{fmtDate(job.status_date)}</span></>
                          : <span className="text-muted-foreground/30">—</span>}
                      </div>

                      {/* Follow-up */}
                      <div>
                        <InlineDate
                          value={job.follow_up_date}
                          placeholder="—"
                          onSave={v => handleFieldUpdate(job.id, { follow_up_date: v })}
                        />
                      </div>

                      {/* Deadline */}
                      {(() => {
                        const today = new Date().toISOString().split("T")[0];
                        const isOverdue = !!job.deadline &&
                          job.deadline < today &&
                          (job.status === "active" || job.status === "applying");
                        return (
                          <div className="flex items-center gap-1 min-w-0">
                            {job.deadline && (
                              isOverdue
                                ? <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                                : <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                            )}
                            <InlineDate
                              value={job.deadline}
                              placeholder="—"
                              onSave={v => handleFieldUpdate(job.id, { deadline: v })}
                              className={isOverdue ? "!text-red-600 dark:!text-red-400 font-medium" : ""}
                            />
                          </div>
                        );
                      })()}

                      {/* Salary */}
                      <div className="group/cell">
                        <InlineText
                          value={job.salary_range}
                          placeholder="—"
                          onSave={v => handleFieldUpdate(job.id, { salary_range: v })}
                          className="group-hover/cell:whitespace-normal group-hover/cell:overflow-visible"
                        />
                      </div>

                      {/* Fit / Resume indicator */}
                      <div className="justify-center">
                        {fitScore !== undefined
                          ? <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${fitScore >= 70 ? "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400" : fitScore >= 50 ? "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" : "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"}`}>{fitScore}%</span>
                          : jobsWithResume.has(job.id)
                            ? <span title="Resume exists (not yet scored)"><FileText className="h-3.5 w-3.5 text-muted-foreground" /></span>
                            : <span className="text-xs text-muted-foreground/30">—</span>}
                      </div>

                      {/* Notes */}
                      <div className="group/cell">
                        <InlineText
                          value={job.notes}
                          placeholder="Add notes…"
                          multiline
                          onSave={v => handleFieldUpdate(job.id, { notes: v })}
                          className="group-hover/cell:whitespace-normal group-hover/cell:overflow-visible"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" asChild className="h-6 px-2 text-xs">
                          <Link href={`/jobs/${job.id}`}>View</Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(job.id)}>
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
