"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, MapPin, Building2, Tag, Calendar } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusSwitcher } from "./status-switcher";
import type { JobPosting } from "@/types/jobs";

interface JobCardProps {
  job: JobPosting;
  onDelete?: (id: string) => void;
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const [currentStatus, setCurrentStatus] = useState(job.status);
  const [currentStatusDate, setCurrentStatusDate] = useState(job.status_date);
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
          <StatusSwitcher
            jobId={job.id}
            status={currentStatus}
            statusDate={currentStatusDate}
            onUpdate={(s, d) => { setCurrentStatus(s); setCurrentStatusDate(d); }}
          />
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="size-3" />
          <span>{keywordCount} keyword{keywordCount !== 1 ? "s" : ""}</span>
          {currentStatusDate && (
            <>
              <span>&middot;</span>
              <Calendar className="size-3" />
              <span>
                {new Date(currentStatusDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </>
          )}
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
