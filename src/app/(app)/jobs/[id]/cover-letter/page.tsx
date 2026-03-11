"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverLetterEditor } from "@/components/cover-letter/cover-letter-editor";
import type { JobPosting } from "@/types/jobs";
import { downloadAsPdf, downloadAsDocx } from "@/lib/cover-letter-download";
import { ArrowLeft, Loader2, Sparkles, Download, FileText, FileType } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CoverLetterPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { data: job } = useSWR<JobPosting>(`/api/jobs/${jobId}`, fetcher);

  const [tone, setTone] = useState<string>("professional");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function getFilename() {
    const company = job?.company || "Company";
    return `Cover Letter - ${company}`;
  }

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      downloadAsPdf(content, getFilename());
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadDocx() {
    setDownloading(true);
    try {
      await downloadAsDocx(content, getFilename());
    } catch {
      toast.error("Failed to generate DOCX");
    } finally {
      setDownloading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_posting_id: jobId,
          tone,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();
      setContent(data.content);
      setGenerated(true);
      toast.success("Cover letter generated");
    } catch {
      toast.error("Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  }

  if (!job) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Cover Letter</h1>
          <p className="text-muted-foreground">
            for {job.title} at {job.company || "Unknown Company"}
          </p>
        </div>
      </div>

      {!generated ? (
        <div className="mx-auto max-w-md space-y-6 py-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Generate a Cover Letter</h2>
          <p className="text-muted-foreground">
            Select a tone and generate a tailored cover letter based on your
            experience blocks and this job posting.
          </p>
          <div className="mx-auto max-w-xs space-y-4">
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <CoverLetterEditor
            content={content}
            onContentChange={setContent}
          />
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setGenerated(false);
                setContent("");
              }}
            >
              Regenerate
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                Download as:
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={downloading}
                onClick={handleDownloadDocx}
              >
                <FileType className="mr-1.5 h-4 w-4" />
                DOCX
              </Button>
              <Button
                size="sm"
                disabled={downloading}
                onClick={handleDownloadPdf}
              >
                <FileText className="mr-1.5 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
