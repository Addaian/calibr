"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Check, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { matchKeywords } from "@/lib/keyword-match";
import type { TailoredContent } from "@/types/resumes";
import type { JobPosting } from "@/types/jobs";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface KeywordMatchPanelProps {
  jobId: string | null;
  content: TailoredContent | null | undefined;
}

export function KeywordMatchPanel({ jobId, content }: KeywordMatchPanelProps) {
  const [open, setOpen] = useState(true);
  const { data: job, isLoading } = useSWR<JobPosting>(
    jobId ? `/api/jobs/${jobId}` : null,
    fetcher
  );

  const { results, matchPercentage } = useMemo(() => {
    if (!job || !content) return { results: [], matchPercentage: 0 };
    return matchKeywords(job, content);
  }, [job, content]);

  // Don't render if no job linked
  if (!jobId) return null;
  if (isLoading) return null;
  if (!job) return null;
  if (results.length === 0) return null;

  const progressIndicatorClass =
    matchPercentage >= 70
      ? "[&_[data-slot=progress-indicator]]:bg-green-500"
      : matchPercentage >= 50
      ? "[&_[data-slot=progress-indicator]]:bg-yellow-500"
      : "[&_[data-slot=progress-indicator]]:bg-red-500";

  const sourceLabel: Record<string, string> = {
    required: "Required",
    preferred: "Preferred",
    general: "Keywords",
  };

  const grouped = {
    required: results.filter((r) => r.source === "required"),
    preferred: results.filter((r) => r.source === "preferred"),
    general: results.filter((r) => r.source === "general"),
  };

  const missingRequired = grouped.required.filter((r) => !r.found);
  const requiredMatched = grouped.required.filter((r) => r.found).length;
  const requiredTotal = grouped.required.length;

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ATS Keyword Match</CardTitle>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-semibold ${
                matchPercentage >= 70
                  ? "text-green-600 dark:text-green-400"
                  : matchPercentage >= 50
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {matchPercentage}%
            </span>
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="pt-1">
          <Progress
            value={matchPercentage}
            className={`h-1.5 ${progressIndicatorClass}`}
          />
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          {/* Warning banner for missing required keywords */}
          {missingRequired.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800/50 dark:bg-red-950/40">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Missing {missingRequired.length} required keyword{missingRequired.length > 1 ? "s" : ""} — ATS may filter this resume
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingRequired.map((r) => (
                    <button
                      key={r.keyword}
                      onClick={() => navigator.clipboard.writeText(r.keyword)}
                      title="Click to copy"
                      className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-xs text-red-700 hover:bg-red-200 dark:border-red-700 dark:bg-red-900/60 dark:text-red-300 dark:hover:bg-red-900"
                    >
                      {r.keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Required match summary */}
          {requiredTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className={requiredMatched === requiredTotal ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                {requiredMatched}/{requiredTotal} required
              </span>
              {" "}keywords matched
            </p>
          )}

          {(["required", "preferred", "general"] as const).map((source) => {
            const group = grouped[source];
            if (group.length === 0) return null;
            return (
              <div key={source} className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {sourceLabel[source]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((r) => (
                    <span
                      key={r.keyword}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        r.found
                          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                          : source === "required"
                          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                          : "border-muted bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {r.found ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {r.keyword}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">
            {results.filter((r) => r.found).length} of {results.length} keywords found in resume
          </p>
        </CardContent>
      )}
    </Card>
  );
}
