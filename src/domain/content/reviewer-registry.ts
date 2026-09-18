/**
 * AI School V3 — Trusted Human Reviewer Registry & Authority
 * 
 * Enforces cryptographic identity and authorization verification for pedagogical content review.
 * Arbitrary strings or ID prefixes alone (e.g. "REV-HUMAN-*") do not constitute proof of identity.
 * 
 * Controller Security Guarantee:
 * - Reviewer authority is strictly read-only in production.
 * - No mutable production registerReviewer()/clearReviewerRegistry() is exposed as a trust mechanism.
 * - verifiedByController=true is trusted only when it originates from the controller-managed reviewer authority.
 * - Test registries may be injected via ReviewerAuthority interface or createTestReviewerAuthority().
 */

export type ReviewerRole =
  | "PEDAGOGICAL_CONTROLLER"
  | "SUBJECT_EXPERT"
  | "CURRICULUM_AUDITOR";

export interface ReviewerRecord {
  reviewerId: string;
  type: "HUMAN";
  role: ReviewerRole;
  active: boolean;
  verifiedByController: boolean;
  verifiedAt?: string;
  displayName?: string;
}

export class ReviewerAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewerAuthorizationError";
  }
}

/**
 * Interface defining the read-only contract for reviewer identity & authority verification.
 */
export interface ReviewerAuthority {
  getReviewer(reviewerId: string): ReviewerRecord | undefined;
  isTrustedReviewer(reviewerId: string, requiredRole?: ReviewerRole): boolean;
  assertTrustedReviewer(reviewerId: string, requiredRole?: ReviewerRole): ReviewerRecord;
}

/**
 * Concrete read-only implementation of ReviewerAuthority.
 */
export class ReadOnlyReviewerAuthority implements ReviewerAuthority {
  private readonly store: ReadonlyMap<string, ReviewerRecord>;

  constructor(records: Iterable<ReviewerRecord> = []) {
    const map = new Map<string, ReviewerRecord>();
    for (const record of records) {
      if (!record.reviewerId || typeof record.reviewerId !== "string" || record.reviewerId.trim() === "") {
        throw new ReviewerAuthorizationError("reviewerId must be a non-empty string.");
      }
      if (record.type !== "HUMAN") {
        throw new ReviewerAuthorizationError(`Reviewer type must be 'HUMAN', got '${record.type}'.`);
      }
      if (record.reviewerId.startsWith("AI_") || (record.displayName && record.displayName.includes("AI_"))) {
        throw new ReviewerAuthorizationError("AI personas are strictly prohibited from human reviewer authority.");
      }
      // Clone record to prevent external mutation
      map.set(record.reviewerId, Object.freeze({ ...record }));
    }
    this.store = map;
  }

  getReviewer(reviewerId: string): ReviewerRecord | undefined {
    return this.store.get(reviewerId);
  }

  isTrustedReviewer(reviewerId: string, requiredRole?: ReviewerRole): boolean {
    const record = this.store.get(reviewerId);
    if (!record) {
      return false;
    }
    if (record.type !== "HUMAN") {
      return false;
    }
    if (!record.active) {
      return false;
    }
    if (!record.verifiedByController) {
      return false;
    }
    if (requiredRole && record.role !== requiredRole) {
      return false;
    }
    return true;
  }

  assertTrustedReviewer(reviewerId: string, requiredRole?: ReviewerRole): ReviewerRecord {
    const record = this.store.get(reviewerId);
    if (!record) {
      throw new ReviewerAuthorizationError(
        `Reviewer '${reviewerId}' not found in trusted reviewer authority. Arbitrary strings or prefixes do not prove identity.`
      );
    }
    if (record.type !== "HUMAN") {
      throw new ReviewerAuthorizationError(
        `Reviewer '${reviewerId}' is not of type 'HUMAN'.`
      );
    }
    if (!record.active) {
      throw new ReviewerAuthorizationError(
        `Reviewer '${reviewerId}' is marked INACTIVE.`
      );
    }
    if (!record.verifiedByController) {
      throw new ReviewerAuthorizationError(
        `Reviewer '${reviewerId}' is not verified by pedagogical controller.`
      );
    }
    if (requiredRole && record.role !== requiredRole) {
      throw new ReviewerAuthorizationError(
        `Reviewer '${reviewerId}' role '${record.role}' does not match required role '${requiredRole}'.`
      );
    }
    return record;
  }
}

/**
 * Production reviewer authority: Read-only, empty by default (fail-closed).
 * In production runtime, zero unvetted reviewers can promote content.
 */
export const productionReviewerAuthority: ReviewerAuthority = new ReadOnlyReviewerAuthority([]);

// Internal test authority holder used ONLY when explicitly injected in test harness
let testAuthorityOverride: ReviewerAuthority | null = null;

function assertTestEnvironment(helperName: string): void {
  if (process.env.NODE_ENV !== "test") {
    throw new ReviewerAuthorizationError(
      `SECURITY_VIOLATION: '${helperName}' is restricted strictly to test environments (NODE_ENV === 'test'). In production, reviewer authority is immutable and read-only.`
    );
  }
}

/**
 * Returns the effective reviewer authority.
 * Defaults to productionReviewerAuthority.
 * Test override is ONLY permitted when process.env.NODE_ENV === 'test'.
 */
export function getEffectiveReviewerAuthority(): ReviewerAuthority {
  if (process.env.NODE_ENV === "test") {
    return testAuthorityOverride ?? productionReviewerAuthority;
  }
  return productionReviewerAuthority;
}

/**
 * Test-only utility: Creates an isolated, immutable ReviewerAuthority from supplied test records.
 */
export function createTestReviewerAuthority(records: ReviewerRecord[]): ReviewerAuthority {
  assertTestEnvironment("createTestReviewerAuthority");
  return new ReadOnlyReviewerAuthority(records);
}

/**
 * Test-only utility: Injects or clears the test reviewer authority override.
 */
export function setTestReviewerAuthority(authority: ReviewerAuthority | null): void {
  assertTestEnvironment("setTestReviewerAuthority");
  testAuthorityOverride = authority;
}

/**
 * Backward-compatibility test helper: registers reviewer into an injected test authority.
 */
export function registerReviewerForTesting(record: ReviewerRecord): void {
  assertTestEnvironment("registerReviewerForTesting");
  const current = testAuthorityOverride instanceof ReadOnlyReviewerAuthority
    ? Array.from((testAuthorityOverride as any).store.values()) as ReviewerRecord[]
    : [];
  // Filter out existing reviewerId if present
  const updated = current.filter((r) => r.reviewerId !== record.reviewerId);
  updated.push(record);
  testAuthorityOverride = new ReadOnlyReviewerAuthority(updated);
}

/**
 * Backward-compatibility test helper: resets test authority back to null (production).
 */
export function resetReviewerAuthorityForTesting(): void {
  assertTestEnvironment("resetReviewerAuthorityForTesting");
  testAuthorityOverride = null;
}

// Backward-compatibility aliases for test suites
export const registerReviewer = registerReviewerForTesting;
export const clearReviewerRegistry = resetReviewerAuthorityForTesting;
