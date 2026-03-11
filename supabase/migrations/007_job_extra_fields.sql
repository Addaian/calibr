ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS notes          TEXT,
  ADD COLUMN IF NOT EXISTS source         TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_name TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_email TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_date DATE,
  ADD COLUMN IF NOT EXISTS priority       SMALLINT CHECK (priority BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS offer_amount   TEXT;
