# AI School R2.2 Publication Enforcement & Student Runtime Cutover Report

**Report Status:**
```text
EXECUTOR R2.2.1 FINAL GRAPH CUTOVER COMPLETE
CONTROLLER REVIEW: PENDING
```

**Repository:** `GiaPhatSDZ/assessment-platform`  
**Baseline Commit:** `056370a28d43fc9aa79ba8423aa7b026a2da43b8`  
**Execution Timestamp:** 2026-09-18  

---

## 1. Executive Summary & Scope Adherence

This remediation fulfills the final freeze cleanup requirements of Controller Audit for commit `056370a28d43fc9aa79ba8423aa7b026a2da43b8`. The implementation resolves the legacy knowledge graph parallel authority:
- Legacy graph `curriculum/graphs/math-grade6-fractions.json` is retired from active runtime and marked `LEGACY_NON_AUTHORITATIVE`.
- `CurriculumService` has zero static imports of the legacy graph and fails closed.
- Canonical graph artifacts (`knowledge-nodes.json`, `prerequisite-edges.json`) remain strictly `SOURCE_LINKED` and unapproved.
- Canonical Grade 6 lesson has explicit `"itemMaturity": "DRAFT"`.
- Production client chunks are verified free of all graph IDs, payloads, and descriptions.

### Scope Invariant Verification:
- **No curriculum subjects added:** The 166-subject national catalog remains unchanged.
- **No grades or lessons added:** Grade 6 Mathematics vertical slice remains the sole exploratory baseline.
- **No question-bank items added:** The 6 draft question items remain untouched.
- **Grade 6 Content Maturity Preserved:** All Grade 6 items, lessons, and graph artifacts remain `itemMaturity: "DRAFT"`, `reviewState: "AI_DRAFT"` or `"SOURCE_LINKED"`, `publicationState: "DRAFT"`, `publishedAt: null`, `publishedBy: null`.
- **Zero fake reviewers in production data:** Production reviewer authority is strictly read-only and empty by default (fail-closed).
- **No UI changes / No scoring direction modifications.**
- **Unrelated transcript-bridge work preserved:** Stored in dedicated branch `feature/transcript-bridge`.

---

## 2. Changed Files (Final Graph Cutover & Freeze Cleanup)

| File | Status | Description |
|---|---|---|
| `curriculum/graphs/math-grade6-fractions.json` | **MODIFIED** | Retired from active runtime. Marked `LEGACY_NON_AUTHORITATIVE`, `LEGACY_UNVERIFIED`, with `runtimeStatus: "RETIRED_FROM_ACTIVE_RUNTIME"`. Removed from production authority. |
| `curriculum/vietnam/lower-secondary/grade-6/math/lessons/fractions-addition.json` | **MODIFIED** | Added explicit `"itemMaturity": "DRAFT"`. |
| `curriculum/vietnam/lower-secondary/grade-6/math/publication-manifest.json` | **MODIFIED** | Updated checksum to match actual SHA-256 of `items.json` + `fractions-addition.json` (`48d73b548dd0cb52573999d58b51d9ddf8ff3c1eff403d27e42bd0805a202427`). |
| `src/application/curriculum/curriculum-service.ts` | **MODIFIED** | Removed static import of `math-grade6-fractions.json`. `getFractionsKnowledgeGraph()` returns empty graph fail-closed. |
| `src/application/curriculum/student-content-delivery-service.ts` | **MODIFIED** | Added `graph: null` in diagnostic delivery. Added `getKnowledgeGraphDelivery()` returning `null` (unreviewed canonical graph). |
| `components/v3/diagnostic/Grade6FractionsDiagnosticFlow.tsx` | **MODIFIED** | Uses `delivery?.graph || CurriculumService.getFractionsKnowledgeGraph()`. No unpublished graph imported. |
| `components/v3/curriculum/PrerequisiteTree.tsx` | **MODIFIED** | Renders graceful unreviewed holding state when `nodes.length === 0`. |
| `tests/curriculum/server-delivery-boundary-r2-2-1.test.ts` | **MODIFIED** | Added tests verifying graph sentinels, payload absence from chunks, lesson DRAFT maturity, and canonical node/edge `SOURCE_LINKED` status. |
| `tests/integration/v3-vertical-slice.test.ts` | **MODIFIED** | Verified client graph fail-closed; used test fixture graph for diagnostic engine evaluation. |
| `docs/evidence/PUBLICATION_ENFORCEMENT_R2_2_REPORT.md` | **MODIFIED** | Updated status to `EXECUTOR R2.2.1 FINAL GRAPH CUTOVER COMPLETE`. |

---

## 3. Knowledge Graph Boundary Architecture

```
canonical repository files (knowledge-nodes.json, prerequisite-edges.json)
       ↓
SERVER-ONLY loader (`import "server-only"`)
[StudentContentDeliveryService.getKnowledgeGraphDelivery]
       ↓
publication guard (canonical graph is SOURCE_LINKED / unreviewed → fails closed)
       ↓
`graph: null` delivered to client
       ↓
Client Component (`Grade6FractionsDiagnosticFlow`) receives NO graph
```

- **Client Import Elimination:** `CurriculumService` has zero imports of `math-grade6-fractions.json`. Calling `CurriculumService.getFractionsKnowledgeGraph()` returns `{ id: "", nodes: [], edges: [], ... }`.
- **Legacy Graph Retirement:** `curriculum/graphs/math-grade6-fractions.json` is marked `isAuthoritative: false`, `runtimeStatus: "RETIRED_FROM_ACTIVE_RUNTIME"`, `status: "LEGACY_NON_AUTHORITATIVE"`, and is not imported anywhere in production code.
- **Canonical Graph Preservation:** `curriculum/vietnam/lower-secondary/grade-6/math/knowledge-nodes.json` and `prerequisite-edges.json` remain `reviewState: "SOURCE_LINKED"`. They have not been falsely promoted to `APPROVED`.

---

## 4. Promotion Authority Hardening & Maturity Failsafe

- **`promoteContent` Invariant:** Arbitrary authority injection is forbidden in production (`SECURITY_VIOLATION`), permitted only when `NODE_ENV === "test"`.
- **Maturity Fail-Closed Gate:** Missing or DRAFT `itemMaturity` throws `ContentNotPublishedError`.
- **Canonical Lesson Truth:** `curriculum/vietnam/lower-secondary/grade-6/math/lessons/fractions-addition.json` has explicit `"itemMaturity": "DRAFT"`.

---

## 5. Parent Copilot Isolation

- Student `LearningPack` interface contains no AI prompt generation or NotebookLM fields.
- Dynamic prompt generation is completely isolated to parent services (`ManualGeminiNotebookProvider`) and `/parent` routes.

---

## 6. Truthful UI & Report Copy Audit

- All unverified claims (`"chữ ký số"`, `"hội đồng chuyên môn"`, `"Trang 55"`) removed.
- Replaced with truthful pedagogical statements: `"review attestation gắn với phiên bản nội dung"`, `"đang chờ thẩm định con người"`, `"Chương trình GDPT 2018 môn Toán"`.

---

## 7. Mandatory Test Matrix & Verification Evidence

All mandatory acceptance tests are verified green:

| ID | Mandatory Verification Item | Test / Verification Method | Result |
|---|---|---|---|
| **A** | DRAFT question-bank sentinel (`ITEM-G6-FRAC-01`) is absent from production client chunks | Static chunk scanner across all 45 `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **B** | DRAFT lesson sentinel (`LESSON-MATH-6-FRAC-01`, pedagogical text) is absent from production client chunks | Static chunk scanner across all 45 `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **C** | Server delivery returns zero student items for current DRAFT bank | `StudentContentDeliveryService.getDiagnosticDelivery` returns `items: []` | **PASS** |
| **D** | Client receives only `CONTENT_NOT_AVAILABLE` state | `getDiagnosticDelivery` returns `status: "CONTENT_NOT_AVAILABLE"` | **PASS** |
| **E** | Arbitrary production authority injection into `promoteContent` fails | `promoteContent` throws `SECURITY_VIOLATION` in production mode | **PASS** |
| **F** | Student `LearningPack` type/payload contains no parent AI prompt fields | `generateLearningPack` payload inspection (`geminiNotebookInstructions` undefined) | **PASS** |
| **G** | Missing or DRAFT `itemMaturity` fails student publication | `assertPublishedForStudent` throws `ITEM_MATURITY_NOT_ALLOWED` | **PASS** |
| **H** | Existing R2.2 hash/stale-attestation tests remain green | `tests/curriculum/publication-enforcement-r2-2.test.ts` (20/20 passed) | **PASS** |
| **I** | False "digital signature / committee / unverified page" copy absent | Grep and automated AST inspection of components | **PASS** |
| **J** | Legacy graph ID (`GRAPH-MATH-G6-FRACTIONS`) absent from client chunks | Static chunk scanner across all `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **K** | Legacy APPROVED graph payload absent from client chunks | Static chunk scanner across all `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **L** | Canonical SOURCE_LINKED graph descriptions absent from client chunks | Static chunk scanner across all `.next/static/**/*.js` chunks | **PASS** (0 occurrences) |
| **M** | Canonical Grade 6 lesson has explicit `itemMaturity: "DRAFT"` | JSON inspection and `publication-manifest.json` checksum verification | **PASS** |
| **N** | Canonical knowledge nodes and edges remain `SOURCE_LINKED` | JSON inspection in `tests/curriculum/server-delivery-boundary-r2-2-1.test.ts` | **PASS** |

### Complete Verification Suite Output:
- **`npm test`**: **37 passed (37 test files, 216 tests passed, 0 failures)**
- **`npx tsc --noEmit`**: **0 errors (Exit code 0)**
- **`npm run lint`**: **✔ No ESLint warnings or errors (Exit code 0)**
- **`npm run build`**: **Compiled successfully, 24/24 static pages generated (Exit code 0)**
- **`npm run test:e2e`**: **34 passed (Playwright Chromium & Mobile Chrome)**

---

## 8. Open Limitations & Content Status

1. **Grade 6 Content Remains Strictly DRAFT:**
   All Grade 6 items, lessons, and graph artifacts remain `itemMaturity: "DRAFT"` and `reviewState: "AI_DRAFT"` or `"SOURCE_LINKED"`. No fake attestation or test reviewer exists in production data.
2. **Reviewer Authority Remains Empty in Production:**
   `productionReviewerAuthority` contains zero reviewers by default, failing closed until real human reviewers are onboarded through official channels.
3. **Assessment Grading Contract:**
   Published assessment grading will be executed server-side in the future persistence milestone. Student client DTOs do not contain correctAnswer or rationale payloads.



