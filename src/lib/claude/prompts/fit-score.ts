interface AlgorithmicScores {
  skillsMatch: number;
  keywordCoverage: number;
  educationFit: number;
}

export function getFitScorePrompt(
  blocks: string,
  jobPosting: string,
  algorithmicScores: AlgorithmicScores,
  skillsProfile?: string,
  candidateContext?: string
): { system: string; user: string } {
  return {
    system: `You are a resume-job fit analyst. Three dimensions have already been scored algorithmically:
- Skills Match (max 30): keyword presence of required/preferred skills in the resume
- Keyword Coverage (max 15): ATS keyword presence in resume text
- Education Fit (max 15): degree status vs job's education requirement

You must score only the two remaining dimensions that require semantic understanding:

1. experience_relevance (0–30): How relevant is the candidate's actual work/project/research experience to the job's responsibilities and domain? Consider depth, recency, and quality of relevant experience.

2. overall_impression (0–10): Holistic assessment — career trajectory alignment, seniority fit, cultural signals, anything the other dimensions miss.

Also provide:
- pros: 3–5 specific strengths that align with this job
- cons: 2–4 gaps or weaknesses relative to the job requirements
- suggestions: 2–3 actionable steps the candidate can take to improve their fit

Scoring guidance for experience_relevance:
- 25–30: Experience directly matches job responsibilities with depth and recency
- 18–24: Strong overlap with most key responsibilities
- 10–17: Moderate overlap; some relevant experience but notable gaps
- 4–9: Limited relevance; tangential experience only
- 0–3: Very little relevant experience

Education requirement guidance (for qualitative feedback only — education_fit is already scored):
- If the job requires a completed degree and the candidate is still enrolled, mention it as a con but frame it constructively.
- If the job is open to students, treat in-progress education as a positive signal.

Return ONLY valid JSON:
{
  "experience_relevance": 22,
  "overall_impression": 7,
  "pros": ["specific strength 1", "specific strength 2"],
  "cons": ["specific gap 1", "specific gap 2"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"]
}`,
    user: `Algorithmic scores already computed:
- Skills Match: ${algorithmicScores.skillsMatch}/30
- Keyword Coverage: ${algorithmicScores.keywordCoverage}/15
- Education Fit: ${algorithmicScores.educationFit}/15

Candidate's experience blocks:

${blocks}${skillsProfile ? `\n\nCandidate's skills profile:\n\n${skillsProfile}` : ""}${candidateContext ? `\n\nCandidate context:\n${candidateContext}` : ""}

Job posting:

${jobPosting}

Score experience_relevance (0–30) and overall_impression (0–10), and provide pros/cons/suggestions. Return only JSON.`,
  };
}
