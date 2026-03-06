"use client";

import Link from "next/link";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/jobs/job-card";
import type { JobPosting } from "@/types/jobs";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load jobs");
    return res.json();
  });

export default function JobsPage() {
  const { data, error, isLoading, mutate } = useSWR<JobPosting[]>(
    "/api/jobs",
    fetcher
  );

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

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((job) => (
            <JobCard key={job.id} job={job} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
