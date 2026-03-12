import type { ExperienceBlock } from "@/types/blocks";
import { containsKeyword } from "@/lib/text-utils";

export function buildCorpusFromBlocks(
  blocks: ExperienceBlock[],
  skillsProfile?: { category: string; items: string[] }[]
): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.title) parts.push(block.title);
    if (block.description) parts.push(block.description);
    parts.push(...(block.bullet_points ?? []));
    parts.push(...(block.technologies ?? []));
  }
  if (skillsProfile) {
    for (const cat of skillsProfile) {
      parts.push(...cat.items);
    }
  }
  return parts.join(" ").toLowerCase();
}

export function computeSkillsMatchScore(
  job: { required_skills: string[]; preferred_skills: string[]; keywords: string[] },
  blocks: ExperienceBlock[],
  skillsProfile?: { category: string; items: string[] }[]
): { score: number; maxScore: 30 } {
  const corpus = buildCorpusFromBlocks(blocks, skillsProfile);

  const required = job.required_skills ?? [];
  const preferred = job.preferred_skills ?? [];

  const requiredFound = required.filter((k) => k && containsKeyword(corpus, k)).length;
  const preferredFound = preferred.filter((k) => k && containsKeyword(corpus, k)).length;

  let score = 0;
  if (required.length > 0 && preferred.length > 0) {
    score = (requiredFound / required.length) * 20 + (preferredFound / preferred.length) * 10;
  } else if (required.length > 0) {
    score = (requiredFound / required.length) * 30;
  } else if (preferred.length > 0) {
    score = (preferredFound / preferred.length) * 30;
  } else {
    // Fall back to general keywords
    const general = job.keywords ?? [];
    if (general.length > 0) {
      const generalFound = general.filter((k) => k && containsKeyword(corpus, k)).length;
      score = (generalFound / general.length) * 30;
    } else {
      score = 15; // No skills data — neutral
    }
  }

  return { score: Math.round(Math.min(30, score)), maxScore: 30 };
}

export function computeKeywordCoverageScore(
  job: { keywords: string[] },
  blocks: ExperienceBlock[],
  skillsProfile?: { category: string; items: string[] }[]
): { score: number; maxScore: 15 } {
  const corpus = buildCorpusFromBlocks(blocks, skillsProfile);
  const keywords = job.keywords ?? [];

  if (keywords.length === 0) {
    return { score: 10, maxScore: 15 }; // Neutral when no keywords
  }

  const found = keywords.filter((k) => k && containsKeyword(corpus, k)).length;
  const score = Math.round((found / keywords.length) * 15);

  return { score: Math.min(15, score), maxScore: 15 };
}

export function computeEducationFitScore(
  job: { education_requirement: "completed" | "in_progress_ok" | "none" | null },
  blocks: ExperienceBlock[]
): { score: number; maxScore: 15 } {
  const req = job.education_requirement;

  if (!req || req === "none") {
    return { score: 15, maxScore: 15 };
  }

  const educationBlocks = blocks.filter((b) => b.type === "education");

  if (educationBlocks.length === 0) {
    if (req === "completed") return { score: 3, maxScore: 15 };
    return { score: 15, maxScore: 15 }; // in_progress_ok with no edu block — neutral
  }

  const today = new Date();
  const hasCompleted = educationBlocks.some(
    (b) => b.end_date && new Date(b.end_date) <= today
  );
  const hasInProgress = educationBlocks.some(
    (b) => !b.end_date || new Date(b.end_date) > today
  );

  if (req === "in_progress_ok") {
    return { score: 15, maxScore: 15 };
  }

  // req === "completed"
  if (hasCompleted) return { score: 15, maxScore: 15 };
  if (hasInProgress) return { score: 10, maxScore: 15 };
  return { score: 3, maxScore: 15 };
}
