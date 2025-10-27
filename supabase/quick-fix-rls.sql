-- QUICK FIX: Basic policies to get your app working
-- Copy and paste this entire block into Supabase SQL Editor

-- USERS TABLE: Allow all authenticated users to read (needed for displaying profiles)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read users"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own data"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- FLINK_PROFILES: Allow read for own profile and public profiles
CREATE POLICY IF NOT EXISTS "Users can read own profile"
ON flink_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can read public profiles"
ON flink_profiles FOR SELECT
TO authenticated
USING (NOT private OR user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON flink_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON flink_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- SOCIAL_LINKS: Allow read for own links and public profile links
CREATE POLICY IF NOT EXISTS "Users can read own social links"
ON social_links FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can read accessible social links"
ON social_links FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM flink_profiles 
    WHERE flink_profiles.user_id = social_links.user_id 
    AND NOT flink_profiles.private
  )
);

CREATE POLICY IF NOT EXISTS "Users can insert own social links"
ON social_links FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own social links"
ON social_links FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own social links"
ON social_links FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- CONNECTIONS TABLE
CREATE POLICY IF NOT EXISTS "Users can read own connections"
ON connections FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can create connections"
ON connections FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update own connections"
ON connections FOR UPDATE
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete own connections"
ON connections FOR DELETE
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

