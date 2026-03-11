CREATE TABLE interview_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  round_number SMALLINT NOT NULL DEFAULT 1,
  round_type TEXT NOT NULL CHECK (round_type IN (
    'online_assessment', 'phone_screen', 'technical', 'behavioral',
    'system_design', 'team_match', 'hiring_manager', 'other'
  )),
  scheduled_at TIMESTAMPTZ,
  duration_minutes SMALLINT,
  location TEXT,
  interviewer_name TEXT,
  notes TEXT,
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'passed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE interview_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interview rounds"
  ON interview_rounds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_interview_rounds_job ON interview_rounds (job_posting_id, round_number);
CREATE INDEX idx_interview_rounds_user ON interview_rounds (user_id, scheduled_at);
