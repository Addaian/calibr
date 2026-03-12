"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Inbox, LayoutGrid, List, Pencil, Trash2, Calendar, MapPin, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlockCard } from "@/components/blocks/block-card";
import type { ExperienceBlock, BlockType } from "@/types/blocks";
import { formatDateRange } from "@/lib/format-date";

const filterTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "work_experience", label: "Work" },
  { value: "project", label: "Projects" },
  { value: "education", label: "Education" },
  { value: "research", label: "Research" },
  { value: "volunteering", label: "Volunteering" },
];

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

interface BlockListProps {
  blocks: ExperienceBlock[];
  onDelete?: (id: string) => void;
  onReorder?: (reordered: ExperienceBlock[]) => void;
}

export function BlockList({ blocks, onDelete, onReorder }: BlockListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<string | null>(null);

  const filteredBlocks =
    activeTab === "all"
      ? blocks
      : blocks.filter((block) => block.type === activeTab);

  const handleDragStart = useCallback((id: string) => {
    dragItemRef.current = id;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragItemRef.current !== id) {
      setDragOverId(id);
    }
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    const sourceId = dragItemRef.current;
    if (!sourceId || sourceId === targetId || !onReorder) return;

    const sourceIdx = blocks.findIndex(b => b.id === sourceId);
    const targetIdx = blocks.findIndex(b => b.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reordered = [...blocks];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    onReorder(reordered);
    dragItemRef.current = null;
    setDragOverId(null);
  }, [blocks, onReorder]);

  const handleDragEnd = useCallback(() => {
    dragItemRef.current = null;
    setDragOverId(null);
  }, []);

  const empty = (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/10 py-16 text-center">
      <div className="relative flex items-center justify-center mb-3">
        <div className="absolute h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
          <Inbox className="h-6 w-6 text-primary/60" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">No blocks found</p>
      <p className="text-xs text-muted-foreground">
        {activeTab === "all"
          ? "Create your first experience block to get started."
          : "No blocks match this filter."}
      </p>
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <TabsList className="flex-wrap">
          {filterTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center rounded-md border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("list")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {filterTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {filteredBlocks.length === 0 ? empty : view === "grid" ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlocks.map((block) => (
                <div
                  key={block.id}
                  draggable={!!onReorder && activeTab === "all"}
                  onDragStart={() => handleDragStart(block.id)}
                  onDragOver={(e) => handleDragOver(e, block.id)}
                  onDrop={() => handleDrop(block.id)}
                  onDragEnd={handleDragEnd}
                  className={`group/drag relative transition-all duration-150 ${
                    dragOverId === block.id
                      ? "scale-[1.02] ring-2 ring-primary/30 rounded-xl"
                      : ""
                  } ${onReorder && activeTab === "all" ? "cursor-grab active:cursor-grabbing" : ""}`}
                >
                  {onReorder && activeTab === "all" && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/drag:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <BlockCard block={block} onDelete={onDelete} />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {filteredBlocks.map((block) => {
                const dateRange = formatDateRange(block.start_date, block.end_date);
                return (
                  <div
                    key={block.id}
                    draggable={!!onReorder && activeTab === "all"}
                    onDragStart={() => handleDragStart(block.id)}
                    onDragOver={(e) => handleDragOver(e, block.id)}
                    onDrop={() => handleDrop(block.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-4 px-4 py-3 transition-all duration-150 ${
                      dragOverId === block.id ? "bg-primary/5" : ""
                    } ${onReorder && activeTab === "all" ? "cursor-grab active:cursor-grabbing" : ""}`}
                  >
                    {onReorder && activeTab === "all" && (
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <Badge
                      variant="secondary"
                      className={`w-28 shrink-0 justify-center ${typeBadgeColors[block.type]}`}
                    >
                      {typeLabels[block.type]}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{block.title}</p>
                      {(block.organization || block.location || dateRange) && (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          {block.organization && <span>{block.organization}</span>}
                          {block.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />{block.location}
                            </span>
                          )}
                          {dateRange && (
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />{dateRange}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/blocks/${block.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDelete(block.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
