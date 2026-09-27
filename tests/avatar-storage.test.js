import test from 'node:test';
import assert from 'node:assert/strict';
import { getAvatarStoragePath } from '../src/utils/avatarStorage.js';

test('extracts an avatar object path from a Supabase public URL', () => {
  assert.equal(
    getAvatarStoragePath(
      'https://project.supabase.co/storage/v1/object/public/avatars/user-id/avatar%20one.webp?download=1'
    ),
    'user-id/avatar one.webp'
  );
});

test('extracts mock avatar paths and rejects unrelated URLs', () => {
  assert.equal(
    getAvatarStoragePath('/mock-storage/avatars/user-id/avatar.png'),
    'user-id/avatar.png'
  );
  assert.equal(getAvatarStoragePath('https://example.com/avatar.png'), null);
  assert.equal(getAvatarStoragePath(null), null);
});
