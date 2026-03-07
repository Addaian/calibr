export function getFitScorePrompt(
  blocks: string,
  jobPosting: string,
  skillsProfile?: string,
  candidateContext?: string
): { system: string; user: string } {
  return {
    system: `You are a resume-job fit analyst. Evaluate how well a candidate's experience blocks match a job posting.

Provide:
1. A score from 0-100 representing overall fit
2. Pros - specific strengths that align with the job (3-5 items)
3. Cons - gaps or weaknesses relative to the job requirements (2-4 items)
4. Suggestions - actionable advice to improve fit (2-3 items)

Scoring guide:
- 90-100: Exceptional fit, meets nearly all requirements
- 70-89: Strong fit, meets most key requirements
- 50-69: Moderate fit, meets some requirements but has notable gaps
- 30-49: Weak fit, significant gaps in key areas
- 0-29: Poor fit, few relevant qualifications

Education requirement guidance:
- If the job requires a COMPLETED degree ("education_requirement": "completed") and the candidate is still enrolled, note this as a con but do not penalize more than 10-15 points — many such roles still consider strong candidates.
- If the job is open to students still enrolled ("education_requirement": "in_progress_ok"), treat in-progress education as a neutral or positive signal.
- If no education requirement is specified, do not penalize for in-progress education.

Return ONLY valid JSON:
{
  "score": 75,
  "pros": ["specific strength 1", "specific strength 2"],
  "cons": ["specific gap 1", "specific gap 2"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"]
}`,
    user: `Candidate's experience blocks:\n\n${blocks}${skillsProfile ? `\n\nCandidate's skills profile:\n\n${skillsProfile}` : ""}${candidateContext ? `\n\nCandidate context:\n${candidateContext}` : ""}\n\nJob posting:\n\n${jobPosting}\n\nAnalyze the fit and return only JSON.`,
  };
}
