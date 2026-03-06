export interface CoverLetter {
  id: string;
  user_id: string;
  job_posting_id: string | null;
  generated_resume_id: string | null;
  content: string;
  tone: "professional" | "conversational" | "enthusiastic";
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
}
