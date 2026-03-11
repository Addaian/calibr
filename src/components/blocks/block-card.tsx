"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Pencil, Trash2, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ExperienceBlock, BlockType } from "@/types/blocks";

const typeLabels: Record<BlockType, string> = {
  work_experience: "Work Experience",
  project: "Project",
  education: "Education",
  volunteering: "Volunteering",
  research: "Research",
};

const typeBadgeColors: Record<BlockType, string> = {
  work_experience: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  project: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  education: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  volunteering: "bg-pink-500/10 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400",
  research: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
};

const typeBorderColors: Record<BlockType, string> = {
  work_experience: "border-t-blue-500/40",
  project: "border-t-violet-500/40",
  education: "border-t-green-500/40",
  volunteering: "border-t-pink-500/40",
  research: "border-t-cyan-500/40",
};

function formatDateRange(startDate: string | null, endDate: string | null): string | null {
  if (!startDate) return null;
  const start = new Date(startDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const end = endDate
    ? new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Present";
  return `${start} - ${end}`;
}

interface BlockCardProps {
  block: ExperienceBlock;
  onDelete?: (id: string) => void;
}

export function BlockCard({ block, onDelete }: BlockCardProps) {
  const dateRange = formatDateRange(block.start_date, block.end_date);
  const [confirming, setConfirming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (confirming) {
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  function handleTrashClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onDelete) return;
    if (confirming) {
      onDelete(block.id);
    } else {
      setConfirming(true);
    }
  }

  // ─── 3D tilt on mouse move ───────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;

      // ±8 degrees max tilt
      const rotateY = ((x - midX) / midX) * 8;
      const rotateX = ((midY - y) / midY) * 8;

      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.transform = "";
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <Card
        ref={cardRef}
        onClick={() => setDialogOpen(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`group relative cursor-pointer overflow-hidden border-t-2 ${typeBorderColors[block.type]} transition-[box-shadow] duration-200 will-change-transform hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Gloss reflection layer */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-white/5" />

        <CardHeader className="px-3 pb-0.5 pt-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Badge
                variant="secondary"
                className={`shrink-0 px-1.5 py-0 text-[10px] ${typeBadgeColors[block.type]}`}
              >
                {typeLabels[block.type]}
              </Badge>
              <CardTitle className="truncate text-sm">{block.title}</CardTitle>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {confirming && (
                <span className="animate-in fade-in text-xs font-medium text-destructive">
                  Delete?
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                asChild
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Link href={`/blocks/${block.id}/edit`}>
                  <Pencil />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant={confirming ? "destructive" : "ghost"}
                  size="icon-xs"
                  onClick={handleTrashClick}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0.5 px-3 pb-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {block.organization && (
              <span className="min-w-0 truncate font-medium">{block.organization}</span>
            )}
            {block.location && (
              <span className="inline-flex min-w-0 items-center gap-0.5">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{block.location}</span>
              </span>
            )}
            {dateRange && (
              <span className="inline-flex shrink-0 items-center gap-0.5">
                <Calendar className="size-3 shrink-0" />
                {dateRange}
              </span>
            )}
          </div>
          {block.bullet_points.length > 0 && (
            <ul className="list-inside list-disc space-y-0 text-xs text-muted-foreground">
              {block.bullet_points.slice(0, 1).map((point, i) => (
                <li key={i} className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {point}
                </li>
              ))}
            </ul>
          )}
          {block.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {block.technologies.slice(0, 5).map((tech) => (
                <Badge key={tech} variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                  {tech}
                </Badge>
              ))}
              {block.technologies.length > 5 && (
                <span className="text-[10px] text-muted-foreground">+{block.technologies.length - 5}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Expanded detail dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`shrink-0 text-xs ${typeBadgeColors[block.type]}`}
              >
                {typeLabels[block.type]}
              </Badge>
              <DialogTitle className="text-base">{block.title}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Meta row */}
            {(block.organization || block.location || dateRange) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {block.organization && (
                  <span className="font-medium text-foreground">{block.organization}</span>
                )}
                {block.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {block.location}
                  </span>
                )}
                {dateRange && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {dateRange}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {block.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{block.description}</p>
            )}

            {/* Bullet points */}
            {block.bullet_points.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key Achievements</p>
                <ul className="space-y-1.5">
                  {block.bullet_points.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {block.technologies.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {block.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs font-normal">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata (education extras) */}
            {block.metadata && Object.keys(block.metadata).length > 0 && (
              <div className="space-y-1 text-sm">
                {block.metadata.gpa != null && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">GPA:</span> {String(block.metadata.gpa)}
                  </p>
                )}
                {block.metadata.coursework != null && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Relevant Coursework:</span>{" "}
                    {String(block.metadata.coursework)}
                  </p>
                )}
                {block.metadata.research_topic != null && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Research Topic:</span>{" "}
                    {String(block.metadata.research_topic)}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/blocks/${block.id}/edit`}>
                <Pencil className="size-3.5" />
                Edit Block
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
