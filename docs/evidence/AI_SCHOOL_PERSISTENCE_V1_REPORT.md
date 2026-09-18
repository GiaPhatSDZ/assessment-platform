# AI School — Learning Evidence Persistence V1 Report

```text
EXECUTOR AI SCHOOL PERSISTENCE V1 CONTROLLER FIX COMPLETE
CONTROLLER REVIEW: PENDING
```

**Milestone:** AI School Persistence V1 — Controller Audit Fixes  
**Baseline Commit (Remote Main):** `ac2f0613fc8afded173da5b9125e7b657e7ca822`  
**Date:** 2026-09-18  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Branch:** `main`  

---

## 1. Executive Summary

Milestone **AI School Persistence V1** establishes the production-grade persistence foundation and ownership security model for student learning evidence, deterministic knowledge node projections, and mastery transition audit history.

Following the Controller Audit of commit `088dfa7e0e6669147e981b8ba91c16a5ca2b9d15` (remote main `ac2f0613fc8afded173da5b9125e7b657e7ca822`), all six required security and integrity fixes (P0-1, P0-2, P1-1, P1-2, P1-3, P1-4) have been implemented, verified, and regression-tested across both `InMemoryLearningPersistenceRepository` and `SupabaseLearningPersistenceRepository`.

---

## 2. Controller Audit Fixes Implemented

### 2.1 P0-1: Guardian Claim Ownership Security
- **Problem:** `claimLearnerForGuardian()` previously allowed a claim if `ownership.userId === guardianUserId`, permitting an authenticated user knowing a `learnerId` to claim an anonymous learner without visitor token ownership.
- **Resolution:**
  - Initial anonymous learner → guardian binding strictly requires all four conditions:
    1. `ownership.userId` exists
    2. `ownership.userId === guardianUserId`
    3. `ownership.visitorToken` exists
    4. visitor token verifies against `learner.visitor_owner_hash`
  - If an identical guardian relationship already exists in `guardian_learner_relationships`, authenticated `ownership.userId === guardianUserId` succeeds idempotently for subsequent access.
  - Visitor ownership alone cannot bind an arbitrary guardian user; matching `userId` alone cannot claim an anonymous learner.
  - Implemented in both `InMemoryLearningPersistenceRepository` and `SupabaseLearningPersistenceRepository`.
  - Added comprehensive test cases A through F in test suite:
    - **A:** matching guardian userId WITHOUT visitor token → DENIED (`UnauthorizedLearnerAccessError`)
    - **B:** valid visitor token WITHOUT authenticated userId → DENIED (`UnauthorizedLearnerAccessError`)
    - **C:** valid visitor token + different authenticated userId → DENIED (`UnauthorizedLearnerAccessError`)
    - **D:** valid visitor token + matching authenticated guardian → PASS (`true`)
    - **E:** existing guardian relationship permits later authenticated access (idempotent claim & load)
    - **F:** unrelated guardian remains denied (`UnauthorizedLearnerAccessError` / `null`)

### 2.2 P0-2: Supabase Node State Column Mapping
- **Problem:** `SupabaseLearningPersistenceRepository.upsertNodeState()` wrote payload key `lastAssessedAt` instead of snake_case column `last_assessed_at`.
- **Resolution:**
  - Fixed upsert payload key to `last_assessed_at`.
  - Added mock-client contract test verifying that the exact database insert/upsert keys are:
    `["attempts_count", "confidence", "correct_count", "last_assessed_at", "learner_id", "misconception_tags", "node_id", "rule_version", "state", "updated_at"]`
  - Explicitly asserted that `lastAssessedAt` does not appear in the database write payload.

### 2.3 P1-1: Evidence Semantic Integrity
- **Problem:** Knowledge evidence could theoretically be inserted with arbitrary node IDs or contradictory outcome/type metadata.
- **Resolution:**
  - Enforced strict semantic derivation in both repositories prior to inserting into `knowledge_evidence`:
    - `evidence.outcome` must match `attempt.isCorrect`: `true` → `CORRECT`, `false` → `INCORRECT`. Throws `EvidenceSemanticMismatchError`.
    - `evidence.evidenceType` must match `session.sessionKind`:
      - `DIAGNOSTIC` → `DIAGNOSTIC_ATTEMPT`
      - `PRACTICE` → `PRACTICE_ATTEMPT`
      - `RETEST` → `RETEST_ATTEMPT`
      Throws `EvidenceSemanticMismatchError`.
    - `evidence.nodeId` must equal `attempt.primaryNodeId`. Throws `EvidenceSemanticMismatchError`.
  - Added negative regression tests for all mismatch permutations in both In-Memory and Supabase mock repository tests.

### 2.4 P1-2: Hash Contract Consistency
- **Problem:** Item content hash validator permitted uppercase hexadecimal hashes (`/^[a-f0-9]{64}$/i`), whereas the database migration strictly enforces lowercase `^[a-f0-9]{64}$`.
- **Resolution:**
  - Updated `SHA256_REGEX` in `src/domain/learning-persistence/types.ts` to `/^[a-f0-9]{64}$/` without the `/i` flag.
  - Canonical item content hash must be strictly lowercase.
  - Added test asserting that uppercase SHA-256 strings throw `InvalidItemHashError`.

### 2.5 P1-3: NOT_ASSESSED State Consistency
- **Problem:** Database constraint previously allowed `NOT_ASSESSED` node states with non-null `last_assessed_at` or non-zero attempts/correct counts.
- **Resolution:**
  - Strengthened database check constraint `chk_node_states_last_assessed` in `supabase/migrations/20260918000002_ai_school_learning_persistence_v1.sql`:
    ```sql
    CONSTRAINT chk_node_states_last_assessed CHECK (
      (state = 'NOT_ASSESSED' AND attempts_count = 0 AND correct_count = 0 AND last_assessed_at IS NULL) OR
      (state != 'NOT_ASSESSED' AND last_assessed_at IS NOT NULL)
    )
    ```
  - Added domain validator `validateNodeStateConsistency(state, attemptsCount, correctCount, lastAssessedAt)` throwing `NodeStateConsistencyError`.
  - Enforced in both repositories: `upsertNodeState()` normalizes `lastAssessedAt` to `null` when state is `NOT_ASSESSED`.

### 2.6 P1-4: Session / Mastery Semantic Match
- **Problem:** Mastery transitions could be recorded with reason codes that do not match the triggering session kind.
- **Resolution:**
  - Enforced semantic matching in `appendMasteryTransition()`:
    - `DIAGNOSTIC` → `DIAGNOSTIC_EVALUATION`
    - `PRACTICE` → `PRACTICE_EVALUATION`
    - `RETEST` → `RETEST_EVALUATION`
    - Mismatches throw `MasterySemanticMismatchError`.
  - Added negative regression tests for reason code mismatches across all session types.

---

## 3. Explicit Declarations & Disclaimers

> [!IMPORTANT]
> **1. No live Supabase integration test has been claimed:**  
> All persistence verification is performed against the strict SQL migration schema using comprehensive in-memory repository tests and typed Supabase mock-client contract tests asserting exact database column names, types, and constraints. Zero unverified live database claims are made.
>
> **2. Server-side grading remains NOT implemented:**  
> Persistence V1 stores evaluated attempts and derived evidence supplied by authoritative test fixtures or backend evaluation services. Server-side diagnostic grading, item rubric evaluation, and atomic state transitions belong to the next milestone.
>
> **3. Current Grade 6 content remains DRAFT / unavailable:**  
> Grade 6 Mathematics question items and lesson content remain `DRAFT / AI_DRAFT / SOURCE_LINKED`. The student runtime diagnostic remains fail-closed (`CONTENT_NOT_AVAILABLE`). No publication gates or cryptographic reviewer authorities were bypassed or altered.

---

## 4. Automated Verification Results

All quality gates passed with zero errors:

| Verification Gate | Command | Result |
|---|---|---|
| Persistence Test Matrix (38 tests) | `npx vitest run tests/persistence/learning-persistence-v1.test.tsx` | **PASS** (38/38 tests passing, including P0-1, P0-2, P1-1, P1-2, P1-3, P1-4) |
| Full Test Suite | `npm test` | **PASS** (289/289 tests across 39 test files) |
| Typecheck | `npx tsc --noEmit` | **PASS** (0 errors) |
| Linter | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| Production Build | `npm run build` | **PASS** (24 static & dynamic routes compiled) |
| End-to-End Suite | `npm run test:e2e` | **PASS** (34/34 Playwright tests passing) |

---

## 5. Files Modified

1. [`src/domain/learning-persistence/types.ts`](file:///d:/giao_duc/src/domain/learning-persistence/types.ts)
   - Updated `SHA256_REGEX` to lowercase `/^[a-f0-9]{64}$/`.
   - Added error classes: `EvidenceSemanticMismatchError`, `MasterySemanticMismatchError`, `NodeStateConsistencyError`.
   - Added validation helpers: `validateNodeStateConsistency`, `sessionKindToEvidenceType`, `sessionKindToMasteryReason`.
2. [`supabase/migrations/20260918000002_ai_school_learning_persistence_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260918000002_ai_school_learning_persistence_v1.sql)
   - Strengthened `chk_node_states_last_assessed` constraint.
3. [`src/infrastructure/database/in-memory-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/in-memory-learning-persistence-repository.ts)
   - Implemented P0-1 guardian 4-condition claim check and idempotent access.
   - Implemented P1-1 evidence semantic integrity checks.
   - Implemented P1-3 `validateNodeStateConsistency`.
   - Implemented P1-4 trigger session / mastery reason code match.
4. [`src/infrastructure/database/supabase-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/supabase-learning-persistence-repository.ts)
   - Implemented P0-1 guardian 4-condition claim check and idempotent access.
   - Fixed P0-2 `last_assessed_at` snake_case DB column mapping in `upsertNodeState`.
   - Implemented P1-1 evidence semantic integrity checks.
   - Implemented P1-3 `validateNodeStateConsistency`.
   - Implemented P1-4 trigger session / mastery reason code match.
5. [`tests/persistence/learning-persistence-v1.test.tsx`](file:///d:/giao_duc/tests/persistence/learning-persistence-v1.test.tsx)
   - Added test suite for P0-1 (Tests A-F for in-memory and Supabase mock client).
   - Added test suite for P0-2 (Supabase node state column mapping).
   - Added test suite for P1-1 (negative regression tests for outcome, evidenceType, nodeId).
   - Added test suite for P1-2 (lowercase SHA-256 only).
   - Added test suite for P1-3 (`NOT_ASSESSED` consistency domain and migration check).
   - Added test suite for P1-4 (mastery reason code vs session kind).
6. [`docs/evidence/AI_SCHOOL_PERSISTENCE_V1_REPORT.md`](file:///d:/giao_duc/docs/evidence/AI_SCHOOL_PERSISTENCE_V1_REPORT.md)
   - Updated report with controller audit fixes, explicit statements, and verification evidence.
