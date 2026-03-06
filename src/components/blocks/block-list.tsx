"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockCard } from "@/components/blocks/block-card";
import type { ExperienceBlock, BlockType } from "@/types/blocks";

const filterTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "work_experience", label: "Work" },
  { value: "project", label: "Projects" },
  { value: "education", label: "Education" },
  { value: "skill", label: "Skills" },
  { value: "volunteering", label: "Volunteering" },
];

interface BlockListProps {
  blocks: ExperienceBlock[];
  onDelete?: (id: string) => void;
}

export function BlockList({ blocks, onDelete }: BlockListProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredBlocks =
    activeTab === "all"
      ? blocks
      : blocks.filter((block) => block.type === activeTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4 flex-wrap">
        {filterTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {filterTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {filteredBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Inbox className="mb-3 size-10 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                No blocks found
              </p>
              <p className="text-xs text-muted-foreground">
                {activeTab === "all"
                  ? "Create your first experience block to get started."
                  : "No blocks match this filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlocks.map((block) => (
                <BlockCard key={block.id} block={block} onDelete={onDelete} />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
