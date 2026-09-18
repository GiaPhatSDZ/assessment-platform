# AI School — Learning Evidence Persistence V1 Report

```text
EXECUTOR AI SCHOOL PERSISTENCE V1 COMPLETE
CONTROLLER REVIEW: PENDING
```

**Milestone:** AI School Persistence V1  
**Full Commit SHA:** `088dfa7e0e6669147e981b8ba91c16a5ca2b9d15`  
**Baseline Commit:** `c7632e17ccd8c76353826bd01422be12c017d770`  
**Date:** 2026-09-18  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Branch:** `main`  
**Commit URL:** `https://github.com/GiaPhatSDZ/assessment-platform/commit/088dfa7e0e6669147e981b8ba91c16a5ca2b9d15`

---

## 1. Executive Summary

Milestone **AI School Persistence V1** establishes the production-grade data layer and ownership authority for student learning evidence, node projections, and mastery state transitions.

The authority chain for learner state is strictly structured as:
```text
published reviewed item/version
        ↓
server evaluation [NEXT MILESTONE]
        ↓
learning_attempt
        ↓
knowledge_evidence (immutable)
        ↓
deterministic node-state projection (current)
        ↓
mastery_history (append-only)
        ↓
learner history UI
```

---

## 2. Non-Destructive Database Migration

- **Migration File:** [`supabase/migrations/20260918000002_ai_school_learning_persistence_v1.sql`](file:///d:/giao_duc/supabase/migrations/20260918000002_ai_school_learning_persistence_v1.sql)
- **Legacy Preservation:** [`supabase/migrations/20260917000001_initial_schema.sql`](file:///d:/giao_duc/supabase/migrations/20260917000001_initial_schema.sql) is left untouched.

### 2.1 Seven AI School Tables Created

| Table Name | Role | Primary Key | Key Invariants / Constraints |
|---|---|---|---|
| `learner_profiles` | Anonymous-first learner identity | `id UUID` | Zero child PII (no email, phone, exact DOB, school, address). Check constraint on stage consistency (`PRESCHOOL`, `PRIMARY`, `LOWER_SECONDARY`, `UPPER_SECONDARY`). |
| `guardian_learner_relationships` | Authenticated guardian linkage | `(guardian_user_id, learner_id)` | Additive link to `user_profiles(id)`. Relationship type `PARENT` or `GUARDIAN`. |
| `learning_sessions` | Session lifecycle | `id UUID` | Kinds: `DIAGNOSTIC`, `PRACTICE`, `RETEST`. Statuses: `STARTED`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`. Composite unique constraint `(id, learner_id)` for relational integrity. |
| `learning_attempts` | Immutable evaluated attempt | `id UUID` | Foreign key `(session_id, learner_id)`. Content hash validated against `^[a-f0-9]{64}$`. Server-owned `is_correct`, misconception tags, grading rule version. |
| `knowledge_evidence` | Immutable atomic evidence | `id UUID` | Foreign key `(attempt_id, learner_id, session_id)`. Types: `DIAGNOSTIC_ATTEMPT`, `PRACTICE_ATTEMPT`, `RETEST_ATTEMPT`. Strictly excludes `PARENT_AI` or `COPILOT`. Unique `(attempt_id, node_id, evidence_type)`. |
| `knowledge_node_states` | Current deterministic projection | `(learner_id, node_id)` | States: `NOT_ASSESSED`, `UNCERTAIN`, `DEVELOPING`, `SECURE`. Confidence: `LOW`, `MEDIUM`, `HIGH`. Nullable `last_assessed_at` for `NOT_ASSESSED`. Enforces `attempts_count >= 0`, `correct_count >= 0`, `correct_count <= attempts_count`. |
| `mastery_history` | Append-only transition audit log | `id UUID` | Foreign key `(trigger_session_id, learner_id)`. Reason codes: `DIAGNOSTIC_EVALUATION`, `PRACTICE_EVALUATION`, `RETEST_EVALUATION`. Traceable to session and learner. |

### 2.2 Row-Level Security Strategy
- RLS enabled on all 7 tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Zero direct public anon/authenticated client CRUD policies.
- Access strictly constrained to server-side repository using Supabase service-role credentials.

---

## 3. Application Repository Contract & Implementations

### 3.1 Contract
- Interface: [`src/application/learning-persistence-repository.ts`](file:///d:/giao_duc/src/application/learning-persistence-repository.ts)
- Defined `OwnershipContext`: `{ visitorToken?: string; userId?: string }`.
- Append-only guarantee (A7): zero update or delete methods for `knowledge_evidence` and `mastery_history`.
- Full ownership chain verification (A9): `ownership → learner → session → attempt`.

### 3.2 Implementations
1. **In-Memory Repository:** [`src/infrastructure/database/in-memory-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/in-memory-learning-persistence-repository.ts)
   - Development & test isolated fixture engine.
   - Enforces full ownership matching, composite chain verification, and invariant validation.
2. **Supabase Repository:** [`src/infrastructure/database/supabase-learning-persistence-repository.ts`](file:///d:/giao_duc/src/infrastructure/database/supabase-learning-persistence-repository.ts)
   - Server-only (`import "server-only"`).
   - **Fail-Loud Policy:** When Supabase is configured and a database operation fails, throws `DatabasePersistenceError` immediately. Zero silent fallback to memory.
3. **Repository Factory:** [`src/infrastructure/database/learning-persistence-factory.ts`](file:///d:/giao_duc/src/infrastructure/database/learning-persistence-factory.ts)
   - Server-only (`import "server-only"`).
   - Returns `SupabaseLearningPersistenceRepository` when configured.
   - In production (`process.env.NODE_ENV === "production"`), missing Supabase configuration throws `PERSISTENCE_NOT_CONFIGURED` (`DatabasePersistenceError`).

---

## 4. UI Truth & Learner History Cleanup

- **File Modified:** [`components/v3/profile/LearnerHistory.tsx`](file:///d:/giao_duc/components/v3/profile/LearnerHistory.tsx)
- Removed all hardcoded fake learner events (`RETEST_PASSED`, `SECURE/HIGH`, `gap detected`, `Gemini Notebook`, `Toán Lớp 6`).
- Truthful empty state active by default:
  `"Chưa có lịch sử học tập được ghi nhận."`
- Illustrative demo events are explicitly separated and labeled:
  `"Ví dụ minh họa"` and `"Không phải kết quả thực tế của học sinh hiện tại"`.

---

## 5. Automated Verification Summary

| Verification Gate | Command | Result |
|---|---|---|
| Persistence Test Matrix (Tests 1–33) | `npx vitest run tests/persistence/learning-persistence-v1.test.tsx` | **PASS** (28/28 test blocks covering all 33 requirements) |
| Full Test Suite | `npm test` | **PASS** (279/279 tests across 39 files) |
| Typecheck | `npx tsc --noEmit` | **PASS** (0 errors) |
| Linter | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| Production Build | `npm run build` | **PASS** (24 static & dynamic routes compiled) |
| End-to-End Suite | `npm run test:e2e` | **PASS** (34/34 Playwright tests passing) |

---

## 6. Open Limitations

1. **Server-side grading is NOT implemented in Persistence V1.**
   - Persistence V1 stores evaluated attempts and derived evidence supplied by authoritative test fixtures or backend evaluation services.
   - Server-side diagnostic grading and live attempt evaluation belong to the next milestone.
2. **No current DRAFT curriculum content is opened to students.**
   - Grade 6 Mathematics items remain `DRAFT / AI_DRAFT / SOURCE_LINKED`.
   - Student runtime diagnostic remains fail-closed to `CONTENT_NOT_AVAILABLE`.
3. **Not Alpha User-Ready Yet.**
   - Product runtime Alpha requires the completion of server-side grading before live student attempts can be processed and persisted.
