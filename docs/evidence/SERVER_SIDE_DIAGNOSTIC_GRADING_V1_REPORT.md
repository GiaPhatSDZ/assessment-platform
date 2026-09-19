# AI School — Server-Side Diagnostic Grading V1 Report

```text
EXECUTOR SERVER-SIDE DIAGNOSTIC GRADING V1 COMPLETE
CONTROLLER REVIEW: PENDING
```

**Milestone:** Server-Side Diagnostic Grading V1  
**Baseline Commit:** `92e6082350c6a31494a2656111207334c600c354`  
**Date:** 2026-09-19  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Branch:** `main`  

---

## 1. Executive Summary

Milestone **Server-Side Diagnostic Grading V1** establishes the authoritative, server-only diagnostic submission, deterministic evaluation, and atomic learning persistence pipeline for AI School.

The submission flow enforces end-to-end cryptographic and pedagogical integrity:
```text
Client (Student Submission)
  { learnerId, sessionId, itemId, itemVersion, response: { type, ... } }
        │
        ▼ (HttpOnly cookie + SSR auth context; cross-origin rejected)
API Route Boundary (POST /api/learning/diagnostic/attempt)
        │
        ▼ (Ownership verification & active DIAGNOSTIC session check)
Server Diagnostic Service (src/application/diagnostic/server-diagnostic-service.ts)
        │
        ├─► Canonical Item Resolution & Publication Guard (assertPublishedForStudent)
        │     - Recomputes canonicalContentHash server-side
        │     - Validates exact item version
        │     - Verifies explicit subjectId/topicId compatibility (A6)
        │
        ├─► Deterministic Grading Engine (pure, no-LLM)
        │     - MCQ: matches canonical correctAnswer; validates single correct option (A8)
        │     - NUMERIC: strict answerSpec rule; tolerance from spec only; no fallback (A1)
        │     - Misconceptions: WRONG != MISCONCEPTION. Distractor tag or []
        │
        ├─► Conservative Node State Matrix Projection
        │     - 0 attempts: NOT_ASSESSED / LOW (last_assessed_at: null)
        │     - 1 correct: UNCERTAIN / LOW (never overclaims SECURE on single attempt)
        │     - 1 incorrect: DEVELOPING / LOW
        │     - >=2 correct: SECURE requires >= 2 independent canonical items (A5)
        │     - Multiple mixed: UNCERTAIN / MEDIUM
        │     - Multiple incorrect: DEVELOPING (MEDIUM/HIGH)
        │
        ├─► Mastery Transition Detection
        │     - Transition appended ONLY when state OR confidence actually changes
        │
        └─► Atomic Persistence Transaction
              - PostgreSQL RPC: record_atomic_diagnostic_grading
              - In-Memory Repository: transactional snapshot/rollback
        │
        ▼
Safe Student Result DTO (zero answer keys, rationales, or internal hashes leaked)
```

---

## 2. Rule Versions & Invariants

| Specification | Canonical Identifier / Value |
|---|---|
| **Grading Rule Version** | `DIAGNOSTIC_GRADING_RULE_VERSION = "1.0.0"` |
| **Node State Rule Version** | `DIAGNOSTIC_NODE_STATE_RULE_VERSION = "1.0.0"` |
| **Evidence Rule Version** | `DIAGNOSTIC_EVIDENCE_RULE_VERSION = "1.0.0"` |
| **Mastery History Rule Version** | `DIAGNOSTIC_MASTERY_RULE_VERSION = "1.0.0"` |
| **Transaction RPC Name** | `public.record_atomic_diagnostic_grading` |
| **Replay / Duplicate Policy** | `UNIQUE(session_id, item_id)` raising `ATTEMPT_ALREADY_RECORDED` |
| **Concurrency Control** | Advisory transaction lock + CAS on `updated_at` raising `STATE_CONFLICT_RETRY` |

---

## 3. Implementation Details & Controller Amendments

### 3.1 Server-Only Grading Authority & Security Boundary
- `src/application/diagnostic/server-diagnostic-service.ts` enforces `import "server-only";`.
- Browser/client never receives or imports `correctAnswer`, `answerSpec`, `rationale`, `distractorRationales`, or unpublished canonical items.
- Ownership context (`visitorToken`, `userId`) is derived server-side from HttpOnly cookies and Supabase SSR `getAuthenticatedUser()`.
- Client payload contains only: `learnerId`, `sessionId`, `itemId`, `itemVersion`, and `response`.
- Rejects any client-supplied grading authority fields (`correctAnswer`, `isCorrect`, `rationale`, `misconceptionTags`, `gradingRuleVersion`, `itemContentHash`, `primaryNodeId`) with `400 Bad Request`.

### 3.2 Exact Item Authority & Recomputation
- Canonical item resolved through `assertPublishedForStudent(item)`.
- Fails closed for unreviewed, draft, or stale items (`ContentNotPublishedError`).
- Recomputes `canonicalContentHash(item)` server-side; caller-supplied hash is strictly ignored.
- **Grade 6 Content:** Remains `DRAFT` / `AI_DRAFT` / `SOURCE_LINKED`. The production route `/diagnostic/math-grade6` strictly returns `CONTENT_NOT_AVAILABLE`.

### 3.3 Pure Deterministic Grading Engine (A1, A8, Misconceptions)
- **MCQ (A8):** Exactly one option must have `isCorrect=true`, and `item.correctAnswer` must reference that same option ID. Any mismatch throws `InvalidCanonicalGradingItemError`.
- **NUMERIC (A1):** Requires canonical `answerSpec` with valid `exactValue` or `value`. Fallback parsing of `correctAnswer` is forbidden. Missing/unsupported `answerSpec` throws `UnsupportedGradingRuleError`. Tolerance is taken strictly from `answerSpec.tolerance` (no invented tolerance).
- **Misconception Semantics:** Wrong answer does not automatically inherit all misconception tags. Only explicitly mapped distractor misconception tags are recorded; otherwise, `detectedMisconceptions = []`.

### 3.4 Conservative Node State Matrix & Independent Evidence (A5)
- 1 correct answer produces `UNCERTAIN / LOW` (provisional positive signal; does not claim `SECURE`).
- 1 incorrect answer produces `DEVELOPING / LOW`.
- `SECURE` mastery strictly requires `>= 2` independent evidence units (distinct canonical `itemId`s). Repeating the same item across sessions cannot inflate confidence to `SECURE`.

### 3.5 Atomic Persistence Transaction (A3, A4)
- **Database Migration:** [`supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql)
  - Adds `UNIQUE(session_id, item_id)` to `learning_attempts`.
  - Implements `record_atomic_diagnostic_grading` RPC:
    - Atomically writes `learning_attempts`, `knowledge_evidence`, `knowledge_node_states`, and conditional `mastery_history`.
    - Locks search path: `SET search_path = public, pg_temp;`.
    - Revokes execute from `PUBLIC`, `anon`, and `authenticated`; grants execute exclusively to `service_role` (A4).
    - Serializes node projection updates using advisory lock and CAS check, returning `STATE_CONFLICT_RETRY` on concurrent collision (A3).
- **In-Memory Repository:** Uses transactional snapshots (`attemptsSnapshot`, `evidenceSnapshot`, `nodeStatesSnapshot`, `masterySnapshot`) to ensure all-or-nothing rollback on any failure.

### 3.6 Route Boundary & Cross-Origin Protection (A7)
- Route: `app/api/learning/diagnostic/attempt/route.ts`
- Checks `Origin` header against `Host` to reject cross-origin POST attacks with `403 CROSS_ORIGIN_FORBIDDEN`.
- Derives `visitorToken` strictly from HttpOnly cookies without auto-creation (missing cookie returns `401 UNAUTHORIZED`).

---

## 4. Explicit Declarations & Disclaimers

> [!IMPORTANT]
> **1. No live Supabase integration test has been claimed:**  
> Development verification is executed against the strict SQL migration schema using the in-memory transactional repository and typed Supabase mock-client contract tests verifying exact database column names, RPC function names, parameters, and error translations.
>
> **2. Current Grade 6 content remains strictly DRAFT / fail-closed:**  
> Grade 6 Mathematics items remain unreviewed (`DRAFT` / `AI_DRAFT` / `SOURCE_LINKED`). `/diagnostic/math-grade6` continues to return `CONTENT_NOT_AVAILABLE`. All automated grading tests execute exclusively against isolated test-published fixtures.
>
> **3. Scope Boundaries:**  
> This milestone implements DIAGNOSTIC grading only. Practice grading, re-test grading, parent AI grading, recommendation AI, adaptive item selection, and broad curriculum expansion remain NOT implemented.

---

## 5. Automated Verification Results

All quality gates passed with zero errors:

| Verification Gate | Command | Result |
|---|---|---|
| Server Diagnostic Grading Test Suite (36 tests) | `npx vitest run tests/diagnostic/server-diagnostic-grading-v1.test.ts` | **PASS** (36/36 tests passing) |
| Persistence V1 Regression Matrix (38 tests) | `npx vitest run tests/persistence/learning-persistence-v1.test.tsx` | **PASS** (38/38 tests passing) |
| Full Test Suite | `npm test` | **PASS** (325/325 tests across 40 test files) |
| Typecheck | `npx tsc --noEmit` | **PASS** (0 errors) |
| Linter | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| Production Build | `npm run build` | **PASS** (25 static & dynamic routes compiled) |
| End-to-End Suite | `npm run test:e2e` | **PASS** (34/34 Playwright tests passing) |

---

## 6. Files Created & Modified

1. [`supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql) [NEW]
   - Added unique constraint on `(session_id, item_id)`.
   - Created atomic `record_atomic_diagnostic_grading` RPC with service-role security and CAS lock.
2. [`src/domain/diagnostic/types.ts`](file:///d:/giao_duc/src/domain/diagnostic/types.ts) [MODIFY]
   - Added `DiagnosticSubmissionRequestDto`, `DiagnosticGradingResultDto`, `NumericAnswerSpec`, `AtomicDiagnosticGradingParams`.
   - Added domain errors: `AttemptAlreadyRecordedError`, `UnsupportedGradingRuleError`, `InvalidCanonicalGradingItemError`, `InvalidGradingInputError`, `SessionClosedError`, `SessionCompatibilityError`, `StateConflictRetryError`.
3. [`src/domain/diagnostic/grading-engine.ts`](file:///d:/giao_duc/src/domain/diagnostic/grading-engine.ts) [NEW]
   - Implemented deterministic grading for MCQ and NUMERIC items.
   - Enforced A1 (answerSpec required for numeric) and A8 (single correct option matching correctAnswer).
   - Enforced conservative node state matrix and A5 (distinct items required for SECURE).
   - Implemented mastery transition change detection.
4. [`src/domain/content/canonical-item-resolver.ts`](file:///d:/giao_duc/src/domain/content/canonical-item-resolver.ts) [NEW]
   - Implemented canonical item resolver returning explicit `subjectId` and `topicId` metadata (A6).
5. [`src/application/learning-persistence-repository.ts`](file:///d:/giao_duc/src/application/learning-persistence-repository.ts) [MODIFY]
   - Added `getLearnerNodeAttempts` and `recordAtomicDiagnosticSubmission` methods.
6. [`src/infrastructure/database/in-memory-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/in-memory-learning-persistence-repository.ts) [MODIFY]
   - Implemented transactional `recordAtomicDiagnosticSubmission` with rollback snapshot.
   - Implemented `getLearnerNodeAttempts`.
7. [`src/infrastructure/database/supabase-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/supabase-learning-persistence-repository.ts) [MODIFY]
   - Implemented `recordAtomicDiagnosticSubmission` invoking RPC and translating errors.
   - Implemented `getLearnerNodeAttempts`.
8. [`src/application/diagnostic/server-diagnostic-service.ts`](file:///d:/giao_duc/src/application/diagnostic/server-diagnostic-service.ts) [NEW]
   - Server-only diagnostic grading application service (`import "server-only"`).
   - Enforced exact item authority, recomputed canonical hash, session checks, and safe DTO return.
9. [`app/api/learning/diagnostic/attempt/route.ts`](file:///d:/giao_duc/app/api/learning/diagnostic/attempt/route.ts) [NEW]
   - Authoritative API route handler with cross-origin POST check (A7) and HttpOnly cookie derivation.
10. [`tests/diagnostic/server-diagnostic-grading-v1.test.ts`](file:///d:/giao_duc/tests/diagnostic/server-diagnostic-grading-v1.test.ts) [NEW]
    - Comprehensive test suite covering all 31 base requirements + amendments A1–A8.
11. [`docs/evidence/SERVER_SIDE_DIAGNOSTIC_GRADING_V1_REPORT.md`](file:///d:/giao_duc/docs/evidence/SERVER_SIDE_DIAGNOSTIC_GRADING_V1_REPORT.md) [NEW]
    - Evidence report and specification documentation.
