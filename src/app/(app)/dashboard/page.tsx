"use client";

import Link from "next/link";
import useSWR from "swr";
import { Blocks, Briefcase, FileText, Mail, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: blocks } = useSWR("/api/blocks", fetcher);
  const { data: jobs } = useSWR("/api/jobs", fetcher);
  const { data: resumes } = useSWR("/api/resumes", fetcher);
  const { data: coverLetters } = useSWR("/api/cover-letters", fetcher);

  const stats = [
    {
      title: "Experience Blocks",
      description: "Reusable resume building blocks",
      count: Array.isArray(blocks) ? blocks.length : null,
      icon: Blocks,
      href: "/blocks",
    },
    {
      title: "Job Postings",
      description: "Saved job descriptions",
      count: Array.isArray(jobs) ? jobs.length : null,
      icon: Briefcase,
      href: "/jobs",
    },
    {
      title: "Generated Resumes",
      description: "Tailored resumes created",
      count: Array.isArray(resumes) ? resumes.length : null,
      icon: FileText,
      href: "/resumes",
    },
    {
      title: "Cover Letters",
      description: "Generated cover letters",
      count: Array.isArray(coverLetters) ? coverLetters.length : null,
      icon: Mail,
      href: "/resumes",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.title}</CardDescription>
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-3xl">
                  {stat.count === null ? (
                    <Skeleton className="h-9 w-12" />
                  ) : (
                    stat.count
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/blocks/new">
              <Plus className="size-4" />
              Add Block
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/jobs/new">
              <Plus className="size-4" />
              New Job
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blocks/import">
              <Plus className="size-4" />
              Import Resume
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
