export function getTailorPrompt(
  blocks: string,
  jobPosting: string,
  resumeTemplate?: string
): { system: string; user: string } {
  return {
    system: `You are an expert resume tailoring assistant. Your job is to take a set of experience blocks and a job posting, then produce an optimized resume by:

1. Selecting the most relevant blocks for this specific job
2. Reordering them for maximum impact (most relevant first within each category)
3. Rewriting bullet points to naturally incorporate keywords and skills from the job posting
4. Generating a professional summary tailored to this role

Rules:
- Keep rewritten bullet points truthful - enhance wording and emphasis, don't fabricate experiences
- Naturally integrate job-relevant keywords without keyword stuffing
- Maintain professional tone and active voice
- Each bullet point should start with a strong action verb
- Quantify achievements where the original data supports it
- Drop blocks that are completely irrelevant to the role

Return ONLY valid JSON matching this exact schema:
{
  "summary": "A 2-3 sentence professional summary tailored to this role",
  "blocks": [
    {
      "block_id": "original block UUID",
      "type": "work_experience|project|education|skill|volunteering",
      "title": "original or slightly refined title",
      "organization": "original organization or null",
      "start_date": "original date or null",
      "end_date": "original date or null",
      "bullet_points": ["rewritten bullet 1", "rewritten bullet 2"],
      "technologies": ["relevant tech from original"]
    }
  ]
}`,
    user: `Here are the experience blocks:\n\n${blocks}\n\nHere is the job posting:\n\n${jobPosting}${resumeTemplate ? `\n\nHere is an example of the user's existing resume. Use it as a stylistic reference — mirror the tone, phrasing style, and level of detail in the bullet points:\n\n${resumeTemplate}` : ""}\n\nTailor the resume by selecting the best blocks and rewriting bullet points to match this job. Return only JSON.`,
  };
}
