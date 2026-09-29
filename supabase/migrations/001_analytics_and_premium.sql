-- ==============================================
-- MIGRATION: Analytics tables + Premium flag
-- ==============================================
-- Run this on existing Supabase projects that already have the base schema.
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ==============================================

-- 1. Add premium fields to flink_profiles
ALTER TABLE flink_profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 2. Profile views table
CREATE TABLE IF NOT EXISTS profile_views (
  id BIGSERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES flink_profiles(id) ON DELETE CASCADE,
  visitor_id TEXT,
  referrer TEXT,
  country TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(profile_id, viewed_at DESC);

-- 3. Link clicks table
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

-- 4. RLS policies
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public visitors)
CREATE POLICY "Anyone can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert link clicks" ON link_clicks
  FOR INSERT WITH CHECK (true);

-- Only profile owners can read their analytics
CREATE POLICY "Profile owners can read own views" ON profile_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flink_profiles
      WHERE flink_profiles.id = profile_views.profile_id
      AND flink_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Profile owners can read own clicks" ON link_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flink_profiles
      WHERE flink_profiles.id = link_clicks.profile_id
      AND flink_profiles.user_id = auth.uid()
    )
  );

-- 5. Reserve 'analytics' handle
INSERT INTO reserved_handles (handle) VALUES ('analytics') ON CONFLICT DO NOTHING;
