"use client";

import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { FileText, Mail, Copy, Download, FileDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { GeneratedResume } from "@/types/resumes";
import type { CoverLetter } from "@/types/cover-letters";
import { downloadAsPdf, downloadAsDocx } from "@/lib/cover-letter-download";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toneLabel(tone: string) {
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}

function fitPillClass(score: number | null) {
  if (score === null) return "bg-zinc-500/8 text-zinc-500 dark:bg-zinc-500/15 dark:text-zinc-400";
  if (score >= 70) return "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  return "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400";
}

export function JobDocuments({ jobId, company }: { jobId: string; company?: string | null }) {
  const { data: resumes, isLoading: resumesLoading } = useSWR<GeneratedResume[]>(
    `/api/resumes?job_id=${jobId}`,
    fetcher
  );
  const { data: coverLetters, isLoading: clLoading } = useSWR<CoverLetter[]>(
    `/api/cover-letters?job_id=${jobId}`,
    fetcher
  );

  const hasResumes = Array.isArray(resumes) && resumes.length > 0;
  const hasCoverLetters = Array.isArray(coverLetters) && coverLetters.length > 0;
  const isEmpty = !resumesLoading && !clLoading && !hasResumes && !hasCoverLetters;

  async function handleCopy(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div className="space-y-4">
      {isEmpty && (
          <p className="text-sm text-muted-foreground">
            No documents generated for this job yet.
          </p>
        )}

        {/* Resumes */}
        {(resumesLoading || hasResumes) && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Resumes
            </p>
            {resumesLoading && !hasResumes && (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            )}
            {hasResumes && (
              <div className="divide-y rounded-md border">
                {resumes!.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{resume.name}</span>
                      {resume.fit_score !== null && (
                        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${fitPillClass(resume.fit_score)}`}>
                          {resume.fit_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(resume.created_at)}</span>
                      <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                        <Link href={`/resumes/${resume.id}/export`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hasResumes && hasCoverLetters && <Separator />}

        {/* Cover Letters */}
        {(clLoading || hasCoverLetters) && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cover Letters
            </p>
            {clLoading && !hasCoverLetters && (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            )}
            {hasCoverLetters && (
              <div className="divide-y rounded-md border">
                {coverLetters!.map((cl) => {
                  const filename = company
                    ? `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}`
                    : "cover-letter";
                  return (
                    <div key={cl.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {toneLabel(cl.tone)}
                        </Badge>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatDate(cl.created_at)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopy(cl.content)}
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => downloadAsDocx(cl.content, filename)}
                          title="Download DOCX"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => downloadAsPdf(cl.content, filename)}
                          title="Download PDF"
                        >
                          <FileDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
