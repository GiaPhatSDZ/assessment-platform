# Evidence Report: Milestone M3 — Supabase Persistence & Secure Anonymous Ownership

**Date:** 2026-09-17  
**Milestone:** M3 — Supabase Persistence and Secure Anonymous Ownership  
**Executor:** Gemini 3.8 Flash (Autonomous)  
**Status:** PASS  

---

## 1. Scope Delivered & Verified

1. **Database Schema & Migrations (`supabase/migrations/`):**
   - Ordered SQL migration `20260917000001_initial_schema.sql` defining:
     - `assessments` (identity-level metadata)
     - `assessment_versions` (immutable definition snapshot)
     - `assessment_sessions` (tracking anonymous visitor hashes & optional user IDs)
     - `assessment_answers` (unique per session and question)
     - `assessment_results` (deterministic score calculations only; AI prose excluded)
     - `referral_sources` (campaign & attribution codes)
     - `leads` (name, email, timestamped consents)
     - `generated_reports` (structured AI outputs)
     - `user_profiles` (auth user mapping)
     - `product_events` (minimal funnel events)
   - Enabled Row Level Security (RLS) across all tables with explicit public read access for published assessments.
2. **Assessment Seed (`supabase/seed.sql`, `src/infrastructure/database/seed.ts`):**
   - Idempotent seeding mechanism ensuring reference assessment `asmt-ai-career-readiness-v1` and standard referral codes (`DEMO123`, `DIRECT`) are initialized.
3. **Cryptographic Anonymous Ownership (`src/infrastructure/auth/anonymous-visitor.ts`):**
   - High-entropy 256-bit visitor token generated via `crypto.randomBytes(32)` stored in HttpOnly, SameSite=Lax, Secure cookie `assessment_visitor_token`.
   - The database stores only the SHA-256 derived hash (`visitor_owner_hash`).
   - Constant-time verification prevents timing attacks.
   - Attackers possessing only a valid session UUID cannot view, modify, or read assessment results.
4. **Authoritative Server Scoring (`app/api/assessment/submit/route.ts`):**
   - Server recomputes scores mathematically from the published immutable assessment version and submitted answers.
   - Client-submitted score objects are strictly ignored.
   - Submissions with incomplete required answers or malformed option IDs are rejected with HTTP 400.
5. **Repository Layer:**
   - Application interface `AssessmentRepository` implemented by `SupabaseAssessmentRepository` and `InMemoryAssessmentRepository`.

---

## 2. Test Execution & Evidence

### 2.1 Repository Integration Tests
- **File:** `tests/integration/repository.test.ts`
- **Results:** 4/4 passing
  - Session creation with hashed visitor owner token
  - Owner read and incremental answer update
  - Unauthorized visitor rejection
  - Authoritative deterministic result persistence and ownership check

### 2.2 Server Scoring Authority Tests
- **File:** `tests/integration/server-scoring.test.ts`
- **Results:** 3/3 passing
  - Recomputes authoritative score ignoring client-injected scores
  - Rejection of incomplete required answers
  - Rejection of unknown question IDs

### 2.3 Visitor Ownership Cryptographic Tests
- **File:** `src/infrastructure/auth/anonymous-visitor.test.ts`
- **Results:** 4/4 passing
  - Token uniqueness and length
  - Deterministic SHA-256 hashing
  - Verified ownership matching
  - Rejection of mismatched or forged tokens
