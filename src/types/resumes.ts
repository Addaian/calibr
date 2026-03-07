export interface TailoredBlock {
  block_id: string;
  type: string;
  title: string;
  organization: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  bullet_points: string[];
  technologies: string[];
  metadata?: Record<string, unknown>;
}

export interface TailoredContent {
  summary: string;
  blocks: TailoredBlock[];
}

export interface FitAnalysis {
  pros: string[];
  cons: string[];
  suggestions: string[];
}

export interface GeneratedResume {
  id: string;
  user_id: string;
  job_posting_id: string | null;
  name: string;
  template: string;
  source: "uploaded" | "generated";
  selected_block_ids: string[];
  tailored_content: TailoredContent;
  fit_score: number | null;
  fit_analysis: FitAnalysis | null;
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
}
