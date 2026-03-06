"use client";

import Link from "next/link";
import useSWR from "swr";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockList } from "@/components/blocks/block-list";
import type { ExperienceBlock } from "@/types/blocks";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksPage() {
  const { data, isLoading } = useSWR<ExperienceBlock[]>("/api/blocks", fetcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Experience Blocks</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/blocks/import">
              <Upload />
              Import from Resume
            </Link>
          </Button>
          <Button asChild>
            <Link href="/blocks/new">
              <Plus />
              Add Block
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <BlockList blocks={Array.isArray(data) ? data : []} />
      )}
    </div>
  );
}
