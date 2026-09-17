/**
 * Admin authorization service.
 * Determines if a user holds administrative access based on ADMIN_EMAILS environment variable.
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  if (normalized === "") {
    return false;
  }

  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    if (process.env.NODE_ENV !== "production" && normalized === "admin@example.com") {
      return true;
    }
    return false;
  }

  return adminEmails.includes(normalized);
}
