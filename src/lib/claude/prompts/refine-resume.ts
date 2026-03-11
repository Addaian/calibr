import type { TailoredContent } from "@/types/resumes";

export function getRefineResumePrompt(
  currentContent: TailoredContent,
  userRequest: string
): { system: string; user: string } {
  return {
    system: `You are a resume editor. The user has a tailored resume and wants to make specific edits. Apply their request precisely while keeping all other content unchanged.

Rules:
- Only modify what the user explicitly asks to change
- Keep all other blocks, bullet points, and content exactly as-is
- Maintain professional tone and active voice
- Keep bullet points truthful — do not fabricate experiences
- Preserve all block_id, type, organization, location, start_date, end_date, technologies, and metadata fields exactly unless the user asks to change them

Return ONLY valid JSON matching this exact schema:
{
  "summary": "the summary (modified only if requested)",
  "blocks": [
    {
      "block_id": "original block UUID",
      "type": "work_experience|project|education|skill|volunteering|research",
      "title": "title",
      "organization": "organization or null",
      "location": "location or null",
      "start_date": "date or null",
      "end_date": "date or null",
      "bullet_points": ["bullet 1", "bullet 2"],
      "technologies": ["tech"],
      "metadata": {}
    }
  ]
}`,
    user: `Current resume content:\n\n${JSON.stringify(currentContent, null, 2)}\n\nUser's request: ${userRequest}\n\nApply the request and return the updated resume JSON only.`,
  };
}
