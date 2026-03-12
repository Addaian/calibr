"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JobUrlForm } from "@/components/jobs/job-url-form";
import { JobKeywords } from "@/components/jobs/job-keywords";
import type { ParsedJob } from "@/lib/claude/schemas/parsed-job";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scrapedUrl, setScrapedUrl] = useState<string | null>(null);
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);

  async function handleUrlSubmit(url: string) {
    setLoading(true);
    setParsedJob(null);
    setScrapedUrl(url);

    try {
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to analyze job posting");
      }

      const data = await res.json();
      setParsedJob(data);
      toast.success("Job posting analyzed successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to analyze job posting"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePasteSubmit(text: string) {
    setLoading(true);
    setParsedJob(null);
    setScrapedUrl(null);

    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to analyze job posting");
      }

      const data = await res.json();
      setParsedJob(data);
      toast.success("Job posting analyzed successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to analyze job posting"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!parsedJob) return;

    setSaving(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsedJob,
          url: scrapedUrl,
          status: "active",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save job");
      }

      const data = await res.json();
      toast.success("Job posting saved");
      router.push(`/jobs/${data.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save job posting"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="animate-header-in text-2xl font-bold">Add Job Posting</h1>

      <Card>
        <CardContent className="pt-6">
          <JobUrlForm onSubmit={handleUrlSubmit} onPasteSubmit={handlePasteSubmit} loading={loading} />
        </CardContent>
      </Card>

      {parsedJob && (
        <div className="space-y-6">
          <Separator />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Preview</h2>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Job"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{parsedJob.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {parsedJob.company && <span>{parsedJob.company}</span>}
                {parsedJob.location && <span>{parsedJob.location}</span>}
                {parsedJob.employment_type && (
                  <Badge variant="outline">{parsedJob.employment_type}</Badge>
                )}
                {parsedJob.salary_range && (
                  <span>{parsedJob.salary_range}</span>
                )}
              </div>

              {(parsedJob.required_skills.length > 0 ||
                parsedJob.preferred_skills.length > 0 ||
                parsedJob.keywords.length > 0) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Skills & Keywords</h3>
                  <JobKeywords
                    keywords={parsedJob.keywords}
                    required_skills={parsedJob.required_skills}
                    preferred_skills={parsedJob.preferred_skills}
                  />
                </div>
              )}

              {parsedJob.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Responsibilities</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {parsedJob.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(parsedJob.company_info.industry ||
                parsedJob.company_info.size ||
                parsedJob.company_info.about) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Company Info</h3>
                  <div className="text-sm text-muted-foreground">
                    {parsedJob.company_info.industry && (
                      <p>Industry: {parsedJob.company_info.industry}</p>
                    )}
                    {parsedJob.company_info.size && (
                      <p>Size: {parsedJob.company_info.size}</p>
                    )}
                    {parsedJob.company_info.about && (
                      <p>{parsedJob.company_info.about}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
