const REFERRAL_REGEX = /^[A-Z0-9_-]{2,32}$/;

/**
 * Normalizes an incoming referral code candidate:
 * - Trims whitespace
 * - Converts to uppercase
 * - Validates length between 2 and 32 characters
 * - Validates alphanumeric characters, underscores, and hyphens only
 * Returns normalized string if valid, or null if malformed/unsafe.
 */
export function normalizeReferralCode(rawCode: unknown): string | null {
  if (typeof rawCode !== "string") {
    return null;
  }

  const trimmed = rawCode.trim().toUpperCase();
  if (trimmed.length < 2 || trimmed.length > 32) {
    return null;
  }

  if (!REFERRAL_REGEX.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function isValidReferralCode(rawCode: unknown): boolean {
  return normalizeReferralCode(rawCode) !== null;
}
