export function getCoverLetterPrompt(
  blocks: string,
  jobPosting: string,
  tone: string,
  candidateName?: string
): { system: string; user: string } {
  const toneGuide = {
    professional:
      "Use a formal, polished tone. Focus on qualifications and value proposition.",
    conversational:
      "Use a warm, approachable tone while remaining professional. Show personality.",
    enthusiastic:
      "Use an energetic, passionate tone. Convey genuine excitement about the role and company.",
  }[tone] || "Use a formal, polished tone.";

  const signOff = candidateName
    ? `Best,\n\n${candidateName}`
    : "Best,\n\n[Your Name]";

  return {
    system: `You are an expert cover letter writer. Write a complete, properly formatted cover letter that:

1. Opens with a salutation addressed to the company's recruitment team — e.g. "Dear [Company Name] Recruitment Team," — using the company name from the job posting. If no company is found, use "Dear Hiring Team,".
2. Opens the first paragraph with a strong hook mentioning the specific role and company
3. Highlights 2-3 most relevant experiences from the candidate's background
4. Connects the candidate's skills directly to the job requirements
5. Shows knowledge of the company (from the job posting context)
6. Closes with a confident call to action paragraph
7. Ends with exactly this sign-off on its own lines:\n\n${signOff}

Tone: ${toneGuide}

Format: Full cover letter — salutation, body paragraphs, then the sign-off. Do NOT include a date or mailing address header.

Return ONLY the cover letter text, no JSON wrapping.`,
    user: `Candidate's experience:\n\n${blocks}\n\nJob posting:\n\n${jobPosting}\n\nWrite the cover letter.`,
  };
}
