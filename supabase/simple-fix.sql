-- Simple RLS Fix - Copy and paste this ENTIRE file into Supabase SQL Editor

-- Users table policies
CREATE POLICY temp_users_select ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY temp_users_insert ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY temp_users_update ON users FOR UPDATE TO authenticated USING (true);

-- Flink profiles table policies
CREATE POLICY temp_profiles_select ON flink_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY temp_profiles_insert ON flink_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY temp_profiles_update ON flink_profiles FOR UPDATE TO authenticated USING (true);

-- Social links table policies
CREATE POLICY temp_social_select ON social_links FOR SELECT TO authenticated USING (true);
CREATE POLICY temp_social_insert ON social_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY temp_social_update ON social_links FOR UPDATE TO authenticated USING (true);
CREATE POLICY temp_social_delete ON social_links FOR DELETE TO authenticated USING (true);

-- Connections table policies
CREATE POLICY temp_conn_select ON connections FOR SELECT TO authenticated USING (true);
CREATE POLICY temp_conn_insert ON connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY temp_conn_update ON connections FOR UPDATE TO authenticated USING (true);
CREATE POLICY temp_conn_delete ON connections FOR DELETE TO authenticated USING (true);

