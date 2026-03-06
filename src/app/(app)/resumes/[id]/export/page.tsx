"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedResume } from "@/types/resumes";
import type { ResumeProfile } from "@/components/resume/resume-pdf";
import { ArrowLeft } from "lucide-react";
import { RESUME_STYLES, DEFAULT_STYLE_ID, type StyleId } from "@/lib/resume-styles";

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
  const searchParams = useSearchParams();
  const initialStyle = (searchParams.get("style") as StyleId) ?? DEFAULT_STYLE_ID;

  const [selectedStyle, setSelectedStyle] = useState<StyleId>(
    Object.keys(RESUME_STYLES).includes(initialStyle) ? initialStyle : DEFAULT_STYLE_ID
  );

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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/resumes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{resume.name}</h1>
      </div>

      {/* Style picker */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Resume Style</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(RESUME_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`rounded-lg border-2 p-3 text-left transition-colors ${
                selectedStyle === style.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <p className="text-sm font-semibold">{style.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <ResumePreview
        content={resume.tailored_content}
        profile={profile}
        filename={filename}
        styleId={selectedStyle}
      />
    </div>
  );
}
