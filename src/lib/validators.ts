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
  status: z
    .enum(["active", "applied", "interview", "rejected", "offer"])
    .default("active"),
  status_date: z.string().nullable().optional(),
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
});

export const coverLetterSchema = z.object({
  job_posting_id: z.string().uuid(),
  generated_resume_id: z.string().uuid().optional(),
  tone: z
    .enum(["professional", "conversational", "enthusiastic"])
    .default("professional"),
});
