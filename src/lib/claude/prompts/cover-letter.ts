export function getCoverLetterPrompt(
  blocks: string,
  jobPosting: string,
  tone: string
): { system: string; user: string } {
  const toneGuide = {
    professional:
      "Use a formal, polished tone. Focus on qualifications and value proposition.",
    conversational:
      "Use a warm, approachable tone while remaining professional. Show personality.",
    enthusiastic:
      "Use an energetic, passionate tone. Convey genuine excitement about the role and company.",
  }[tone] || "Use a formal, polished tone.";

  return {
    system: `You are an expert cover letter writer. Write a compelling cover letter that:

1. Opens with a strong hook mentioning the specific role and company
2. Highlights 2-3 most relevant experiences from the candidate's background
3. Connects the candidate's skills directly to the job requirements
4. Shows knowledge of the company (from the job posting context)
5. Closes with a confident call to action

Tone: ${toneGuide}

Format: Standard cover letter format with paragraphs. Do NOT include the date, address header, or "Dear Hiring Manager" - start directly with the opening paragraph. End before the signature/closing.

Return ONLY the cover letter text, no JSON wrapping.`,
    user: `Candidate's experience:\n\n${blocks}\n\nJob posting:\n\n${jobPosting}\n\nWrite the cover letter.`,
  };
}
