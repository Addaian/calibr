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
  status:
    | "active"
    | "applying"
    | "applied"
    | "screening"
    | "interview"
    | "assessment"
    | "final_round"
    | "offer"
    | "negotiating"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "ghosted"
    | "declined";
  status_date: string | null;
  notes: string | null;
  source: string | null;
  recruiter_name: string | null;
  recruiter_email: string | null;
  follow_up_date: string | null;
  priority: 1 | 2 | 3 | null;
  offer_amount: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateJobInput = Omit<
  JobPosting,
  "id" | "user_id" | "created_at" | "updated_at"
>;
