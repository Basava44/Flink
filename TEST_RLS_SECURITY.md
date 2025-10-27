# Testing RLS Security - Browser Console Commands

## Quick Test After Running RLS Policies

Open your browser console (F12) and paste ONE of these tests:

### Method 1: If Supabase is available in window

```javascript
// Check if supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  const { data } = await window.supabase
    .from('flink_profiles')
    .select('*')
    .single();
  console.log(data ? '✅ Working!' : '❌ Blocked');
}
```

### Method 2: Direct import (if using ES modules)

```javascript
// Try importing
import { supabase } from './src/lib/supabase.js';

const { data } = await supabase
  .from('flink_profiles')
  .select('*')
  .single();

console.log(data ? '✅ Working!' : '❌ Blocked');
```

### Method 3: Access from React component (Best)

Instead of using console, just refresh your app and see if:
1. Profile loads ✅
2. Social links show ✅
3. Settings page loads ✅

## What to Look For

### ✅ Working (RLS policies are good):
- Profile loads without errors
- Social links display
- You can view your own data
- You can update your settings

### ❌ Still Broken (need to adjust policies):
- Error: "PGRST116" or "0 rows"
- Error: "new row violates row-level security policy"
- Profile won't load
- Can't access any data

## Check Your Current Policies

Run this in SQL Editor in Supabase:

```sql
-- Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'flink_profiles', 'social_links', 'connections')
ORDER BY tablename, policyname;
```

Should show at least:
- users: 3 policies (SELECT, INSERT, UPDATE)
- flink_profiles: 4 policies (SELECT x2, INSERT, UPDATE)
- social_links: 4 policies (SELECT x2, INSERT, UPDATE, DELETE)
- connections: 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Fix if Still Not Working

If you still get errors, run this **REPLACEMENT** for the users table:

```sql
-- Drop the existing policy
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;

-- Create a simpler policy
CREATE POLICY "Allow all authenticated users to read users"
ON users FOR SELECT
TO authenticated
USING (true);

-- Also allow inserts (for new user signup)
CREATE POLICY "Allow all authenticated users to insert"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);

-- And updates (for profile updates)
CREATE POLICY "Allow users to update any user"
ON users FOR UPDATE
TO authenticated
USING (true);
```

**NOTE:** This makes users table fully accessible - it's less secure but gets you running. You can tighten it later once you verify everything works.

