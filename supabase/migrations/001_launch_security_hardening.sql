-- Flink launch security hardening
-- Apply once to existing environments before deploying the matching application.

BEGIN;

-- Email is private authentication data. Keep it exclusively in auth.users so
-- public profile RLS can never disclose it through public.users.
ALTER TABLE public.users DROP COLUMN IF EXISTS email;

-- Remove legacy auto-published login emails while preserving email links that
-- use a different, explicitly supplied contact address.
DELETE FROM public.social_links AS links
USING auth.users AS accounts
WHERE links.user_id = accounts.id
  AND links.platform = 'email'
  AND LOWER(REGEXP_REPLACE(links.url, '^mailto:', '', 'i')) = LOWER(accounts.email);

CREATE TABLE IF NOT EXISTS public.reserved_handles (
  handle TEXT PRIMARY KEY
);

INSERT INTO public.reserved_handles (handle) VALUES
  ('settings'), ('help'), ('login'), ('signup'), ('register'),
  ('forgot-password'), ('reset-password'), ('privacy'), ('terms'),
  ('admin'), ('api'), ('app'), ('about'), ('blog'), ('contact'),
  ('dashboard'), ('flink'), ('home'), ('notifications'), ('friends'),
  ('search'), ('explore'), ('profile'), ('edit'), ('delete'),
  ('null'), ('undefined'), ('favicon.ico'), ('robots.txt'), ('sitemap.xml')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'impersonation', 'malicious_links', 'harassment', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);

CREATE TABLE IF NOT EXISTS public.support_requests (
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
  ON public.support_requests(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_reserved_handle()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.reserved_handles
    WHERE handle = LOWER(NEW.handle)
  ) THEN
    RAISE EXCEPTION 'Handle "%" is reserved', NEW.handle;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_reserved_handle ON public.flink_profiles;
CREATE TRIGGER enforce_reserved_handle
  BEFORE INSERT OR UPDATE OF handle ON public.flink_profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_reserved_handle();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flink_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserved_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy RECORD;
BEGIN
  FOR policy IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'flink_profiles', 'social_links', 'reserved_handles', 'reports', 'support_requests')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy.policyname, policy.tablename);
  END LOOP;
END;
$$;

CREATE POLICY "Anyone can read reserved handles" ON public.reserved_handles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can read own support requests" ON public.support_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- public.users now contains only public-safe metadata. Private email remains in
-- auth.users and is inaccessible through the public API.
CREATE POLICY "Anyone can read public user data" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flink_profiles
      WHERE flink_profiles.user_id = users.id
        AND flink_profiles.is_private = false
    )
  );

CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read public profiles" ON public.flink_profiles
  FOR SELECT USING (is_private = false);

CREATE POLICY "Owner can read own profile" ON public.flink_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.flink_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.flink_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read links for public profiles" ON public.social_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flink_profiles
      WHERE flink_profiles.user_id = social_links.user_id
        AND flink_profiles.is_private = false
    )
  );

CREATE POLICY "Owner can read own links" ON public.social_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON public.social_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON public.social_links
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON public.social_links
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.upsert_social_links(
  p_user_id UUID,
  p_links JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.social_links WHERE user_id = p_user_id;

  INSERT INTO public.social_links (
    user_id, platform, url, label, display_order, created_at, updated_at
  )
  SELECT
    p_user_id,
    elem->>'platform',
    elem->>'url',
    elem->>'label',
    COALESCE((elem->>'display_order')::int, 0),
    NOW(),
    NOW()
  FROM jsonb_array_elements(p_links) AS elem
  WHERE COALESCE(elem->>'url', '') <> '';
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_social_links(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_social_links(UUID, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_social_links(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.users WHERE id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

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

CREATE OR REPLACE FUNCTION public.submit_support_request(
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
    SELECT 1 FROM public.support_requests
    WHERE user_id = auth.uid()
      AND created_at > NOW() - INTERVAL '60 seconds'
  ) THEN
    RAISE EXCEPTION 'Please wait before sending another message';
  END IF;

  INSERT INTO public.support_requests (user_id, category, subject, message, priority)
  VALUES (auth.uid(), p_type, BTRIM(p_subject), BTRIM(p_message), p_priority)
  RETURNING id INTO request_id;

  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_support_request(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_support_request(TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_support_request(TEXT, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;
