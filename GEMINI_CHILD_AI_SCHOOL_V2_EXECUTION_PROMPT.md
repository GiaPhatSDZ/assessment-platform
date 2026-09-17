# GEMINI 3.8 FLASH — MASTER PRODUCT CORRECTION PROMPT V2
## Correct Adult/Career V1 into Parent → Child → AI School V2

You are the autonomous correction executor for:

```text
GiaPhatSDZ/assessment-platform
```

The repository already contains a substantial V1 implementation.

DO NOT rebuild it from scratch.

The current implementation made a PRODUCT-DOMAIN mistake:
it built an adult career/AI-readiness experience, while the intended V1 public product is a parent-facing assessment about a child for an AI School / future-skills context.

You are authorized to perform the complete correction autonomously without waiting for intermediate controller approval.

After you finish and push the verified result, an independent controller will audit the repository.

---

# BASELINE

Audited repository baseline at the time this prompt was created:

```text
main@600db58d9a81301634b4ba32a35263db30b08cfc
```

If current HEAD differs:
- inspect it
- preserve newer legitimate work
- do not hard reset
- record actual starting SHA

---

# AUTHORITIES

Read completely before coding:

```text
docs/superpowers/specs/2026-09-17-child-ai-school-product-correction-v2.md
docs/superpowers/plans/2026-09-17-child-ai-school-migration-plan-v2.md
```

The product correction spec overrides conflicting V1 PRODUCT assumptions.

The previous spec remains useful for generic architecture where compatible.

---

# PRODUCT TRUTH

This is NOT primarily:

```text
adult
→ self-assessment
→ career readiness
→ workplace AI skills
```

It IS:

```text
PARENT / GUARDIAN
      ↓
answers based on observations
      ↓
CHILD is assessment subject
      ↓
4 future-skill pillars
      ↓
parent-friendly result
      ↓
practical home development ideas
      ↓
optional AI-assisted full report
      ↓
optional AI School next step
      ↓
reassessment later
```

This distinction must exist in:
- UI
- domain model
- database
- report prompts
- dashboard
- privacy language
- tests

---

# DO NOT THROW AWAY WORKING CORE

PRESERVE unless genuinely broken:

- Next.js structure
- deterministic scoring architecture
- server-side score recomputation
- assessment schema/validation
- assessment versioning
- Supabase architecture
- anonymous session ownership
- referral
- analytics abstraction
- provider-neutral AI interface
- auth
- admin protection
- CI
- security
- accessibility
- OSS docs
- Vercel readiness

This is a product/domain correction, NOT an excuse for a rewrite.

---

# MUST REPLACE / MIGRATE

Correct:
- public hero
- landing positioning
- design direction
- adult career question set
- adult dimension semantics
- result copy
- AI report prompt
- parent/child data semantics
- dashboard semantics
- lead/contact labels
- privacy handling
- SEO
- relevant tests

---

# CRITICAL VERSIONING RULE

The existing published adult assessment is historical V0.1 material.

DO NOT silently transform it into a child assessment while keeping the same identity/version.

Create a NEW assessment:

```text
slug: child-ai-readiness
```

Keep old sessions/results reproducible.

The old adult assessment can become legacy/non-primary.

Do not rewrite history.

---

# CHILD PRIVACY

Treat child data conservatively.

V2 must not request:
- child's email
- child's phone
- exact date of birth
- school name
- address
- location

Use:
- nickname optional
- grade
- parent/guardian attestation

Parent account owns/manages child profiles.

Do not send child nickname or parent email to third-party analytics.

Do not send parent email to AI.

Prefer not to send child nickname to AI.

Never claim unverified child-data legal compliance.

---

# ASSESSMENT CONTENT

Implement the exact V2 content from the correction spec and content-authority file.

Four dimensions:

```text
thinking_analysis
problem_solving_creativity
technology_ai
self_learning_adaptability
```

Ten questions.

Shared observed-frequency scale.

Q2 and Q7 are reverse scored.

Do not replace them with your own adult/professional questions.

Do not copy MindX questions.

---

# RESULT LANGUAGE

Never treat score as:
- IQ
- percentile
- age norm
- peer rank
- permanent ability

Use:

```text
Tín hiệu hiện tại chưa rõ
Đang hình thành
Đang phát triển rõ
Thể hiện nổi bật trong quan sát hiện tại
```

The score is an observational index based on this product instrument.

---

# DESIGN CORRECTION

The current dark, enterprise/AI-SaaS direction is not the target.

Re-run UI UX Pro Max with:

```text
Vietnamese parent-facing child education / AI school assessment.
Warm light.
Trustworthy.
Modern.
Family-friendly but not childish.
Strong report/data visualization.
Mobile-first.
Parents answer about children.
No enterprise career-assessment aesthetic.
No generic dark AI hero.
No fake science.
```

Update the canonical design system and apply it consistently.

Do NOT pixel-copy MindX.

Use the reference only for product-category understanding:
- parent audience
- child report
- visible radar/result value
- strong CTA

Create an original product.

---

# LANDING FIRST VIEWPORT ACCEPTANCE

At ~375px and desktop, a reasonable person must understand within the first viewport:

1. this is for a parent/guardian
2. the assessment is about their child
3. it concerns future skills / AI-era development
4. the CTA starts an assessment for the child

If the page can still be mistaken for an adult career assessment, the correction is NOT done.

---

# AI REPORT

Do not repurpose the old adult report prompt by only replacing a few words.

Create a versioned child/parent prompt.

It must state:
- parent is respondent
- child is subject
- observational interpretation
- no diagnosis
- no peer ranking
- no career prediction
- no fixed ability labels
- scores immutable
- practical at-home actions
- age/grade-aware wording where appropriate

Preserve legacy prompt for historical reproducibility.

---

# DASHBOARD

The account belongs to the parent.

The child has a profile, not an auth account.

Target information architecture:

```text
Parent account
 ├── Child profile A
 │    ├── result
 │    ├── report
 │    └── reassessment history
 └── Child profile B
      └── ...
```

Do not require elaborate family management if unnecessary, but do not hardcode one child forever.

---

# DATABASE MIGRATION

Do not rewrite an already applied initial migration.

Add a new non-destructive migration for child profiles and session subject linkage.

Legacy sessions may have null child link.

New child sessions require owned child profile in application logic.

Ownership must be server-verified.

Knowing a child/session ID is not authorization.

---

# TDD / VERIFICATION

Use RED → GREEN → REFACTOR for behavioral changes.

Do not fake RED.

When a test fails:
- reproduce
- find root cause
- fix
- add regression coverage
- rerun

Do not weaken legitimate tests merely to get green.

---

# SUPERPOWERS

If Superpowers is available:
- use relevant TDD/debugging/execution skills
- do not stop for human checkpoint after each milestone
- perform internal checkpoint and continue

Only stop for a genuine hard blocker.

---

# UI UX PRO MAX

If available:
- use it as design intelligence
- do not let it override product/security architecture
- record recommendations adopted/rejected

Production app must not depend on it at runtime.

---

# LEGACY LANGUAGE SWEEP

Before completion, search active public code for:

```text
nghề nghiệp
cơ hội nghề nghiệp
môi trường làm việc
cấp trên
đồng nghiệp
thẩm định nhân sự
năng lực nghề nghiệp
Chuẩn Xác 100%
bảo mật tuyệt đối
```

Review every match.

Legacy/history/doc occurrences may remain.

Active child product occurrences generally must not.

---

# MISLEADING CLAIMS

Remove from active product unless evidence exists:

```text
100% accurate
scientifically proven
absolute security
predicts future success
compares child to peers
```

Do not invent:
- users
- testimonials
- children assessed
- success rates
- school outcomes

---

# AI SCHOOL CTA

A program/consultation CTA is allowed only if configuration provides a real destination.

Examples:

```text
Khám phá lộ trình AI phù hợp với độ tuổi
Trao đổi về lộ trình học cho con
```

Do not claim:
- “the algorithm selected the perfect course”
- “your child must enroll”
- fake limited slots

If no real destination:
- hide the CTA
- keep development guidance useful

---

# EXECUTION

Complete ALL migration plan milestones M0–M20.

Do not pause with:

```text
Should I continue?
```

You have authorization to continue.

After each milestone:
- run relevant tests
- fix failures
- commit coherent work
- continue

---

# GIT

Create/use:

```text
product/child-ai-school-v2
```

Do not force-push unknown main history.

When complete:
- full verification green
- push branch
- merge/push main only if safe and authorized
- rerun final state if merge changes anything
- prepare `v0.2.0`

Do not erase V0.1 history.

---

# REQUIRED FINAL CHECKS

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Also verify:
- migrations
- no secrets
- public language sweep
- responsive 375px
- private child pages noindex
- cross-owner access rejected
- AI-disabled fallback
- child PII absent from analytics payload

---

# REQUIRED FINAL EVIDENCE

Create:

```text
docs/evidence/PRODUCT_CORRECTION_V2_FINAL.md
```

Include:

- actual starting SHA
- final SHA
- branch
- GitHub state
- V0.2 tag state
- preserved V1 architecture
- new child-domain files
- DB migration
- new assessment definition
- new question content
- scoring tests
- reverse-score tests
- result changes
- AI prompt changes
- dashboard changes
- privacy changes
- UI UX audit
- E2E results
- lint/typecheck/test/build results
- known limitations
- owner actions
- architecture deviations

Also create/update:

```text
docs/evidence/UI_UX_AUDIT_V2.md
docs/evidence/PRODUCT_CORRECTION_V2_UI.md
docs/evidence/PRODUCT_CORRECTION_V2_E2E.md
```

---

# ALLOWED FINAL STATUS

Use only:

```text
PASS
PASS_WITH_OWNER_ACTIONS
BLOCKED
```

Do not use PASS if required tests are red.

---

# FINAL RESPONSE

Return:

```markdown
# Child AI School Product Correction V2

## Status
PASS | PASS_WITH_OWNER_ACTIONS | BLOCKED

## Git
- Start SHA:
- Final SHA:
- Branch:
- Main merged:
- Tag:
- GitHub URL:

## Product Correction
- Parent respondent:
- Child subject:
- New assessment:
- Child profile:
- Public landing:
- Child result:
- AI parent report:
- Dashboard:

## Verification
- lint:
- typecheck:
- tests:
- e2e:
- build:

## Privacy
Short summary.

## Evidence
Paths.

## Architecture Preserved
Short summary.

## Known Limitations
Concrete list.

## Owner Actions
Only remaining external actions.
```

Do not start unrelated new features after completion.

---

# START

Inspect current repository and actual HEAD.

Read the correction spec, content authority, and migration plan completely.

Then execute the full Product Correction V2 autonomously.
