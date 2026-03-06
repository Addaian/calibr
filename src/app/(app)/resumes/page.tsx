"use client";

import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedResume } from "@/types/resumes";
import { FileText, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getScoreColor(score: number | null) {
  if (score === null) return "secondary";
  if (score >= 70) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

export default function ResumesPage() {
  const { data: resumes, mutate, isLoading, error } =
    useSWR<GeneratedResume[]>("/api/resumes", fetcher);

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      mutate(resumes?.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Generated Resumes</h1>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load resumes. Please try refreshing the page.
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && Array.isArray(resumes) && resumes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No generated resumes yet.</p>
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      )}

      {Array.isArray(resumes) && resumes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
                <CardTitle className="text-base">{resume.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(resume.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <div className="flex items-center gap-2">
                  {resume.fit_score !== null && (
                    <Badge variant={getScoreColor(resume.fit_score)}>
                      {resume.fit_score}% fit
                    </Badge>
                  )}
                  <Badge variant="outline">{resume.template}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {resume.selected_block_ids?.length ?? 0} blocks
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/resumes/${resume.id}/export`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Export PDF
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
