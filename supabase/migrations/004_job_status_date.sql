-- Track when a job's status changed
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS status_date DATE;
