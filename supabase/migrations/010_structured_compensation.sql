ALTER TABLE job_postings ADD COLUMN compensation JSONB DEFAULT NULL;

COMMENT ON COLUMN job_postings.compensation IS
  'Structured compensation: { base?, signing_bonus?, rsus?, rsu_vest_years?, relocation?, other?, currency? }';
