import test from 'node:test';
import assert from 'node:assert/strict';

import { parseWhatsAppInput } from '../src/utils/whatsapp.js';

test('normalizes international phone numbers', () => {
  assert.equal(parseWhatsAppInput('+91 98765 43210'), 'https://wa.me/919876543210');
});

test('rejects usernames and invalid phone lengths', () => {
  assert.equal(parseWhatsAppInput('basava44'), null);
  assert.equal(parseWhatsAppInput('12345'), null);
  assert.equal(parseWhatsAppInput('1234567890123456'), null);
});

test('accepts only exact WhatsApp hosts', () => {
  assert.equal(parseWhatsAppInput('wa.me/919876543210'), 'https://wa.me/919876543210');
  assert.equal(
    parseWhatsAppInput('https://api.whatsapp.com/send?phone=919876543210'),
    'https://api.whatsapp.com/send?phone=919876543210'
  );
  assert.equal(parseWhatsAppInput('https://evil.example/wa.me/1234567'), null);
  assert.equal(parseWhatsAppInput('https://wa.me.evil.example/1234567'), null);
  assert.equal(parseWhatsAppInput('https://user@wa.me/1234567'), null);
});
