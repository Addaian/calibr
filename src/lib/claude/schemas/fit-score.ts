import { z } from "zod";

export const fitScoreOutputSchema = z.object({
  experience_relevance: z.number().int().min(0).max(30),
  overall_impression: z.number().int().min(0).max(10),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type FitScoreOutput = z.infer<typeof fitScoreOutputSchema>;
