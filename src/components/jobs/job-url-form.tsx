"use client";

import { useState } from "react";
import { Loader2, Link as LinkIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JobUrlFormProps {
  onSubmit: (url: string) => void;
  onPasteSubmit?: (text: string) => void;
  loading?: boolean;
}

export function JobUrlForm({ onSubmit, onPasteSubmit, loading }: JobUrlFormProps) {
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [error, setError] = useState("");

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    onSubmit(url);
  }

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!pastedText.trim()) {
      setError("Please paste a job description");
      return;
    }

    onPasteSubmit?.(pastedText);
  }

  return (
    <div className="space-y-4">
      {mode === "url" ? (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-url">Job Posting URL</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="job-url"
                  type="url"
                  placeholder="https://example.com/jobs/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !url}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Job Posting"
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-text">Job Description</Label>
            <Textarea
              id="job-text"
              placeholder="Paste the full job description here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[200px]"
              disabled={loading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" disabled={loading || !pastedText.trim()}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Job Posting"
            )}
          </Button>
        </form>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setMode(mode === "url" ? "paste" : "url");
          setError("");
        }}
        disabled={loading}
      >
        <FileText className="size-4" />
        {mode === "url" ? "Or paste job description" : "Or enter a URL"}
      </Button>
    </div>
  );
}
