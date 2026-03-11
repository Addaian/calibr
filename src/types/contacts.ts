export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
  linkedin_url: string | null;
  last_contacted_at: string | null;
  job_posting_id: string | null;
  created_at: string;
  updated_at: string;
}
