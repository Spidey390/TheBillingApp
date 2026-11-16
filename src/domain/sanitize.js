/**
 * Security and form input sanitization helpers.
 * Prevents control character injection, BiDi override spoofing, and excessive string lengths.
 */

// Matches ASCII control characters except \t, \n, \r and unicode bidi overrides
const DANGEROUS_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E]/g;

export function sanitizeText(value, maxLength = 255) {
  if (value === null || value === undefined) return '';
  const cleaned = String(value)
    .normalize('NFKC')
    .replace(DANGEROUS_CHARS_REGEX, '')
    .trim();
  return maxLength && cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

export function sanitizeNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}
