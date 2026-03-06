"use client";

import { useState } from "react";
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
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TailorPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data: job } = useSWR<JobPosting>(`/api/jobs/${jobId}`, fetcher);
  const { data: blocks } = useSWR<ExperienceBlock[]>("/api/blocks", fetcher);

  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tailoring, setTailoring] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [fitScore, setFitScore] = useState<{
    score: number;
    pros: string[];
    cons: string[];
    suggestions: string[];
  } | null>(null);

  async function handleTailor() {
    setTailoring(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_ids: selectedIds,
          job_posting_id: jobId,
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
          <div className="flex justify-end">
            <Button
              onClick={handleTailor}
              disabled={selectedIds.length === 0 || tailoring}
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
                onClick={() => router.push(`/resumes/${resume.id}/export`)}
              >
                Export PDF
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
