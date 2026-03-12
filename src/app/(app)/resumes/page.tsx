"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { GeneratedResume } from "@/types/resumes";
import type { CoverLetter } from "@/types/cover-letters";
import type { ResumeProfile } from "@/components/resume/resume-pdf";
import { ResumeCard } from "@/components/resume/resume-card";
import { FileText, Mail, Copy, Download, FileDown, Upload, Sparkles } from "lucide-react";
import { downloadAsPdf, downloadAsDocx } from "@/lib/cover-letter-download";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobPosting } from "@/types/jobs";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getScoreColor(score: number | null) {
  if (score === null) return "secondary";
  if (score >= 70) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

type ResumeFilter = "all" | "uploaded" | "generated";

interface CoverLetterWithJob extends CoverLetter {
  job_postings: { title: string; company: string | null } | null;
}

function toneLabel(tone: string) {
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}

export default function ResumesPage() {
  const [resumeFilter, setResumeFilter] = useState<ResumeFilter>("all");
  const [jobFilter, setJobFilter] = useState<string | null>(null);
  const { data: jobs } = useSWR<JobPosting[]>("/api/jobs", fetcher);
  const resumesUrl = jobFilter ? `/api/resumes?job_id=${jobFilter}` : "/api/resumes";
  const clUrl = jobFilter ? `/api/cover-letters?job_id=${jobFilter}` : "/api/cover-letters";
  const { data: resumes, mutate: mutateResumes, isLoading: resumesLoading, error: resumesError } =
    useSWR<GeneratedResume[]>(resumesUrl, fetcher);
  const { data: coverLetters, isLoading: clLoading, error: clError } =
    useSWR<CoverLetterWithJob[]>(clUrl, fetcher);
  const { data: profile } = useSWR<ResumeProfile>("/api/profile", fetcher);

  async function handleDeleteResume(id: string) {
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      mutateResumes(resumes?.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    }
  }

  async function handleCopyCoverLetter(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  const allResumes = Array.isArray(resumes) ? resumes : [];
  const filtered = resumeFilter === "all"
    ? allResumes
    : allResumes.filter((r) => r.source === resumeFilter);

  const allCoverLetters = Array.isArray(coverLetters) ? coverLetters : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="animate-header-in">
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your generated resumes and cover letters.</p>
      </div>
      <Tabs defaultValue="resumes">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="resumes">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Resumes
            </TabsTrigger>
            <TabsTrigger value="cover-letters">
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Cover Letters
            </TabsTrigger>
          </TabsList>
          {Array.isArray(jobs) && jobs.length > 0 && (
            <Select
              value={jobFilter ?? "all"}
              onValueChange={(v) => setJobFilter(v === "all" ? null : v)}
            >
              <SelectTrigger className="h-8 w-56 text-sm">
                <SelectValue placeholder="All jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}{job.company ? ` — ${job.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* ── Resumes Tab ── */}
        <TabsContent value="resumes" className="mt-6 space-y-6">
          <h1 className="text-2xl font-bold">Resumes</h1>

          {resumesError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Failed to load resumes. Please try refreshing the page.
            </div>
          )}

          {!resumesLoading && allResumes.length > 0 && (
            <Tabs value={resumeFilter} onValueChange={(v) => setResumeFilter(v as ResumeFilter)}>
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

          {resumesLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          )}

          {!resumesLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {resumeFilter === "uploaded"
                  ? "No uploaded resumes yet."
                  : resumeFilter === "generated"
                  ? "No AI-generated resumes yet."
                  : "No resumes yet."}
              </p>
              {resumeFilter !== "uploaded" && (
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              )}
              {resumeFilter !== "generated" && (
                <Link href="/blocks/import">
                  <Button variant="outline">Import from Resume</Button>
                </Link>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  profile={profile}
                  onDelete={handleDeleteResume}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Cover Letters Tab ── */}
        <TabsContent value="cover-letters" className="mt-6 space-y-6">
          <h1 className="text-2xl font-bold">Cover Letters</h1>

          {clError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Failed to load cover letters. Please try refreshing the page.
            </div>
          )}

          {clLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52" />
              ))}
            </div>
          )}

          {!clLoading && allCoverLetters.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Mail className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No cover letters yet.</p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          )}

          {allCoverLetters.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allCoverLetters.map((cl) => {
                const jobTitle = cl.job_postings?.title ?? "Unknown Job";
                const company = cl.job_postings?.company ?? null;
                const filename = company
                  ? `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}`
                  : "cover-letter";

                return (
                  <Card key={cl.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cover Letter</span>
                      </div>
                      <CardTitle className="truncate text-base">{jobTitle}</CardTitle>
                      {company && (
                        <p className="text-sm text-muted-foreground">{company}</p>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {toneLabel(cl.tone)}
                        </Badge>
                        <p className="line-clamp-4 text-xs text-muted-foreground whitespace-pre-line">
                          {cl.content}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(cl.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleCopyCoverLetter(cl.content)}
                          >
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAsDocx(cl.content, filename)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAsPdf(cl.content, filename)}
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
