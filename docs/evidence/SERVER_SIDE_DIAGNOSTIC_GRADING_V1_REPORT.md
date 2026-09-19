# AI School — Server-Side Diagnostic Grading V1 Report

```text
EXECUTOR SERVER-SIDE DIAGNOSTIC GRADING V1 FINAL FIX COMPLETE
CONTROLLER REVIEW: PENDING
```

**Milestone:** Server-Side Diagnostic Grading V1  
**Audit Baseline Commit:** `be28885ef25bf5bd97f913ed1f320b84629bc809`  
**Initial Baseline Commit:** `92e6082350c6a31494a2656111207334c600c354`  
**Date:** 2026-09-19  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Branch:** `main`  

---

## 1. Executive Summary

Milestone **Server-Side Diagnostic Grading V1** establishes the authoritative, server-only diagnostic submission, deterministic evaluation, and atomic learning persistence pipeline for AI School.

Following Controller Audit on commit `be28885`, two specific blockers have been completely resolved:
1. **P0 (Migration History Immutability):** Migration [`supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql) was restored exactly to its historical `4c1256a` baseline. The concurrency and existence upgrades are delivered via a new additive migration [`supabase/migrations/20260919000004_diagnostic_grading_concurrency_fix.sql`](file:///d:/giao_duc/supabase/migrations/20260919000004_diagnostic_grading_concurrency_fix.sql), safely dropping the old 00003 overload and installing the upgraded RPC.
2. **P1 (Split Attempt vs Node Misconception Tags):** Misconception tags are cleanly separated across the pipeline:
   - `attemptMisconceptionTags = evaluated.detectedMisconceptions` $\rightarrow$ stored in `learning_attempts.misconception_tags`.
   - `nodeMisconceptionTags = newProjection.misconceptionTags` $\rightarrow$ stored in `knowledge_node_states.misconception_tags`.
   - Verified across a 3-attempt sequential regression flow: Attempt 1 (wrong with MISCON-A) records MISCON-A on attempt and node; Attempt 2 (correct) records empty tags on attempt while node preserves MISCON-A; Attempt 3 (wrong with MISCON-B) records MISCON-B on attempt and unique `[MISCON-A, MISCON-B]` on node.

---

## 2. Database Migration Architecture & Convergence

A fresh database running `00001 → 00002 → 00003 → 00004` and an existing database already at historical `00003` converge to the exact same schema:

1. **`00003_server_diagnostic_grading_v1.sql` (Historical Baseline):**
   - Creates unique constraint `uq_learning_attempts_session_item` on `learning_attempts(session_id, item_id)`.
   - Defines initial `record_atomic_diagnostic_grading` RPC.
2. **`00004_diagnostic_grading_concurrency_fix.sql` (Additive Upgraded Authority):**
   - Drops old `record_atomic_diagnostic_grading` overload from 00003.
   - Creates upgraded `record_atomic_diagnostic_grading` RPC with:
     - `p_attempt_misconception_tags JSONB`
     - `p_node_misconception_tags JSONB`
     - `p_expected_node_exists BOOLEAN DEFAULT FALSE`
     - `p_expected_node_updated_at TIMESTAMPTZ DEFAULT NULL`
   - Preserves: `SECURITY DEFINER`, `SET search_path = public, pg_temp`, advisory lock `pg_advisory_xact_lock`, explicit presence/absence CAS check (`STATE_CONFLICT_RETRY`), and `service_role`-only execution grants.

---

## 3. Explicit Declarations & Disclaimers

> [!IMPORTANT]
> **1. No live Supabase integration test has been claimed:**  
> Development verification is executed against the strict SQL migration schema using the in-memory transactional repository and typed Supabase mock-client contract tests verifying exact database column names, RPC function names, parameters (`p_expected_node_exists`, `p_attempt_misconception_tags`, `p_node_misconception_tags`), and error translations.
>
> **2. Current Grade 6 content remains strictly DRAFT / fail-closed:**  
> Grade 6 Mathematics items remain unreviewed (`DRAFT` / `AI_DRAFT` / `SOURCE_LINKED`). `/diagnostic/math-grade6` continues to return `CONTENT_NOT_AVAILABLE`. All automated grading tests execute exclusively against isolated test-published fixtures.
>
> **3. Scope Boundaries:**  
> This milestone implements DIAGNOSTIC grading only. Practice grading, re-test grading, parent AI grading, recommendation AI, adaptive item selection, and broad curriculum expansion remain NOT implemented.

---

## 4. Automated Verification Results

All quality gates passed with zero errors:

| Verification Gate | Command | Result |
|---|---|---|
| Server Diagnostic Tests (41 tests) | `npx vitest run tests/diagnostic/server-diagnostic-grading-v1.test.ts` | **PASS** (41/41 tests passing) |
| Delivery Boundary Tests (15 tests) | `npx vitest run tests/curriculum/server-delivery-boundary-r2-2-1.test.ts` | **PASS** (15/15 tests passing) |
| Persistence V1 Regression Matrix (38 tests) | `npx vitest run tests/persistence/learning-persistence-v1.test.tsx` | **PASS** (38/38 tests passing) |
| Full Test Suite | `npm test` | **PASS** (330/330 tests across 40 test files) |
| TypeScript Typecheck | `npm run typecheck` (`tsc --noEmit`) | **PASS** (0 errors) |
| Next.js Linter | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| Production Build | `npm run build` | **PASS** (25 static & dynamic routes compiled) |
| Playwright E2E Suite | `npm run test:e2e` | **PASS** (34/34 Playwright tests passing) |

---

## 5. Files Created & Modified

1. [`supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql) [RESTORE]
   - Restored exactly to historical `4c1256a` version.
2. [`supabase/migrations/20260919000004_diagnostic_grading_concurrency_fix.sql`](file:///d:/giao_duc/supabase/migrations/20260919000004_diagnostic_grading_concurrency_fix.sql) [NEW]
   - Additive migration dropping old 00003 overload and creating upgraded RPC with `p_expected_node_exists`, `p_attempt_misconception_tags`, and `p_node_misconception_tags`.
3. [`src/domain/diagnostic/types.ts`](file:///d:/giao_duc/src/domain/diagnostic/types.ts) [MODIFY]
   - Split `misconceptionTags` into `attemptMisconceptionTags` and `nodeMisconceptionTags` in `AtomicDiagnosticGradingParams`.
4. [`src/application/diagnostic/server-diagnostic-service.ts`](file:///d:/giao_duc/src/application/diagnostic/server-diagnostic-service.ts) [MODIFY]
   - Passes `attemptMisconceptionTags: evaluated.detectedMisconceptions` and `nodeMisconceptionTags: newProjection.misconceptionTags`.
5. [`src/infrastructure/database/in-memory-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/in-memory-learning-persistence-repository.ts) [MODIFY]
   - Persists `attemptMisconceptionTags` to attempts and `nodeMisconceptionTags` to node states.
6. [`src/infrastructure/database/supabase-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/supabase-learning-persistence-repository.ts) [MODIFY]
   - Passes `p_attempt_misconception_tags` and `p_node_misconception_tags` to RPC.
7. [`tests/diagnostic/server-diagnostic-grading-v1.test.ts`](file:///d:/giao_duc/tests/diagnostic/server-diagnostic-grading-v1.test.ts) [MODIFY]
   - Added Requirement 45 (migration regression for 00003 vs 00004).
   - Added Requirement 46 (misconception tags split 3-attempt sequential regression flow). Total test count increased to 41.
8. [`docs/evidence/SERVER_SIDE_DIAGNOSTIC_GRADING_V1_REPORT.md`](file:///d:/giao_duc/docs/evidence/SERVER_SIDE_DIAGNOSTIC_GRADING_V1_REPORT.md) [MODIFY]
   - Updated evidence documentation.
