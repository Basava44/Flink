import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schemaPath = new URL('../supabase/schema.sql', import.meta.url);
const migrationPath = new URL(
  '../supabase/migrations/001_launch_security_hardening.sql',
  import.meta.url
);
const storageMigrationPath = new URL(
  '../supabase/migrations/002_storage_api_account_deletion.sql',
  import.meta.url
);

const schema = await readFile(schemaPath, 'utf8');
const migration = await readFile(migrationPath, 'utf8');
const storageMigration = await readFile(storageMigrationPath, 'utf8');
const authContext = await readFile(
  new URL('../src/contexts/AuthContext.jsx', import.meta.url),
  'utf8'
);
const socialHandlesForm = await readFile(
  new URL('../src/components/SocialHandlesForm.jsx', import.meta.url),
  'utf8'
);
const settingsPage = await readFile(
  new URL('../src/pages/SettingsPage.jsx', import.meta.url),
  'utf8'
);
const profileSetupForm = await readFile(
  new URL('../src/components/ProfileSetupForm.jsx', import.meta.url),
  'utf8'
);
const privacyPolicy = await readFile(
  new URL('../src/pages/PrivacyPolicy.jsx', import.meta.url),
  'utf8'
);

test('public users table does not define an email column', () => {
  const usersTable = schema.match(/CREATE TABLE IF NOT EXISTS users \(([\s\S]*?)\n\);/i)?.[1];
  assert.ok(usersTable, 'users table definition must exist');
  assert.doesNotMatch(usersTable, /^\s*email\s+/im);
  assert.match(migration, /DROP COLUMN IF EXISTS email/i);
});

test('login email is not auto-published as a profile link', () => {
  assert.doesNotMatch(socialHandlesForm, /defaults\.email\s*=.*userEmail/i);
  assert.doesNotMatch(socialHandlesForm, /isEmailPrefilled/i);
  assert.match(socialHandlesForm, /placeholder=\{platform\.placeholder\}/i);
  assert.doesNotMatch(settingsPage, /Email cannot be edited/i);
  assert.match(settingsPage, /Your login email stays private/i);
  assert.match(
    migration,
    /DELETE FROM public\.social_links[\s\S]*?links\.platform = 'email'[\s\S]*?accounts\.email/i
  );
});

test('profile visibility controls are hidden until the feature is released', () => {
  assert.doesNotMatch(settingsPage, /Profile Visibility/i);
  assert.doesNotMatch(settingsPage, /Toggle profile visibility/i);
  assert.doesNotMatch(profileSetupForm, /Only you can see your profile/i);
  assert.doesNotMatch(profileSetupForm, /private:\s*!prev\.private/i);
  assert.doesNotMatch(privacyPolicy, /set your profile to private in Settings/i);
});

test('social-link RPC rejects a missing identity and restricts execution', () => {
  for (const sql of [schema, migration]) {
    assert.match(sql, /auth\.uid\(\) IS NULL OR auth\.uid\(\) <> p_user_id/i);
    assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?upsert_social_links\(UUID, JSONB\) FROM PUBLIC/i);
    assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?upsert_social_links\(UUID, JSONB\) FROM anon/i);
    assert.match(sql, /GRANT EXECUTE ON FUNCTION (?:public\.)?upsert_social_links\(UUID, JSONB\) TO authenticated/i);
  }
});

test('account deletion rejects anonymous callers and restricts execution', () => {
  for (const sql of [schema, migration, storageMigration]) {
    assert.match(sql, /IF auth\.uid\(\) IS NULL THEN[\s\S]*?RAISE EXCEPTION 'Not authorized'/i);
    assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?delete_user_account\(\) FROM PUBLIC/i);
    assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?delete_user_account\(\) FROM anon/i);
    assert.match(sql, /GRANT EXECUTE ON FUNCTION (?:public\.)?delete_user_account\(\) TO authenticated/i);
    assert.doesNotMatch(sql, /DELETE FROM storage\.objects/i);
  }
  assert.match(storageMigration, /owner_id = \(SELECT auth\.uid\(\)::text\)/i);
  assert.match(authContext, /\.from\("avatars"\)[\s\S]*?\.remove\(\[\.\.\.avatarPaths\]\)/i);
});

test('support requests require authentication, are rate limited, and restrict execution', () => {
  for (const sql of [schema, migration]) {
    assert.match(sql, /CREATE OR REPLACE FUNCTION (?:public\.)?submit_support_request/i);
    assert.match(sql, /auth\.uid\(\) IS NULL/i);
    assert.match(sql, /INTERVAL '60 seconds'/i);
    assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?submit_support_request\(TEXT, TEXT, TEXT, TEXT\) FROM PUBLIC/i);
    assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?submit_support_request\(TEXT, TEXT, TEXT, TEXT\) FROM anon/i);
    assert.match(sql, /GRANT EXECUTE ON FUNCTION (?:public\.)?submit_support_request\(TEXT, TEXT, TEXT, TEXT\) TO authenticated/i);
  }
});

test('a numbered production migration exists for launch hardening', () => {
  assert.match(migration, /BEGIN;/);
  assert.match(migration, /COMMIT;/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.reports/i);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.reserved_handles/i);
});
