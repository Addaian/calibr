"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, LayoutGrid, List, Building2, MapPin, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/jobs/job-card";
import type { JobPosting } from "@/types/jobs";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load jobs");
    return res.json();
  });

const statusConfig: Record<
  JobPosting["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  applied: { label: "Applied", variant: "secondary" },
  interview: { label: "Interview", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
  offer: { label: "Offer", variant: "default" },
};

export default function JobsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data, error, isLoading, mutate } = useSWR<JobPosting[]>("/api/jobs", fetcher);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      mutate((jobs) => jobs?.filter((j) => j.id !== id), false);
      toast.success("Job posting deleted");
    } catch {
      toast.error("Failed to delete job posting");
    }
  }

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

      <div className="flex items-center justify-end">
        <div className="flex items-center rounded-md border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("list")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex justify-between pt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="size-8" />
              </div>
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

      {data && data.length > 0 && view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((job) => (
            <JobCard key={job.id} job={job} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {data && data.length > 0 && view === "list" && (
        <div className="divide-y rounded-lg border">
          {data.map((job) => {
            const status = statusConfig[job.status];
            const keywordCount =
              job.keywords.length + job.required_skills.length + job.preferred_skills.length;
            return (
              <div key={job.id} className="flex items-center gap-4 px-4 py-3">
                <Badge variant={status.variant} className="w-20 shrink-0 justify-center">
                  {status.label}
                </Badge>
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${job.id}`} className="truncate text-sm font-medium hover:underline">
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {job.company && (
                      <span className="flex items-center gap-0.5">
                        <Building2 className="h-3 w-3" />{job.company}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />{job.location}
                      </span>
                    )}
                    {keywordCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Tag className="h-3 w-3" />{keywordCount} keyword{keywordCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <div className="flex shrink-0 gap-1">
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
      )}
    </div>
  );
}
