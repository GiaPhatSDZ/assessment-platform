import crypto from "crypto";
import {
  QuestionItem,
  Lesson,
  PublicationState,
  ReviewState,
  ReviewAttestation,
  SelfPromotionForbiddenError,
  assertCannotSelfPromote,
} from "./schema";

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

const ALLOWED_STUDENT_PUBLICATION_STATES: ReadonlySet<PublicationState> = new Set([
  "PUBLISHED_BETA",
  "PUBLISHED_VERIFIED",
]);

const ALLOWED_STUDENT_REVIEW_STATES: ReadonlySet<ReviewState> = new Set([
  "INTERNAL_REVIEWED",
  "SUBJECT_EXPERT_REVIEWED",
  "PILOTED",
]);

export const AUTHORIZED_REVIEWER_ROLES: ReadonlySet<string> = new Set([
  "PEDAGOGICAL_CONTROLLER",
  "SUBJECT_EXPERT",
  "CURRICULUM_AUDITOR",
]);

export const VALID_HUMAN_REVIEWER_ID_PREFIX = "REV-HUMAN-";

/**
 * Promotion gate: The sole authorized path to promote content from draft states to reviewed states.
 * Requires cryptographic review attestation matching content hash and rejects AI self-attestation or arbitrary strings.
 */
export function promoteContent<
  T extends {
    id: string;
    reviewState: ReviewState;
    authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
    reviewAttestation?: ReviewAttestation;
  }
>(
  item: T,
  targetState: ReviewState,
  attestation: ReviewAttestation,
  rawContentToHash: string
): T {
  if (!attestation.reviewerId || attestation.reviewerId.trim() === "") {
    throw new SelfPromotionForbiddenError("Review attestation must include non-empty reviewerId.");
  }
  if (!attestation.reviewerId.startsWith(VALID_HUMAN_REVIEWER_ID_PREFIX)) {
    throw new SelfPromotionForbiddenError(
      `Arbitrary reviewer strings do not prove human review. Reviewer ID '${attestation.reviewerId}' must start with '${VALID_HUMAN_REVIEWER_ID_PREFIX}'.`
    );
  }
  if (!attestation.reviewerName || attestation.reviewerName.trim() === "") {
    throw new SelfPromotionForbiddenError("Review attestation must include non-empty reviewerName.");
  }
  if (!attestation.role || !AUTHORIZED_REVIEWER_ROLES.has(attestation.role)) {
    throw new SelfPromotionForbiddenError(
      `Arbitrary reviewer strings do not prove human review. Role '${attestation.role}' is not an authorized reviewer role.`
    );
  }
  if (!attestation.attestedAt) {
    throw new SelfPromotionForbiddenError("Review attestation must include valid attestedAt timestamp.");
  }
  if (
    attestation.reviewerId.startsWith("AI_") ||
    attestation.reviewerName.includes("AI_") ||
    attestation.reviewerName.toLowerCase().includes("bot")
  ) {
    throw new SelfPromotionForbiddenError(
      `Self-promotion forbidden: AI agent '${attestation.reviewerName}' cannot attest pedagogical review.`
    );
  }

  // Cryptographic content binding
  const computedHash = crypto.createHash("sha256").update(rawContentToHash).digest("hex");
  if (attestation.contentHash !== computedHash) {
    throw new SelfPromotionForbiddenError(
      `Review attestation hash mismatch: attestation contentHash '${attestation.contentHash}' does not match computed '${computedHash}'.`
    );
  }

  assertCannotSelfPromote({
    authoringOrigin: item.authoringOrigin,
    reviewState: targetState,
    reviewedBy: attestation.reviewerName,
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
 * Throws ContentNotPublishedError if the item is in draft, unreviewed state,
 * or if AI_ASSISTED content lacks a verified human review attestation.
 */
export function assertPublishedForStudent(
  item: {
    id: string;
    publicationState: PublicationState;
    reviewState: ReviewState;
    authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
    reviewAttestation?: ReviewAttestation;
  }
): void {
  if (!ALLOWED_STUDENT_PUBLICATION_STATES.has(item.publicationState)) {
    throw new ContentNotPublishedError(item.id, item.publicationState);
  }

  if (!ALLOWED_STUDENT_REVIEW_STATES.has(item.reviewState)) {
    throw new ContentNotPublishedError(
      item.id,
      item.publicationState,
      `CONTENT_NOT_AVAILABLE: Item '${item.id}' has unreviewed maturity '${item.reviewState}' and cannot enter student runtime.`
    );
  }

  // If content originated from AI (AI_ASSISTED), it CANNOT enter student runtime without an official human review attestation
  if (item.authoringOrigin === "AI_ASSISTED") {
    if (
      !item.reviewAttestation ||
      !item.reviewAttestation.reviewerId ||
      !item.reviewAttestation.reviewerId.startsWith(VALID_HUMAN_REVIEWER_ID_PREFIX) ||
      !item.reviewAttestation.role ||
      !AUTHORIZED_REVIEWER_ROLES.has(item.reviewAttestation.role) ||
      !item.reviewAttestation.contentHash ||
      !/^[a-f0-9]{64}$/i.test(item.reviewAttestation.contentHash)
    ) {
      throw new ContentNotPublishedError(
        item.id,
        item.publicationState,
        `CONTENT_NOT_AVAILABLE: Item '${item.id}' is AI_ASSISTED and lacks verified human review attestation from an authorized reviewer.`
      );
    }
  }
}

/**
 * Pure filter that returns only published and reviewed items for student consumption.
 */
export function filterPublishedForStudent<
  T extends { id: string; publicationState: PublicationState; reviewState: ReviewState }
>(items: T[]): T[] {
  return items.filter(
    (item) =>
      ALLOWED_STUDENT_PUBLICATION_STATES.has(item.publicationState) &&
      ALLOWED_STUDENT_REVIEW_STATES.has(item.reviewState)
  );
}

/**
 * Hard barrier to ensure student-facing endpoints never invoke LLM generation fallbacks.
 */
export function assertNoAiGenerationFallback(requestedAudience: "STUDENT" | "PARENT"): void {
  if (requestedAudience === "STUDENT") {
    throw new StudentRuntimeAiViolationError();
  }
}
