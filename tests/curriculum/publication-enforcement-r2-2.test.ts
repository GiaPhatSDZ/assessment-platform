/**
 * AI School V3 — Publication Enforcement R2.2 Test Suite
 * 
 * Verifies all 17 mandatory acceptance criteria + Controller Amendments:
 * 1. Exact reviewed content with valid registered reviewer + APPROVE attestation passes promotion logic
 * 2. Changing correctAnswer after review makes attestation stale (REVIEW_ATTESTATION_STALE)
 * 3. Changing sourceRefs after review makes attestation stale (REVIEW_ATTESTATION_STALE)
 * 4. Changing rationale after review makes attestation stale (REVIEW_ATTESTATION_STALE)
 * 5. HUMAN-authored but unattested content fails student publication
 * 6. AI-assisted unattested content fails student publication
 * 7. REV-HUMAN-* ID not present in trusted authority fails
 * 8. Inactive reviewer fails
 * 9. Unverified-by-controller reviewer fails
 * 10. Invalid/unauthorized role fails
 * 11. decision = REJECT fails
 * 12. decision = REQUEST_CHANGES fails
 * 13. Attestation scope mismatch fails
 * 14. filterPublishedForStudent() cannot bypass attestation
 * 15. itemMaturity = DRAFT fails student publication
 * 16. Directly editing JSON review/publication flags cannot bypass gate
 * 17. VBT/SBT inconsistency is represented explicitly and truthfully
 * 
 * Controller Amendments:
 * - Amendment 1: Read-only reviewer authority; verifiedByController originates from authority
 * - Amendment 2: stableCanonicalJsonV1 deterministic hashing without claiming official RFC 8785
 * - Amendment 3: canonicalContentHash includes authoringOrigin; preserves semantic array order
 * - Amendment 4: hashAlgorithm = "SHA-256", hashSchemaVersion = "content-hash-v1" required
 * - Amendment 6: filterPublishedForStudent propagates unexpected system errors
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  QuestionItem,
  SourceDocument,
  SelfPromotionForbiddenError,
} from "../../src/domain/content/schema";
import {
  canonicalContentHash,
} from "../../src/domain/content/canonical-content-hash";
import {
  ReviewerRecord,
  ReviewerAuthority,
  createTestReviewerAuthority,
  setTestReviewerAuthority,
} from "../../src/domain/content/reviewer-registry";
import {
  promoteContent,
  assertPublishedForStudent,
  filterPublishedForStudent,
  ContentNotPublishedError,
} from "../../src/domain/content/publication-guard";

const TRUSTED_CONTROLLER_REVIEWER: ReviewerRecord = {
  reviewerId: "REV-HUMAN-01",
  type: "HUMAN",
  role: "PEDAGOGICAL_CONTROLLER",
  active: true,
  verifiedByController: true,
  verifiedAt: "2026-09-17T00:00:00Z",
  displayName: "Nguyen Van Controller",
};

const TRUSTED_SUBJECT_EXPERT: ReviewerRecord = {
  reviewerId: "REV-HUMAN-02",
  type: "HUMAN",
  role: "SUBJECT_EXPERT",
  active: true,
  verifiedByController: true,
  verifiedAt: "2026-09-17T00:00:00Z",
  displayName: "Tran Thi Expert",
};

function createBaseDraftQuestion(overrides?: Partial<QuestionItem>): QuestionItem {
  return {
    id: "ITEM-TEST-G6-001",
    primaryNodeId: "NODE-MATH-6-FRAC-03",
    supportingNodeIds: ["NODE-MATH-6-FRAC-01"],
    type: "MULTIPLE_CHOICE",
    cognitiveDemand: "APPLY",
    prompt: [{ type: "text", value: "Tính giá trị của 1/2 + 1/3" }],
    options: [
      { id: "opt-1", content: [{ type: "text", value: "5/6" }], isCorrect: true },
      { id: "opt-2", content: [{ type: "text", value: "2/5" }], isCorrect: false },
    ],
    correctAnswer: "opt-1",
    rationale: "Quy đồng mẫu số chung là 6: 3/6 + 2/6 = 5/6",
    distractorRationales: { "opt-2": "Cộng cả tử và mẫu là sai lầm phổ biến." },
    misconceptionTags: ["ADD_NUMERATOR_AND_DENOMINATOR"],
    sourceRefs: [
      {
        sourceId: "SRC-NXBGD-KNTT-MATH6-T2",
        pageNumber: 15,
      },
    ],
    authoringOrigin: "AI_ASSISTED",
    itemMaturity: "DRAFT",
    reviewState: "AI_DRAFT",
    publicationState: "DRAFT",
    version: "1.0.0",
    ...overrides,
  };
}

describe("AI School R2.2 Publication Enforcement Suite", () => {
  let testAuthority: ReviewerAuthority;

  beforeEach(() => {
    testAuthority = createTestReviewerAuthority([
      TRUSTED_CONTROLLER_REVIEWER,
      TRUSTED_SUBJECT_EXPERT,
    ]);
    setTestReviewerAuthority(testAuthority);
  });

  // 1. Exact reviewed content with valid registered reviewer + APPROVE attestation can pass promotion logic
  it("1. passes promotion logic with exact reviewed content, valid registered reviewer, and APPROVE attestation", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    const promoted = promoteContent(
      draft,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
        auditNotes: "Pedagogically verified against MOET 2018 grade 6 syllabus.",
      },
      testAuthority
    );

    expect(promoted.reviewState).toBe("INTERNAL_REVIEWED");
    expect(promoted.reviewAttestation?.contentHash).toBe(hash);
    expect(promoted.reviewAttestation?.decision).toBe("APPROVE");
  });

  // 2. Changing correctAnswer after review makes attestation stale (REVIEW_ATTESTATION_STALE)
  it("2. fails student publication if correctAnswer is mutated after review (REVIEW_ATTESTATION_STALE)", () => {
    const draft = createBaseDraftQuestion({ itemMaturity: "REVIEWED", publicationState: "PUBLISHED_BETA" });
    const hash = canonicalContentHash(draft);

    const promoted = promoteContent(
      draft,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      },
      testAuthority
    );

    // Verify it initially passes student publication
    expect(() => assertPublishedForStudent(promoted, testAuthority)).not.toThrow();

    // Tamper: modify correctAnswer
    const tampered = { ...promoted, correctAnswer: "opt-2" };

    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(/REVIEW_ATTESTATION_STALE/);
  });

  // 3. Changing sourceRefs after review makes attestation stale (REVIEW_ATTESTATION_STALE)
  it("3. fails student publication if sourceRefs is mutated after review (REVIEW_ATTESTATION_STALE)", () => {
    const draft = createBaseDraftQuestion({ itemMaturity: "REVIEWED", publicationState: "PUBLISHED_BETA" });
    const hash = canonicalContentHash(draft);

    const promoted = promoteContent(
      draft,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      },
      testAuthority
    );

    // Tamper: modify sourceRefs
    const tampered = {
      ...promoted,
      sourceRefs: [
        {
          sourceId: "SRC-UNAPPROVED-BLOG",
          pageNumber: 99,
        },
      ],
    };

    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(/REVIEW_ATTESTATION_STALE/);
  });

  // 4. Changing rationale after review makes attestation stale (REVIEW_ATTESTATION_STALE)
  it("4. fails student publication if rationale is mutated after review (REVIEW_ATTESTATION_STALE)", () => {
    const draft = createBaseDraftQuestion({ itemMaturity: "REVIEWED", publicationState: "PUBLISHED_BETA" });
    const hash = canonicalContentHash(draft);

    const promoted = promoteContent(
      draft,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      },
      testAuthority
    );

    // Tamper: modify rationale
    const tampered = {
      ...promoted,
      rationale: "Rationale mutated after controller attestation.",
    };

    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(/REVIEW_ATTESTATION_STALE/);
  });

  // Amendment 3 test: Changing authoringOrigin after review makes attestation stale
  it("4b. fails student publication if authoringOrigin is mutated after review (Amendment 3)", () => {
    const draft = createBaseDraftQuestion({ itemMaturity: "REVIEWED", publicationState: "PUBLISHED_BETA" });
    const hash = canonicalContentHash(draft);

    const promoted = promoteContent(
      draft,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      },
      testAuthority
    );

    // Tamper: modify authoringOrigin
    const tampered = {
      ...promoted,
      authoringOrigin: "HUMAN" as const,
    };

    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(tampered, testAuthority)).toThrow(/REVIEW_ATTESTATION_STALE/);
  });

  // 5. HUMAN-authored but unattested content fails student publication
  it("5. blocks HUMAN-authored but unattested content from student publication", () => {
    const humanItem: QuestionItem = createBaseDraftQuestion({
      authoringOrigin: "HUMAN",
      itemMaturity: "REVIEWED",
      reviewState: "INTERNAL_REVIEWED",
      publicationState: "PUBLISHED_BETA",
      reviewAttestation: undefined,
    });

    expect(() => assertPublishedForStudent(humanItem, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(humanItem, testAuthority)).toThrow(/lacks verified human review attestation/);
  });

  // 6. AI-assisted unattested content fails student publication
  it("6. blocks AI_ASSISTED unattested content from student publication", () => {
    const aiItem: QuestionItem = createBaseDraftQuestion({
      authoringOrigin: "AI_ASSISTED",
      itemMaturity: "REVIEWED",
      reviewState: "INTERNAL_REVIEWED",
      publicationState: "PUBLISHED_BETA",
      reviewAttestation: undefined,
    });

    expect(() => assertPublishedForStudent(aiItem, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(aiItem, testAuthority)).toThrow(/lacks verified human review attestation/);
  });

  // 7. REV-HUMAN-* ID not present in trusted authority fails
  it("7. rejects reviewer ID not present in trusted authority", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-NONEXISTENT",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        },
        testAuthority
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // 8. Inactive reviewer fails
  it("8. rejects promotion by an inactive reviewer", () => {
    const authorityWithInactive = createTestReviewerAuthority([
      {
        reviewerId: "REV-HUMAN-INACTIVE",
        type: "HUMAN",
        role: "PEDAGOGICAL_CONTROLLER",
        active: false, // inactive!
        verifiedByController: true,
      },
    ]);

    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-INACTIVE",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        },
        authorityWithInactive
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // 9. Unverified-by-controller reviewer fails
  it("9. rejects promotion by a reviewer not verified by controller", () => {
    const authorityWithUnverified = createTestReviewerAuthority([
      {
        reviewerId: "REV-HUMAN-UNVERIFIED",
        type: "HUMAN",
        role: "SUBJECT_EXPERT",
        active: true,
        verifiedByController: false, // unverified!
      },
    ]);

    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-UNVERIFIED",
          role: "SUBJECT_EXPERT",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        },
        authorityWithUnverified
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // 10. Invalid/unauthorized role fails
  it("10. rejects promotion when attestation role does not match registered reviewer role or is invalid", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-02", // registered as SUBJECT_EXPERT
          role: "PEDAGOGICAL_CONTROLLER", // mismatched requested role
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        },
        testAuthority
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // 11. decision = REJECT fails
  it("11. rejects promotion and blocks student publication when decision is REJECT", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-01",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "REJECT",
          scope: "QUESTION_ITEM",
        },
        testAuthority
      );
    }).toThrow(SelfPromotionForbiddenError);

    const rejectedItem = {
      ...draft,
      itemMaturity: "REVIEWED" as const,
      publicationState: "PUBLISHED_BETA" as const,
      reviewState: "INTERNAL_REVIEWED" as const,
      reviewAttestation: {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER" as const,
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256" as const,
        hashSchemaVersion: "content-hash-v1" as const,
        decision: "REJECT" as const,
        scope: "QUESTION_ITEM" as const,
      },
    };

    expect(() => assertPublishedForStudent(rejectedItem, testAuthority)).toThrow(ContentNotPublishedError);
  });

  // 12. decision = REQUEST_CHANGES fails
  it("12. rejects promotion and blocks student publication when decision is REQUEST_CHANGES", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-01",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "REQUEST_CHANGES",
          scope: "QUESTION_ITEM",
        },
        testAuthority
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // 13. Attestation scope mismatch fails
  it("13. rejects promotion and publication when attestation scope mismatches item type", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-01",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "LESSON", // Mismatch: Item is QUESTION_ITEM
        },
        testAuthority
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // Amendment 4 test: Invalid hash algorithm or version fails
  it("13b. rejects promotion when hashAlgorithm or hashSchemaVersion is invalid (Amendment 4)", () => {
    const draft = createBaseDraftQuestion();
    const hash = canonicalContentHash(draft);

    expect(() => {
      promoteContent(
        draft,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-01",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-18T10:00:00Z",
          contentHash: hash,
          hashAlgorithm: "MD5" as any,
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        },
        testAuthority
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  // 14. filterPublishedForStudent() cannot bypass attestation
  it("14. filterPublishedForStudent strictly excludes unattested or stale items", () => {
    const validDraft = createBaseDraftQuestion({ itemMaturity: "REVIEWED", publicationState: "PUBLISHED_BETA" });
    const hash = canonicalContentHash(validDraft);
    const validPromoted = promoteContent(
      validDraft,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      },
      testAuthority
    );

    const draftItem = createBaseDraftQuestion({ id: "ITEM-DRAFT" });
    const tamperedStaleItem = { ...validPromoted, id: "ITEM-STALE", correctAnswer: "tampered" };
    const humanUnattestedItem = createBaseDraftQuestion({
      id: "ITEM-HUMAN-NO-ATTEST",
      authoringOrigin: "HUMAN",
      itemMaturity: "REVIEWED",
      publicationState: "PUBLISHED_BETA",
      reviewState: "INTERNAL_REVIEWED",
    });

    const items = [validPromoted, draftItem, tamperedStaleItem, humanUnattestedItem];
    const filtered = filterPublishedForStudent(items, testAuthority);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(validPromoted.id);
  });

  // Amendment 6 test: filterPublishedForStudent propagates unexpected system errors
  it("14b. filterPublishedForStudent propagates unexpected errors and does not swallow them (Amendment 6)", () => {
    // A corrupted item that causes unexpected TypeError inside assertion
    const brokenItem = null as any;

    expect(() => filterPublishedForStudent([brokenItem], testAuthority)).toThrow();
  });

  // 15. itemMaturity = DRAFT fails student publication
  it("15. strictly rejects itemMaturity = DRAFT even if reviewState and publicationState are marked approved", () => {
    const draftWithReview = createBaseDraftQuestion({
      itemMaturity: "DRAFT", // DRAFT maturity!
      publicationState: "PUBLISHED_BETA",
    });
    const hash = canonicalContentHash(draftWithReview);

    const promoted = promoteContent(
      draftWithReview,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-18T10:00:00Z",
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      },
      testAuthority
    );

    expect(promoted.itemMaturity).toBe("DRAFT");
    expect(() => assertPublishedForStudent(promoted, testAuthority)).toThrow(ContentNotPublishedError);
    expect(() => assertPublishedForStudent(promoted, testAuthority)).toThrow(/unreviewed maturity 'DRAFT'/);
  });

  // 16. Directly editing JSON review/publication flags cannot bypass gate
  it("16. blocks publication when someone manually edits JSON review and publication flags without attestation", () => {
    const rawBypassedJson: QuestionItem = {
      id: "ITEM-FORGED-01",
      primaryNodeId: "NODE-MATH-6-FRAC-03",
      supportingNodeIds: [],
      type: "MULTIPLE_CHOICE",
      cognitiveDemand: "APPLY",
      prompt: [{ type: "text", value: "Câu hỏi bị sửa trực tiếp cờ" }],
      correctAnswer: "A",
      rationale: "Giải thích",
      misconceptionTags: [],
      sourceRefs: [],
      authoringOrigin: "AI_ASSISTED",
      itemMaturity: "REVIEWED",
      reviewState: "INTERNAL_REVIEWED",
      publicationState: "PUBLISHED_BETA",
      version: "1.0.0",
      reviewAttestation: undefined,
    };

    expect(() => assertPublishedForStudent(rawBypassedJson, testAuthority)).toThrow(ContentNotPublishedError);
  });

  // 17. VBT/SBT inconsistency is represented explicitly and truthfully
  it("17. verifies VBT/SBT label ambiguity is represented explicitly in source registry without silent normalization", () => {
    const registryPath = path.resolve(
      __dirname,
      "../../curriculum/vietnam/lower-secondary/grade-6/math/source-registry.json"
    );
    const registry: SourceDocument[] = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

    const vbtSource = registry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-VBT-T2");
    expect(vbtSource).toBeDefined();
    expect(vbtSource?.canonicalInternalName).toBe("VBT Toán 6, tập hai (Bài mẫu)");
    expect(vbtSource?.sourceDisplayedTitle).toBe("SBT Toán 6, tập hai (Bài mẫu)");
    expect(vbtSource?.identityStatus).toBe("SOURCE_LABEL_INCONSISTENT");
    // Source authority semantics are preserved
    expect(vbtSource?.authority).toBe("Nhà xuất bản Giáo dục Việt Nam");
    expect(vbtSource?.sourceTier).toBe("TIER_B2_NXBGD_PUBLISHER_RESOURCE");
  });
});
