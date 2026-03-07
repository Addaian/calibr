"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockSelector } from "@/components/tailor/block-selector";
import { TailoringPreview } from "@/components/tailor/tailoring-preview";
import { FitScoreDisplay } from "@/components/tailor/fit-score-display";
import type { ExperienceBlock } from "@/types/blocks";
import type { JobPosting } from "@/types/jobs";
import type { GeneratedResume } from "@/types/resumes";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Upload, X, FileText } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TailorPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data: job } = useSWR<JobPosting>(`/api/jobs/${jobId}`, fetcher);
  const { data: blocks } = useSWR<ExperienceBlock[]>("/api/blocks", fetcher);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tailoring, setTailoring] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateText, setTemplateText] = useState<string | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [styleReason, setStyleReason] = useState<string>("");
  const [detectedSections, setDetectedSections] = useState<string[]>([]);
  const [fitScore, setFitScore] = useState<{
    score: number;
    pros: string[];
    cons: string[];
    suggestions: string[];
  } | null>(null);

  async function handleTemplateUpload(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setTemplateFile(file);
    setTemplateLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume-template", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to read resume");
      }
      const data = await res.json();
      setTemplateText(data.text);
      if (data.styleReason) setStyleReason(data.styleReason);
      if (Array.isArray(data.detectedSections) && data.detectedSections.length > 0) {
        setDetectedSections(data.detectedSections);
      }
      toast.success("Resume template loaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to read resume");
      setTemplateFile(null);
      setTemplateText(null);
    } finally {
      setTemplateLoading(false);
    }
  }

  async function handleTailor() {
    setTailoring(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_ids: selectedIds,
          job_posting_id: jobId,
          ...(templateText ? { resume_template_text: templateText } : {}),
        }),
      });

      if (!res.ok) throw new Error("Tailoring failed");

      const data = await res.json();
      setResume(data);
      setStep(1);
      toast.success("Resume tailored successfully");

      fetchFitScore();
    } catch {
      toast.error("Failed to tailor resume");
    } finally {
      setTailoring(false);
    }
  }

  async function fetchFitScore() {
    setScoringLoading(true);
    try {
      const res = await fetch("/api/fit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_ids: selectedIds,
          job_posting_id: jobId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFitScore(data);
      }
    } catch {
      // non-blocking
    } finally {
      setScoringLoading(false);
    }
  }

  if (!blocks || !job) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const steps = ["Select Blocks", "Review & Score"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Tailor Resume</h1>
          <p className="text-muted-foreground">
            for {job.title} at {job.company || "Unknown Company"}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 text-sm ${
              i === step
                ? "font-medium text-primary"
                : i < step
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
            }`}
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <BlockSelector
            blocks={blocks}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Style Template <span className="text-muted-foreground font-normal">(optional)</span></p>
            <p className="text-xs text-muted-foreground">Upload an existing resume PDF so Claude can match its font, section order, spacing, and writing style.</p>
            {!templateFile ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={templateLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload resume PDF
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {templateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm truncate max-w-[200px]">{templateFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => { setTemplateFile(null); setTemplateText(null); setStyleReason(""); setDetectedSections([]); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {styleReason && (
              <p className="text-xs text-muted-foreground">{styleReason}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTemplateUpload(f); }}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleTailor}
              disabled={selectedIds.length === 0 || tailoring || templateLoading}
            >
              {tailoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tailoring...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tailor Resume
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && resume && (
        <div className="space-y-6">
          <TailoringPreview content={resume.tailored_content} />

          {scoringLoading && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">
                Calculating fit score...
              </span>
            </div>
          )}

          {fitScore && (
            <FitScoreDisplay score={fitScore.score} analysis={fitScore} />
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/jobs/${jobId}/cover-letter`)}
              >
                Generate Cover Letter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  const qs = detectedSections.length > 0
                    ? `?sections=${detectedSections.join(",")}`
                    : "";
                  router.push(`/resumes/${resume.id}/export${qs}`);
                }}
              >
                Export Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
