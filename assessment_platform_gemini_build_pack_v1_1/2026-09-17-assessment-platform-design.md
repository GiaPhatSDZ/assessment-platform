# Assessment Platform — Product & Architecture Specification v1.1

**Status:** Approved implementation authority  
**Date:** 2026-09-17  
**Working repository name:** `assessment-platform`  
**Working product name:** `Assessment Studio` (temporary; all branding must be centralized and replaceable)  
**Primary audience for first release:** Vietnamese mobile users  
**Documentation/code language:** English  
**Initial UI language:** Vietnamese (`vi`)  
**Deployment target:** Vercel  
**Database/Auth target:** Supabase/PostgreSQL  
**Open-source target:** Public GitHub repository  
**License target:** Apache-2.0  
**Implementation agent:** Gemini 3.8 Flash (or equivalent coding executor)  
**Architecture authority:** This document

---

## 0. Executive Summary

Build a reusable, open-source assessment platform that converts structured answers into deterministic, explainable scores and then optionally uses AI to turn those scores into a personalized report and action plan.

The platform must not be hard-coded to one quiz or one business niche. The first public assessment is only a reference implementation.

The core product loop is:

```text
Landing
  ↓
Anonymous assessment
  ↓
Deterministic score
  ↓
Immediate result preview
  ↓
Optional lead/profile capture
  ↓
Optional AI interpretation
  ↓
Saved report / history
  ↓
Reassessment
```

The system must remain useful when AI is disabled, unavailable, rate-limited, or misconfigured.

The implementation must favor:
- deterministic domain logic
- mobile-first UX
- privacy-aware lead capture
- versioned assessment definitions
- provider-neutral AI integration
- testability
- simple deployment
- open-source maintainability
- evidence that can later support genuine OSS program applications

The project must not optimize for “demo magic.” It must optimize for a small, reliable production core that can survive future feature growth.

---

# 1. Product Vision

The product is a platform for publishing and completing structured self-assessments.

Long-term examples include:
- AI readiness
- career readiness
- founder profile
- Web3 knowledge
- trading behavior
- learning style
- team skills
- product onboarding assessments
- custom business assessments

A new assessment should be primarily new configuration/content, not a rewrite of the application.

---

# 2. First-Release Product Promise

The first production release proves one end-to-end workflow:

```text
User opens landing page
→ starts without creating an account
→ answers 10 questions
→ answers survive refresh
→ submits assessment
→ deterministic scoring engine calculates four dimensions
→ user sees radar/result cards immediately
→ user may provide name + email to request a full report
→ if AI is configured, AI generates a structured interpretation
→ result/report can be revisited
→ referral attribution is recorded
→ admin can see aggregate funnel information
```

The core assessment preview must never require an AI provider.

---

# 3. Non-Negotiable Architectural Principles

## 3.1 Deterministic scoring is authoritative

AI must never determine, alter, “correct,” or hallucinate assessment scores.

Canonical flow:

```text
AssessmentDefinition
+ UserAnswers
      ↓
Pure Scoring Engine
      ↓
AssessmentResult
      ↓
Optional AI Interpretation
```

For a given assessment version and identical answer set, scoring output must be reproducible.

## 3.2 AI is an interpretation layer

AI may:
- summarize results
- explain patterns
- translate structured evidence into natural language
- suggest non-clinical next steps
- generate an action plan

AI may not:
- create missing answers
- change numeric scores
- claim medical or psychological diagnosis
- claim psychometric validation that does not exist
- infer sensitive personal attributes
- make certainty claims beyond available evidence

## 3.3 Published assessment versions are immutable

Once an assessment version is published:
- question IDs do not change
- scoring rules do not change
- dimension IDs do not change
- historical submissions remain linked to that exact version

Changes require a new assessment version.

## 3.4 UI does not own business logic

React components render state and invoke domain/application functions.

They must not contain canonical scoring formulas.

## 3.5 Database is not the domain model

Database schemas persist domain data but do not replace explicit TypeScript domain contracts.

## 3.6 External providers are adapters

Supabase, AI providers, and analytics providers live behind narrow adapters/interfaces.

Domain logic must not import provider SDKs.

## 3.7 Mobile-first

The first design target is a 360–430 px mobile viewport.

Desktop enhances the experience; it does not define it.

## 3.8 Fail useful

If:
- AI fails
- analytics fails
- referral data is malformed
- email delivery is unavailable

the completed deterministic assessment result remains usable.

---

# 4. User Types

## 4.1 Participant

Needs:
- low-friction start
- clear progress
- no forced signup before value
- understandable result
- privacy clarity
- mobile usability

## 4.2 Returning participant

Needs:
- access to past completed assessments
- saved reports
- optional reassessment history

## 4.3 Assessment creator / maintainer

V1 needs source-controlled assessment definitions.

A visual assessment builder is explicitly deferred.

## 4.4 Admin

Needs:
- assessment/session counts
- completions
- reports generated
- referral breakdown
- limited session inspection

## 4.5 Referral/campaign partner

V1 needs attribution only.

Payments, commissions, and payout logic are deferred.

## 4.6 Open-source maintainer

Needs:
- reproducible local setup
- tests
- architecture docs
- issue templates
- secure defaults
- provider abstractions
- no hidden private dependency

---

# 5. Initial Assessment

## 5.1 Purpose

The bundled assessment is a product demonstration and useful self-reflection tool.

It is NOT presented as a validated psychological or clinical instrument.

## 5.2 Dimensions

Use exactly four initial dimensions:

```text
analytical_thinking
problem_solving
ai_literacy
adaptability
```

UI Vietnamese labels:

```text
Tư duy phân tích
Giải quyết vấn đề
Hiểu biết & ứng dụng AI
Khả năng thích nghi
```

## 5.3 Questions

Initial release contains exactly 10 questions.

Question type for V1:

```text
single_choice_scale
```

Each question has 5 options.

Values are integers in a defined range, typically `1..5`.

Questions may contribute to one or more dimensions using explicit weights.

No hidden LLM scoring.

## 5.4 Assessment disclaimer

The first assessment must contain a concise Vietnamese disclaimer:

- results are for self-reflection and guidance
- this is not a medical/psychological diagnosis
- the demo instrument is not claimed to be psychometrically validated

This disclaimer appears:
- before start in a lightweight form
- on the result page
- in the full report

---

# 6. Assessment Definition Contract

Canonical concept:

```ts
export interface AssessmentDefinition {
  id: string;
  slug: string;
  title: string;
  locale: "vi";
  version: number;
  status: "draft" | "published" | "archived";
  description: string;
  dimensions: DimensionDefinition[];
  questions: QuestionDefinition[];
  resultBands: ResultBandDefinition[];
}
```

Dimension:

```ts
export interface DimensionDefinition {
  id: string;
  label: string;
  shortDescription: string;
  order: number;
}
```

Question:

```ts
export interface QuestionDefinition {
  id: string;
  type: "single_choice_scale";
  prompt: string;
  required: boolean;
  options: QuestionOption[];
  scoring: ScoringContribution[];
}
```

Option:

```ts
export interface QuestionOption {
  id: string;
  label: string;
  value: number;
}
```

Contribution:

```ts
export interface ScoringContribution {
  dimensionId: string;
  weight: number;
  reverse?: boolean;
}
```

Requirements:
- IDs unique within their scope
- every scoring dimension exists
- weights finite and greater than zero
- option IDs unique per question
- option values finite
- published definitions validate before runtime use

Use Zod (or equivalent schema validation) at boundaries.

---

# 7. Scoring Engine

## 7.1 Location

Canonical scoring code:

```text
src/domain/assessment/
```

or an equivalent isolated domain path chosen once at bootstrap.

Do not duplicate formulas elsewhere.

## 7.2 Public interface

Conceptually:

```ts
scoreAssessment(
  definition: AssessmentDefinition,
  answers: Answer[]
): AssessmentScore
```

## 7.3 Validation

Final scoring rejects:
- unknown question IDs
- duplicate final answers for the same question
- unknown option IDs
- missing required answers
- malformed numeric values
- assessment version mismatch

## 7.4 Output

```ts
export interface AssessmentScore {
  assessmentId: string;
  assessmentVersion: number;
  completeness: number;
  dimensions: DimensionScore[];
  scoringVersion: string;
}
```

```ts
export interface DimensionScore {
  dimensionId: string;
  rawScore: number;
  normalizedScore: number; // 0..100
  evidenceQuestionIds: string[];
}
```

## 7.5 Normalization

Normalization must use the theoretical min/max possible for each dimension under the current assessment definition, not the min/max observed in submitted answers.

Formula concept:

```text
normalized =
  ((raw - theoreticalMin) / (theoreticalMax - theoreticalMin)) * 100
```

Then clamp to `0..100`.

Round only at a documented boundary.

## 7.6 Determinism requirement

A regression fixture must prove identical input returns byte-equivalent canonical score JSON after stable serialization.

---

# 8. Deterministic Result Interpretation

Before AI, the product has deterministic result copy.

Each dimension maps normalized score to one of four neutral bands:

```text
0–39   Emerging
40–59  Developing
60–79  Strong
80–100 Standout
```

Vietnamese public wording must avoid shaming language.

Band descriptions live in assessment configuration or a dedicated deterministic result copy module.

This allows the preview page to remain useful without AI.

---

# 9. Anonymous Assessment Sessions

## 9.1 No forced authentication

A participant can:
- start
- answer
- refresh
- finish
- view deterministic results

without creating an account.

## 9.2 Browser recovery

During the first local slice, browser state may be persisted through a storage adapter.

Production persistence moves to server/database-backed sessions.

## 9.3 Production authorization

Do not rely on guessable session IDs alone.

Use an opaque anonymous visitor/session credential stored in a secure HttpOnly cookie.

Recommended approach:
- server generates random visitor token
- browser receives HttpOnly, Secure, SameSite=Lax cookie
- database stores only a hash/derived identifier
- server verifies ownership before returning private session/result data
- privileged DB operations remain server-side

Exact implementation may vary, but equivalent security properties are required.

---

# 10. Persistence Model

Core PostgreSQL tables:

```text
assessments
assessment_versions
assessment_sessions
assessment_answers
assessment_results
leads
generated_reports
referral_sources
product_events
user_profiles
```

## 10.1 assessments

Identity-level metadata.

Example fields:
- `id`
- `slug`
- `created_at`
- `updated_at`

## 10.2 assessment_versions

Stores:
- assessment ID
- version
- status
- immutable definition snapshot
- published timestamp

Unique:

```text
(assessment_id, version)
```

## 10.3 assessment_sessions

Stores:
- public/session ID
- assessment version ID
- anonymous visitor owner hash
- optional authenticated user ID
- optional referral source
- status
- started/completed timestamps

Statuses:

```text
started
in_progress
completed
abandoned
```

## 10.4 assessment_answers

Stores:
- session
- question ID
- option ID
- answer timestamp

Unique:

```text
(session_id, question_id)
```

## 10.5 assessment_results

Stores only deterministic scoring output and metadata.

AI prose does not live here.

## 10.6 leads

Stores minimum contact information requested for full-report flow:
- display name
- email
- product-processing consent timestamp
- optional marketing consent timestamp

Do not collect phone number in V1.

## 10.7 generated_reports

Stores:
- deterministic result reference
- provider identifier
- model identifier if available
- report schema version
- prompt/template version
- validated structured payload
- generation status
- created timestamp

## 10.8 referral_sources

Stores normalized referral code and optional metadata.

No commissions in V1.

## 10.9 product_events

First-party minimal event record for important funnel metrics.

Third-party analytics is optional.

## 10.10 user_profiles

Links Supabase Auth user to display metadata.

---

# 11. Database Security

Requirements:
- migrations are source-controlled
- RLS enabled where browser-accessible Supabase tables are exposed
- prefer server-side DB operations for assessment sessions/results
- service-role key never enters client bundle
- AI keys never enter client bundle
- admin data requires authenticated authorization
- user/session ownership checks are explicit
- raw email addresses must not appear in application logs
- production `.env` never committed

---

# 12. Lead Capture Strategy

Use delayed capture:

```text
Complete assessment
→ show real deterministic value
→ offer “Xem báo cáo đầy đủ”
→ request display name + email
→ explicit consent
→ generate full report
```

Do not block the core result with contact capture.

Consent requirements:
- processing consent required to persist contact/profile
- marketing consent separate and optional
- no prechecked marketing checkbox

---

# 13. Authentication

V1:
- anonymous core assessment
- optional Supabase Auth magic-link for saved dashboard

Do not implement passwords unless required later.

Anonymous sessions can be associated with a newly authenticated user only after secure ownership verification.

---

# 14. AI Report Architecture

## 14.1 Provider-neutral contract

```ts
export interface ReportGenerator {
  generate(input: ReportGenerationInput): Promise<GeneratedReport>;
}
```

Domain/application code must not import provider-specific SDKs.

## 14.2 AI input

Allowed:
- assessment title/version
- deterministic scores
- dimension labels/descriptions
- evidence question IDs
- normalized selected-answer summaries needed for interpretation
- approved report schema
- locale
- non-clinical disclaimer

Not allowed:
- secrets
- unrelated profile data
- referral/marketing metadata
- hidden internal prompts from other systems

## 14.3 Structured output

Example:

```ts
export interface GeneratedReport {
  summary: string;
  strengths: Insight[];
  growthAreas: Insight[];
  actionPlan: ActionItem[];
  disclaimer: string;
}
```

Validate before persistence.

Invalid model output:
- is rejected
- does not corrupt deterministic result
- exposes a graceful fallback state

## 14.4 AI provider configuration

The platform must boot and complete core assessment without any AI key.

If provider configuration is absent:
- full report CTA may show “AI report temporarily unavailable”
- deterministic results still work
- tests still pass

## 14.5 Prompt versioning

Every generated report stores a `promptVersion`.

Prompts live in source control.

---

# 15. AI Safety and Content Boundaries

The report must not:
- diagnose health or mental-health conditions
- recommend medication/treatment
- infer protected/sensitive identity
- declare a user “unfit,” “incapable,” or equivalent
- claim scientifically validated accuracy unless real validation exists
- use manipulative fear/urgency to drive conversion

Recommendations should be framed as:
- experiments
- learning actions
- reflection prompts
- skill-building suggestions

---

# 16. Referral Attribution

Incoming format:

```text
?ref=CODE
```

Requirements:
- normalize allowed characters
- enforce max length
- reject malformed values safely
- store first-touch referral for an assessment session
- referral never changes scoring
- referral never becomes an authorization credential

Initial funnel metrics:
- landing visits
- assessment starts
- completions
- result views
- report requests
- generated reports

No payout system.

---

# 17. Analytics

Create a domain-level analytics interface.

Canonical events:

```text
landing_view
assessment_started
question_answered
assessment_completed
result_viewed
report_requested
report_generated
signup_completed
```

Privacy:
- do not send question text/answer text to third-party analytics
- do not send AI report prose
- do not send secrets
- prefer IDs/counts/statuses

PostHog may be added as an optional adapter.

App must work when analytics is disabled.

---

# 18. Admin V1

Protected route:

```text
/admin
```

V1 capabilities:
- view available assessment/version metadata
- started session count
- completed session count
- completion rate
- report request/generated counts
- referral-source breakdown
- inspect deterministic result dimensions for a session
- no bulk export of personal data by default

Not in V1:
- visual question editor
- arbitrary SQL console
- affiliate payouts
- role-management UI

---

# 19. Public Routes

Initial route map:

```text
/
 /assessment/[slug]
 /assessment/[slug]/result/[sessionId]
 /report/[sessionId]
 /dashboard
 /privacy
 /terms
 /admin
```

Optional:
- `/login`
- `/auth/callback`

Route naming may adapt to framework constraints but semantics must remain.

---

# 20. Landing Page UX

Sections:
1. concise hero
2. what user receives
3. four dimensions preview
4. how it works
5. example result visualization
6. privacy/no-spam reassurance
7. FAQ
8. CTA
9. footer

Primary CTA:

```text
Bắt đầu đánh giá
```

No fake:
- countdown
- limited slots
- urgency
- user count
- testimonials

unless backed by real evidence.

---

# 21. Assessment Runner UX

Requirements:
- one question at a time
- progress text and progress bar
- large touch targets
- visible selected state
- Previous/Next
- required questions cannot be skipped silently
- refresh recovery
- safe double-submit prevention
- final submit state
- keyboard accessible
- screen-reader labels

Question UI must not receive scoring weights unless strictly needed, which it should not be.

---

# 22. Result UX

Result page must render without AI.

Required:
- overall summary
- 4 dimension score cards
- radar chart
- text equivalent of chart
- strongest signals
- development opportunities
- disclaimer
- CTA for full report

Visual chart is supplementary. Text is canonical for accessibility.

---

# 23. Dashboard UX

Authenticated participant dashboard:
- assessment title/version
- completion date
- deterministic score summary
- full report status
- open result/report links

Longitudinal charts may be deferred.

---

# 24. Design System

Direction:
- clean
- calm
- credible
- modern
- generous spacing
- data-first
- mobile-first
- restrained animation

Avoid copying PHHS/MindX:
- no reused text
- no reused illustration
- no pixel imitation
- no copied questionnaire
- no copied brand colors as an identity system

Use a centralized theme and site config.

Recommended dependencies:
- Tailwind CSS
- Recharts for radar chart
- Lucide icons if needed

Avoid introducing a full UI framework unless implementation evidence shows it is needed.

---

# 25. Accessibility

Target WCAG 2.2 AA practices.

Minimum:
- semantic headings
- form labels
- keyboard flow
- visible focus
- no color-only meaning
- touch target sizing
- reduced-motion support where animation exists
- chart text equivalents
- meaningful error messages

The complete 10-question assessment must be finishable with keyboard only.

---

# 26. Performance

Goals:
- landing page should not require client-side JavaScript for core content
- assessment runner should use only necessary client components
- chart code may be lazy-loaded if beneficial
- third-party scripts optional
- optimize images
- avoid giant dependency bundles
- no AI call during landing/start/core scoring

Production acceptance should include a basic Lighthouse or equivalent review, but correctness gates take precedence over chasing arbitrary scores.

---

# 27. SEO / Sharing

V1 public pages should include:
- title/description metadata
- OpenGraph basics
- favicon placeholder
- robots policy
- sitemap where appropriate

Private result/report/admin pages should not be indexed.

---

# 28. Error Handling

User-facing errors must be:
- actionable
- non-technical
- safe

Server logs may contain:
- request/correlation IDs
- error category
- provider status

Do not log:
- secrets
- full answer payloads unnecessarily
- auth tokens
- magic-link tokens
- raw report prompts with sensitive content

---

# 29. Testing Strategy

## 29.1 Unit

Required:
- assessment schema validation
- scoring
- normalization
- result bands
- referral parser
- AI report schema
- prompt/version helpers
- storage/session serialization

## 29.2 Integration

Required:
- create session
- save answer
- overwrite answer
- complete session
- persist result
- unauthorized ownership rejected
- report persistence
- lead consent persistence

## 29.3 Component

Required for critical UX:
- assessment navigation
- progress
- required answer state
- result score rendering
- contact/report form validation

## 29.4 E2E

Primary E2E:

```text
landing
→ start assessment
→ answer 10 questions
→ complete
→ see deterministic result
→ refresh
→ result still available
```

Secondary E2E:

```text
result
→ request full report
→ submit profile/consent
→ AI configured: validated report
or
→ AI unavailable: graceful fallback
```

Referral E2E:

```text
/?ref=DEMO123
→ start
→ complete
→ session retains DEMO123 attribution
```

---

# 30. CI Quality Gates

GitHub Actions must run on push/PR:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Playwright E2E may use a separate job if environment setup is heavier.

A final implementation is not accepted when the build is red.

---

# 31. Repository Structure

Preferred structure:

```text
assessment-platform/
├── app/
│   ├── assessment/
│   ├── report/
│   ├── dashboard/
│   ├── admin/
│   ├── privacy/
│   └── terms/
├── src/
│   ├── domain/
│   │   └── assessment/
│   ├── application/
│   ├── infrastructure/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── database/
│   │   └── auth/
│   ├── content/
│   └── config/
├── components/
│   ├── assessment/
│   ├── results/
│   ├── marketing/
│   └── ui/
├── assessments/
├── supabase/
│   └── migrations/
├── tests/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── superpowers/
│   │   ├── specs/
│   │   └── plans/
│   ├── evidence/
│   └── adr/
├── public/
├── .github/
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── LICENSE
└── .env.example
```

If Next.js/framework conventions make minor path changes preferable, the executor may adjust structure while preserving boundaries.

---

# 32. Configuration

Centralize:
- site name
- site description
- support/contact placeholder
- default locale
- assessment slug
- feature flags
- AI availability
- analytics availability

Do not scatter product branding strings across components.

---

# 33. Environment Variables

Expected classes:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AI_PROVIDER
AI_API_KEY
AI_MODEL
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
ADMIN_EMAILS
```

Exact naming can be improved once, then documented in `.env.example`.

Secrets must never be prefixed `NEXT_PUBLIC_`.

App must start in a useful core mode without `AI_API_KEY`.

---

# 34. Data Privacy and User Rights

Before production:
- privacy page
- terms page
- data retention statement
- basic deletion path documented
- basic export path documented or minimally implemented for authenticated users

Do not promise capabilities that implementation does not provide.

---

# 35. Security Baseline

Required:
- server-only privileged keys
- secure cookies in production
- CSRF-safe mutation pattern appropriate to chosen framework
- input validation at boundaries
- safe email normalization
- no open redirect in auth callback
- authorization checks on private result/report/admin routes
- dependency audit review
- no secrets in Git history
- security headers appropriate to deployment
- sane rate/cost controls for AI report generation

AI report generation must not be an unauthenticated unlimited public endpoint.

---

# 36. Open-Source Requirements

Public repo must include:
- Apache-2.0 license
- README
- architecture overview
- local setup
- environment docs
- test commands
- deployment instructions
- contribution guide
- code of conduct
- security reporting policy
- changelog
- issue templates
- PR template

Repository must be useful without proprietary infrastructure.

Any hosted-only optional feature must degrade cleanly.

---

# 37. OSS Evidence Discipline

Never fabricate:
- stars
- users
- contributors
- deployments
- testimonials
- integrations
- maintainership history

Create a place to track real evidence:

```text
docs/oss/OSS_EVIDENCE.md
```

Evidence can later include:
- release history
- real issues/PRs
- contributor activity
- known deployments
- external integrations
- user feedback with permission
- anonymized usage metrics when lawful

This document is evidence storage, not marketing fiction.

---

# 38. Git Strategy

During autonomous implementation:
- work on a feature branch/worktree if repository context supports it
- use small coherent commits
- commit only passing slices
- never commit `.env`
- never force-push a shared branch
- final branch should be clean

Suggested conventional commit types:
- `chore:`
- `feat:`
- `test:`
- `fix:`
- `docs:`
- `refactor:`

---

# 39. GitHub Publication

When implementation is fully green:
- create/push public GitHub repository if credentials/permission exist
- otherwise leave a clean local repo and provide exact publish commands
- do not expose secrets
- include final commit SHA in implementation report

A GitHub push is not equivalent to production acceptance.

---

# 40. Vercel Policy

The code must be Vercel-ready.

For this autonomous implementation run:
- a Vercel preview deploy is allowed only if credentials are already available
- do not require production-domain promotion
- do not block project completion solely because Vercel credentials are absent
- record deployment readiness and any preview URL

Production promotion should ideally occur after the post-implementation controller audit.

---

# 41. Milestone Acceptance Gates

Each milestone must internally pass its defined tests before execution continues.

Gemini does not need to ask the human for milestone approval.

It must:
1. implement
2. run checks
3. fix failures
4. record evidence
5. commit
6. continue

Only hard blockers justify stopping.

---

# 42. Hard Blockers

Examples:
- GitHub authentication missing when push is required
- required Supabase project credentials unavailable for live DB acceptance
- repository permissions deny write
- package registry/network prevents installation after reasonable retry
- irreconcilable contradiction in this spec/plan

Not hard blockers:
- failing tests
- lint errors
- TypeScript errors
- implementation bugs
- build errors
- missing AI API key
- missing PostHog key
- absent Vercel credentials

Those must be fixed or gracefully degraded/documented.

---

# 43. Explicit Non-Goals for V1

Do NOT implement:
- adaptive testing
- psychometric validation engine
- diagnostic mental-health assessment
- payments
- affiliate commissions
- multi-tenant organizations
- white-label admin UI
- visual drag/drop assessment builder
- embeddings
- vector database
- RAG
- multi-agent runtime
- native Android/iOS
- complex RBAC
- real-time collaboration
- social network
- arbitrary chatbot
- gamification economy

These require separate future specs.

---

# 44. Definition of Done — V1

The autonomous implementation is technically complete when all applicable items pass:

```text
[ ] clean install
[ ] lint
[ ] TypeScript check
[ ] unit tests
[ ] integration tests
[ ] primary E2E
[ ] production build
[ ] no committed secrets
[ ] deterministic scoring fixture
[ ] mobile assessment works
[ ] refresh recovery works
[ ] deterministic result works without AI
[ ] referral attribution works
[ ] privacy/terms exist
[ ] admin protected
[ ] AI provider abstraction exists
[ ] AI failure degrades safely
[ ] Supabase migrations are reproducible
[ ] README setup works from a clean clone
[ ] GitHub Actions configured
[ ] OSS docs present
[ ] final git working tree clean
[ ] GitHub push attempted/completed when authorized
[ ] final evidence report written
```

---

# 45. Final Evidence Artifact

Create:

```text
docs/evidence/FINAL_IMPLEMENTATION_REPORT.md
```

It must contain:
- implementation date
- final commit SHA
- milestone status table
- test commands and summarized outcomes
- build outcome
- E2E outcome
- database/migration status
- AI configured/not configured
- analytics configured/not configured
- GitHub repository URL if pushed
- Vercel preview URL if available
- known limitations
- deferred items
- security notes
- exact manual steps still required from owner

No unverifiable “100% complete” claims.

---

# 46. Authority and Change Control

This specification is the product/architecture authority for the initial build.

The executor may:
- choose small implementation details
- adjust filenames to framework conventions
- fix contradictions where one interpretation is clearly safer and smaller
- add tests required to prove correctness

The executor may NOT silently change:
- deterministic scoring authority
- AI boundaries
- delayed lead capture
- assessment immutability
- privacy model
- provider-neutral architecture
- anonymous core flow
- open-source requirement
- major technology choices

Material deviations must be documented in:

```text
docs/adr/
```

and called out in the final report.

---

# 47. Future Direction

After V1 audit, likely next specs:

1. adaptive assessment
2. visual assessment builder
3. richer dashboard and reassessment trends
4. multilingual content
5. organization/white-label support
6. assessment marketplace
7. paid plans
8. contributor/plugin ecosystem
9. validation tooling for serious assessment authors

None of these are prerequisites for V1.


---

# 48. UI/UX Pro Max Skill Integration

## 48.1 Role

Use the open-source project:

```text
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
```

as a **design intelligence and UI/UX review layer** for this project.

It is NOT:
- product authority
- architecture authority
- scoring authority
- database authority
- security authority

Precedence is:

```text
Product/Architecture Spec
        ↓
Implementation Plan
        ↓
Security + Accessibility Requirements
        ↓
Project Design System
        ↓
UI UX Pro Max recommendations
```

If a UI UX Pro Max recommendation conflicts with this specification, this specification wins.

## 48.2 Supported use in this project

Use it for:
- landing-page pattern research
- product-appropriate visual direction
- typography recommendations
- accessible color-system guidance
- spacing/layout guidance
- mobile responsive behavior
- CTA hierarchy
- form UX
- assessment-runner interaction review
- radar/result visualization review
- dashboard chart selection
- admin information density
- UX anti-pattern checks
- focus/keyboard/reduced-motion checks

Do NOT use it to:
- change assessment scoring
- add fake social proof
- add urgency mechanics
- invent user metrics
- add unnecessary animation
- override privacy requirements
- add dependencies solely for visual novelty
- clone PHHS/MindX styling

## 48.3 Design-system artifact

Before implementing polished public UI, generate and commit:

```text
docs/design/DESIGN_SYSTEM.md
```

It must define at minimum:
- product visual intent
- layout pattern
- color tokens
- typography
- spacing scale
- radius/shadow policy
- CTA hierarchy
- form controls
- cards
- chart conventions
- responsive breakpoints/behavior
- motion rules
- accessibility constraints
- anti-patterns to avoid

The design system is project-specific and may be informed by UI UX Pro Max output.

Generated recommendations must be reviewed against:
- WCAG goals
- mobile-first requirements
- truthful product claims
- Vietnamese text length
- performance constraints

## 48.4 Design tokens

Translate approved design-system decisions into centralized implementation tokens/configuration.

Do not hardcode inconsistent colors/spacing throughout components.

If Tailwind is used, centralize tokens using the framework's current recommended configuration/CSS-token approach.

## 48.5 Responsive verification

Critical UI must be reviewed at:

```text
375px
768px
1024px
1440px
```

The product must remain usable below 375px down to the previously specified practical target of approximately 360px.

Check:
- heading wrapping
- button labels
- long Vietnamese copy
- cards
- form errors
- chips/badges
- chart containers
- admin tables
- dashboard summaries

## 48.6 UI/UX evidence

Create:

```text
docs/evidence/UI_UX_AUDIT.md
```

It must record:
- UI UX Pro Max availability/version if used
- design-system generation inputs
- recommendations adopted
- recommendations rejected and why
- responsive widths checked
- accessibility checks
- known visual/UX limitations

This is evidence, not marketing.

## 48.7 Runtime independence

UI UX Pro Max is a development-time skill/tool only.

The production application must not require:
- its CLI
- its Python search script
- its repository
- network access to its services

to render or function.

Do not add it as a production runtime dependency unless a future approved specification explicitly requires that.
