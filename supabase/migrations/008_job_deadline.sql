ALTER TABLE job_postings ADD COLUMN deadline DATE;

CREATE INDEX idx_job_postings_deadline ON job_postings (user_id, deadline)
  WHERE deadline IS NOT NULL;
