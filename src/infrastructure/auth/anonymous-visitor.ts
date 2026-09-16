import crypto from "crypto";

export const VISITOR_COOKIE_NAME = "assessment_visitor_token";

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

export const VISITOR_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
};

export function generateVisitorToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashVisitorToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyVisitorTokenOwnership(
  providedToken: string | undefined | null,
  persistedHash: string | undefined | null
): boolean {
  if (!providedToken || !persistedHash) {
    return false;
  }
  const computedHash = hashVisitorToken(providedToken);
  // Constant time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(persistedHash, "hex")
    );
  } catch {
    return false;
  }
}
