export type RoundType =
  | "online_assessment"
  | "phone_screen"
  | "technical"
  | "behavioral"
  | "system_design"
  | "team_match"
  | "hiring_manager"
  | "other";

export type RoundOutcome = "pending" | "passed" | "failed" | "cancelled";

export interface InterviewRound {
  id: string;
  user_id: string;
  job_posting_id: string;
  round_number: number;
  round_type: RoundType;
  scheduled_at: string | null;
  duration_minutes: number | null;
  location: string | null;
  interviewer_name: string | null;
  notes: string | null;
  outcome: RoundOutcome;
  created_at: string;
  updated_at: string;
}

export const ROUND_TYPE_LABELS: Record<RoundType, string> = {
  online_assessment: "Online Assessment",
  phone_screen: "Phone Screen",
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
  team_match: "Team Match",
  hiring_manager: "Hiring Manager",
  other: "Other",
};

export const OUTCOME_LABELS: Record<RoundOutcome, string> = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
  cancelled: "Cancelled",
};
