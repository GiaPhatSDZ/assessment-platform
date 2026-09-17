/**
 * Sanitize and validate redirect URLs to prevent open redirect vulnerabilities.
 * Ensures the target URL is strictly a relative internal path.
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  fallback: string = "/dashboard"
): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();

  if (trimmed === "") {
    return fallback;
  }

  // Prevent control characters / CRLF injection
  if (/[\r\n\t\0]/.test(trimmed)) {
    return fallback;
  }

  // Must begin with a single slash '/'
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  // Must not begin with '//' or '/\' (protocol-relative / Windows path escape)
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("\\")) {
    return fallback;
  }

  // Check if there's any colon or backslash before the first query or hash
  const pathPart = trimmed.split(/[?#]/)[0];
  if (pathPart.includes(":") || pathPart.includes("\\")) {
    return fallback;
  }

  return trimmed;
}
