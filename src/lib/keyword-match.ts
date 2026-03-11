import type { TailoredContent } from "@/types/resumes";

export interface KeywordMatchResult {
  keyword: string;
  source: "required" | "preferred" | "general";
  found: boolean;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsKeyword(corpus: string, keyword: string): boolean {
  const lower = keyword.toLowerCase();
  // Word-boundary match handles most cases (avoids "Go" matching "going")
  const pattern = new RegExp("\\b" + escapeRegex(lower) + "\\b", "i");
  return pattern.test(corpus);
}

export function matchKeywords(
  job: { required_skills: string[]; preferred_skills: string[]; keywords: string[] },
  content: TailoredContent
): { results: KeywordMatchResult[]; matchPercentage: number } {
  // Build search corpus from all resume text
  const parts: string[] = [content.summary ?? ""];
  for (const block of content.blocks ?? []) {
    parts.push(...(block.bullet_points ?? []));
    parts.push(...(block.technologies ?? []));
    if (block.title) parts.push(block.title);
  }
  const corpus = parts.join(" ").toLowerCase();

  // Deduplicate keywords, track source priority: required > preferred > general
  const seen = new Map<string, "required" | "preferred" | "general">();
  for (const k of job.required_skills ?? []) {
    if (k) seen.set(k.toLowerCase(), "required");
  }
  for (const k of job.preferred_skills ?? []) {
    const lower = k.toLowerCase();
    if (k && !seen.has(lower)) seen.set(lower, "preferred");
  }
  for (const k of job.keywords ?? []) {
    const lower = k.toLowerCase();
    if (k && !seen.has(lower)) seen.set(lower, "general");
  }

  const results: KeywordMatchResult[] = [];
  for (const [lowerKey, source] of seen.entries()) {
    // Get original casing from the input arrays
    const original =
      (job.required_skills ?? []).find((k) => k.toLowerCase() === lowerKey) ??
      (job.preferred_skills ?? []).find((k) => k.toLowerCase() === lowerKey) ??
      (job.keywords ?? []).find((k) => k.toLowerCase() === lowerKey) ??
      lowerKey;
    results.push({ keyword: original, source, found: containsKeyword(corpus, original) });
  }

  // Sort: required first, then preferred, then general; missing before found within each group
  results.sort((a, b) => {
    const order = { required: 0, preferred: 1, general: 2 };
    const srcDiff = order[a.source] - order[b.source];
    if (srcDiff !== 0) return srcDiff;
    return Number(a.found) - Number(b.found);
  });

  const matchPercentage =
    results.length === 0 ? 0 : Math.round((results.filter((r) => r.found).length / results.length) * 100);

  return { results, matchPercentage };
}
