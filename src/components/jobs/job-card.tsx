"use client";

import Link from "next/link";
import { Trash2, MapPin, Building2, Tag } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobPosting } from "@/types/jobs";

const statusConfig: Record<
  JobPosting["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  applied: { label: "Applied", variant: "secondary" },
  interview: { label: "Interview", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
  offer: { label: "Offer", variant: "default" },
};

interface JobCardProps {
  job: JobPosting;
  onDelete?: (id: string) => void;
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const status = statusConfig[job.status];
  const keywordCount =
    job.keywords.length +
    job.required_skills.length +
    job.preferred_skills.length;

  return (
    <Card>
      <CardHeader>
        <Link href={`/jobs/${job.id}`} className="hover:underline">
          <CardTitle>{job.title}</CardTitle>
        </Link>
        <CardDescription className="flex flex-col gap-1">
          {job.company && (
            <span className="flex items-center gap-1">
              <Building2 className="size-3" />
              {job.company}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
          )}
        </CardDescription>
        <CardAction>
          <Badge variant={status.variant}>{status.label}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="size-3" />
          <span>
            {keywordCount} keyword{keywordCount !== 1 ? "s" : ""}
          </span>
          <span>&middot;</span>
          <span>
            {new Date(job.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/jobs/${job.id}`}>View Details</Link>
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(job.id)}
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
