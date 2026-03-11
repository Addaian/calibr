export function getScrapeJobPrompt(cleanedText: string): string {
  return `You are a job posting parser. Extract structured information from the following job posting text.

Return a JSON object with the following fields:
- "title" (string): The job title. This field is required.
- "company" (string | null): The company name, or null if not found.
- "location" (string | null): The job location, or null if not found.
- "employment_type" (string | null): e.g. "Full-time", "Part-time", "Contract", "Internship", or null if not found.
- "salary_range" (string | null): The salary or compensation range as a string, or null if not found.
- "required_skills" (string[]): An array of required skills, qualifications, or technologies. Use an empty array if none are found.
- "preferred_skills" (string[]): An array of preferred or nice-to-have skills. Use an empty array if none are found.
- "keywords" (string[]): Important terms, technologies, frameworks, and domain-specific keywords from the posting. Use an empty array if none are found.
- "responsibilities" (string[]): Key job responsibilities or duties. Use an empty array if none are found.
- "company_info" (object): An object with optional fields:
  - "industry" (string | undefined): The industry the company operates in.
  - "size" (string | undefined): The company size if mentioned.
  - "about" (string | undefined): A brief description of the company.
- "education_requirement" ("completed" | "in_progress_ok" | "none" | null): Whether the role requires a finished degree or accepts candidates currently enrolled:
  - "completed": Job explicitly requires a completed/awarded bachelor's degree (e.g. "Bachelor's degree required", "must have a BS/BA").
  - "in_progress_ok": Job is open to students still pursuing their degree (e.g. internships, "currently enrolled", "pursuing a degree", "expected graduation", "rising junior/senior", new-grad roles that list an expected grad year).
  - "none": Job posting explicitly states no degree is required.
  - null: Education requirement is not mentioned or unclear.
- "deadline" (string | null): The application deadline or closing date as an ISO 8601 date string (YYYY-MM-DD), or null if not mentioned. Look for phrases like "apply by", "application deadline", "closes on", "last day to apply".

Rules:
- Return ONLY valid JSON, no markdown, no code fences, no extra text.
- For missing or unclear fields, use null for nullable strings and empty arrays for array fields.
- Keep skill and keyword entries concise (1-4 words each).
- Deduplicate skills and keywords.
- Responsibilities should be clear, concise sentences.

Job posting text:
${cleanedText}`;
}
