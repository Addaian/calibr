"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  FileText,
  Mail,
  Calendar,
  GraduationCap,
  Clock,
  AlertCircle,
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
import { JobDocuments } from "./job-documents";
import { StatusSwitcher } from "./status-switcher";
import type { JobPosting } from "@/types/jobs";
import type { GeneratedResume } from "@/types/resumes";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getBestScore(resumes: GeneratedResume[]): number | null {
  const scores = resumes.map((r) => r.fit_score).filter((s): s is number => s !== null);
  return scores.length > 0 ? Math.max(...scores) : null;
}

function fitPillClass(score: number) {
  if (score >= 70) return "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  return "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400";
}

interface JobDetailProps {
  job: JobPosting;
}

export function JobDetail({ job }: JobDetailProps) {
  const [status, setStatus] = useState(job.status);
  const [statusDate, setStatusDate] = useState(job.status_date ?? null);
  const { data: resumes } = useSWR<GeneratedResume[]>(`/api/resumes?job_id=${job.id}`, fetcher);
  const bestScore = resumes ? getBestScore(resumes) : null;

  const requiredSkills = job.required_skills ?? [];
  const preferredSkills = job.preferred_skills ?? [];
  const keywords = job.keywords ?? [];
  const responsibilities = job.responsibilities ?? [];
  const companyInfo = job.company_info ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <StatusSwitcher
              jobId={job.id}
              status={status}
              statusDate={statusDate}
              onUpdate={(s, d) => { setStatus(s); setStatusDate(d); }}
            />
            {bestScore !== null && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${fitPillClass(bestScore)}`}>
                {bestScore}% fit
              </span>
            )}
          </div>
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
            {job.education_requirement && job.education_requirement !== "none" && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-4" />
                {job.education_requirement === "in_progress_ok"
                  ? "Students welcome"
                  : "Degree required"}
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="size-4" />
                {job.salary_range}
              </span>
            )}
            {statusDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {new Date(statusDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            )}
            {job.deadline && (() => {
              const today = new Date().toISOString().split("T")[0];
              const isOverdue = job.deadline < today &&
                (job.status === "active" || job.status === "applying");
              return (
                <span className={`flex items-center gap-1.5 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : ""}`}>
                  {isOverdue
                    ? <AlertCircle className="size-4" />
                    : <Clock className="size-4" />}
                  Deadline:{" "}
                  {new Date(job.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                  {isOverdue && " (overdue)"}
                </span>
              );
            })()}
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
        {requiredSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <Badge key={skill} variant="destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {preferredSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferred Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {preferredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <JobKeywords keywords={keywords} required_skills={[]} preferred_skills={[]} />
          </CardContent>
        </Card>
      )}

      {responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              {responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(companyInfo.industry || companyInfo.size || companyInfo.about) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {companyInfo.industry && (
                <div>
                  <dt className="font-medium text-muted-foreground">Industry</dt>
                  <dd>{companyInfo.industry}</dd>
                </div>
              )}
              {companyInfo.size && (
                <div>
                  <dt className="font-medium text-muted-foreground">Company Size</dt>
                  <dd>{companyInfo.size}</dd>
                </div>
              )}
              {companyInfo.about && (
                <div>
                  <dt className="font-medium text-muted-foreground">About</dt>
                  <dd>{companyInfo.about}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {job.description_raw && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description_raw}</p>
          </CardContent>
        </Card>
      )}

      <JobDocuments jobId={job.id} company={job.company} />
    </div>
  );
}
