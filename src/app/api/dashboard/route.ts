import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface ActionItem {
  type:
    | "deadline_overdue"
    | "deadline_soon"
    | "follow_up_due"
    | "no_resume"
    | "ghosted"
    | "offer_pending"
    | "interview_upcoming";
  priority: "urgent" | "high" | "medium";
  job_id: string;
  job_title: string;
  company: string | null;
  message: string;
  due_date: string | null;
}

export interface DashboardStats {
  total_jobs: number;
  active_applications: number;
  offers: number;
  avg_fit_score: number | null;
}

export interface DashboardData {
  stats: DashboardStats;
  actions: ActionItem[];
}

const ACTIVE_STATUSES = [
  "active", "applying", "applied", "screening",
  "interview", "assessment", "final_round",
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];
    const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    const ago14Days = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];
    const ago7Days = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    // Fetch all jobs + resumes in parallel
    const [jobsResult, resumesResult] = await Promise.all([
      supabase
        .from("job_postings")
        .select("id, title, company, status, deadline, follow_up_date, status_date")
        .eq("user_id", user.id),
      supabase
        .from("generated_resumes")
        .select("job_posting_id, fit_score")
        .eq("user_id", user.id)
        .not("job_posting_id", "is", null),
    ]);

    const jobs = jobsResult.data ?? [];
    const resumes = resumesResult.data ?? [];

    // Build lookup sets
    const jobsWithResume = new Set(resumes.map((r) => r.job_posting_id as string));
    const bestScoreByJob = new Map<string, number>();
    for (const r of resumes) {
      if (r.job_posting_id && r.fit_score !== null) {
        const prev = bestScoreByJob.get(r.job_posting_id) ?? -1;
        if (r.fit_score > prev) bestScoreByJob.set(r.job_posting_id, r.fit_score);
      }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    const activeApplications = jobs.filter((j) =>
      ["applying", "applied", "screening", "interview", "assessment", "final_round"].includes(j.status)
    ).length;

    const offers = jobs.filter((j) =>
      ["offer", "negotiating", "accepted"].includes(j.status)
    ).length;

    const scores = Array.from(bestScoreByJob.values());
    const avgFitScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    const stats: DashboardStats = {
      total_jobs: jobs.length,
      active_applications: activeApplications,
      offers,
      avg_fit_score: avgFitScore,
    };

    // ── Actions ───────────────────────────────────────────────────────────────
    const actions: ActionItem[] = [];

    for (const job of jobs) {
      // 1. Deadline overdue
      if (
        job.deadline &&
        job.deadline < today &&
        (job.status === "active" || job.status === "applying")
      ) {
        actions.push({
          type: "deadline_overdue",
          priority: "urgent",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: `Deadline passed on ${fmtDate(job.deadline)}`,
          due_date: job.deadline,
        });
        continue; // skip deadline_soon check for same job
      }

      // 2. Deadline within 3 days
      if (
        job.deadline &&
        job.deadline >= today &&
        job.deadline <= in3Days &&
        (job.status === "active" || job.status === "applying")
      ) {
        const daysLeft = Math.ceil(
          (new Date(job.deadline).getTime() - new Date(today).getTime()) / 86400000
        );
        actions.push({
          type: "deadline_soon",
          priority: "urgent",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: daysLeft === 0
            ? "Deadline is today"
            : daysLeft === 1
            ? "Deadline is tomorrow"
            : `Deadline in ${daysLeft} days`,
          due_date: job.deadline,
        });
      }

      // 3. Offer pending — no follow-up action taken
      if (job.status === "offer" || job.status === "negotiating") {
        actions.push({
          type: "offer_pending",
          priority: "high",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: job.status === "negotiating" ? "Negotiation in progress" : "Offer received — review and respond",
          due_date: null,
        });
      }

      // 4. Follow-up overdue
      if (
        job.follow_up_date &&
        job.follow_up_date <= today &&
        !["accepted", "rejected", "withdrawn", "declined"].includes(job.status)
      ) {
        actions.push({
          type: "follow_up_due",
          priority: "high",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: `Follow-up was due ${job.follow_up_date === today ? "today" : `on ${fmtDate(job.follow_up_date)}`}`,
          due_date: job.follow_up_date,
        });
      }

      // 5. Interview / assessment upcoming (status changed within last 14 days)
      if (
        ["interview", "assessment", "final_round"].includes(job.status) &&
        job.status_date &&
        job.status_date >= ago14Days
      ) {
        const label =
          job.status === "final_round"
            ? "Final round"
            : job.status === "assessment"
            ? "Assessment"
            : "Interview";
        actions.push({
          type: "interview_upcoming",
          priority: "high",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: `${label} stage — prep materials`,
          due_date: null,
        });
      }

      // 6. Possibly ghosted
      if (
        job.status === "applied" &&
        job.status_date &&
        job.status_date < ago14Days
      ) {
        const daysSince = Math.floor(
          (new Date(today).getTime() - new Date(job.status_date).getTime()) / 86400000
        );
        actions.push({
          type: "ghosted",
          priority: "medium",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: `Applied ${daysSince} days ago — no response`,
          due_date: null,
        });
      }

      // 7. No resume tailored yet (active/applying only)
      if (
        (job.status === "active" || job.status === "applying") &&
        !jobsWithResume.has(job.id)
      ) {
        actions.push({
          type: "no_resume",
          priority: "medium",
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          message: "No tailored resume yet",
          due_date: null,
        });
      }
    }

    // Sort: urgent first, then high, then medium; within same priority sort by due_date
    const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2 };
    actions.sort((a, b) => {
      const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pd !== 0) return pd;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

    return NextResponse.json({ stats, actions } satisfies DashboardData);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
