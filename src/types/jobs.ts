export interface JobPosting {
  id: string;
  user_id: string;
  url: string | null;
  title: string;
  company: string | null;
  location: string | null;
  employment_type: string | null;
  salary_range: string | null;
  description_raw: string | null;
  required_skills: string[];
  preferred_skills: string[];
  keywords: string[];
  responsibilities: string[];
  company_info: {
    industry?: string;
    size?: string;
    about?: string;
  };
  education_requirement: "completed" | "in_progress_ok" | "none" | null;
  status: "active" | "applied" | "interview" | "rejected" | "offer";
  status_date: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateJobInput = Omit<
  JobPosting,
  "id" | "user_id" | "created_at" | "updated_at"
>;
