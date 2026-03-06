"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GeneratedResume } from "@/types/resumes";
import { FileText, Trash2, Upload, Sparkles } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getScoreColor(score: number | null) {
  if (score === null) return "secondary";
  if (score >= 70) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

type Filter = "all" | "uploaded" | "generated";

export default function ResumesPage() {
  const [filter, setFilter] = useState<Filter>("all");
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

  const allResumes = Array.isArray(resumes) ? resumes : [];
  const filtered = filter === "all"
    ? allResumes
    : allResumes.filter((r) => r.source === filter);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Resumes</h1>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load resumes. Please try refreshing the page.
        </div>
      )}

      {!isLoading && allResumes.length > 0 && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({allResumes.length})</TabsTrigger>
            <TabsTrigger value="uploaded">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Uploaded ({allResumes.filter((r) => r.source === "uploaded").length})
            </TabsTrigger>
            <TabsTrigger value="generated">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Generated ({allResumes.filter((r) => r.source === "generated").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {filter === "uploaded"
              ? "No uploaded resumes yet."
              : filter === "generated"
              ? "No AI-generated resumes yet."
              : "No resumes yet."}
          </p>
          {filter !== "uploaded" && (
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          )}
          {filter !== "generated" && (
            <Link href="/blocks/import">
              <Button variant="outline">Import from Resume</Button>
            </Link>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resume) => (
            <Card key={resume.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="text-base truncate">{resume.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {resume.source === "uploaded" ? (
                      <><Upload className="mr-1 h-3 w-3" />Uploaded</>
                    ) : (
                      <><Sparkles className="mr-1 h-3 w-3" />AI Generated</>
                    )}
                  </Badge>
                </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  {resume.fit_score !== null && (
                    <Badge variant={getScoreColor(resume.fit_score)}>
                      {resume.fit_score}% fit
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {resume.selected_block_ids?.length ?? 0} blocks
                  </span>
                </div>
                {resume.source === "generated" && (
                  <div className="flex gap-2">
                    <Link href={`/resumes/${resume.id}/export`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Export PDF
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
