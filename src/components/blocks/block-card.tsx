"use client";

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
  skill: "Skill",
  volunteering: "Volunteering",
};

const typeBadgeColors: Record<BlockType, string> = {
  work_experience: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  education: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  skill: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  volunteering: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
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

  return (
    <Card className="group relative">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5">
            <Badge
              variant="secondary"
              className={typeBadgeColors[block.type]}
            >
              {typeLabels[block.type]}
            </Badge>
            <CardTitle className="text-base">{block.title}</CardTitle>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon-xs" asChild>
              <Link href={`/blocks/${block.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(block.id)}
              >
                <Trash2 className="text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {block.organization && (
          <p className="text-sm text-muted-foreground">{block.organization}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {block.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {block.location}
            </span>
          )}
          {dateRange && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {dateRange}
            </span>
          )}
        </div>
        {block.bullet_points.length > 0 && (
          <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
            {block.bullet_points.slice(0, 2).map((point, i) => (
              <li key={i} className="truncate">
                {point}
              </li>
            ))}
          </ul>
        )}
        {block.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {block.technologies.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs font-normal">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
