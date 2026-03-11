-- Drop the old CHECK constraint and replace with expanded status values
ALTER TABLE job_postings
  DROP CONSTRAINT IF EXISTS job_postings_status_check;

ALTER TABLE job_postings
  ADD CONSTRAINT job_postings_status_check CHECK (
    status IN (
      'active', 'applying', 'applied', 'screening',
      'interview', 'assessment', 'final_round',
      'offer', 'negotiating', 'accepted',
      'rejected', 'withdrawn', 'ghosted', 'declined'
    )
  );
