# Testing Flink RLS Security

Run these checks against a staging Supabase project after applying every
migration. Never weaken policies just to make a failing test pass.

## Required anonymous checks

Using the public anon key with no user session:

1. A public `flink_profiles` row can be read.
2. A private `flink_profiles` row cannot be read.
3. Social links for a public profile can be read.
4. Social links for a private profile cannot be read.
5. `public.users` exposes no `email` column.
6. Inserts into `reports` are rejected.
7. `upsert_social_links` and `delete_user_account` cannot be executed.

## Required authenticated checks

With two staging users, Alice and Bob:

1. Alice can read and update her own `users` and `flink_profiles` rows.
2. Alice cannot update Bob's rows or links.
3. Alice can replace only her own links through `upsert_social_links`.
4. Alice can submit a report whose `reporter_id` is Alice's ID.
5. Alice cannot submit a report using Bob's ID.
6. Account deletion removes only the authenticated caller.

## Policy inspection

```sql
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'flink_profiles', 'social_links', 'reserved_handles', 'reports'
  )
ORDER BY tablename, policyname;
```

## Function permission inspection

```sql
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE specific_schema = 'public'
  AND routine_name IN ('upsert_social_links', 'delete_user_account')
ORDER BY routine_name, grantee;
```

Only the `authenticated` role should have execute access to these two
security-definer functions. The `anon` and `PUBLIC` roles must not.
