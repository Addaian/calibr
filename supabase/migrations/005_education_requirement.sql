ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS education_requirement TEXT
  CHECK (education_requirement IN ('completed', 'in_progress_ok', 'none'));
