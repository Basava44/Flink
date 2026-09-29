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
  name TEXT,
  profile_url TEXT,
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Existing installations may still have the legacy public email column.
-- Email is private authentication data and belongs only in auth.users.
ALTER TABLE users DROP COLUMN IF EXISTS email;

CREATE TABLE IF NOT EXISTS flink_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  bio TEXT,
  location TEXT,
  website TEXT,
  profile_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_since TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
  -- Multiple links per platform allowed (max enforced in app)
  -- label is used for custom links (platform='custom') to store user-provided title
);

-- Reserved handles - blocked at DB level
CREATE TABLE IF NOT EXISTS reserved_handles (
  handle TEXT PRIMARY KEY
);

INSERT INTO reserved_handles (handle) VALUES
  ('settings'), ('help'), ('login'), ('signup'), ('register'),
  ('forgot-password'), ('reset-password'), ('privacy'), ('terms'),
  ('admin'), ('api'), ('app'), ('about'), ('blog'), ('contact'),
  ('dashboard'), ('flink'), ('home'), ('notifications'), ('friends'),
  ('search'), ('explore'), ('profile'), ('edit'), ('delete'), ('analytics'),
  ('null'), ('undefined'), ('favicon.ico'), ('robots.txt'), ('sitemap.xml')
ON CONFLICT DO NOTHING;

-- Reports table for moderation
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'impersonation', 'malicious_links', 'harassment', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);

-- Authenticated support inbox with server-enforced rate limiting
CREATE TABLE IF NOT EXISTS support_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('question', 'bug_report', 'feature_request', 'feedback')),
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 160),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_user_created
  ON support_requests(user_id, created_at DESC);

-- ANALYTICS TABLES
-- ==============================================

CREATE TABLE IF NOT EXISTS profile_views (
  id BIGSERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES flink_profiles(id) ON DELETE CASCADE,
  visitor_id TEXT,          -- fingerprint hash for unique visitor tracking (no PII)
  referrer TEXT,
  country TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(profile_id, viewed_at DESC);

CREATE TABLE IF NOT EXISTS link_clicks (
  id BIGSERIAL PRIMARY KEY,
  link_id INTEGER NOT NULL REFERENCES social_links(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES flink_profiles(id) ON DELETE CASCADE,
  referrer TEXT,
  country TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_profile_id ON link_clicks(profile_id, clicked_at DESC);

-- 2. INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_flink_profiles_handle ON flink_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_flink_profiles_user_id ON flink_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);

-- 3. HANDLE RESERVATION CONSTRAINT
-- ==============================================
-- Prevents inserting/updating a handle that is reserved

CREATE OR REPLACE FUNCTION check_reserved_handle()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM reserved_handles WHERE handle = LOWER(NEW.handle)) THEN
    RAISE EXCEPTION 'Handle "%" is reserved', NEW.handle;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_reserved_handle ON flink_profiles;
CREATE TRIGGER enforce_reserved_handle
  BEFORE INSERT OR UPDATE OF handle ON flink_profiles
  FOR EACH ROW EXECUTE FUNCTION check_reserved_handle();

-- 4. ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flink_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL old/conflicting policies first
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'users', 'flink_profiles', 'social_links',
        'reserved_handles', 'reports', 'support_requests',
        'profile_views', 'link_clicks'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END;
$$;

-- RESERVED_HANDLES policies (read-only for everyone, no writes via API)
CREATE POLICY "Anyone can read reserved handles" ON reserved_handles
  FOR SELECT USING (true);

-- REPORTS policies
-- Authenticated users can submit reports
CREATE POLICY "Authenticated users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reporter_id);

-- Users can read their own submitted reports
CREATE POLICY "Users can read own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can read own support requests" ON support_requests
  FOR SELECT USING (auth.uid() = user_id);

-- USERS policies
-- Owner can read their own account metadata. Email remains private in auth.users.
CREATE POLICY "Users can read own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- public.users contains only public-safe profile metadata; email is stored only
-- in auth.users and is never exposed through this table.
CREATE POLICY "Anyone can read public user data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flink_profiles
      WHERE flink_profiles.user_id = users.id
      AND flink_profiles.is_private = false
    )
  );

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- FLINK_PROFILES policies
-- Anyone can read public profiles (core feature: shared link-in-bio)
CREATE POLICY "Anyone can read public profiles" ON flink_profiles
  FOR SELECT USING (is_private = false);

-- Owner can always read own profile (even if private)
CREATE POLICY "Owner can read own profile" ON flink_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON flink_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON flink_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SOCIAL_LINKS policies
-- Anyone can read links for public profiles
CREATE POLICY "Anyone can read links for public profiles" ON social_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flink_profiles
      WHERE flink_profiles.user_id = social_links.user_id
      AND flink_profiles.is_private = false
    )
  );

-- Owner can always read own links
CREATE POLICY "Owner can read own links" ON social_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON social_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON social_links
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON social_links
  FOR DELETE USING (auth.uid() = user_id);

-- PROFILE_VIEWS policies
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (public visitors trigger this)
CREATE POLICY "Anyone can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (true);

-- Profile owners can read their own analytics
CREATE POLICY "Profile owners can read own views" ON profile_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flink_profiles
      WHERE flink_profiles.id = profile_views.profile_id
      AND flink_profiles.user_id = auth.uid()
    )
  );

-- LINK_CLICKS policies
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a click (public visitors trigger this)
CREATE POLICY "Anyone can insert link clicks" ON link_clicks
  FOR INSERT WITH CHECK (true);

-- Profile owners can read their own click analytics
CREATE POLICY "Profile owners can read own clicks" ON link_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flink_profiles
      WHERE flink_profiles.id = link_clicks.profile_id
      AND flink_profiles.user_id = auth.uid()
    )
  );

-- 5. UPDATED_AT TRIGGER
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS flink_profiles_updated_at ON flink_profiles;
CREATE TRIGGER flink_profiles_updated_at
  BEFORE UPDATE ON flink_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS social_links_updated_at ON social_links;
CREATE TRIGGER social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. SAFE SOCIAL LINKS UPSERT (atomic replace)
-- ==============================================
-- Replaces the dangerous delete-then-insert pattern in Settings.
-- Deletes old links and inserts new ones in a single transaction.

CREATE OR REPLACE FUNCTION upsert_social_links(
  p_user_id UUID,
  p_links JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller owns these links
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Atomic delete + insert
  DELETE FROM social_links WHERE user_id = p_user_id;

  INSERT INTO social_links (user_id, platform, url, label, display_order, created_at, updated_at)
  SELECT
    p_user_id,
    elem->>'platform',
    elem->>'url',
    elem->>'label',
    COALESCE((elem->>'display_order')::int, 0),
    NOW(),
    NOW()
  FROM jsonb_array_elements(p_links) AS elem
  WHERE (elem->>'url') IS NOT NULL AND (elem->>'url') != '';
END;
$$;

REVOKE ALL ON FUNCTION upsert_social_links(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION upsert_social_links(UUID, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION upsert_social_links(UUID, JSONB) TO authenticated;

-- 7. STORAGE BUCKET (for profile pictures)
-- ==============================================
-- Create this manually in Supabase Dashboard > Storage:
-- Bucket name: avatars
-- Public: true
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 2MB

DROP POLICY IF EXISTS "Users can list own avatars" ON storage.objects;
CREATE POLICY "Users can list own avatars" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND owner_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND owner_id = (SELECT auth.uid()::text));

-- 8. ACCOUNT DELETION FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete from public.users (cascades to flink_profiles + social_links)
  DELETE FROM public.users WHERE id = auth.uid();

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION delete_user_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- 9. SUPPORT REQUEST FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION submit_support_request(
  p_type TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF EXISTS (
    SELECT 1 FROM support_requests
    WHERE user_id = auth.uid()
      AND created_at > NOW() - INTERVAL '60 seconds'
  ) THEN
    RAISE EXCEPTION 'Please wait before sending another message';
  END IF;

  INSERT INTO support_requests (user_id, category, subject, message, priority)
  VALUES (
    auth.uid(),
    p_type,
    BTRIM(p_subject),
    BTRIM(p_message),
    p_priority
  )
  RETURNING id INTO request_id;

  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION submit_support_request(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION submit_support_request(TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION submit_support_request(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 10. VERIFICATION
-- ==============================================

SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'flink_profiles', 'social_links', 'reserved_handles', 'reports', 'support_requests', 'profile_views', 'link_clicks');

SELECT tablename, policyname, cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'flink_profiles', 'social_links', 'reserved_handles', 'reports', 'support_requests', 'profile_views', 'link_clicks')
ORDER BY tablename, policyname;
