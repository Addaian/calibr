"use client";

import { useEffect, useState } from "react";
import type { FitAnalysis, FitScoreDimension } from "@/types/resumes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";
import {
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Code2,
  Briefcase,
  GraduationCap,
  Search,
  Sparkles,
} from "lucide-react";

interface FitScoreDisplayProps {
  score: number;
  analysis: FitAnalysis;
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreRingColor(score: number) {
  if (score >= 70) return "stroke-green-500";
  if (score >= 50) return "stroke-yellow-500";
  return "stroke-red-500";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Exceptional Fit";
  if (score >= 70) return "Strong Fit";
  if (score >= 50) return "Moderate Fit";
  if (score >= 30) return "Weak Fit";
  return "Poor Fit";
}

function getDimensionBarColor(pct: number) {
  if (pct >= 70) return "[&_[data-slot=progress-indicator]]:bg-green-500";
  if (pct >= 50) return "[&_[data-slot=progress-indicator]]:bg-yellow-500";
  return "[&_[data-slot=progress-indicator]]:bg-red-500";
}

const dimensionIcons: Record<string, React.ReactNode> = {
  "Skills Match": <Code2 className="size-4 shrink-0 text-muted-foreground" />,
  "Experience Relevance": <Briefcase className="size-4 shrink-0 text-muted-foreground" />,
  "Education Fit": <GraduationCap className="size-4 shrink-0 text-muted-foreground" />,
  "Keyword Coverage": <Search className="size-4 shrink-0 text-muted-foreground" />,
  "Overall Impression": <Sparkles className="size-4 shrink-0 text-muted-foreground" />,
};

function DimensionRow({ dim }: { dim: FitScoreDimension }) {
  const pct = Math.round((dim.score / dim.maxScore) * 100);
  return (
    <div className="flex items-center gap-3">
      {dimensionIcons[dim.label] ?? <Sparkles className="size-4 shrink-0 text-muted-foreground" />}
      <span className="w-40 shrink-0 text-sm">{dim.label}</span>
      <Progress
        value={pct}
        className={cn("h-2 flex-1", getDimensionBarColor(pct))}
      />
      <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        {dim.score}/{dim.maxScore}
      </span>
      <Badge
        variant="outline"
        className="w-10 shrink-0 justify-center text-xs"
      >
        {dim.source === "ai" ? "AI" : "ATS"}
      </Badge>
    </div>
  );
}

export function FitScoreDisplay({ score, analysis }: FitScoreDisplayProps) {
  const circumference = 2 * Math.PI * 45;
  const targetOffset = circumference - (score / 100) * circumference;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay to ensure CSS transition triggers from full offset → target
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Ring + label */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={mounted ? targetOffset : circumference}
                  className={cn("transition-all duration-1000 ease-out", getScoreRingColor(score))}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedNumber value={score} duration={1000} className={cn("text-3xl font-bold", getScoreColor(score))} />
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {getScoreLabel(score)}
            </Badge>
          </div>

          {/* Dimension breakdown */}
          {analysis.dimensions?.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              {analysis.dimensions.map((dim) => (
                <DimensionRow key={dim.label} dim={dim} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Qualitative grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <ScrollReveal><Card className="hover-lift border-l-4 border-l-green-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <ThumbsUp className="h-4 w-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.pros.map((pro, i) => (
                <li key={i} className="text-sm">
                  {pro}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card></ScrollReveal>

        <ScrollReveal delay={100}><Card className="hover-lift border-l-4 border-l-red-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <ThumbsDown className="h-4 w-4" />
              Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.cons.map((con, i) => (
                <li key={i} className="text-sm">
                  {con}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card></ScrollReveal>

        <ScrollReveal delay={200}><Card className="hover-lift border-l-4 border-l-blue-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.suggestions.map((s, i) => (
                <li key={i} className="text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card></ScrollReveal>
      </div>
    </div>
  );
}
