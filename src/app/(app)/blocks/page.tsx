"use client";

import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { Blocks, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockList } from "@/components/blocks/block-list";
import type { ExperienceBlock } from "@/types/blocks";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksPage() {
  const { data, isLoading, error, mutate } = useSWR<ExperienceBlock[]>("/api/blocks", fetcher);

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/blocks/${id}`, { method: "DELETE" });
      mutate((prev) => prev?.filter((b) => b.id !== id));
      toast.success("Block deleted");
    } catch {
      toast.error("Failed to delete block");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Experience Blocks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your reusable career building blocks — used to tailor every resume.</p>
        </div>
        <div className="flex shrink-0 gap-2">
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

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load blocks. Please try refreshing the page.
        </div>
      )}

      {!isLoading && !error && Array.isArray(data) && data.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Blocks className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No blocks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Import your existing resume or add blocks manually.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link href="/blocks/import"><Upload className="h-4 w-4" />Import Resume</Link></Button>
            <Button asChild><Link href="/blocks/new"><Plus className="h-4 w-4" />Add Block</Link></Button>
          </div>
        </div>
      )}

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
        <BlockList blocks={Array.isArray(data) ? data : []} onDelete={handleDelete} />
      )}
    </div>
  );
}
