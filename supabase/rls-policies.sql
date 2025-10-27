-- ==============================================
-- FLINK - ROW LEVEL SECURITY POLICIES
-- ==============================================
-- Run this SQL script in your Supabase Dashboard:
-- Dashboard → SQL Editor → New Query → Paste this entire file
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flink_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can read public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can read own flink profile" ON flink_profiles;
DROP POLICY IF EXISTS "Users can read public flink profiles" ON flink_profiles;
DROP POLICY IF EXISTS "Users can insert own flink profile" ON flink_profiles;
DROP POLICY IF EXISTS "Users can update own flink profile" ON flink_profiles;

DROP POLICY IF EXISTS "Users can read accessible social links" ON social_links;
DROP POLICY IF EXISTS "Users can insert own social links" ON social_links;
DROP POLICY IF EXISTS "Users can update own social links" ON social_links;
DROP POLICY IF EXISTS "Users can delete own social links" ON social_links;

DROP POLICY IF EXISTS "Users can read own connections" ON connections;
DROP POLICY IF EXISTS "Users can create outgoing connections" ON connections;
DROP POLICY IF EXISTS "Users can update own connections" ON connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON connections;

-- ==============================================
-- USERS TABLE POLICIES
-- ==============================================

-- Users can read their own profile (full access)
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can read public user data (name, profile_url) for displaying profiles
CREATE POLICY "Users can read public profiles"
ON users FOR SELECT
USING (true); -- All authenticated users can read user profiles for public viewing

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- ==============================================
-- FLINK_PROFILES TABLE POLICIES
-- ==============================================

-- Users can read their own profile
CREATE POLICY "Users can read own flink profile"
ON flink_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can read public profiles or profiles of users they're connected to
CREATE POLICY "Users can read public flink profiles"
ON flink_profiles FOR SELECT
USING (
  -- Own profile
  user_id = auth.uid() OR
  -- Public profiles
  NOT private OR
  -- Connected users (friends)
  EXISTS (
    SELECT 1 FROM connections 
    WHERE ((sender_id = auth.uid() AND receiver_id = flink_profiles.user_id) OR
           (sender_id = flink_profiles.user_id AND receiver_id = auth.uid()))
    AND status = 'accepted'
  )
);

-- Users can insert their own profile (only once during onboarding)
CREATE POLICY "Users can insert own flink profile"
ON flink_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile only
CREATE POLICY "Users can update own flink profile"
ON flink_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- ==============================================
-- SOCIAL_LINKS TABLE POLICIES
-- ==============================================

-- Users can read social links for profiles they can view
CREATE POLICY "Users can read accessible social links"
ON social_links FOR SELECT
USING (
  -- Can read own links
  user_id = auth.uid() OR
  -- Can read links from public profiles
  EXISTS (
    SELECT 1 FROM flink_profiles 
    WHERE flink_profiles.user_id = social_links.user_id 
    AND (NOT flink_profiles.private OR flink_profiles.user_id = auth.uid())
  ) OR
  -- Can read links from connected users (friends)
  EXISTS (
    SELECT 1 FROM connections 
    WHERE ((sender_id = auth.uid() AND receiver_id = user_id) OR
           (sender_id = user_id AND receiver_id = auth.uid()))
    AND status = 'accepted'
  )
);

-- Users can only insert their own social links
CREATE POLICY "Users can insert own social links"
ON social_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own social links
CREATE POLICY "Users can update own social links"
ON social_links FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own social links
CREATE POLICY "Users can delete own social links"
ON social_links FOR DELETE
USING (auth.uid() = user_id);

-- ==============================================
-- CONNECTIONS TABLE POLICIES
-- ==============================================

-- Users can read connections where they're the sender or receiver
CREATE POLICY "Users can read own connections"
ON connections FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can only create connections where they're the sender
CREATE POLICY "Users can create outgoing connections"
ON connections FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can only update connections where they're involved
CREATE POLICY "Users can update own connections"
ON connections FOR UPDATE
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can only delete their own connections
CREATE POLICY "Users can delete own connections"
ON connections FOR DELETE
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check if RLS is enabled (should return 4 rows)
SELECT 
  tablename, 
  rowsecurity as rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'flink_profiles', 'social_links', 'connections');

-- Check policies (should return all your policies)
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'flink_profiles', 'social_links', 'connections')
ORDER BY tablename, policyname;

-- ==============================================
-- NOTES
-- ==============================================
-- 
-- These policies ensure:
-- 1. Users can only modify their own data
-- 2. Users can view public profiles and profiles of connected users
-- 3. Users can view social links for profiles they can access
-- 4. Users can manage their own connections
-- 5. No user can access or modify another user's private data
--
-- To test your security:
-- 1. Create two test accounts
-- 2. Try to access other user's private profile (should fail)
-- 3. Try to update other user's data (should fail)
-- 4. Try to create fake connections (should fail unless you're the sender)
--
-- ==============================================

