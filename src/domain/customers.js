export function normalizePhone(value = '') {
  const input = value.trim();
  if (/[^\d+().\s-]/.test(input)) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10 && !input.startsWith('+')) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  if (input.startsWith('+') && digits.length >= 8 && digits.length <= 15) return '+' + digits;
  return '';
}
