import {
  PublicationState,
  ReviewState,
  ReviewAttestation,
  SelfPromotionForbiddenError,
  assertCannotSelfPromote,
} from "./schema";
import { canonicalContentHash } from "./canonical-content-hash";
import {
  ReviewerRole,
  ReviewerAuthority,
  getEffectiveReviewerAuthority,
} from "./reviewer-registry";

export class ContentNotPublishedError extends Error {
  constructor(
    public readonly contentId: string,
    public readonly currentState: PublicationState,
    message?: string
  ) {
    super(
      message ||
        `CONTENT_NOT_AVAILABLE: Content item '${contentId}' is in '${currentState}' state and is not authorized for student runtime.`
    );
    this.name = "ContentNotPublishedError";
  }
}

export class StudentRuntimeAiViolationError extends Error {
  constructor(message?: string) {
    super(
      message ||
        `AI_SCHOOL_PRODUCT_VIOLATION: Generative AI fallback is strictly forbidden in student-facing runtime. Content must be pre-reviewed and published.`
    );
    this.name = "StudentRuntimeAiViolationError";
  }
}

export const ALLOWED_STUDENT_PUBLICATION_STATES: ReadonlySet<PublicationState> = new Set([
  "PUBLISHED_BETA",
  "PUBLISHED_VERIFIED",
]);

export const ALLOWED_STUDENT_REVIEW_STATES: ReadonlySet<ReviewState> = new Set([
  "INTERNAL_REVIEWED",
  "SUBJECT_EXPERT_REVIEWED",
  "PILOTED",
]);

export const ALLOWED_STUDENT_MATURITY_STATES: ReadonlySet<string> = new Set([
  "REVIEWED",
  "PILOT",
  "CALIBRATED",
]);

export const AUTHORIZED_REVIEWER_ROLES: ReadonlySet<string> = new Set([
  "PEDAGOGICAL_CONTROLLER",
  "SUBJECT_EXPERT",
  "CURRICULUM_AUDITOR",
]);

export const VALID_HUMAN_REVIEWER_ID_PREFIX = "REV-HUMAN-";

/**
 * Derives the expected review scope from a content item.
 */
function deriveExpectedScope(item: Record<string, unknown>): string {
  if ("primaryNodeId" in item || "correctAnswer" in item || "cognitiveDemand" in item) {
    return "QUESTION_ITEM";
  }
  if ("learnerText" in item || "workedExamples" in item) {
    return "LESSON";
  }
  if ("shortExplanation" in item || "stepByStep" in item) {
    return "EXPLANATION";
  }
  if ("whatChildNeedsToUnderstand" in item || "questionsToAskChild" in item) {
    return "PARENT_GUIDE";
  }
  return "QUESTION_ITEM";
}

/**
 * Promotion gate: The sole authorized path to promote content from draft states to reviewed states.
 * Computes canonicalContentHash internally; verifies trusted human reviewer authority,
 * APPROVE decision, matching scope, and hash algorithm/version.
 */
export function promoteContent<
  T extends {
    id: string;
    reviewState: ReviewState;
    authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
    reviewAttestation?: ReviewAttestation;
    [key: string]: any;
  }
>(
  item: T,
  targetState: ReviewState,
  attestation: ReviewAttestation,
  authority: ReviewerAuthority = getEffectiveReviewerAuthority()
): T {
  if (!attestation.reviewerId || attestation.reviewerId.trim() === "") {
    throw new SelfPromotionForbiddenError("Review attestation must include non-empty reviewerId.");
  }
  if (!attestation.reviewerId.startsWith(VALID_HUMAN_REVIEWER_ID_PREFIX)) {
    throw new SelfPromotionForbiddenError(
      `Arbitrary reviewer strings do not prove human review. Reviewer ID '${attestation.reviewerId}' must start with '${VALID_HUMAN_REVIEWER_ID_PREFIX}'.`
    );
  }
  if (!attestation.role || !AUTHORIZED_REVIEWER_ROLES.has(attestation.role)) {
    throw new SelfPromotionForbiddenError(
      `Arbitrary reviewer strings do not prove human review. Role '${attestation.role}' is not an authorized reviewer role.`
    );
  }
  if (!attestation.attestedAt) {
    throw new SelfPromotionForbiddenError("Review attestation must include valid attestedAt timestamp.");
  }

  // 1. Hash algorithm and schema version checks
  if (attestation.hashAlgorithm !== "SHA-256") {
    throw new SelfPromotionForbiddenError(
      `Invalid hash algorithm '${attestation.hashAlgorithm}'. Only 'SHA-256' is authorized.`
    );
  }
  if (attestation.hashSchemaVersion !== "content-hash-v1") {
    throw new SelfPromotionForbiddenError(
      `Invalid hash schema version '${attestation.hashSchemaVersion}'. Only 'content-hash-v1' is authorized.`
    );
  }

  // 2. Decision must be APPROVE
  if (attestation.decision !== "APPROVE") {
    throw new SelfPromotionForbiddenError(
      `Self-promotion forbidden: Attestation decision '${attestation.decision}' cannot promote content. Only 'APPROVE' is authorized.`
    );
  }

  // 3. Attestation scope must match content type
  const expectedScope = deriveExpectedScope(item);
  if (attestation.scope && attestation.scope !== expectedScope) {
    throw new SelfPromotionForbiddenError(
      `Scope mismatch: Attestation scope '${attestation.scope}' does not match content item scope '${expectedScope}'.`
    );
  }

  // 4. Trusted reviewer authority verification
  try {
    authority.assertTrustedReviewer(attestation.reviewerId, attestation.role as ReviewerRole);
  } catch (err: any) {
    throw new SelfPromotionForbiddenError(err.message);
  }

  // 5. Internal deterministic canonical content hashing
  const computedHash = canonicalContentHash(item);
  if (attestation.contentHash !== computedHash) {
    throw new SelfPromotionForbiddenError(
      `Review attestation hash mismatch: attestation contentHash '${attestation.contentHash}' does not match computed '${computedHash}'.`
    );
  }

  assertCannotSelfPromote({
    authoringOrigin: item.authoringOrigin,
    reviewState: targetState,
    reviewedBy: attestation.reviewerName || attestation.reviewerId,
    reviewedAt: attestation.attestedAt,
  });

  return {
    ...item,
    reviewState: targetState,
    reviewAttestation: attestation,
  };
}

/**
 * Validates that an item is authorized to be delivered to a student.
 * Throws ContentNotPublishedError if:
 * - publicationState is unapproved
 * - reviewState is unapproved
 * - itemMaturity is 'DRAFT'
 * - any authoringOrigin (HUMAN, AI_ASSISTED, ADAPTED_WITH_PERMISSION) lacks a valid,
 *   approved review attestation from a trusted, controller-verified human reviewer
 * - canonical hash has diverged since attestation (REVIEW_ATTESTATION_STALE)
 */
export function assertPublishedForStudent(
  item: {
    id: string;
    publicationState: PublicationState;
    reviewState: ReviewState;
    itemMaturity?: string;
    authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
    reviewAttestation?: ReviewAttestation;
    [key: string]: any;
  },
  authority: ReviewerAuthority = getEffectiveReviewerAuthority()
): void {
  // 1. Publication State Check
  if (!ALLOWED_STUDENT_PUBLICATION_STATES.has(item.publicationState)) {
    throw new ContentNotPublishedError(item.id, item.publicationState);
  }

  // 2. Review State Check
  if (!ALLOWED_STUDENT_REVIEW_STATES.has(item.reviewState)) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' has unreviewed state '${item.reviewState}' and cannot enter student runtime.`
    );
  }

  // 3. Item Maturity Check (DRAFT is strictly rejected)
  if (item.itemMaturity === "DRAFT") {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' has unreviewed maturity 'DRAFT' and cannot enter student runtime.`
    );
  }
  if (item.itemMaturity && !ALLOWED_STUDENT_MATURITY_STATES.has(item.itemMaturity)) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' has unapproved maturity '${item.itemMaturity}' for student delivery.`
    );
  }

  // 4. Universal Human Review Attestation Gate (applies to HUMAN, AI_ASSISTED, and ADAPTED)
  const attestation = item.reviewAttestation;
  if (!attestation) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' lacks verified human review attestation.`
    );
  }

  if (attestation.decision !== "APPROVE") {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' attestation decision is '${attestation.decision}', not 'APPROVE'.`
    );
  }

  if (attestation.hashAlgorithm !== "SHA-256" || attestation.hashSchemaVersion !== "content-hash-v1") {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' has invalid hashAlgorithm '${attestation.hashAlgorithm}' or hashSchemaVersion '${attestation.hashSchemaVersion}'.`
    );
  }

  // Scope check
  const expectedScope = deriveExpectedScope(item);
  if (attestation.scope && attestation.scope !== expectedScope) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' attestation scope '${attestation.scope}' does not match expected '${expectedScope}'.`
    );
  }

  // Reviewer Authority validation
  if (!authority.isTrustedReviewer(attestation.reviewerId, attestation.role as ReviewerRole)) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Reviewer '${attestation.reviewerId}' is not an active, controller-verified human reviewer in trusted authority.`
    );
  }

  // 5. Freshness Check: canonical content hash re-verification
  const currentHash = canonicalContentHash(item);
  if (attestation.contentHash !== currentHash) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `REVIEW_ATTESTATION_STALE: Content hash mismatch for item '${item.id}'. Pedagogical content was modified after review attestation (attestation: '${attestation.contentHash}', current: '${currentHash}').`
    );
  }
}

/**
 * Evaluates whether an item satisfies all publication gates for student runtime.
 * Catches ONLY expected ContentNotPublishedError. Unexpected system errors propagate.
 */
export function isPublishedForStudent(
  item: any,
  authority: ReviewerAuthority = getEffectiveReviewerAuthority()
): boolean {
  try {
    assertPublishedForStudent(item, authority);
    return true;
  } catch (err: unknown) {
    if (err instanceof ContentNotPublishedError) {
      return false;
    }
    // Propagate unexpected/system errors
    throw err;
  }
}

/**
 * Pure filter that returns only published and reviewed items for student consumption.
 * Delegates directly to assertPublishedForStudent via isPublishedForStudent to guarantee no weaker parallel logic.
 */
export function filterPublishedForStudent<
  T extends {
    id: string;
    publicationState: PublicationState;
    reviewState: ReviewState;
    itemMaturity?: string;
    authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
    reviewAttestation?: ReviewAttestation;
    [key: string]: any;
  }
>(
  items: T[],
  authority: ReviewerAuthority = getEffectiveReviewerAuthority()
): T[] {
  return items.filter((item) => isPublishedForStudent(item, authority));
}

/**
 * Hard barrier to ensure student-facing endpoints never invoke LLM generation fallbacks.
 */
export function assertNoAiGenerationFallback(requestedAudience: "STUDENT" | "PARENT"): void {
  if (requestedAudience === "STUDENT") {
    throw new StudentRuntimeAiViolationError();
  }
}
