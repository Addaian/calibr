import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const importRowSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  url: z.string().url().optional().or(z.literal("")),
  employment_type: z.string().max(100).optional(),
  salary_range: z.string().max(100).optional(),
  notes: z.string().optional(),
  deadline: z.string().optional(),
  recruiter_name: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status_date: z.string().optional(),
  status: z
    .enum([
      "active", "applying", "applied", "screening", "interview",
      "assessment", "final_round", "offer", "negotiating", "accepted",
      "rejected", "withdrawn", "ghosted", "declined",
    ])
    .optional(),
});

const importBodySchema = z.object({
  rows: z.array(importRowSchema).min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = importBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const records = parsed.data.rows.map(row => ({
      user_id: user.id,
      title: row.title,
      company: row.company || null,
      location: row.location || null,
      url: row.url || null,
      employment_type: row.employment_type || null,
      salary_range: row.salary_range || null,
      notes: row.notes || null,
      deadline: row.deadline || null,
      recruiter_name: row.recruiter_name || null,
      source: row.source || null,
      status_date: row.status_date || null,
      status: row.status ?? "active",
    }));

    const { data, error } = await supabase
      .from("job_postings")
      .insert(records)
      .select("id");

    if (error) {
      return NextResponse.json({ error: "Import failed" }, { status: 500 });
    }

    return NextResponse.json({ imported: data?.length ?? 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
