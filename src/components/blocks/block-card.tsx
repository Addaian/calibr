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
  work_experience: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  education: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  volunteering: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  research: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
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
    <Card className="group relative">
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {block.organization && (
            <span className="font-medium">{block.organization}</span>
          )}
          {block.location && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3" />
              {block.location}
            </span>
          )}
          {dateRange && (
            <span className="inline-flex items-center gap-0.5">
              <Calendar className="size-3" />
              {dateRange}
            </span>
          )}
        </div>
        {block.bullet_points.length > 0 && (
          <ul className="list-inside list-disc space-y-0 text-xs text-muted-foreground">
            {block.bullet_points.slice(0, 1).map((point, i) => (
              <li key={i} className="truncate">
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
