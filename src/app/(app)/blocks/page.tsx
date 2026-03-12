"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { Blocks, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BlockList } from "@/components/blocks/block-list";
import type { ExperienceBlock } from "@/types/blocks";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlocksPage() {
  const { data, isLoading, error, mutate } = useSWR<ExperienceBlock[]>("/api/blocks", fetcher);
  const [deleteTarget, setDeleteTarget] = useState<ExperienceBlock | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await fetch(`/api/blocks/${id}`, { method: "DELETE" });
      mutate((prev) => prev?.filter((b) => b.id !== id));
      toast.success("Block deleted");
    } catch {
      toast.error("Failed to delete block");
    }
  }

  function handleDelete(id: string) {
    const block = data?.find((b) => b.id === id);
    if (block) setDeleteTarget(block);
  }

  async function handleReorder(reordered: ExperienceBlock[]) {
    // Optimistic update
    mutate(reordered, false);

    const order = reordered.map((b, i) => ({ id: b.id, sort_order: i }));
    try {
      const res = await fetch("/api/blocks/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to save order");
      mutate(); // revert
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4 animate-header-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Experience Blocks
            {data && data.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {data.length} block{data.length !== 1 ? "s" : ""}
              </span>
            )}
          </h1>
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
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/10 py-20 text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Blocks className="h-6 w-6 text-primary/60" />
            </div>
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
        <BlockList
          blocks={Array.isArray(data) ? data : []}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete block?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
