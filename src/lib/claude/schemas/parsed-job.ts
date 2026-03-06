import { z } from "zod";

export const parsedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().nullable(),
  location: z.string().nullable(),
  employment_type: z.string().nullable(),
  salary_range: z.string().nullable(),
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
});

export type ParsedJob = z.infer<typeof parsedJobSchema>;
