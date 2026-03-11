ALTER TABLE generated_resumes
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'generated';

ALTER TABLE generated_resumes
  ADD CONSTRAINT generated_resumes_source_check
  CHECK (source IN ('uploaded', 'generated'));
