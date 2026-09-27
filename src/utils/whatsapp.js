// Validates a WhatsApp input and returns the resolved wa.me URL or null.

// Accepts:
//   - International phone number: digits with optional leading +, spaces/dashes/parens OK
//     Must have 7-15 digits (E.164 range)
//   - wa.me or whatsapp.com URL
// Rejects anything else (e.g. usernames like "basava44").

export function parseWhatsAppInput(raw) {
  const value = (raw || '').trim();
  if (!value) return null;

  // Existing WhatsApp link. Parse the URL and require an exact trusted host;
  // a substring check would accept attacker-controlled domains such as
  // evil.example/wa.me/123.
  if (/^(?:https?:\/\/)?(?:wa\.me|(?:api\.|www\.)?whatsapp\.com)(?:[/:?#]|$)/i.test(value)) {
    try {
      const candidate = new URL(
        /^https?:\/\//i.test(value) ? value : `https://${value}`
      );
      const allowedHosts = new Set([
        'wa.me',
        'whatsapp.com',
        'www.whatsapp.com',
        'api.whatsapp.com',
      ]);

      if (
        !allowedHosts.has(candidate.hostname.toLowerCase()) ||
        candidate.username ||
        candidate.password ||
        candidate.port ||
        !['http:', 'https:'].includes(candidate.protocol)
      ) {
        return null;
      }

      candidate.protocol = 'https:';
      return candidate.toString();
    } catch {
      return null;
    }
  }

  // Strip formatting chars allowed in phone numbers: spaces, dashes, parens, dots
  const cleaned = value.replace(/[\s\-().]/g, '');

  // Must be optional + followed by only digits
  if (!/^\+?\d+$/.test(cleaned)) return null;

  const digits = cleaned.replace(/^\+/, '');

  // E.164: 7-15 digits (country code + number)
  if (digits.length < 7 || digits.length > 15) return null;

  return `https://wa.me/${digits}`;
}

export function isValidWhatsAppInput(raw) {
  return parseWhatsAppInput(raw) !== null;
}
