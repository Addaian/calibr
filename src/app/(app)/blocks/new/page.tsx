"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BlockForm } from "@/components/blocks/block-form";

export default function NewBlockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to create block");
      }

      toast.success("Block created successfully");
      router.push("/blocks");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create block");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/blocks">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add Experience Block</h1>
      </div>

      <BlockForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
