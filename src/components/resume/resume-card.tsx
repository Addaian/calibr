"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Trash2, Upload, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GeneratedResume, TailoredBlock } from "@/types/resumes";
import type { ResumeProfile } from "@/components/resume/resume-pdf";

// Lazy-load the real PDF viewer only when the dialog opens
const ResumePdfDialog = dynamic(
  () => import("./resume-pdf-dialog").then((m) => m.ResumePdfDialog),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Rendering preview…
      </div>
    ),
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fitPillClass(score: number | null) {
  if (score === null) return "bg-zinc-500/8 text-zinc-500 dark:bg-zinc-500/15 dark:text-zinc-400";
  if (score >= 70) return "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  return "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400";
}

// ─── Mini resume preview (HTML, no PDF overhead) ─────────────────────────────

function MiniResumePreview({
  resume,
  profile,
}: {
  resume: GeneratedResume;
  profile?: ResumeProfile;
}) {
  const blocks: TailoredBlock[] = resume.tailored_content?.blocks ?? [];

  const contactParts = [
    profile?.phone,
    profile?.email,
    profile?.location,
  ].filter(Boolean) as string[];

  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 7.5,
        lineHeight: 1.25,
        color: "#000",
        padding: "10px 12px",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Name */}
      {profile?.full_name && (
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 13, marginBottom: 1 }}>
          {profile.full_name}
        </div>
      )}
      {/* Contact */}
      {contactParts.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 4, color: "#333" }}>
          {contactParts.join(" | ")}
        </div>
      )}

      {/* Blocks — show first 4 */}
      {blocks.slice(0, 4).map((block, i) => {
        const isSkill = block.type === "skill";
        const isEdu = block.type === "education";
        const dateRange = block.start_date
          ? `${formatDate(block.start_date)} – ${block.end_date ? formatDate(block.end_date) : "Present"}`
          : null;
        const right = [block.location, dateRange].filter(Boolean).join(" | ");

        return (
          <div key={i} style={{ marginTop: i === 0 ? 4 : 3 }}>
            {isSkill ? (
              <div>
                <strong>{block.title}: </strong>
                {block.bullet_points.join(", ")}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                  <div style={{ flexShrink: 1, minWidth: 0 }}>
                    <strong>{block.organization ?? ""}</strong>
                    {!isEdu && block.title && (
                      <span>
                        <strong>{", "}</strong>
                        <em>{block.title}</em>
                      </span>
                    )}
                  </div>
                  {right && (
                    <strong style={{ flexShrink: 0, marginLeft: 4, whiteSpace: "nowrap" }}>
                      {right}
                    </strong>
                  )}
                </div>
                {isEdu && block.title && <div><em>{block.title}</em></div>}
                {block.bullet_points.slice(0, 2).map((bp, j) => (
                  <div key={j} style={{ display: "flex", paddingLeft: 8, marginTop: 1 }}>
                    <span style={{ width: 7, flexShrink: 0 }}>•</span>
                    <span style={{ flex: 1 }}>{bp}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}

      {blocks.length > 4 && (
        <div style={{ marginTop: 3, color: "#888", textAlign: "center" }}>
          +{blocks.length - 4} more sections
        </div>
      )}
    </div>
  );
}

// ─── Resume Card ─────────────────────────────────────────────────────────────

interface ResumeCardProps {
  resume: GeneratedResume;
  profile?: ResumeProfile;
  onDelete: (id: string) => void;
}

export function ResumeCard({ resume, profile, onDelete }: ResumeCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group relative flex cursor-pointer flex-col rounded-xl border bg-card transition-colors hover:border-primary/60 hover:bg-muted/30"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 p-3 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-semibold">{resume.name}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                {resume.source === "uploaded" ? (
                  <><Upload className="mr-1 h-3 w-3" />Uploaded</>
                ) : (
                  <><Sparkles className="mr-1 h-3 w-3" />AI Generated</>
                )}
              </Badge>
              {resume.fit_score !== null && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${fitPillClass(resume.fit_score)}`}>
                  {resume.fit_score}% fit
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mini preview */}
        <div className="mx-3 mb-3 rounded border bg-white overflow-hidden">
          <MiniResumePreview resume={resume} profile={profile} />
        </div>

        {/* Export button */}
        {resume.source === "generated" && (
          <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
            <Link href={`/resumes/${resume.id}/export`} className="block">
              <Button variant="outline" size="sm" className="w-full">
                Export
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Enlarged PDF preview dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle>{resume.name}</DialogTitle>
          </DialogHeader>
          <div style={{ height: 680 }}>
            {open && (
              <ResumePdfDialog
                content={resume.tailored_content}
                profile={profile}
                resumeId={resume.id}
                filename={resume.name || "resume"}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
