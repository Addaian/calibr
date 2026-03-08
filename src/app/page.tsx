import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  Sparkles,
  FileText,
  Star,
  ArrowRight,
  Link as LinkIcon,
  LayoutGrid,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Blocks,
    title: "Experience Blocks",
    description:
      "Break your career into reusable building blocks — work, projects, education, research, and more.",
    accent: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: LinkIcon,
    title: "Smart Job Scraping",
    description:
      "Paste a job URL and we instantly extract keywords, required skills, and responsibilities.",
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tailoring",
    description:
      "Claude picks your best blocks and rewrites them to mirror the job's language and tone.",
    accent: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Star,
    title: "Fit Score & Analysis",
    description:
      "See exactly how well you match with a scored breakdown — strengths, gaps, and suggestions.",
    accent: "bg-green-500/10 text-green-500",
  },
  {
    icon: LayoutGrid,
    title: "Job Pipeline Tracker",
    description:
      "Track every application through 14 pipeline stages with inline editing, kanban, and flow diagrams.",
    accent: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: Download,
    title: "PDF & DOCX Export",
    description:
      "Download polished resumes and cover letters in PDF or Word format with one click.",
    accent: "bg-rose-500/10 text-rose-500",
  },
];

const steps = [
  {
    number: "01",
    icon: Blocks,
    title: "Build your blocks",
    description:
      "Add your work experience, projects, and skills as modular building blocks once.",
  },
  {
    number: "02",
    icon: LinkIcon,
    title: "Paste a job URL",
    description:
      "Drop in any job posting link and we extract all keywords and requirements automatically.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get a tailored resume",
    description:
      "AI selects and rewrites your blocks to match the job. Export as PDF or DOCX in one click.",
  },
];

const stats = [
  { value: "14", label: "Pipeline stages" },
  { value: "5", label: "Block types" },
  { value: "3", label: "Export formats" },
  { value: "Claude AI", label: "Powered by" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* Nav */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
        <span className="text-xl font-bold tracking-tight">Calibr</span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-32 text-center">
          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,hsl(var(--primary)/0.1),transparent)]" />
          </div>

          <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-medium">
            Powered by Claude AI
          </Badge>

          <h1 className="mx-auto mb-6 max-w-3xl text-6xl font-bold leading-[1.1] tracking-tight">
            Resumes that fit the job.{" "}
            <span className="bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
              Every time.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            Build your experience as reusable blocks. Paste a job link. Let AI
            assemble and tailor your perfect resume in seconds.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-6">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-6">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats strip */}
        <div className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-border/50 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-8 py-6 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">How it works</p>
              <h2 className="text-3xl font-bold">Three steps to a tailored resume</h2>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connector line */}
              <div
                className="absolute left-[calc(1/6*100%)] right-[calc(1/6*100%)] top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
                aria-hidden="true"
              />

              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border bg-background shadow-sm">
                    <span className="text-xl font-bold">{step.number}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/20 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">Features</p>
              <h2 className="text-3xl font-bold">Everything you need</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-background p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.accent}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 via-background to-muted/40 px-8 py-16 text-center shadow-sm">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to land your next role?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Stop sending generic resumes. Start tailoring every application in
              minutes.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold">Calibr</span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
          <span className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Calibr</span>
        </div>
      </footer>

    </div>
  );
}
