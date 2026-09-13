-- ==============================================
-- FLINK v2 - COMPLETE DATABASE SCHEMA
-- ==============================================
-- Run this in a fresh Supabase project:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ==============================================

-- 1. TABLES
-- ==============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  profile_url TEXT,
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flink_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  bio TEXT,
  location TEXT,
  website TEXT,
  profile_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Multiple links per platform allowed (max 3 enforced in app)
);

-- 2. INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_flink_profiles_handle ON flink_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_flink_profiles_user_id ON flink_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);

-- 3. ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flink_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Anyone can read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- FLINK_PROFILES policies
-- Public profiles readable by everyone (including anonymous for shared links)
CREATE POLICY "Anyone can read profiles" ON flink_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON flink_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON flink_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- SOCIAL_LINKS policies
-- Public social links readable by everyone (the whole point of the app)
CREATE POLICY "Anyone can read social links" ON social_links
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own links" ON social_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON social_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON social_links
  FOR DELETE USING (auth.uid() = user_id);

-- 4. UPDATED_AT TRIGGER
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER flink_profiles_updated_at
  BEFORE UPDATE ON flink_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. STORAGE BUCKET (for profile pictures)
-- ==============================================
-- Create this manually in Supabase Dashboard > Storage:
-- Bucket name: avatars
-- Public: true
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 2MB

-- 6. VERIFICATION
-- ==============================================

SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'flink_profiles', 'social_links');
