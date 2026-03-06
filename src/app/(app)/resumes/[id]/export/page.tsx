"use client";

import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedResume } from "@/types/resumes";
import { ArrowLeft, Download, FileText } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ExportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sectionsParam = searchParams.get("sections");

  const { data: resume, isLoading } = useSWR<GeneratedResume>(
    `/api/resumes/${params.id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full max-w-md" />
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

  const downloadUrl = sectionsParam
    ? `/api/resumes/${params.id}/docx?sections=${sectionsParam}`
    : `/api/resumes/${params.id}/docx`;

  const blockCount = resume.tailored_content?.blocks?.length ?? 0;

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

      <div className="max-w-md rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">{resume.name}</p>
            <p className="text-sm text-muted-foreground">
              {blockCount} section{blockCount !== 1 ? "s" : ""} · Garamond · DOCX
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Formatted in the Garamond finance style — single page, tight spacing, tab-aligned dates.
          Opens directly in Word or Google Docs.
        </p>

        <Button asChild className="w-full">
          <a href={downloadUrl} download>
            <Download className="mr-2 h-4 w-4" />
            Download .docx
          </a>
        </Button>
      </div>
    </div>
  );
}
