import { z } from "zod";

export const fitScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type FitScoreOutput = z.infer<typeof fitScoreSchema>;
