import Link from "next/link";
import { Blocks, Briefcase, FileText, Mail, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Experience Blocks",
    description: "Reusable resume building blocks",
    count: 0,
    icon: Blocks,
  },
  {
    title: "Job Postings",
    description: "Saved job descriptions",
    count: 0,
    icon: Briefcase,
  },
  {
    title: "Generated Resumes",
    description: "Tailored resumes created",
    count: 0,
    icon: FileText,
  },
  {
    title: "Cover Letters",
    description: "Generated cover letters",
    count: 0,
    icon: Mail,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{stat.title}</CardDescription>
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{stat.count}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
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
        </div>
      </div>
    </div>
  );
}
