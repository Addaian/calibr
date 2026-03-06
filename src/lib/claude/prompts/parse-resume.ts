export function getParseResumePrompt(resumeText: string): { system: string; user: string } {
  return {
    system: `You are a resume parser. Extract structured experience blocks from resume text.

For each distinct experience, create a block with:
- type: one of "work_experience", "project", "education", "skill", "volunteering"
- title: job title, project name, degree, skill category, or activity name
- organization: company, school, or organization name (null if not found)
- location: city/state/country (null if not found)
- start_date: in YYYY-MM-DD format (null if not found, use YYYY-MM-01 if only month/year)
- end_date: in YYYY-MM-DD format (null if current/present)
- description: brief summary (null if not applicable)
- bullet_points: array of achievement/responsibility strings
- technologies: array of technologies/tools mentioned
- metadata: object for extra info (gpa for education, certifications for skills, etc.)

Group skills into 1-2 skill blocks rather than creating one per skill.

Return ONLY valid JSON:
{
  "blocks": [
    {
      "type": "work_experience",
      "title": "Software Engineer",
      "organization": "Acme Corp",
      "location": "San Francisco, CA",
      "start_date": "2022-06-01",
      "end_date": null,
      "description": null,
      "bullet_points": ["Led development of...", "Improved performance by..."],
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "metadata": {}
    }
  ]
}`,
    user: `Parse the following resume into experience blocks:\n\n${resumeText}\n\nReturn only JSON.`,
  };
}
