import {
  QuestionItem,
  Lesson,
  PublicationState,
  ReviewState,
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

/**
 * Validates that an item is authorized to be delivered to a student.
 * Throws ContentNotPublishedError if the item is in draft or unreviewed state.
 */
export function assertPublishedForStudent(
  item: { id: string; publicationState: PublicationState; reviewState: ReviewState }
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
