"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TailoringPreview } from "@/components/tailor/tailoring-preview";
import type { GeneratedResume } from "@/types/resumes";
import { ArrowLeft, Download } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ExportPage() {
  const params = useParams();
  const { data: resume, isLoading } = useSWR<GeneratedResume>(
    `/api/resumes/${params.id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
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

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/resumes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{resume.name}</h1>
        </div>
        <Button onClick={handlePrint} className="print:hidden">
          <Download className="mr-2 h-4 w-4" />
          Save as PDF
        </Button>
      </div>

      <p className="text-sm text-muted-foreground print:hidden">
        Click &quot;Save as PDF&quot; or use your browser&apos;s print dialog
        (Ctrl/Cmd+P) and select &quot;Save as PDF&quot; to download.
      </p>

      <TailoringPreview content={resume.tailored_content} />
    </div>
  );
}
