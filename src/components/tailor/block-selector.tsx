"use client";

import { useState } from "react";
import type { ExperienceBlock, BlockType } from "@/types/blocks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const typeLabels: Record<BlockType, string> = {
  work_experience: "Work",
  project: "Project",
  education: "Education",
  skill: "Skill",
  volunteering: "Volunteering",
};

const typeColors: Record<BlockType, string> = {
  work_experience: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  education: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  skill: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  volunteering: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

interface BlockSelectorProps {
  blocks: ExperienceBlock[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function BlockSelector({
  blocks,
  selectedIds,
  onSelectionChange,
}: BlockSelectorProps) {
  const [filter, setFilter] = useState<BlockType | "all">("all");

  const filtered =
    filter === "all" ? blocks : blocks.filter((b) => b.type === filter);

  function toggleBlock(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  function selectAll() {
    onSelectionChange(filtered.map((b) => b.id));
  }

  function deselectAll() {
    onSelectionChange([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {(Object.keys(typeLabels) as BlockType[]).map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {typeLabels[type]}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll}>
          Deselect All
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((block) => {
          const isSelected = selectedIds.includes(block.id);
          return (
            <Card
              key={block.id}
              className={cn(
                "cursor-pointer p-4 transition-colors",
                isSelected && "border-primary bg-primary/5"
              )}
              onClick={() => toggleBlock(block.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", typeColors[block.type])}
                    >
                      {typeLabels[block.type]}
                    </Badge>
                  </div>
                  <h4 className="truncate font-medium">{block.title}</h4>
                  {block.organization && (
                    <p className="text-sm text-muted-foreground">
                      {block.organization}
                    </p>
                  )}
                  {block.bullet_points.length > 0 && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {block.bullet_points[0]}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No blocks found. Add some experience blocks first.
        </p>
      )}
    </div>
  );
}
