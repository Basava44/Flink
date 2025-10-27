-- Allow Everyone (Including Anonymous Users) to View ALL Profiles
-- This allows non-logged-in users to view both public AND private profiles

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can read public flink profiles" ON flink_profiles;
DROP POLICY IF EXISTS "Anyone can read public flink profiles" ON flink_profiles;

-- Create a policy that allows everyone to read ALL profiles
CREATE POLICY "Everyone can read all flink profiles"
ON flink_profiles FOR SELECT
USING (true); -- Anyone (authenticated or not) can read all profiles

-- Update users table policy to allow reading all user data
DROP POLICY IF EXISTS "Users can read public profiles" ON users;
DROP POLICY IF EXISTS "Anyone can read public user data" ON users;

CREATE POLICY "Everyone can read all user data"
ON users FOR SELECT
USING (true); -- Anyone can read all user data

-- Update social_links policy to allow reading all social links
DROP POLICY IF EXISTS "Users can read accessible social links" ON social_links;
DROP POLICY IF EXISTS "Anyone can read social links for public profiles" ON social_links;

CREATE POLICY "Everyone can read all social links"
ON social_links FOR SELECT
USING (true); -- Anyone can read all social links

