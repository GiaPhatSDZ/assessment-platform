# AI School — Server-Side Diagnostic Grading V1 Report

```text
EXECUTOR SERVER-SIDE DIAGNOSTIC GRADING V1 CONTROLLER FIX COMPLETE
CONTROLLER REVIEW: PENDING
```

**Milestone:** Server-Side Diagnostic Grading V1  
**Baseline Audit Commit:** `4c1256a63fe4aad70bd687168ff0126733b50f53`  
**Initial Baseline Commit:** `92e6082350c6a31494a2656111207334c600c354`  
**Date:** 2026-09-19  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Branch:** `main`  

---

## 1. Executive Summary

Milestone **Server-Side Diagnostic Grading V1** establishes the authoritative, server-only diagnostic submission, deterministic evaluation, and atomic learning persistence pipeline for AI School.

Following Controller Audit on commit `4c1256a`, the following critical fixes have been integrated and verified:
1. **P0-1 (Production Resolver Isolation):** `ServerDiagnosticService` constructor permits custom item resolver injection strictly in `NODE_ENV === "test"`. Any injection outside test throws `TestResolverInjectionForbiddenError` (`TEST_RESOLVER_INJECTION_FORBIDDEN`). Added `ServerDiagnosticService.createForTesting(...)` guarded test factory.
2. **P0-2 (First-Node Concurrency Hole):** Added explicit `expectedNodeExists: boolean` token to `AtomicDiagnosticGradingParams` and `record_atomic_diagnostic_grading` RPC. Under the advisory lock, if `expectedNodeExists = false` and a node row exists, or if `expectedNodeExists = true` and `updated_at` does not match, the transaction raises `STATE_CONFLICT_RETRY`. `ServerDiagnosticService` catches conflict, reloads attempts, reloads node state, recomputes the projection, and retries persistence once.
3. **P1-1 (Independent Evidence Confidence):** Matrix input tracks `distinctAttemptedItemIds`. Confidence escalation for incorrect and mixed evidence depends strictly on distinct items attempted (1 item wrong 3 times remains `DEVELOPING / LOW`; 2 distinct items wrong $\rightarrow$ `DEVELOPING / MEDIUM`; 3+ distinct items wrong $\rightarrow$ `DEVELOPING / HIGH`).

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
| **Concurrency Control** | Advisory transaction lock + explicit existence & CAS check (`STATE_CONFLICT_RETRY`) + automatic 1-shot retry |

---

## 3. Implementation Details & Controller Audit Fixes

### 3.1 P0-1 Production Resolver Isolation
- `src/application/diagnostic/server-diagnostic-service.ts`:
  - Enforces `import "server-only";`.
  - Default constructor signature: `constructor(persistenceRepo?, itemResolver?)`.
  - If `itemResolver` is provided when `process.env.NODE_ENV !== "test"`, it immediately throws `TestResolverInjectionForbiddenError` (`TEST_RESOLVER_INJECTION_FORBIDDEN`).
  - Provides test-only factory `ServerDiagnosticService.createForTesting(repo, resolver)` with identical runtime check.
  - Production uses strictly `defaultCanonicalItemResolver`.

### 3.2 P0-2 First-Node Concurrency Hole & Auto-Retry
- **Atomic Contract:** Added `expectedNodeExists: boolean` to `AtomicDiagnosticGradingParams`.
- **Database RPC:** `supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql` accepts `p_expected_node_exists BOOLEAN DEFAULT FALSE`.
  - Under `pg_advisory_xact_lock(hashtext(p_learner_id::text || ':' || p_primary_node_id))`:
    - `IF NOT p_expected_node_exists AND FOUND THEN RAISE EXCEPTION 'STATE_CONFLICT_RETRY...'`
    - `IF p_expected_node_exists AND (NOT FOUND OR updated_at IS DISTINCT FROM expected) THEN RAISE EXCEPTION 'STATE_CONFLICT_RETRY...'`
- **In-Memory Repository:** Mirrors the exact same existence and CAS checks in `InMemoryLearningPersistenceRepository.recordAtomicDiagnosticSubmission`.
- **ServerDiagnosticService Pipeline:** On catching `StateConflictRetryError`:
  - Reloads past attempts for the target node (`getLearnerNodeAttempts`).
  - Reloads current node states (`getCurrentNodeStates`).
  - Recomputes deterministic node projection incorporating all attempts.
  - Retries atomic submission ONCE. If conflict persists, propagates error.
- **Regression Test:** Simulating two concurrent first submissions for distinct items on an unassessed node results in both attempts persisted, 2 evidence records, and node `attempts_count = 2` reflecting both attempts.

### 3.3 P1-1 Independent Evidence Confidence Escalation
- `src/domain/diagnostic/grading-engine.ts`:
  - `NodeStateEvaluationInput` accepts `distinctAttemptedItemIds: Set<string>` alongside `distinctCorrectItemIds: Set<string>`.
  - **All Incorrect (`correctCount === 0`):**
    - 1 distinct item (e.g. same item wrong 1 or 3 times): `DEVELOPING / LOW`.
    - 2 distinct items: `DEVELOPING / MEDIUM`.
    - 3+ distinct items: `DEVELOPING / HIGH`.
  - **Mixed Evidence (`0 < correctCount < attemptsCount`):**
    - $\le 1$ distinct item: `UNCERTAIN / LOW`.
    - 2 distinct items: `UNCERTAIN / MEDIUM`.
    - 3+ distinct items: `UNCERTAIN / HIGH`.
  - **All Correct (`correctCount === attemptsCount`):**
    - $\ge 2$ distinct items: `SECURE` (`MEDIUM` for 2, `HIGH` for $\ge 3$).
    - $< 2$ distinct items: `UNCERTAIN / LOW` (repeated same item correct does not overclaim `SECURE`).

---

## 4. Explicit Declarations & Disclaimers

> [!IMPORTANT]
> **1. No live Supabase integration test has been claimed:**  
> Development verification is executed against the strict SQL migration schema using the in-memory transactional repository and typed Supabase mock-client contract tests verifying exact database column names, RPC function names, parameters (`p_expected_node_exists`), and error translations.
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
| Server Diagnostic Grading Test Suite (39 tests) | `npx vitest run tests/diagnostic/server-diagnostic-grading-v1.test.ts` | **PASS** (39/39 tests passing) |
| Delivery Boundary Tests (15 tests) | `npx vitest run tests/curriculum/server-delivery-boundary-r2-2-1.test.ts` | **PASS** (15/15 tests passing) |
| Persistence V1 Regression Matrix (38 tests) | `npx vitest run tests/persistence/learning-persistence-v1.test.tsx` | **PASS** (38/38 tests passing) |
| Full Test Suite | `npm test` | **PASS** (328/328 tests across 40 test files) |
| Typecheck | `npx tsc --noEmit` | **PASS** (0 errors) |
| Linter | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| Production Build | `npm run build` | **PASS** (25 static & dynamic routes compiled) |
| End-to-End Suite | `npm run test:e2e` | **PASS** (34/34 Playwright tests passing) |

---

## 6. Files Created & Modified

1. [`supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql) [MODIFY]
   - Added `p_expected_node_exists BOOLEAN DEFAULT FALSE` to `record_atomic_diagnostic_grading`.
   - Updated CAS to check presence vs absence under advisory lock.
2. [`src/domain/diagnostic/types.ts`](file:///d:/giao_duc/src/domain/diagnostic/types.ts) [MODIFY]
   - Added `expectedNodeExists: boolean` to `AtomicDiagnosticGradingParams`.
   - Exported `TestResolverInjectionForbiddenError` (`TEST_RESOLVER_INJECTION_FORBIDDEN`).
3. [`src/domain/diagnostic/grading-engine.ts`](file:///d:/giao_duc/src/domain/diagnostic/grading-engine.ts) [MODIFY]
   - Added `distinctAttemptedItemIds` to `NodeStateEvaluationInput`.
   - Updated `computeConservativeNodeState` for P1-1 independent evidence confidence escalation.
4. [`src/application/diagnostic/server-diagnostic-service.ts`](file:///d:/giao_duc/src/application/diagnostic/server-diagnostic-service.ts) [MODIFY]
   - Implemented P0-1 production resolver isolation.
   - Added `createForTesting` guarded factory.
   - Implemented P0-2 automatic 1-shot retry on `StateConflictRetryError`.
   - Tracked and passed `distinctAttemptedItemIds` and `expectedNodeExists`.
5. [`src/infrastructure/database/in-memory-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/in-memory-learning-persistence-repository.ts) [MODIFY]
   - Implemented explicit existence check and CAS in `recordAtomicDiagnosticSubmission`.
6. [`src/infrastructure/database/supabase-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/supabase-learning-persistence-repository.ts) [MODIFY]
   - Passed `p_expected_node_exists` into RPC call.
7. [`tests/diagnostic/server-diagnostic-grading-v1.test.ts`](file:///d:/giao_duc/tests/diagnostic/server-diagnostic-grading-v1.test.ts) [MODIFY]
   - Added tests 42 (P0-1), 43 (P0-2), 44 (P1-1). Total test count increased from 36 to 39.
8. [`docs/evidence/SERVER_SIDE_DIAGNOSTIC_GRADING_V1_REPORT.md`](file:///d:/giao_duc/docs/evidence/SERVER_SIDE_DIAGNOSTIC_GRADING_V1_REPORT.md) [MODIFY]
   - Evidence document updated with Controller fix report.
