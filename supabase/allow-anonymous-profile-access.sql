-- Allow Anonymous Users to View Public Profiles
-- This allows non-logged-in users to view public profiles

-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can read public flink profiles" ON flink_profiles;

-- Create a new policy that allows both authenticated AND anonymous users to read public profiles
CREATE POLICY "Anyone can read public flink profiles"
ON flink_profiles FOR SELECT
USING (
  -- Own profile (for authenticated users)
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Public profiles (visible to everyone including anonymous)
  NOT private OR
  -- Connected users (for authenticated users who are friends)
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM connections 
    WHERE ((sender_id = auth.uid() AND receiver_id = flink_profiles.user_id) OR
           (sender_id = flink_profiles.user_id AND receiver_id = auth.uid()))
    AND status = 'accepted'
  ))
);

-- Also update the users table policy to allow reading public user data
DROP POLICY IF EXISTS "Users can read public profiles" ON users;

CREATE POLICY "Anyone can read public user data"
ON users FOR SELECT
USING (true); -- Anyone (authenticated or not) can read public user data

-- Update social_links policy to allow reading social links for public profiles
DROP POLICY IF EXISTS "Users can read accessible social links" ON social_links;

CREATE POLICY "Anyone can read social links for public profiles"
ON social_links FOR SELECT
USING (
  -- Own links (for authenticated users)
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Social links for public profiles (visible to everyone)
  EXISTS (
    SELECT 1 FROM flink_profiles 
    WHERE flink_profiles.user_id = social_links.user_id 
    AND NOT flink_profiles.private
  ) OR
  -- Social links for profiles accessible to the viewer (authenticated users)
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM flink_profiles 
    WHERE flink_profiles.user_id = social_links.user_id 
    AND (NOT flink_profiles.private OR
         EXISTS (
           SELECT 1 FROM connections 
           WHERE ((sender_id = auth.uid() AND receiver_id = flink_profiles.user_id) OR
                  (sender_id = flink_profiles.user_id AND receiver_id = auth.uid()))
           AND status = 'accepted'
         ))
  ))
);

