import { z } from "zod";

export const parsedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().nullable(),
  location: z.string().nullable(),
  employment_type: z.string().nullable(),
  salary_range: z.string().nullable(),
  required_skills: z.array(z.string()).nullable().transform(v => v ?? []),
  preferred_skills: z.array(z.string()).nullable().transform(v => v ?? []),
  keywords: z.array(z.string()).nullable().transform(v => v ?? []),
  responsibilities: z.array(z.string()).nullable().transform(v => v ?? []),
  company_info: z
    .object({
      industry: z.string().nullable().optional(),
      size: z.string().nullable().optional(),
      about: z.string().nullable().optional(),
    })
    .nullable()
    .transform(v => v ?? {}),
  education_requirement: z
    .enum(["completed", "in_progress_ok", "none"])
    .nullable()
    .default(null),
  deadline: z.string().nullable().optional(),
});

export type ParsedJob = z.infer<typeof parsedJobSchema>;
