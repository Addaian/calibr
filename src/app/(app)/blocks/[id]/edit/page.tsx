"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockForm } from "@/components/blocks/block-form";
import type { ExperienceBlock } from "@/types/blocks";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditBlockPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: block, isLoading, error } = useSWR<ExperienceBlock>(
    `/api/blocks/${params.id}`,
    fetcher
  );

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    try {
      const response = await fetch(`/api/blocks/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to update block");
      }

      toast.success("Block updated successfully");
      router.push("/blocks");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update block");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-header-in flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/blocks">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Block</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4 rounded-xl border p-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load block. It may not exist or you may not have access.
        </div>
      ) : block ? (
        <BlockForm initialData={block} onSubmit={handleSubmit} loading={loading} />
      ) : null}
    </div>
  );
}
