-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  email        TEXT,
  phone        TEXT,
  linkedin_url TEXT,
  github_url   TEXT,
  portfolio_url TEXT,
  location     TEXT,
  summary      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"   ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- experience_blocks
-- ============================================================
CREATE TABLE IF NOT EXISTS experience_blocks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('work_experience','project','education','skill','volunteering')),
  title          TEXT NOT NULL,
  organization   TEXT,
  location       TEXT,
  start_date     DATE,
  end_date       DATE,
  description    TEXT,
  bullet_points  JSONB NOT NULL DEFAULT '[]',
  technologies   JSONB NOT NULL DEFAULT '[]',
  metadata       JSONB NOT NULL DEFAULT '{}',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS experience_blocks_user_id_idx ON experience_blocks(user_id);
CREATE INDEX IF NOT EXISTS experience_blocks_user_type_idx ON experience_blocks(user_id, type);

ALTER TABLE experience_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"   ON experience_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own blocks" ON experience_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blocks" ON experience_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own blocks" ON experience_blocks FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- job_postings
-- ============================================================
CREATE TABLE IF NOT EXISTS job_postings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url              TEXT,
  title            TEXT NOT NULL,
  company          TEXT,
  location         TEXT,
  employment_type  TEXT,
  salary_range     TEXT,
  description_raw  TEXT,
  required_skills  JSONB NOT NULL DEFAULT '[]',
  preferred_skills JSONB NOT NULL DEFAULT '[]',
  keywords         JSONB NOT NULL DEFAULT '[]',
  responsibilities JSONB NOT NULL DEFAULT '[]',
  company_info     JSONB NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','applied','interview','rejected','offer')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_postings_user_id_idx ON job_postings(user_id);
CREATE INDEX IF NOT EXISTS job_postings_user_status_idx ON job_postings(user_id, status);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"   ON job_postings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON job_postings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON job_postings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON job_postings FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- generated_resumes
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_resumes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id      UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  template            TEXT NOT NULL DEFAULT 'classic',
  selected_block_ids  JSONB NOT NULL DEFAULT '[]',
  tailored_content    JSONB NOT NULL,
  fit_score           INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  fit_analysis        JSONB DEFAULT '{}',
  pdf_storage_path    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generated_resumes_user_id_idx ON generated_resumes(user_id);
CREATE INDEX IF NOT EXISTS generated_resumes_job_id_idx ON generated_resumes(job_posting_id);

ALTER TABLE generated_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"   ON generated_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON generated_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON generated_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON generated_resumes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- cover_letters
-- ============================================================
CREATE TABLE IF NOT EXISTS cover_letters (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id       UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  generated_resume_id  UUID REFERENCES generated_resumes(id) ON DELETE SET NULL,
  content              TEXT NOT NULL,
  tone                 TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional','conversational','enthusiastic')),
  pdf_storage_path     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_job_id_idx ON cover_letters(job_posting_id);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cover letters"   ON cover_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cover letters" ON cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cover letters" ON cover_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cover letters" ON cover_letters FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Storage buckets (run these in Supabase dashboard or via CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cover-letters', 'cover-letters', false);
