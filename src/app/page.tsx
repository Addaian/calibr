import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  Briefcase,
  Sparkles,
  FileText,
  Star,
  ArrowRight,
  Link as LinkIcon,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Blocks,
    title: "Experience Building Blocks",
    description:
      "Create reusable blocks for every job, project, and skill. Your entire career in one place.",
  },
  {
    icon: LinkIcon,
    title: "Smart Job Scraping",
    description:
      "Paste a job URL and we instantly extract keywords, skills, and requirements.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tailoring",
    description:
      "Claude selects your best blocks and rewrites them to match each job's language.",
  },
  {
    icon: Star,
    title: "Fit Score & Analysis",
    description:
      "See exactly how well you match a job with strengths, gaps, and suggestions.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description:
      "Generate a tailored cover letter in seconds based on your experience.",
  },
  {
    icon: FileText,
    title: "PDF Export",
    description: "Download polished PDF resumes with professional templates.",
  },
];

const steps = [
  {
    number: "01",
    title: "Build your blocks",
    description:
      "Add your work experience, projects, education, and skills as individual building blocks.",
  },
  {
    number: "02",
    title: "Paste a job URL",
    description:
      "Drop in a job posting link and we'll extract all the keywords and requirements automatically.",
  },
  {
    number: "03",
    title: "Get a tailored resume",
    description:
      "AI selects and rewrites your blocks to match the job. Export as PDF in one click.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <span className="text-xl font-bold">Calibr</span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Badge variant="secondary" className="mb-6">
            Powered by Claude AI
          </Badge>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight">
            Resumes that fit the job.{" "}
            <span className="text-primary">Every time.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            Build your experience as reusable blocks. Paste a job link. Let AI
            assemble and tailor your perfect resume in seconds.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-y bg-muted/40 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              How it works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mb-4 text-5xl font-bold text-primary/60" aria-hidden="true">
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Everything you need
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <feature.icon className="mb-4 h-8 w-8 text-primary" />
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/40 px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to land your next role?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Stop sending generic resumes. Start tailoring every application in
              minutes.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Get started free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
          <Link href="/signup" className="hover:underline">
            Sign up
          </Link>
        </div>
      </footer>
    </div>
  );
}
