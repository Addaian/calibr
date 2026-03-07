"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, Building2, MapPin, Trash2, ArrowUpDown, Calendar, AlignJustify, List } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusSwitcher } from "@/components/jobs/status-switcher";
import type { JobPosting } from "@/types/jobs";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load jobs");
    return res.json();
  });

type SortKey = "status_date" | "status" | "location" | "company" | "title";

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  applied: 1,
  interview: 2,
  offer: 3,
  rejected: 4,
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "status_date", label: "Date" },
  { value: "status", label: "Status" },
  { value: "location", label: "City" },
  { value: "company", label: "Company" },
  { value: "title", label: "Role" },
];

function sortJobs(jobs: JobPosting[], key: SortKey): JobPosting[] {
  return [...jobs].sort((a, b) => {
    if (key === "status_date") {
      const da = a.status_date ?? "";
      const db = b.status_date ?? "";
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.localeCompare(da);
    }
    if (key === "status") {
      return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    }
    const av = (a[key] ?? "").toLowerCase();
    const bv = (b[key] ?? "").toLowerCase();
    return av.localeCompare(bv);
  });
}

function formatStatusDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function JobsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("status_date");
  const [compact, setCompact] = useState(false);
  const { data, error, isLoading, mutate } = useSWR<JobPosting[]>("/api/jobs", fetcher);

  const sorted = useMemo(() => sortJobs(data ?? [], sortKey), [data, sortKey]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate((jobs) => jobs?.filter((j) => j.id !== id), false);
      toast.success("Job posting deleted");
    } catch {
      toast.error("Failed to delete job posting");
    }
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? "Sort";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="size-4" />
            Add Job
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort: {sortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              {SORT_OPTIONS.map((o) => (
                <DropdownMenuRadioItem key={o.value} value={o.value}>
                  {o.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center rounded-md border p-0.5">
          <Button
            variant={!compact ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setCompact(false)}
            title="Normal"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={compact ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setCompact(true)}
            title="Compact"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

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
              <Skeleton className="h-7 w-14 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load job postings. Please try again.
        </div>
      )}

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

      {sorted.length > 0 && (
        <div className="rounded-lg border">
          {/* Header */}
          <div className={`hidden grid-cols-[160px_1fr_140px_140px_120px_80px] gap-4 border-b bg-muted/50 px-4 text-xs font-medium text-muted-foreground sm:grid ${compact ? "py-1.5" : "py-2"}`}>
            <span>Status</span>
            <span>Role</span>
            <span>Company</span>
            <span>Location</span>
            <span>Date</span>
            <span />
          </div>

          <div className="divide-y">
            {sorted.map((job) => {
              const dateLabel = formatStatusDate(job.status_date);
              return (
                <div
                  key={job.id}
                  className={`grid grid-cols-1 gap-2 px-4 sm:grid-cols-[160px_1fr_140px_140px_120px_80px] sm:items-center sm:gap-4 ${compact ? "py-1.5" : "py-3"}`}
                >
                  {/* Status */}
                  <div>
                    <StatusSwitcher
                      jobId={job.id}
                      status={job.status}
                      statusDate={job.status_date}
                      onUpdate={(s, d) =>
                        mutate(
                          (jobs) =>
                            jobs?.map((j) =>
                              j.id === job.id ? { ...j, status: s, status_date: d } : j
                            ),
                          false
                        )
                      }
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {job.title}
                    </Link>
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {job.company ? (
                      <>
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{job.company}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {job.location ? (
                      <>
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {dateLabel ? (
                      <>
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{dateLabel}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/jobs/${job.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
