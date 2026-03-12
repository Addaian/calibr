"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ParsedBlock } from "@/lib/claude/schemas/parsed-resume";
import { ArrowLeft, Upload, Check, X, Loader2 } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [parsedBlocks, setParsedBlocks] = useState<ParsedBlock[] | null>(null);
  const [included, setIncluded] = useState<Set<number>>(new Set());

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  async function uploadFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    setFileName(file.name.replace(/\.pdf$/i, ""));
    setParsing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/blocks/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Parsing failed");
      }

      const data = await res.json();
      setParsedBlocks(data.blocks);
      setIncluded(new Set(data.blocks.map((_: ParsedBlock, i: number) => i)));
      toast.success(`Parsed ${data.blocks.length} blocks from your resume`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to parse resume"
      );
    } finally {
      setParsing(false);
    }
  }

  function toggleBlock(index: number) {
    const next = new Set(included);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setIncluded(next);
  }

  async function handleSaveAll() {
    if (!parsedBlocks) return;
    const toSave = parsedBlocks.filter((_, i) => included.has(i));
    if (toSave.length === 0) {
      toast.error("Select at least one block to save");
      return;
    }

    setSaving(true);
    try {
      const responses = await Promise.all(
        toSave.map((block) =>
          fetch("/api/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...block, sort_order: 0 }),
          }).then((r) => r.json())
        )
      );

      const savedIds = responses
        .filter((r) => r?.id)
        .map((r) => r.id as string);

      await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName || "Uploaded Resume",
          source: "uploaded",
          selected_block_ids: savedIds,
          tailored_content: { summary: "", blocks: [] },
          template: "classic",
        }),
      });

      toast.success(`Saved ${toSave.length} blocks`);
      router.push("/resumes");
    } catch {
      toast.error("Failed to save some blocks");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-header-in flex items-center gap-4">
        <Link href="/blocks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Import from Resume</h1>
      </div>

      {!parsedBlocks && (
        <Card
          className="cursor-pointer border-dashed"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            {parsing ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Parsing your resume...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Upload your resume PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to browse. Max 5MB.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {parsing && !parsedBlocks && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {parsedBlocks && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {included.size} of {parsedBlocks.length} blocks selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click();
                  setParsedBlocks(null);
                }}
              >
                Re-upload
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={saving || included.size === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${included.size} Blocks`
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {parsedBlocks.map((block, i) => {
              const isIncluded = included.has(i);
              return (
                <Card
                  key={i}
                  className={`cursor-pointer transition-opacity ${isIncluded ? "" : "opacity-50"}`}
                  onClick={() => toggleBlock(i)}
                >
                  <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="mb-1 text-xs">
                        {block.type.replace("_", " ")}
                      </Badge>
                      <CardTitle className="text-sm">{block.title}</CardTitle>
                      {block.organization && (
                        <CardDescription>{block.organization}</CardDescription>
                      )}
                    </div>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isIncluded ? "border-primary bg-primary text-primary-foreground" : "border-muted"}`}
                    >
                      {isIncluded ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                  </CardHeader>
                  {block.bullet_points.length > 0 && (
                    <CardContent className="pt-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {block.bullet_points[0]}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
