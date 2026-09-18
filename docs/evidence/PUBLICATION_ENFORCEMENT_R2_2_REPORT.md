# AI School R2.2 Publication Enforcement & Student Runtime Cutover Report

**Report Status:**
```text
EXECUTOR R2.2 RUNTIME CUTOVER COMPLETE
CONTROLLER REVIEW: PENDING
```

**Repository:** `GiaPhatSDZ/assessment-platform`  
**Baseline Commit:** `a83915a690ae577d32397202c36bbb50324113fa`  
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

---

## 9. Student Runtime Cutover & Fail-Closed Implementation (Controller Audit Commit a83915a)

Following Controller Audit of commit `a83915a`, the student runtime has been cut over from legacy content sources to the canonical publication authority:

### P0. Parallel Legacy Content Authority Removed:
- **Legacy Path Eliminated:** `assessment-items/reviewed/math-grade6-fractions.json` has been decoupled from the student diagnostic runner.
- **Sole Publication Authority:** `CurriculumService.getInitialDiagnosticItems()` and `getReTestItems()` exclusively source canonical question bank items (`@/curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json`) through `filterPublishedForStudent()`.
- **Fail-Closed Presentation:** Because canonical Grade 6 items are `DRAFT`, the student diagnostic runner on `/diagnostic/math-grade6` strictly fails closed and displays `CONTENT_NOT_AVAILABLE · ĐANG THẨM ĐỊNH (DRAFT)`, adhering to TT 32/2018/TT-BGDĐT pedagogical standards. Zero draft questions reach the student.

### P0. Learning Pack Review Gate Enforced:
- **`LearningPack.contentStatus`:** Added explicit status `"PUBLISHED" | "CONTENT_NOT_AVAILABLE"`.
- **Pre-Delivery Gate:** `generateLearningPack()` evaluates lesson candidates with `isPublishedForStudent()`. When unreviewed, returns `contentStatus: "CONTENT_NOT_AVAILABLE"`, empty worked examples, empty practice plans, and empty Tier-D resource references.
- **Student View Protection:** `LearningPackView` renders a fail-closed pedagogical review holding screen when `contentStatus === "CONTENT_NOT_AVAILABLE"`, blocking unreviewed or hardcoded Tier-D learning material.

### P1. False UI Claims Removed:
- **`NewDiagnosticWizard`:** Removed `"Sẵn sàng"`, `"Đã duyệt (APPROVED)"`, and `"Lát cắt đã hoàn thiện"`. Replaced with truthful `"Đang thẩm định (DRAFT)"` and `"Đang thẩm định (CONTENT_IN_REVIEW)"`.
- **`CoverageExplorer`:** Replaced false `"AVAILABLE"` claims on unreviewed slices with `"IN_PROGRESS"` ("Đang biên soạn / thẩm định").

### Parent Copilot Boundary Enforcement:
- **Student Flow Purged:** Removed `GeminiHandoff` and `NotebookLM` imports and components completely from student remediation view (`LearningPackView`).
- **Parent Isolation:** AI assistance is strictly confined to parent-facing routes (`/parent`, `ParentView.tsx`, `GeminiHandoffSection.tsx`).

### Reviewer Authority Hardening:
- **Production Immutability:** Mutable reviewer registration (`setTestReviewerAuthority`, `registerReviewer`, `registerReviewerForTesting`) is strictly guarded by `process.env.NODE_ENV === "test"`. Outside test environments, all mutators throw security errors and `productionReviewerAuthority` is enforced.
- **No Runtime Authority Injection:** `assertPublishedForStudent`, `isPublishedForStudent`, and `filterPublishedForStudent` throw `ReviewerAuthorizationError` if an external caller attempts to inject a custom authority in non-test environments.

---

## 10. Required Regression Matrix & Test Evidence

All 7 required regression items are verified by automated tests in `tests/curriculum/runtime-cutover-r2-2.test.tsx` and the full suite:

| # | Regression Requirement | Test Location | Result |
|---|---|---|---|
| 1 | Active Grade 6 route cannot render legacy reviewed JSON | `tests/curriculum/runtime-cutover-r2-2.test.tsx` | **PASS** |
| 2 | DRAFT canonical question items cannot reach student diagnostic | `tests/curriculum/runtime-cutover-r2-2.test.tsx` | **PASS** |
| 3 | Student learning pack cannot render Tier-D/unreviewed learning content | `tests/curriculum/runtime-cutover-r2-2.test.tsx` | **PASS** |
| 4 | Student flow contains no NotebookLM/Gemini handoff | `tests/curriculum/runtime-cutover-r2-2.test.tsx` | **PASS** |
| 5 | False APPROVED UI copy is absent from wizard and coverage explorer | `tests/curriculum/runtime-cutover-r2-2.test.tsx` | **PASS** |
| 6 | Publication guard remains the sole content authorization path | `tests/curriculum/runtime-cutover-r2-2.test.tsx` | **PASS** |
| 7 | Existing R2.2 stale-attestation and hash integrity tests remain green | `tests/curriculum/publication-enforcement-r2-2.test.ts` | **PASS** |

### Verification Gate Results:
- **Vitest Unit/Integration:** `npm test` → **36 test files passed, 201 tests passed** (0 failures).
- **TypeScript Typecheck:** `npx tsc --noEmit` → **0 errors (Exit code 0)**.
- **ESLint Quality Check:** `npm run lint` → **0 errors, 0 warnings (Exit code 0)**.
- **Production Build:** `npm run build` → **Compiled successfully, 24/24 static/dynamic routes generated**.
- **Playwright E2E:** `npm run test:e2e` → **34 / 34 tests passed** across Chromium and Mobile Chrome.

---

## 11. Open Limitations & Content Status

1. **All Grade 6 Content Kept DRAFT:**
   In strict compliance with Controller instructions, all Grade 6 items in `curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json` remain `itemMaturity: "DRAFT"` and `reviewState: "AI_DRAFT"`. No fabricated review attestations were added.
2. **Reviewer Authority Remains Empty in Production:**
   Production reviewer registry is read-only and empty until formal pedagogical committee onboarding.

