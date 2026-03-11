-- Move skills from experience_blocks to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '[]';
