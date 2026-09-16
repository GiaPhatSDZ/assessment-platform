# Assessment Platform — Autonomous Implementation Plan v1.1

**Date:** 2026-09-17  
**Execution model:** One autonomous Gemini implementation run, with internal verification gates and no human checkpoint between milestones  
**Spec authority:** `docs/superpowers/specs/2026-09-17-assessment-platform-design.md`  
**Final controller audit:** After the full implementation is committed/pushed  
**Target:** GitHub-ready, Vercel-ready production V1

> Executor rule: complete the whole plan unless a true hard blocker prevents continuation. Do not pause after each task for controller approval.

---

# 0. Execution Protocol

Before coding:

1. Inspect repository state.
2. Read the full spec.
3. Read this full plan.
4. If Superpowers is installed, use its relevant execution/TDD/verification skills.
5. Create/verify an isolated worktree or safe feature branch when appropriate.
6. Establish a clean baseline.
7. Create an internal task checklist.
8. Execute milestone by milestone.
9. For every milestone:
   - write/adjust tests
   - implement
   - run milestone checks
   - fix failures
   - record evidence
   - commit
   - continue automatically
10. Run final full verification.
11. Push GitHub if authenticated/authorized.
12. Produce final evidence report.

Do not ask for routine approvals.

---

# Milestone M0 — Repository Foundation

## M0.1 Inspect / initialize repository

If repo already exists:
- inspect files
- inspect `git status`
- inspect current branch
- inspect recent commits
- preserve owner work
- do not destructively overwrite unrelated content

If empty:
- initialize Git
- initialize Next.js App Router application
- TypeScript
- Tailwind
- npm
- ESLint

Prefer current stable versions at execution time and commit the lockfile.

### Required scripts

Ensure `package.json` exposes:

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "start": "...",
    "lint": "...",
    "typecheck": "...",
    "test": "...",
    "test:watch": "...",
    "test:e2e": "...",
    "check": "..."
  }
}
```

`check` should run the appropriate non-E2E quality gates.

### Files

Create or normalize:
- `.gitignore`
- `.editorconfig`
- `.env.example`
- `README.md` placeholder
- `tsconfig.json`
- lint config
- test config

### Verification

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

### Commit

```text
chore: bootstrap assessment platform
```

---

## M0.2 Testing foundation

Install/configure:
- Vitest
- React Testing Library
- jsdom where needed
- Playwright

Create:
- one unit sanity test
- one page/component smoke test
- Playwright config

Do not overconfigure.

### Verification

```bash
npm run test
npx playwright install --with-deps
```

Use OS-appropriate Playwright install if `--with-deps` is unsupported.

### Commit

```text
test: establish application test harness
```

---

## M0.3 Project boundaries

Create core directories matching the spec:

```text
src/domain/assessment/
src/application/
src/infrastructure/
src/content/
src/config/
components/assessment/
components/results/
components/marketing/
components/ui/
assessments/
tests/integration/
tests/e2e/
docs/superpowers/specs/
docs/superpowers/plans/
docs/evidence/
docs/adr/
docs/oss/
supabase/migrations/
```

Add boundary notes in `ARCHITECTURE.md` draft.

No business logic yet.

### Commit

```text
chore: establish architecture boundaries
```

---

# Milestone M1 — Domain Contracts and Deterministic Scoring

## M1.1 Assessment domain types

Create:

```text
src/domain/assessment/types.ts
src/domain/assessment/errors.ts
```

Define:
- `AssessmentDefinition`
- `DimensionDefinition`
- `QuestionDefinition`
- `QuestionOption`
- `ScoringContribution`
- `Answer`
- `AssessmentScore`
- `DimensionScore`
- result band types

No framework imports.

### Tests

Compile-time/type tests if useful; runtime tests come with schema.

### Commit

```text
feat: define assessment domain model
```

---

## M1.2 Runtime schemas

Create:

```text
src/domain/assessment/schema.ts
src/domain/assessment/schema.test.ts
```

Use Zod.

RED tests first for:
- duplicate dimension IDs
- duplicate question IDs
- duplicate option IDs
- unknown scoring dimension
- invalid weight
- malformed option value
- missing required fields

Then implement minimum validation.

### Commit

```text
feat: validate assessment definitions
```

---

## M1.3 Scoring algorithm

Create:

```text
src/domain/assessment/scoring.ts
src/domain/assessment/scoring.test.ts
```

RED tests:
1. minimum answers normalize correctly
2. maximum answers normalize correctly
3. mixed answers
4. weighted contribution
5. reverse scoring if used
6. invalid question
7. invalid option
8. duplicate answers
9. incomplete required answers
10. deterministic regression fixture

Implementation:
- calculate theoretical per-dimension min/max
- calculate raw score
- normalize `0..100`
- stable rounding rule
- evidence question IDs
- scoring version constant

Avoid database/provider imports.

### Commit

```text
feat: implement deterministic scoring engine
```

---

## M1.4 Result bands

Create:

```text
src/domain/assessment/result-bands.ts
src/domain/assessment/result-bands.test.ts
```

Rules:
- `0..39`
- `40..59`
- `60..79`
- `80..100`

Tests include exact boundaries.

### Commit

```text
feat: add deterministic result bands
```

---

## M1.5 Initial Vietnamese assessment definition

Create:

```text
assessments/ai-career-readiness-v1.ts
assessments/ai-career-readiness-v1.test.ts
```

Requirements:
- slug such as `ai-career-readiness`
- locale `vi`
- exactly 4 dimensions from spec
- exactly 10 questions
- 5 options each
- neutral, clear Vietnamese
- no copied MindX questionnaire text
- explicit demo/non-diagnostic disclaimer
- definition validates against schema

Question design:
- cover each dimension multiple times
- avoid obvious “good answer” wording when possible
- keep completion time short
- no sensitive personal questions

### Commit

```text
feat: add Vietnamese reference assessment
```

---

# Milestone M2 — Marketing Shell and Local Vertical Slice

## M2.1 Central site configuration

Create:

```text
src/config/site.ts
src/content/vi/site-copy.ts
```

Centralize:
- temporary brand
- description
- navigation labels
- CTA copy
- support placeholder
- SEO defaults

Do not scatter brand text.

### Commit

```text
feat: centralize product configuration
```

---

## M2.2 Landing page

Implement `/`.

Components may include:

```text
components/marketing/Hero.tsx
components/marketing/DimensionPreview.tsx
components/marketing/HowItWorks.tsx
components/marketing/ResultPreview.tsx
components/marketing/Faq.tsx
components/marketing/Footer.tsx
```

Requirements:
- polished mobile-first
- not a copy of reference site
- real explanation of value
- no fabricated proof
- CTA starts assessment
- referral query preserved when starting

Component tests:
- H1
- CTA
- dimensions
- FAQ
- disclaimer/privacy hint

### Commit

```text
feat: build public landing experience
```

---

## M2.3 Local session storage abstraction

Before server persistence, define an application port:

```text
src/application/session-store.ts
src/infrastructure/browser/local-session-store.ts
```

Capabilities:
- create/load local draft
- save/replace answer
- current step
- assessment version
- finalized score snapshot

Validate deserialized data.

Tests:
- save/load
- overwrite
- corrupt data ignored safely
- assessment version mismatch rejected/restarted safely

### Commit

```text
feat: add recoverable local assessment sessions
```

---

## M2.4 Assessment runner

Route:

```text
/assessment/[slug]
```

Components:
- `AssessmentRunner`
- `QuestionCard`
- `AnswerOption`
- `ProgressBar`
- navigation controls

Requirements:
- one question per screen
- touch-friendly
- keyboard-friendly
- visible progress
- Previous/Next
- persisted answer selection
- refresh resumes
- final submit runs deterministic scorer
- prevent duplicate finalization
- never render scoring weights

Tests:
- required answer blocking
- forward/back
- progress
- restored answer
- completion
- scorer invocation

### Commit

```text
feat: implement mobile assessment runner
```

---

## M2.5 Result preview

Initial local route/state:
- result page using local finalized score until DB milestone replaces persistence

Components:

```text
components/results/RadarResult.tsx
components/results/DimensionScoreCard.tsx
components/results/DeterministicSummary.tsx
components/results/FullReportCta.tsx
```

Use Recharts if appropriate.

Requirements:
- all 4 dimensions
- numeric/text score equivalents
- radar chart is not sole representation
- result bands
- disclaimer
- CTA for full report (may be placeholder until M5)

Tests:
- scores rendered
- band labels rendered
- disclaimer rendered

### Commit

```text
feat: render deterministic assessment results
```

---

## M2.6 Local E2E vertical slice

Playwright:

```text
landing
→ click CTA
→ answer all 10
→ complete
→ result appears
→ refresh
→ result still appears
```

Test at desktop and one mobile viewport if runtime allows.

Create:

```text
docs/evidence/M2_LOCAL_VERTICAL_SLICE.md
```

Record:
- command
- browser
- result
- known limitations
- commit SHA

### Verification gate

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Fix until green.

### Commit

```text
test: close local deterministic vertical slice
```

---

# Milestone M3 — Supabase Persistence and Secure Anonymous Ownership

## M3.1 Supabase configuration

Add dependencies/config.

Create:

```text
src/infrastructure/database/supabase-server.ts
src/infrastructure/auth/anonymous-visitor.ts
```

Client exposure:
- anon URL/key only where appropriate
- service-role server-only

Update `.env.example`.

App should still present a clear setup error or local/demo mode when Supabase is not configured.

### Commit

```text
chore: configure supabase integration
```

---

## M3.2 Database migrations

Create ordered SQL migrations for:
- assessments
- assessment_versions
- assessment_sessions
- assessment_answers
- assessment_results
- referral_sources
- leads
- generated_reports
- user_profiles
- product_events

Requirements:
- PK/FK
- unique constraints
- useful indexes
- timestamps
- immutable-version protection where practical
- RLS policies where appropriate

Do not put secrets in seed SQL.

### Commit

```text
feat: add production database schema
```

---

## M3.3 Assessment seed/sync

Create a safe mechanism to ensure the reference assessment exists in DB.

Possible:
- idempotent seed script
- migration-safe JSON snapshot

Requirements:
- versioned
- idempotent
- source definition remains reviewable
- published snapshot immutable after creation

Add script/documentation.

### Commit

```text
feat: seed versioned reference assessment
```

---

## M3.4 Anonymous ownership credential

Implement secure server-managed visitor/session ownership.

Preferred:
- cryptographically random token
- HttpOnly cookie
- only hash/derived identifier persisted
- Secure in production
- SameSite=Lax
- appropriate path/max age

Tests:
- owner can read/update own session
- different visitor cannot
- guessed session ID alone is insufficient

### Commit

```text
feat: secure anonymous session ownership
```

---

## M3.5 Assessment repository

Create application interface:

```text
src/application/assessment-repository.ts
```

Supabase implementation:

```text
src/infrastructure/database/supabase-assessment-repository.ts
```

Methods:
- create session
- load owned session
- upsert answer
- finalize session
- persist deterministic result
- load owned result

No raw Supabase queries in React components.

Integration tests with suitable test DB strategy or mocked boundary where live DB is unavailable.

### Commit

```text
feat: persist assessment sessions and results
```

---

## M3.6 Replace local final authority with server persistence

Keep local storage only as temporary draft resilience if useful.

Canonical completed result must come from server/database.

Flow:
- start server session
- answers persist incrementally or at safe checkpoints
- finalization verifies all answers server-side
- server recomputes deterministic score from authoritative assessment definition
- server persists result
- client displays persisted score

Never trust a client-submitted score.

### Tests

Critical:
- tampered client score ignored
- server recomputes
- unknown option rejected
- incomplete finalization rejected

### Commit

```text
feat: make server scoring authoritative
```

---

## M3.7 DB-backed E2E

E2E with configured Supabase/test environment:

```text
start
→ answer
→ refresh mid-assessment
→ resume
→ complete
→ result
→ refresh result
```

Ownership negative test.

Create:

```text
docs/evidence/M3_PERSISTENCE_ACCEPTANCE.md
```

### Commit

```text
test: close secure persistence milestone
```

---

# Milestone M4 — Referral Attribution and First-Party Funnel Events

## M4.1 Referral parser

Create:

```text
src/domain/referral/referral.ts
src/domain/referral/referral.test.ts
```

Rules:
- trim
- case policy documented
- allowed charset
- max length
- reject unsafe/malformed input
- never interpolate raw referral into SQL

### Commit

```text
feat: validate referral attribution codes
```

---

## M4.2 Session attribution

On landing/start:
- capture validated `?ref=`
- persist first-touch referral to created session
- do not overwrite after start

Test:
- valid saved
- invalid ignored/rejected safely
- later different ref does not rewrite session attribution

### Commit

```text
feat: persist first-touch referral attribution
```

---

## M4.3 Product event abstraction

Create:

```text
src/application/analytics.ts
src/infrastructure/analytics/noop-analytics.ts
src/infrastructure/analytics/first-party-events.ts
```

Events from spec.

Do not include full answer content.

### Commit

```text
feat: add privacy-aware funnel events
```

---

## M4.4 Optional PostHog adapter

Create only if configuration is simple and isolated.

Must be disabled safely without key.

Test adapter mapping at unit level.

### Commit

```text
feat: add optional posthog analytics adapter
```

---

# Milestone M5 — Delayed Lead Capture and AI Report

## M5.1 Full report request UI

On deterministic result:

CTA:

```text
Xem báo cáo đầy đủ
```

Form:
- display name
- email
- required processing consent
- optional marketing consent

Validation:
- sane display-name length
- normalized email
- consent required
- no prechecked marketing

Do not ask phone number.

Tests:
- invalid email
- missing required consent
- optional marketing false by default

### Commit

```text
feat: add delayed full-report request flow
```

---

## M5.2 Lead persistence

Application interface + Supabase implementation.

Requirements:
- link lead to owned session/result
- deduplicate safely where appropriate
- consent timestamps
- never log raw email unnecessarily

### Commit

```text
feat: persist report leads and consent
```

---

## M5.3 AI report contracts

Create:

```text
src/application/report-generator.ts
src/domain/report/types.ts
src/domain/report/schema.ts
src/domain/report/schema.test.ts
```

Structured fields:
- summary
- strengths
- growthAreas
- actionPlan
- disclaimer

Validate lengths and arrays.

### Commit

```text
feat: define structured ai report contract
```

---

## M5.4 Prompt builder and prompt version

Create:

```text
src/infrastructure/ai/prompts/report-v1.ts
src/infrastructure/ai/build-report-input.ts
```

Requirements:
- explicit deterministic evidence
- instruction forbidding score changes
- non-diagnostic language
- Vietnamese output
- prompt version constant

Unit test assembled prompt/input for required boundaries.

### Commit

```text
feat: version assessment report prompts
```

---

## M5.5 Provider adapter

Implement one provider adapter selected from available project credentials/owner preference without coupling domain code.

Path:

```text
src/infrastructure/ai/providers/
```

If using SDK:
- server-only
- pinned dependency
- timeout
- structured JSON
- error categories

Tests mock provider:
- valid report
- malformed JSON/schema
- timeout/error
- provider disabled

### Commit

```text
feat: add ai report provider adapter
```

---

## M5.6 Report generation use case

Create application use case:
1. verify owned completed result
2. verify lead/consent
3. enforce one/cost-safe generation policy
4. prepare deterministic evidence
5. call provider if configured
6. validate response
7. persist generated report
8. return safe status

If provider unavailable:
- return graceful unavailable status
- deterministic result remains
- no fake AI copy

### Commit

```text
feat: generate validated personalized reports
```

---

## M5.7 Report page

Route:

```text
/report/[sessionId]
```

Display:
- deterministic scores
- summary
- strengths
- growth areas
- action items
- disclaimer
- provider-unavailable state if needed

Authorization: owner only unless later authenticated association permits.

### Commit

```text
feat: add full personalized report page
```

---

## M5.8 AI report E2E

Two branches:

A. provider configured/mocked:
```text
result → form → report generated → report page
```

B. provider unavailable:
```text
result → form → deterministic result preserved → graceful message
```

Create:

```text
docs/evidence/M5_REPORT_ACCEPTANCE.md
```

### Commit

```text
test: close personalized report milestone
```

---

# Milestone M6 — Authentication and Participant Dashboard

## M6.1 Supabase magic-link authentication

Routes:
- login/request magic link
- auth callback

Requirements:
- safe redirect allowlist
- no open redirect
- auth errors user-friendly
- existing anonymous session association only after ownership verification

### Commit

```text
feat: add magic-link authentication
```

---

## M6.2 User profile association

Create/update `user_profiles`.

Allow authenticated user to claim current owned completed session.

Do not bulk-claim sessions based only on matching email.

### Commit

```text
feat: associate owned sessions with users
```

---

## M6.3 Dashboard

Route:

```text
/dashboard
```

Show:
- completed assessments
- completion date
- dimension summary
- report status
- links

Empty state.

Tests:
- unauthenticated redirected/login prompt
- authenticated only sees own items

### Commit

```text
feat: add participant assessment dashboard
```

---

# Milestone M7 — Admin Minimum

## M7.1 Admin authorization

Use server-side authorization.

Simple V1 option:
- authenticated email must exist in server-only normalized `ADMIN_EMAILS`
or
- admin role stored in trusted user metadata

Do not use client-only hiding.

Tests:
- unauthenticated denied
- normal user denied
- admin allowed

### Commit

```text
feat: protect admin routes
```

---

## M7.2 Admin overview

Route:

```text
/admin
```

Metrics:
- starts
- completions
- completion rate
- report requests
- reports generated
- referral breakdown

Use real DB queries.

No fabricated charts.

### Commit

```text
feat: add admin funnel overview
```

---

## M7.3 Admin session inspection

Allow minimal session/result view:
- assessment version
- timestamps
- dimension scores
- referral code if present

Avoid unnecessary display of raw answers/contact data.

### Commit

```text
feat: add privacy-conscious admin result inspection
```

---

# Milestone M8 — Legal, Privacy, Accessibility, SEO, Hardening

## M8.1 Privacy page

Create `/privacy`.

It must accurately describe implemented behavior:
- what is collected
- why
- AI provider involvement if configured
- analytics if configured
- retention/contact placeholders
- user rights path

Do not claim legal compliance certifications without proof.

### Commit

```text
docs: add product privacy notice
```

---

## M8.2 Terms page

Create `/terms`.

Plain-language baseline:
- self-reflection tool
- not medical/psychological diagnosis
- no guaranteed outcomes
- user responsibility
- open-source/software terms separated where needed

Do not copy another company’s terms.

### Commit

```text
docs: add product terms
```

---

## M8.3 Accessibility audit

Manual + automated where practical.

Verify:
- keyboard can finish assessment
- focus visible
- labels
- errors
- chart text equivalent
- touch targets
- color-independent state
- reduced motion

Fix blocking issues.

Record:

```text
docs/evidence/M8_ACCESSIBILITY.md
```

### Commit

```text
fix: harden assessment accessibility
```

---

## M8.4 Security audit

Review:
- env exposure
- cookies
- authorization
- RLS
- server actions/API routes
- open redirects
- XSS surfaces
- email validation
- AI endpoint abuse
- error logging
- Git history secret scan where available

Add:
- security headers
- cost-safe AI generation constraint
- `SECURITY.md`

Record:

```text
docs/evidence/M8_SECURITY.md
```

### Commit

```text
fix: harden production security baseline
```

---

## M8.5 SEO and index policy

Add:
- metadata
- OpenGraph basics
- sitemap
- robots

Noindex:
- private results where appropriate
- reports
- dashboard
- admin

### Commit

```text
feat: add public metadata and index controls
```

---

## M8.6 Performance review

Review:
- client bundle
- third-party scripts
- chart loading
- images
- unnecessary client components

Fix only measured/obvious issues.

Record:

```text
docs/evidence/M8_PERFORMANCE.md
```

### Commit

```text
perf: reduce public page overhead
```

---

# Milestone M9 — Open Source Repository Hardening

## M9.1 README

Replace placeholder with production README.

Required sections:
- what it is
- screenshots placeholder/instructions
- features
- architecture
- deterministic scoring principle
- requirements
- local setup
- env setup
- Supabase migration/seed
- tests
- deploy to Vercel
- AI optional setup
- project status
- roadmap
- contributing
- license

A new developer should be able to run from clone.

### Commit

```text
docs: write open-source project readme
```

---

## M9.2 OSS governance files

Create:
- `LICENSE` Apache-2.0
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md` if not already
- `CHANGELOG.md`
- `.github/pull_request_template.md`
- issue templates

### Commit

```text
docs: add open-source governance files
```

---

## M9.3 Architecture documentation

Create/finalize `ARCHITECTURE.md`.

Include:
- domain boundaries
- request/data flow
- scoring authority
- AI boundary
- DB boundary
- anonymous ownership
- failure behavior
- extension points

Add Mermaid diagrams if useful and GitHub-renderable.

### Commit

```text
docs: document platform architecture
```

---

## M9.4 ADRs

At minimum create ADRs for:
1. deterministic scoring authority
2. Supabase/PostgreSQL persistence
3. optional provider-neutral AI
4. delayed lead capture
5. anonymous secure sessions

Path:

```text
docs/adr/
```

### Commit

```text
docs: record core architecture decisions
```

---

## M9.5 OSS evidence tracker

Create:

```text
docs/oss/OSS_EVIDENCE.md
```

Initialize with:
- release/version fields
- empty real-metrics table
- instruction: never fabricate metrics
- links/placeholders filled only when real

### Commit

```text
docs: add truthful oss evidence tracker
```

---

# Milestone M10 — CI and Release Readiness

## M10.1 GitHub Actions CI

Workflow:
- checkout
- supported Node version
- `npm ci`
- lint
- typecheck
- unit/component tests
- build

Optional separate E2E with environment or local mode.

Cache npm safely.

### Commit

```text
ci: verify pull requests and pushes
```

---

## M10.2 Clean clone verification

In a fresh temporary directory or worktree:
- clone/copy repository
- `npm ci`
- configure minimum local env
- run check/build
- verify README steps

Fix documentation drift.

Record:

```text
docs/evidence/M10_CLEAN_CLONE.md
```

### Commit

```text
test: verify clean-clone setup
```

---

## M10.3 Version and changelog

Prepare:

```text
v0.1.0
```

Update changelog with:
- core assessment
- deterministic scoring
- persistence
- referral
- optional AI reports
- dashboard
- admin
- OSS docs

Do not tag until final full verification passes.

### Commit

```text
chore: prepare v0.1.0 release
```

---

# Milestone M11 — Final Verification and GitHub Publication

## M11.1 Full verification

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Also run available:
- dependency audit review
- secret scan
- migration verification

If any required command fails:
- diagnose
- fix
- rerun from the failed layer
- rerun the complete final set before claiming success

Do not skip tests to get green.

---

## M11.2 Manual smoke matrix

At minimum verify:
- 360–430 px mobile landing
- start assessment
- back/next
- refresh mid-assessment
- complete
- result
- radar + text
- full-report form
- AI available/unavailable behavior
- referral `?ref=DEMO123`
- login/dashboard if configured
- admin denied/allowed behavior
- privacy/terms links

Record outcome.

---

## M11.3 Final evidence report

Create:

```text
docs/evidence/FINAL_IMPLEMENTATION_REPORT.md
```

Required sections:

```text
Executive status
Final commit SHA
Environment/tool versions
Milestone table M0–M11
Verification commands
Test summary
E2E summary
Build summary
Database/migration status
AI configuration status
Analytics status
Security review summary
Accessibility review summary
GitHub publication status
Vercel readiness/preview status
Known limitations
Deferred scope
Owner manual actions
Architecture deviations
```

No vague “all good” without evidence.

### Commit

```text
docs: add final implementation evidence
```

---

## M11.4 Final git hygiene

Verify:

```bash
git status --short
git log --oneline --decorate -n 30
```

Requirements:
- clean working tree
- no `.env`
- no API keys
- no private user data
- no generated junk
- reasonable commit history

If secret accidentally entered history, clean it before publication and rotate credential if real.

---

## M11.5 GitHub push

If GitHub authentication/permission is available:
1. create or use the intended public repository
2. set `origin`
3. push implementation branch/main according to owner permissions
4. ensure default branch is correct
5. push `v0.1.0` tag only after successful final verification
6. capture repository URL

If GitHub authentication is unavailable:
- do NOT mark implementation failed
- record this as an owner manual action
- provide exact commands
- keep repository clean and ready

Do not force push over unknown remote history.

---

## M11.6 Optional Vercel preview

If Vercel auth and required env are already available:
- create preview deploy
- do not silently promote to owner production domain
- smoke test preview
- record URL

If unavailable:
- document exact Vercel setup
- mark project `VERCEL_READY`
- do not block final completion

---

# Milestone M12 — Executor Self-Audit

This milestone is mandatory because the human/controller will not review intermediate work.

## M12.1 Spec compliance matrix

Create in final report a table:

```text
Spec requirement | Implemented? | Evidence/file | Notes
```

Cover at least:
- scoring authority
- versioned assessment
- 10 questions
- mobile flow
- refresh recovery
- server recomputation
- AI optionality
- delayed lead capture
- referral
- admin protection
- privacy
- accessibility
- OSS files
- CI

---

## M12.2 Code-quality self-review

Search for:
- duplicated scoring logic
- `any`
- `@ts-ignore`
- TODO/FIXME
- hardcoded secrets
- raw provider calls outside adapters
- direct DB queries inside UI
- unsafe redirects
- unvalidated external input
- dead code
- speculative abstractions

Fix material issues.

Document intentional remaining TODOs.

---

## M12.3 Scope audit

Ensure the executor did NOT accidentally implement:
- payments
- adaptive testing
- vector DB
- RAG
- multi-agent runtime
- native apps
- unnecessary CMS
- unrelated features

Remove speculative scope unless essential.

---

## M12.4 Final completion status

Allowed statuses:

```text
PASS
PASS_WITH_OWNER_ACTIONS
BLOCKED
```

`PASS`:
- code + tests + build + publication requirements available to executor succeeded

`PASS_WITH_OWNER_ACTIONS`:
- code is green, but external credentials/actions such as GitHub/Supabase/Vercel are unavailable

`BLOCKED`:
- a true blocker makes the implementation itself unverifiable/incomplete

Never use `PASS` when required tests are knowingly red.

---

# Autonomous Decision Rules

When a detail is missing:
1. choose the smallest option consistent with the spec
2. prefer security and reversibility
3. document material decision in ADR/final report
4. continue

When a test fails:
1. investigate root cause
2. fix implementation/test only if test itself is wrong
3. rerun
4. continue only when gate is green

When a provider credential is missing:
- implement adapter + mocked tests
- keep core functional
- document configuration
- continue

When live Supabase credentials are missing:
- complete migrations/repositories/tests using the safest available local/mock strategy
- clearly mark live DB acceptance as owner action
- continue other work

When GitHub credentials are missing:
- finish clean local repo
- provide publish commands
- do not stop early

When Vercel credentials are missing:
- keep Vercel-ready
- provide instructions
- do not stop early

---

# Final Acceptance Checklist

The executor must use this checklist at the end:

```text
Repository
[ ] clean Git working tree
[ ] lockfile committed
[ ] .env ignored
[ ] no secrets
[ ] Apache-2.0 license
[ ] governance docs

Domain
[ ] assessment schema validated
[ ] exact initial 10 questions
[ ] deterministic scorer
[ ] theoretical min/max normalization
[ ] result bands
[ ] regression determinism test

UX
[ ] mobile landing
[ ] one-question runner
[ ] progress
[ ] refresh recovery
[ ] result cards
[ ] radar + text
[ ] delayed lead gate

Persistence
[ ] migrations
[ ] secure anonymous ownership
[ ] server-side final scoring
[ ] persisted results
[ ] unauthorized access blocked

AI
[ ] provider-neutral contract
[ ] structured schema
[ ] prompt version
[ ] server-only key
[ ] missing-provider fallback
[ ] AI cannot overwrite score

Growth
[ ] referral validation
[ ] first-touch attribution
[ ] privacy-aware events
[ ] optional analytics

Accounts
[ ] optional magic-link auth
[ ] dashboard ownership
[ ] secure claim flow

Admin
[ ] server-protected
[ ] real funnel data
[ ] minimal private data exposure

Hardening
[ ] privacy
[ ] terms
[ ] accessibility audit
[ ] security audit
[ ] SEO/noindex
[ ] performance review

Quality
[ ] lint
[ ] typecheck
[ ] tests
[ ] E2E
[ ] build
[ ] CI
[ ] clean-clone verification

Publication
[ ] final evidence report
[ ] GitHub pushed if authorized
[ ] release/tag only after green
[ ] Vercel-ready
```


---

# Milestone M2A — UI/UX Design Intelligence Gate

This milestone is inserted before polished implementation of the marketing shell and should be completed before or during early M2 UI construction.

## M2A.1 Detect UI UX Pro Max

Reference project:

```text
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
```

If the `uipro` command or Gemini skill is already installed:
- record its version
- initialize/use the Gemini integration according to the project's documented workflow

For Gemini CLI the intended integration is:

```text
uipro init --ai gemini
```

If the skill is not installed and autonomous environment policy permits installing development tooling:
- use the current documented `ui-ux-pro-max-cli` package
- record the installed version

If installing global tooling is not permitted:
- do not block implementation
- use the repository documentation/guidelines as design reference
- mark live skill execution as unavailable in `UI_UX_AUDIT.md`

Do not make the production app depend on the skill.

---

## M2A.2 Generate project design-system proposal

Use the skill's design-system capability if available.

Input intent should describe the actual product, for example:

```text
mobile-first Vietnamese assessment SaaS,
trustworthy educational/self-reflection product,
clean data visualization,
calm modern UI,
Next.js + Tailwind,
accessible forms,
no fake social proof,
no aggressive AI gradients,
no medical aesthetic
```

Produce Markdown output where supported.

Do not accept generated output blindly.

Review it against the product spec.

---

## M2A.3 Commit canonical design system

Create:

```text
docs/design/DESIGN_SYSTEM.md
```

Required:
- design goals
- page/landing pattern
- approved palette/tokens
- typography
- spacing
- radii/shadows
- CTA priority
- form/control states
- assessment question state
- result cards
- chart rules
- dashboard/admin density rules
- responsive rules
- motion/reduced-motion
- accessibility
- anti-patterns

The canonical project design system is this committed document, not ephemeral skill output.

### Commit

```text
docs: define assessment platform design system
```

---

## M2A.4 Apply design system to implementation

Use the design system consistently in:
- landing
- assessment runner
- result page
- report page
- dashboard
- admin

Do not redesign each screen independently.

Centralize reusable primitives/tokens.

---

## M2A.5 UI/UX pre-delivery audit

After the main UI is implemented, use UI UX Pro Max review/search guidance where available for:

```text
responsive layout
form validation
dashboard
chart
error state
accessible icon button
focus state
reduced motion
text wrapping
long Vietnamese labels
```

Check at:

```text
375px
768px
1024px
1440px
```

Create:

```text
docs/evidence/UI_UX_AUDIT.md
```

Record:
- tool/version
- checks performed
- issues found
- fixes applied
- rejected recommendations
- remaining issues

### Commit

```text
fix: close ui ux design audit
```

---

# UI/UX Rule for Later Milestones

For all later UI work:
1. consult `docs/design/DESIGN_SYSTEM.md`
2. use UI UX Pro Max for design/review guidance where useful
3. preserve architecture/spec authority
4. avoid one-off visual systems
5. re-run responsive/a11y checks for materially changed flows
