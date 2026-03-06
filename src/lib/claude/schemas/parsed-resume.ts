import { z } from "zod";

export const parsedBlockSchema = z.object({
  type: z.enum([
    "work_experience",
    "project",
    "education",
    "skill",
    "volunteering",
  ]),
  title: z.string(),
  organization: z.string().nullable(),
  location: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  description: z.string().nullable(),
  bullet_points: z.array(z.string()),
  technologies: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const parsedResumeSchema = z.object({
  blocks: z.array(parsedBlockSchema),
});

export type ParsedBlock = z.infer<typeof parsedBlockSchema>;
export type ParsedResume = z.infer<typeof parsedResumeSchema>;
