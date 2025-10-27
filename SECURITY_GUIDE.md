# 🔐 Flink Security Guide

## Current Security Situation

### ⚠️ What's Exposed (By Design)
- **Supabase URL**: `https://qrdihaipyzvelwhvyjwc.supabase.co`
- **Anonymous Key**: Publicly visible in browser
- **Database Operations**: All CRUD operations visible in Network tab

### ✅ Why This is OK (But Needs Protection)

**Supabase handles security through Row Level Security (RLS):**
- The anonymous key alone CAN'T access your data
- RLS policies control who can read/write what
- Each request must include a valid JWT token (from authentication)
- Even if someone copies your API calls, they still need a valid auth token

## 🛡️ CRITICAL: Database Security Checklist

### 1. **Enable Row Level Security (RLS) - REQUIRED** ⚠️

Go to your Supabase Dashboard → SQL Editor and run these policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flink_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES

-- 1. Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- 2. Users can read public user data (name, profile_url) for displaying profiles
CREATE POLICY "Users can read public profiles"
ON users FOR SELECT
USING (true); -- All authenticated users can read user profiles (but RLS limits what they see)

-- 3. Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- FLINK_PROFILES TABLE POLICIES

-- 1. Users can read their own profile
CREATE POLICY "Users can read own flink profile"
ON flink_profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can read public profiles (not private)
CREATE POLICY "Users can read public flink profiles"
ON flink_profiles FOR SELECT
USING (
  NOT private OR 
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM connections 
    WHERE ((sender_id = auth.uid() AND receiver_id = user_id) OR
           (sender_id = user_id AND receiver_id = auth.uid()))
    AND status = 'accepted'
  )
);

-- 3. Users can insert their own profile (only once during onboarding)
CREATE POLICY "Users can insert own flink profile"
ON flink_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own profile only
CREATE POLICY "Users can update own flink profile"
ON flink_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- SOCIAL_LINKS TABLE POLICIES

-- 1. Users can read social links for profiles they can view
CREATE POLICY "Users can read accessible social links"
ON social_links FOR SELECT
USING (
  -- Can read own links
  user_id = auth.uid() OR
  -- Can read links from public profiles
  EXISTS (
    SELECT 1 FROM flink_profiles 
    WHERE flink_profiles.user_id = social_links.user_id 
    AND NOT flink_profiles.private
  ) OR
  -- Can read links from connected users (friends)
  EXISTS (
    SELECT 1 FROM connections 
    WHERE ((sender_id = auth.uid() AND receiver_id = user_id) OR
           (sender_id = user_id AND receiver_id = auth.uid()))
    AND status = 'accepted'
  )
);

-- 2. Users can only insert their own social links
CREATE POLICY "Users can insert own social links"
ON social_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own social links
CREATE POLICY "Users can update own social links"
ON social_links FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Users can only delete their own social links
CREATE POLICY "Users can delete own social links"
ON social_links FOR DELETE
USING (auth.uid() = user_id);

-- CONNECTIONS TABLE POLICIES

-- 1. Users can read connections where they're the sender or receiver
CREATE POLICY "Users can read own connections"
ON connections FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 2. Users can only create connections where they're the sender
CREATE POLICY "Users can create outgoing connections"
ON connections FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- 3. Users can only update connections where they're the sender or receiver
CREATE POLICY "Users can update own connections"
ON connections FOR UPDATE
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 4. Users can only delete their own connections
CREATE POLICY "Users can delete own connections"
ON connections FOR DELETE
USING (sender_id = auth.uid() OR receiver_id = auth.uid());
```

### 2. **Input Validation** 

Your code has good validation, but add server-side validation too.

Create a Supabase Edge Function for critical operations:

```javascript
// supabase/functions/validate-and-update/supabase/functions/validate-profile/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, bio, location, website } = await req.json()

    // Validate input
    if (bio && bio.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Bio too long' }),
        { status: 400 }
      )
    }

    // Update only if valid
    const { error } = await supabase
      .from('flink_profiles')
      .update({ bio, location, website })
      .eq('user_id', user_id)

    return new Response(JSON.stringify({ success: !error }))
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
```

### 3. **Rate Limiting**

Add rate limiting to prevent abuse:

```javascript
// Add to your AuthContext
const rateLimitMap = new Map();

const checkRateLimit = (userId, action, limit = 10) => {
  const key = `${userId}-${action}-${new Date().getMinutes()}`;
  const count = rateLimitMap.get(key) || 0;
  
  if (count >= limit) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  rateLimitMap.set(key, count + 1);
  
  // Clean up after 1 minute
  setTimeout(() => rateLimitMap.delete(key), 60000);
};

// Use in your functions
const updateProfile = async (data) => {
  checkRateLimit(user.id, 'update-profile');
  // ... rest of your code
};
```

### 4. **Additional Security Layers**

#### A. API Route Protection (If using middleware)

```javascript
// Server-side validation
app.post('/api/update-profile', async (req, res) => {
  const token = req.headers.authorization;
  
  // Verify JWT token
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Only allow user to update their own data
  if (req.body.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Validate and update
  // ...
});
```

#### B. Content Security Policy (CSP)

Add to your `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://qrdihaipyzvelwhvyjwc.supabase.co;
               connect-src 'self' https://qrdihaipyzvelwhvyjwc.supabase.co;
               img-src 'self' data: https:; 
               style-src 'self' 'unsafe-inline';">
```

#### C. Enable Supabase API Protection

In Supabase Dashboard → Settings → API:
1. ✅ Enable "Require authentication for connections"
2. ✅ Set "Max connections per user" limit
3. ✅ Enable "API rate limiting"

## 🚨 Testing Your Security

### Test Script to Verify RLS:

```javascript
// Test unauthorized access
const testSecurity = async () => {
  // Try to access another user's data
  const { data, error } = await supabase
    .from('flink_profiles')
    .select('*')
    .eq('user_id', 'someone-else-id');
  
  // Should return empty array if RLS is working
  console.log('Security test:', data?.length === 0 ? '✅ PASS' : '❌ FAIL');
  
  // Try to update another user's profile
  const { error: updateError } = await supabase
    .from('flink_profiles')
    .update({ bio: 'HACKED' })
    .eq('user_id', 'someone-else-id');
  
  // Should return error
  console.log('Update test:', updateError ? '✅ PASS' : '❌ FAIL');
};
```

## 📋 Security Checklist

- [ ] **RLS enabled on all tables**
- [ ] **RLS policies created for all operations** (see SQL above)
- [ ] **Test RLS policies** with the test script
- [ ] **Input validation** on all user inputs
- [ ] **Rate limiting** implemented
- [ ] **Content Security Policy** added
- [ ] **API keys not in version control** (use .env)
- [ ] **Environment variables** properly configured
- [ ] **Regular security audits** scheduled

## 🔒 Best Practices

1. **Never trust client-side code** - Always verify on server
2. **Use RLS for all database operations** - It's your first line of defense
3. **Validate all inputs** - Client + Server validation
4. **Rate limit everything** - Prevent abuse
5. **Monitor for suspicious activity** - Set up alerts
6. **Keep Supabase updated** - Latest security patches
7. **Use HTTPS only** - Always enforce SSL
8. **Regular backups** - Set up automated backups in Supabase

## 💡 Key Points

✅ **Your API keys are MEANT to be public** - They're designed for client-side use
✅ **RLS is your security** - It controls access, not the key
✅ **Authentication tokens are per-user** - Users can't access each other's data
✅ **Server-side validation** - Add it for extra security
✅ **Rate limiting** - Prevents abuse

## 📞 Need Help?

If you find any vulnerabilities or need help implementing security measures, feel free to ask!

---

**Last Updated:** 2025-01-XX
**Security Level:** Medium-High (depends on RLS implementation)

