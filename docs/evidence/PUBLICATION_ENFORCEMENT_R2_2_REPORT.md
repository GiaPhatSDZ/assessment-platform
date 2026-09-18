# AI School R2.2 Publication Enforcement & Student Runtime Cutover Report

**Report Status:**
```text
EXECUTOR R2.2.1 SERVER DELIVERY FREEZE CLEANUP COMPLETE
CONTROLLER REVIEW: PENDING
```

**Repository:** `GiaPhatSDZ/assessment-platform`  
**Baseline Commit:** `6efc0688702379aa118ec7f4bc5e6bf8042de01a`  
**Execution Timestamp:** 2026-09-18  

---

## 1. Executive Summary & Scope Adherence

This remediation fulfills the requirements of R2.2.1 FREEZE CLEANUP following Controller Audit of remote commit `6efc0688702379aa118ec7f4bc5e6bf8042de01a`. The implementation guarantees that unpublished DRAFT curriculum content never crosses the server/client boundary into client browser bundles.

### Scope Invariant Verification:
- **No curriculum subjects added:** The 166-subject national catalog remains unchanged.
- **No grades or lessons added:** Grade 6 Mathematics vertical slice remains the sole exploratory baseline.
- **No question-bank items added:** The 6 draft question items remain untouched.
- **Grade 6 Content Maturity Preserved:** All Grade 6 items and lessons remain `itemMaturity: "DRAFT"`, `reviewState: "AI_DRAFT"`, `publicationState: "DRAFT"`, `publishedAt: null`, `publishedBy: null`.
- **Zero fake reviewers in production data:** Production reviewer authority is strictly read-only and empty by default (fail-closed).
- **No UI changes / No scoring direction modifications.**
- **Unrelated transcript-bridge work preserved:** Stored in dedicated branch `feature/transcript-bridge`.

---

## 2. Changed Files (R2.2.1 Freeze Cleanup)

| File | Status | Description |
|---|---|---|
| `src/application/curriculum/student-content-delivery-service.ts` | **NEW** | Server-only content delivery service (`import "server-only"`). Sole authorization layer for importing canonical question bank and lesson JSON. Transforms approved content to sanitized delivery DTOs; returns fail-closed `CONTENT_NOT_AVAILABLE` when no approved material exists. |
| `app/diagnostic/math-grade6/page.tsx` | **MODIFIED** | Server component invokes `StudentContentDeliveryService.getDiagnosticDelivery()`. Passes sanitized delivery DTO or fail-closed state to client component. Zero draft content crosses boundary. |
| `src/application/curriculum/curriculum-service.ts` | **MODIFIED** | Removed static import of canonical `question-bank/items.json`. Client-side invocations fail closed with empty item sets. |
| `src/domain/remediation/learning-pack.ts` | **MODIFIED** | Removed static import of canonical `lessons/fractions-addition.json`. Purged `geminiNotebookInstructions` from student `LearningPack` interface and payload. |
| `src/infrastructure/remediation/gemini-notebook/manual-provider.ts` | **MODIFIED** | Decoupled dynamic parent notebook prompt generation from student `LearningPack` internals. Confined to parent-only use. |
| `src/domain/content/publication-guard.ts` | **MODIFIED** | Hardened `promoteContent()`: arbitrary authority injection is forbidden in production (`SECURITY_VIOLATION`), permitted only in `NODE_ENV === "test"`. Hardened maturity gate: missing or DRAFT `itemMaturity` fails closed. |
| `src/domain/content/schema.ts` | **MODIFIED** | Added `itemMaturity` to `Lesson` and `Explanation` schemas. |
| `components/v3/diagnostic/Grade6FractionsDiagnosticFlow.tsx` | **MODIFIED** | Accepts sanitized `DiagnosticDeliveryDto` from server component. Removed unverified claims ("chữ ký số", "hội đồng chuyên môn"). |
| `components/v3/profile/NewDiagnosticWizard.tsx` | **MODIFIED** | Removed unverified "Trang 55" locator claim; truthful national curriculum references only. |
| `components/v3/curriculum/CoverageExplorer.tsx` | **MODIFIED** | Removed unverified "Trang 55" locator claim. |
| `components/diagnostic/KnowledgeGapRunner.tsx` | **MODIFIED** | Switched from `learningPack.geminiNotebookInstructions` to `ManualGeminiNotebookProvider`. |
| `vitest.config.ts` | **MODIFIED** | Added alias for `"server-only"` to allow unit testing of server modules. |
| `tests/curriculum/server-delivery-boundary-r2-2-1.test.ts` | **NEW** | 12 tests covering mandatory R2.2.1 acceptance criteria A-I (bundle sentinels, server-only imports, promotion hardening, parent isolation, maturity enforcement). |

---

## 3. Server Delivery Boundary Architecture

```
canonical repository files
       ↓
SERVER-ONLY loader (`import "server-only"`)
[StudentContentDeliveryService]
       ↓
publication guard (`assertPublishedForStudent` / `filterPublishedForStudent`)
       ↓
sanitized published delivery DTO (`DiagnosticDeliveryDto` / `LessonDeliveryDto`)
       ↓
Client Component (`Grade6FractionsDiagnosticFlow`)
```

- **Server-Only Enforcement:** Canonical curriculum JSON files (`question-bank/items.json`, `lessons/fractions-addition.json`) are only imported by `StudentContentDeliveryService` which declares `import "server-only"`.
- **Client Sanitization:** Any client-callable service (`CurriculumService`, `generateLearningPack`) has zero static imports of unpublished curriculum JSON.
- **Fail-Closed Presentation:** When no items meet student publication criteria (`itemMaturity` in `["REVIEWED", "PILOT", "CALIBRATED"]` with valid human review attestation and fresh cryptographic hash), the server returns `status: "CONTENT_NOT_AVAILABLE"` and an empty items list. Zero draft content crosses the wire.

---

## 4. Promotion Authority Hardening & Maturity Failsafe

- **`promoteContent` Invariant:**
  ```ts
  function resolvePromotionAuthority(authority?: ReviewerAuthority): ReviewerAuthority {
    if (authority && authority !== productionReviewerAuthority) {
      if (process.env.NODE_ENV !== "test") {
        throw new ReviewerAuthorizationError(
          "SECURITY_VIOLATION: Arbitrary ReviewerAuthority injection into promoteContent is only permitted when NODE_ENV === 'test'",
        );
      }
      return authority;
    }
    return productionReviewerAuthority;
  }
  ```
- **Maturity Fail-Closed Gate:**
  In `assertPublishedForStudent`:
  ```ts
  if (!item.itemMaturity || item.itemMaturity === "DRAFT" || !ALLOWED_STUDENT_MATURITY_STATES.has(item.itemMaturity)) {
    throw new ContentNotPublishedError(
      `Item ${item.id} has invalid or unreviewed maturity '${item.itemMaturity}'. Allowed student maturities: REVIEWED, PILOT, CALIBRATED.`,
      "ITEM_MATURITY_NOT_ALLOWED",
    );
  }
  ```

---

## 5. Parent Copilot Isolation

- **Interface Cleaned:** Student `LearningPack` interface no longer contains `geminiNotebookInstructions`, `copyablePrompt`, or NotebookLM fields.
- **Payload Isolated:** Prompt construction is completely isolated to parent-facing services (`ManualGeminiNotebookProvider`) and parent routes (`/parent`). Student-facing flows receive zero AI prompt generation artifacts.

---

## 6. Truthful UI & Report Copy Audit

- **Removed unverified claims:**
  - `"chữ ký số"` → Replaced with truthful `"review attestation gắn với phiên bản nội dung"`.
  - `"hội đồng chuyên môn"` → Replaced with truthful `"đang chờ thẩm định con người"`.
  - `"Trang 55"` → Replaced with verified national curriculum references (`"Chương trình GDPT 2018 môn Toán"`).
  - Language implying TT32 defines cryptographic hashes removed.

---

## 7. Mandatory Test Matrix & Verification Evidence

All 9 mandatory acceptance tests (A through I) are verified green:

| ID | Mandatory Verification Item | Test / Verification Method | Result |
|---|---|---|---|
| **A** | DRAFT question-bank sentinel (`ITEM-G6-FRAC-01`) is absent from production client chunks | Static chunk scanner across all 45 `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **B** | DRAFT lesson sentinel (`LESSON-MATH-6-FRAC-01`, pedagogical text) is absent from production client chunks | Static chunk scanner across all 45 `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **C** | Server delivery returns zero student items for current DRAFT bank | `StudentContentDeliveryService.getDiagnosticDelivery` returns `items: []` | **PASS** |
| **D** | Client receives only `CONTENT_NOT_AVAILABLE` state | `getDiagnosticDelivery` returns `status: "CONTENT_NOT_AVAILABLE"` | **PASS** |
| **E** | Arbitrary production authority injection into `promoteContent` fails | `promoteContent` throws `SECURITY_VIOLATION` in production mode | **PASS** |
| **F** | Student `LearningPack` type/payload contains no parent AI prompt fields | `generateLearningPack` payload inspection (`geminiNotebookInstructions` undefined) | **PASS** |
| **G** | Missing `itemMaturity` fails student publication | `assertPublishedForStudent` throws `ITEM_MATURITY_NOT_ALLOWED` | **PASS** |
| **H** | Existing R2.2 hash/stale-attestation tests remain green | `tests/curriculum/publication-enforcement-r2-2.test.ts` (20/20 passed) | **PASS** |
| **I** | False "digital signature / committee / unverified page" copy absent | Grep and automated AST inspection of components | **PASS** |

### Complete Verification Suite Output:
- **`npm test`**: **37 passed (37 test files, 213 tests passed)**
- **`npx tsc --noEmit`**: **0 errors (Exit code 0)**
- **`npm run lint`**: **✔ No ESLint warnings or errors (Exit code 0)**
- **`npm run build`**: **Compiled successfully, 24/24 static pages generated (Exit code 0)**
- **`npm run test:e2e`**: **34 passed (Playwright Chromium & Mobile Chrome)**

---

## 8. Open Limitations & Content Status

1. **Grade 6 Content Remains Strictly DRAFT:**
   In compliance with Controller directives, all Grade 6 items in `curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json` and lesson in `curriculum/vietnam/lower-secondary/grade-6/math/lessons/fractions-addition.json` remain `itemMaturity: "DRAFT"` and `reviewState: "AI_DRAFT"`. No fake attestation or test reviewer exists in production data.
2. **Reviewer Authority Remains Empty in Production:**
   `productionReviewerAuthority` contains zero reviewers by default, failing closed until real human reviewers are onboarded through official channels.


