"use client";

import Link from "next/link";
import {
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  FileText,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JobKeywords } from "./job-keywords";
import type { JobPosting } from "@/types/jobs";

interface JobDetailProps {
  job: JobPosting;
}

export function JobDetail({ job }: JobDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {job.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" />
                {job.company}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {job.location}
              </span>
            )}
            {job.employment_type && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4" />
                {job.employment_type}
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="size-4" />
                {job.salary_range}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/jobs/${job.id}/tailor`}>
              <FileText className="size-4" />
              Tailor Resume
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/jobs/${job.id}/cover-letter`}>
              <Mail className="size-4" />
              Generate Cover Letter
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {job.required_skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <Badge key={skill} variant="destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {job.preferred_skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferred Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {job.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <JobKeywords
              keywords={job.keywords}
              required_skills={[]}
              preferred_skills={[]}
            />
          </CardContent>
        </Card>
      )}

      {job.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              {job.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(job.company_info.industry ||
        job.company_info.size ||
        job.company_info.about) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {job.company_info.industry && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Industry
                  </dt>
                  <dd>{job.company_info.industry}</dd>
                </div>
              )}
              {job.company_info.size && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Company Size
                  </dt>
                  <dd>{job.company_info.size}</dd>
                </div>
              )}
              {job.company_info.about && (
                <div>
                  <dt className="font-medium text-muted-foreground">About</dt>
                  <dd>{job.company_info.about}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
