# AI School R2.2 Publication Enforcement Report

**Report Status:**
```text
EXECUTOR R2.2 REMEDIATION COMPLETE
CONTROLLER REVIEW: PENDING
```

**Repository:** `GiaPhatSDZ/assessment-platform`  
**Baseline Commit:** `868cdb2630ad61c9a453f2646c3b762e45ca1e00`  
**Execution Timestamp:** 2026-09-18  

---

## 1. Executive Summary & Scope Adherence

This remediation fulfills the requirements of `GEMINI_R2_2_PUBLICATION_ENFORCEMENT_PROMPT.md` and the mandatory amendments from `CONTROLLER PLAN REVIEW — R2.2`. The implementation guarantees that content entering student runtime cannot bypass cryptographic review verification, reviewer authority verification, or item maturity gates.

### Scope Invariant Verification:
- **No curriculum subjects added:** The 166-subject national catalog remains unchanged.
- **No grades or lessons added:** Grade 6 Mathematics vertical slice remains the sole exploratory baseline.
- **No question-bank items added:** The 6 draft question items remain untouched.
- **Grade 6 Content Maturity Preserved:** All Grade 6 items remain `itemMaturity: "DRAFT"`, `reviewState: "AI_DRAFT"`, `publicationState: "DRAFT"`, `publishedAt: null`, `publishedBy: null`.
- **Zero fake reviewers in production data:** Production reviewer authority is strictly read-only and empty by default (fail-closed).
- **No UI changes / No scoring direction modifications.**
- **Unrelated transcript-bridge work preserved:** Stored in dedicated branch `feature/transcript-bridge`.

---

## 2. Changed Files

| File | Status | Description |
|---|---|---|
| `src/domain/content/canonical-json.ts` | **NEW** | Deterministic JSON serialization (`stableCanonicalJsonV1`, `stableCanonicalJsonSha256`). Does not claim RFC 8785 compliance. |
| `src/domain/content/canonical-content-hash.ts` | **NEW** | Deterministic `canonicalContentHash(item)`. Excludes workflow metadata; includes `authoringOrigin`; preserves semantic array order. |
| `src/domain/content/reviewer-registry.ts` | **NEW** | Read-only `ReviewerAuthority` contract and `ReadOnlyReviewerAuthority`. Production registry is empty. Test injection mechanisms provided. |
| `src/domain/content/schema.ts` | **MODIFIED** | Updated `ReviewAttestation` (`hashAlgorithm: "SHA-256"`, `hashSchemaVersion: "content-hash-v1"`, `decision`, `scope`). Added `ReviewableContentMeta`. Extended `SourceDocument`. |
| `src/domain/content/publication-guard.ts` | **MODIFIED** | Refactored `promoteContent` (removed `rawContentToHash`). Refactored `assertPublishedForStudent` (universal review gate, hash freshness check, maturity check). Unified `filterPublishedForStudent` with error propagation. |
| `curriculum/vietnam/lower-secondary/grade-6/math/source-registry.json` | **MODIFIED** | Explicitly represented VBT/SBT label ambiguity with `canonicalInternalName`, `sourceDisplayedTitle`, and `identityStatus: "SOURCE_LABEL_INCONSISTENT"`. |
| `scripts/curriculum/ingest-nxbgd-sources.mjs` | **MODIFIED** | Dynamic derivation of `identityStatus` comparing `canonicalInternalName` with probed `sourceDisplayedTitle`. |
| `tests/curriculum/publication-enforcement-r2-2.test.ts` | **NEW** | 20 comprehensive unit tests covering all 17 mandatory acceptance criteria and controller amendments. |
| `tests/curriculum/curriculum-content-database-v1.test.ts` | **MODIFIED** | Updated test fixtures to use `canonicalContentHash`, valid reviewer authority, and new attestation contract. |
| `tests/curriculum/nxbgd-source-ingestion.test.ts` | **MODIFIED** | Updated `promoteContent` invocations to match R2.2 API (internal hashing, algorithm/version fields, reviewer authority). |

---

## 3. Canonical Content Hash Contract

- **Function:** `canonicalContentHash(item: ReviewableContentItem): string`
- **Algorithm:** SHA-256 over `stableCanonicalJsonV1` representation (`hashAlgorithm: "SHA-256"`, `hashSchemaVersion: "content-hash-v1"`).
- **Hashed Fields (QuestionItem):**
  - `id`, `primaryNodeId`, `supportingNodeIds` (sorted copy), `type`, `cognitiveDemand`, `prompt` (order preserved), `options` (order preserved), `correctAnswer`, `answerSpec` (when present), `rationale`, `distractorRationales`, `misconceptionTags` (sorted copy), `sourceRefs`, `authoringOrigin`, `version`.
- **Hashed Fields (Lesson):**
  - `id`, `nodeIds` (sorted copy), `title`, `learnerText` (order preserved), `workedExamples` (order preserved), `approvedSourceRefs`, `ageOrGradeFit`, `authoringOrigin`, `version`.
- **Excluded Workflow Metadata:**
  - `reviewState`, `reviewAttestation`, `publicationState`, `publishedAt`, `publishedBy`, `itemMaturity`.
- **Order Invariant:**
  - Only explicitly set-like identifier arrays (`supportingNodeIds`, `misconceptionTags`, `nodeIds`) are sorted.
  - Semantic content arrays (`prompt`, `options`, `learnerText`, `workedExamples`, `steps`, `RichContent`) strictly maintain their author-defined sequence.

---

## 4. Trusted Reviewer Authority Architecture

- **Read-Only In Production:**
  `productionReviewerAuthority: ReviewerAuthority = new ReadOnlyReviewerAuthority([])`
  Mutable functions (`registerReviewer`/`clearReviewerRegistry`) are NOT part of the production trust mechanism.
- **Verification Criteria:**
  - Reviewer ID must exist in the authoritative registry.
  - `type === "HUMAN"`.
  - `active === true`.
  - `verifiedByController === true`.
  - Reviewer role must match the required attestation role.
- **Test Injection:**
  Isolated test authorities are injected via `createTestReviewerAuthority()` or optional parameter on publication guard functions.

---

## 5. Review Attestation & Freshness Behavior

- **`promoteContent(item, targetState, attestation, authority?)`:**
  - Rejects external caller-supplied `rawContentToHash`.
  - Computes `canonicalContentHash(item)` internally.
  - Requires `attestation.contentHash === computedHash`.
  - Requires `attestation.decision === "APPROVE"`.
  - Requires `attestation.hashAlgorithm === "SHA-256"` and `attestation.hashSchemaVersion === "content-hash-v1"`.
  - Requires attestation scope to match content type.
  - Asserts reviewer validity in `ReviewerAuthority`.
- **`assertPublishedForStudent(item, authority?)`:**
  - Recomputes current `canonicalContentHash(item)`.
  - If `currentHash !== item.reviewAttestation.contentHash`: throws `ContentNotPublishedError` with `REVIEW_ATTESTATION_STALE`.
  - Verifies that post-review mutations to `correctAnswer`, `sourceRefs`, `rationale`, or `authoringOrigin` invalidate the attestation immediately.

---

## 6. Student Publication Gate Unification & Error Propagation

- **Single Predicate:** `isPublishedForStudent(item, authority?)` is the sole boolean evaluator for student delivery.
- **Error Propagation:**
  `isPublishedForStudent` catches ONLY expected `ContentNotPublishedError`. Any unexpected system errors (e.g. `TypeError`, `RangeError`) immediately propagate without being swallowed.
- **Pure Filter:** `filterPublishedForStudent(items, authority?)` delegates directly to `isPublishedForStudent`. There is no parallel or weaker publication logic in the repository.

---

## 7. Item Maturity Coherence

- `itemMaturity: "DRAFT"` is strictly rejected from student runtime by `assertPublishedForStudent`.
- Allowed student delivery maturities: `REVIEWED`, `PILOT`, `CALIBRATED`.
- Manual modification of `reviewState = INTERNAL_REVIEWED` or `publicationState = PUBLISHED_BETA` cannot bypass the maturity gate.

---

## 8. VBT/SBT Upstream Source-Label Ambiguity Handling

- For `SRC-NXBGD-KNTT-MATH6-VBT-T2`:
  - `canonicalInternalName`: `"VBT Toán 6, tập hai (Bài mẫu)"`
  - `sourceDisplayedTitle`: `"SBT Toán 6, tập hai (Bài mẫu)"`
  - `identityStatus`: `"SOURCE_LABEL_INCONSISTENT"`
- In `scripts/curriculum/ingest-nxbgd-sources.mjs`, `identityStatus` is dynamically derived by comparing `canonicalInternalName` with the actual upstream title scraped by the remote viewer probe, rather than being permanently hardcoded.
- Upstream source authority semantics (`TIER_B2_NXBGD_PUBLISHER_RESOURCE`) are fully preserved without silently normalizing the upstream title.

---

## 9. Local Executor Evidence

### Automated Test Runs

#### 1. Focused Publication Enforcement Suite (R2.2)
- **Command:** `npx vitest run tests/curriculum/publication-enforcement-r2-2.test.ts`
- **Result:** 20 / 20 tests PASSED (Duration: 2.17s)

#### 2. Curriculum Authority & Ingestion Suites
- **Command:** `npx vitest run tests/curriculum/curriculum-content-database-v1.test.ts tests/curriculum/nxbgd-source-ingestion.test.ts tests/curriculum/publication-enforcement-r2-2.test.ts`
- **Result:** 67 / 67 tests PASSED (3 test files, Duration: 3.30s)

#### 3. Complete Test Suite
- **Command:** `npm test`
- **Result:** 35 / 35 test files passed, 184 / 184 tests PASSED (Duration: 41.21s)

#### 4. TypeScript Compilation Gate
- **Command:** `npx tsc --noEmit`
- **Result:** Code 0, 0 type errors.

#### 5. Code Quality / ESLint Gate
- **Command:** `npm run lint`
- **Result:** Code 0, 0 warnings, 0 errors.

#### 6. Production Bundle Build Gate
- **Command:** `npm run build`
- **Result:** Code 0, all 24 static and dynamic routes compiled successfully in 13.1s.

#### 7. Playwright End-to-End Suite
- **Command:** `npm run test:e2e`
- **Result:** 34 / 34 tests PASSED across Chromium and Mobile Chrome (Duration: 38.1s).

---

## 10. Open Limitations

1. **Grade 6 Content Remains Unreviewed:**
   All 6 diagnostic items in `curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json` remain in `itemMaturity: "DRAFT"` and `reviewState: "AI_DRAFT"`. No real human review attestations have been created yet, pending real human pedagogical controller review.
2. **Reviewer Authority Population:**
   Production reviewer registry is intentionally empty. Before production deployment, real human pedagogical reviewers must be provisioned through a secure controller-managed configuration.
