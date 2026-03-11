-- Add 'research' to the allowed block types
ALTER TABLE experience_blocks
  DROP CONSTRAINT IF EXISTS experience_blocks_type_check;

ALTER TABLE experience_blocks
  ADD CONSTRAINT experience_blocks_type_check
  CHECK (type IN ('work_experience','project','education','skill','volunteering','research'));
