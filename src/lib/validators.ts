import { z } from "zod";

export const blockTypes = [
  "work_experience",
  "project",
  "education",
  "volunteering",
  "research",
] as const;

export const blockTypeSchema = z.enum(blockTypes);

export const createBlockSchema = z.object({
  type: blockTypeSchema,
  title: z.string().min(1, "Title is required").max(200),
  organization: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  bullet_points: z.array(z.string().max(500)).default([]),
  technologies: z.array(z.string().max(100)).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  sort_order: z.number().int().default(0),
});

export const updateBlockSchema = createBlockSchema.partial();

export const compensationSchema = z.object({
  base: z.number().positive().optional(),
  signing_bonus: z.number().nonnegative().optional(),
  rsus: z.number().nonnegative().optional(),
  rsu_vest_years: z.number().int().min(1).max(10).optional(),
  relocation: z.number().nonnegative().optional(),
  other: z.string().max(200).optional(),
  currency: z.string().max(10).default("USD"),
});

export const createJobSchema = z.object({
  url: z.string().url().nullable().optional(),
  title: z.string().min(1, "Job title is required").max(200),
  company: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  employment_type: z.string().max(100).nullable().optional(),
  salary_range: z.string().max(100).nullable().optional(),
  description_raw: z.string().nullable().optional(),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  company_info: z
    .object({
      industry: z.string().optional(),
      size: z.string().optional(),
      about: z.string().optional(),
    })
    .default({}),
  education_requirement: z
    .enum(["completed", "in_progress_ok", "none"])
    .nullable()
    .optional(),
  status: z
    .enum([
      "active", "applying", "applied", "screening", "interview",
      "assessment", "final_round", "offer", "negotiating", "accepted",
      "rejected", "withdrawn", "ghosted", "declined",
    ])
    .default("active"),
  status_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: z.string().max(100).nullable().optional(),
  recruiter_name: z.string().max(200).nullable().optional(),
  recruiter_email: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  follow_up_date: z.string().nullable().optional(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable().optional(),
  offer_amount: z.string().max(100).nullable().optional(),
  compensation: compensationSchema.nullable().optional(),
});

export const scrapeJobSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const tailorSchema = z.object({
  block_ids: z.array(z.string().uuid()).min(1, "Select at least one block"),
  job_posting_id: z.string().uuid(),
  resume_template_text: z.string().optional(),
});

export const fitScoreSchema = z.object({
  block_ids: z.array(z.string().uuid()).min(1),
  job_posting_id: z.string().uuid(),
  resume_id: z.string().uuid().optional(),
});

export const createInterviewRoundSchema = z.object({
  job_posting_id: z.string().uuid(),
  round_number: z.number().int().min(1).default(1),
  round_type: z.enum([
    "online_assessment", "phone_screen", "technical", "behavioral",
    "system_design", "team_match", "hiring_manager", "other",
  ]),
  scheduled_at: z.string().nullable().optional(),
  duration_minutes: z.number().int().min(1).max(600).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  interviewer_name: z.string().max(200).nullable().optional(),
  notes: z.string().nullable().optional(),
  outcome: z.enum(["pending", "passed", "failed", "cancelled"]).default("pending"),
});

export const updateInterviewRoundSchema = createInterviewRoundSchema
  .omit({ job_posting_id: true })
  .partial();

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(["cold_outreach", "follow_up", "thank_you", "referral_request", "negotiation", "withdrawal", "other"]),
  subject: z.string().max(300).nullable().optional(),
  body: z.string().min(1),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  notes: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  last_contacted_at: z.string().nullable().optional(),
  job_posting_id: z.string().uuid().nullable().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const coverLetterSchema = z.object({
  job_posting_id: z.string().uuid(),
  generated_resume_id: z.string().uuid().optional(),
  tone: z
    .enum(["professional", "conversational", "enthusiastic"])
    .default("professional"),
});
