"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Pencil, Trash2, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (confirming) {
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  function handleTrashClick() {
    if (!onDelete) return;
    if (confirming) {
      onDelete(block.id);
    } else {
      setConfirming(true);
    }
  }

  return (
    <Card className="group relative overflow-hidden">
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
            <Button variant="ghost" size="icon-xs" asChild>
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
  );
}
