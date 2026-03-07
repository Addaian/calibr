import { z } from "zod";

export const tailoredBlockSchema = z.object({
  block_id: z.string(),
  type: z.enum(["work_experience", "project", "education", "skill", "volunteering", "research"]),
  title: z.string(),
  organization: z.string().nullable(),
  location: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  bullet_points: z.array(z.string()),
  technologies: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const tailoredResumeSchema = z.object({
  summary: z.string(),
  blocks: z.array(tailoredBlockSchema),
});

export type TailoredResumeOutput = z.infer<typeof tailoredResumeSchema>;
