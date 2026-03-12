"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedResume } from "@/types/resumes";
import type { TailoredContent } from "@/types/resumes";
import type { ResumeProfile } from "@/components/resume/resume-pdf";
import { KeywordMatchPanel } from "@/components/resume/keyword-match-panel";
import { ResumeChat } from "@/components/resume/resume-chat";
import { FitScoreDisplay } from "@/components/tailor/fit-score-display";
import { ArrowLeft } from "lucide-react";

const ResumePreview = dynamic(
  () => import("@/components/resume/resume-preview").then((m) => m.ResumePreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 self-end">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-[900px] w-full rounded-lg" />
      </div>
    ),
  }
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ExportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sectionsParam = searchParams.get("sections");
  const sectionOrder = sectionsParam?.split(",").filter(Boolean);

  const { data: resume, isLoading: resumeLoading } = useSWR<GeneratedResume>(
    `/api/resumes/${params.id}`,
    fetcher
  );
  const { data: profile, isLoading: profileLoading } = useSWR<ResumeProfile>(
    "/api/profile",
    fetcher
  );

  const [content, setContent] = useState<TailoredContent | null>(null);

  // Use local state if set (after a chat edit), otherwise fall back to DB value
  const activeContent = content ?? resume?.tailored_content;

  if (resumeLoading || profileLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[900px] w-full" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Resume not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-header-in flex items-center gap-4">
        <Link href="/resumes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{resume.name}</h1>
      </div>

      {resume.fit_score !== null && resume.fit_analysis?.dimensions && (
        <FitScoreDisplay score={resume.fit_score} analysis={resume.fit_analysis} />
      )}

      <KeywordMatchPanel jobId={resume.job_posting_id} content={activeContent!} />

      <ResumeChat
        resumeId={params.id as string}
        onUpdate={setContent}
      />

      <ResumePreview
        content={activeContent!}
        profile={profile}
        filename={resume.name || "resume"}
        resumeId={params.id as string}
        sectionOrder={sectionOrder?.length ? sectionOrder : undefined}
      />
    </div>
  );
}
