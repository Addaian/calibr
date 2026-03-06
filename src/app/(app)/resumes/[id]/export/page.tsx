"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedResume } from "@/types/resumes";
import type { ResumeProfile } from "@/components/resume/resume-pdf";
import { ArrowLeft } from "lucide-react";

const ResumePreview = dynamic(
  () => import("@/components/resume/resume-preview").then((m) => m.ResumePreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4">
        <Skeleton className="ml-auto h-10 w-36" />
        <Skeleton className="h-[900px] w-full rounded-lg" />
      </div>
    ),
  }
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ExportPage() {
  const params = useParams();
  const { data: resume, isLoading: resumeLoading } = useSWR<GeneratedResume>(
    `/api/resumes/${params.id}`,
    fetcher
  );
  const { data: profile, isLoading: profileLoading } = useSWR<ResumeProfile>(
    "/api/profile",
    fetcher
  );

  const isLoading = resumeLoading || profileLoading;

  if (isLoading) {
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

  const filename = resume.name || "resume";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/resumes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{resume.name}</h1>
      </div>

      <ResumePreview
        content={resume.tailored_content}
        profile={profile}
        filename={filename}
      />
    </div>
  );
}
