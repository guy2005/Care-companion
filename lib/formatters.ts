/**
 * Formats a raw phone string into Thai standard mobile phone format: 0XX-XXX-XXXX
 * Automatically inserts dashes after 3rd and 6th digits.
 * Handles backspace cleanly without trapping the user on dashes.
 * Limits to 10 digits (12 characters total with 2 dashes).
 */
export function formatPhoneNumber(input: string, prevValue: string = ''): string {
  // Strip all non-digit characters
  let cleaned = input.replace(/\D/g, '');
  
  // Convert international +66 prefix if pasted
  if (cleaned.startsWith('66') && cleaned.length > 10) {
    cleaned = '0' + cleaned.slice(2);
  }
  
  // Maximum 10 digits
  cleaned = cleaned.slice(0, 10);

  const isDeleting = prevValue.length > input.length;
  if (isDeleting) {
    // If user hit backspace right after a dash, remove the preceding digit too
    if (prevValue.endsWith('-') && input === prevValue.slice(0, -1)) {
      cleaned = cleaned.slice(0, -1);
    }
  }

  if (cleaned.length === 0) return '';

  if (cleaned.length <= 3) {
    return cleaned.length === 3 && !isDeleting ? `${cleaned}-` : cleaned;
  }

  if (cleaned.length <= 6) {
    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3);
    return cleaned.length === 6 && !isDeleting ? `${part1}-${part2}-` : `${part1}-${part2}`;
  }

  const part1 = cleaned.slice(0, 3);
  const part2 = cleaned.slice(3, 6);
  const part3 = cleaned.slice(6, 10);
  return `${part1}-${part2}-${part3}`;
}

/**
 * Validates if the phone number matches Thai mobile format: 0XX-XXX-XXXX
 * Exactly 10 digits and 2 dashes (12 characters in total).
 */
export function isValidPhoneNumber(phone: string): boolean {
  return /^0\d{2}-\d{3}-\d{4}$/.test(phone);
}
