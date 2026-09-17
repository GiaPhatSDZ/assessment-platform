# Assessment Platform — Product Correction Migration Plan V2
## Existing Adult/Career V1 → Parent/Child AI School V2

**Status:** Approved autonomous migration plan  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Baseline:** `main@600db58d9a81301634b4ba32a35263db30b08cfc`  
**Target release:** `v0.2.0`  
**Correction spec:** `docs/superpowers/specs/2026-09-17-child-ai-school-product-correction-v2.md`  
**Execution model:** Gemini performs all correction milestones autonomously, then pushes verified result for independent audit.

---

# 0. Core Migration Rule

DO NOT restart from a new Next.js project.

DO NOT throw away the V1 scoring/security/DB/provider architecture.

Use:

```text
existing generic engine
        +
new child subject domain
        +
new child assessment definition
        +
new parent-facing UX/report
```

The migration must preserve Git history and V0.1 evidence.

---

# M0 — Baseline and Safety

## M0.1 Verify baseline

Run:

```bash
git status --short
git rev-parse HEAD
git log --oneline -n 10
```

Expected audited baseline when this plan was written:

```text
600db58d9a81301634b4ba32a35263db30b08cfc
```

If HEAD is newer:
- inspect changes
- do not reset destructively
- adapt migration to current state
- record actual starting SHA

## M0.2 Branch

Create:

```text
product/child-ai-school-v2
```

or equivalent safe branch.

Do not force-push over `main`.

## M0.3 Baseline verification

Run existing project checks before changing behavior:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Record actual baseline result:

```text
docs/evidence/V2_BASELINE.md
```

If baseline is red, distinguish:
- pre-existing failure
- migration-created failure

---

# M1 — Install Correction Authority

## M1.1 Add documents

Create:

```text
docs/superpowers/specs/2026-09-17-child-ai-school-product-correction-v2.md
docs/superpowers/plans/2026-09-17-child-ai-school-migration-plan-v2.md
```

Add execution prompt if project keeps prompt artifacts.

Update architecture docs with a short note:

```text
Respondent != Subject
Parent/guardian = respondent/account owner
Child = assessment subject
```

### Commit

```text
docs: define parent child product correction
```

---

# M2 — Re-run Product Design System

## M2.1 Use UI UX Pro Max

Use:

```text
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
```

Query intent:

```text
Vietnamese parent-facing child education and AI-school assessment.
Warm light modern interface.
Parents answer about children.
Trustworthy, friendly but not childish.
Future skills and AI literacy.
Mobile-first.
No dark enterprise AI SaaS look.
No fake psychology/science.
```

## M2.2 Rewrite design system

Update:

```text
docs/design/DESIGN_SYSTEM.md
```

Explicitly remove/replace:
- adult enterprise tone
- dark hero as default direction
- corporate career semantics

Add:
- warm light surface
- family education tone
- child-report card style
- parent CTA hierarchy
- safe child-data forms
- radar visual semantics
- long Vietnamese copy behavior

## M2.3 Design audit artifact

Create/update:

```text
docs/evidence/UI_UX_AUDIT_V2.md
```

Record adopted/rejected recommendations.

### Commit

```text
docs: retarget design system for parent child experience
```

---

# M3 — Introduce Child Domain

## M3.1 Child profile types and validation

Create domain/application contract in an appropriate existing boundary.

Suggested:

```text
src/domain/child/types.ts
src/domain/child/schema.ts
src/domain/child/schema.test.ts
```

Fields:
- id
- nickname optional
- grade optional/validated
- ownership references handled outside pure domain
- timestamps as repository concerns if preferred

Rules:
- nickname max length
- trim
- grade 1..12 when provided
- no email
- no phone
- no exact DOB

Tests first.

### Commit

```text
feat: model child assessment subjects
```

## M3.2 New database migration

Do NOT edit applied initial migration.

Create e.g.:

```text
supabase/migrations/20260917XXXXXX_child_profiles.sql
```

Add `child_profiles`.

Add nullable child reference to `assessment_sessions` for backward compatibility.

Suggested schema semantics:
- profile ID
- anonymous visitor owner hash
- optional parent user ID
- optional nickname
- optional grade
- parent/guardian attestation timestamp
- timestamps

Add indexes.

Do not create public permissive read policy for child profiles.

Add comments describing child data minimization.

### Commit

```text
feat: add child profile persistence
```

## M3.3 Child profile repository

Add narrow interface + Supabase implementation.

Required use cases:
- create child profile for current anonymous owner
- load owned child
- list authenticated parent's children
- associate owned anonymous child to authenticated parent
- prevent cross-owner access

Tests:
- own read pass
- foreign read fail
- claim with ownership pass
- claim by email-match only fail

### Commit

```text
feat: secure child profile ownership
```

---

# M4 — New Versioned Child Assessment

## M4.1 Preserve adult V1

Do not rewrite the existing career assessment's question content.

Treat it as legacy/reference.

Do not route homepage CTA to it.

If registry exists, mark it non-primary/legacy without corrupting historical definition.

## M4.2 Create child assessment

Create:

```text
assessments/child-ai-readiness-v1.ts
assessments/child-ai-readiness-v1.test.ts
```

Use exact product-correction content authority:
- 4 V2 dimensions
- 10 V2 questions
- shared 1..5 frequency scale
- Q2 reverse
- Q7 reverse
- specified weights
- disclaimer

Slug:

```text
child-ai-readiness
```

No copied MindX questions.

## M4.3 Result bands

Version child-facing deterministic band copy separately if existing generic bands are adult-sounding.

Prefer:

```text
Tín hiệu hiện tại chưa rõ
Đang hình thành
Đang phát triển rõ
Thể hiện nổi bật trong quan sát hiện tại
```

Do not change legacy result meaning if doing so breaks historical reproducibility.

## M4.4 Tests

Test:
- exactly 10 questions
- correct dimension IDs
- reverse scoring
- deterministic fixture
- min/max
- no adult/career words in question set
- disclaimer present

### Commit

```text
feat: add parent observed child ai readiness assessment
```

---

# M5 — Child Context Start Flow

## M5.1 Start step

Before Q1, add child context.

Fields:
- nickname optional
- grade
- parent/guardian attestation

Copy:

```text
Bạn đang trả lời dựa trên quan sát về con
```

Helper:

```text
Bạn có thể dùng tên gọi ở nhà. Không cần nhập họ tên đầy đủ.
```

No parent email here.

## M5.2 Session association

Creating/starting a V2 child assessment:
- creates or selects owned child profile
- associates session with `child_profile_id`
- preserves referral attribution
- sets correct assessment version

Server must verify child ownership.

## M5.3 Recovery

Refresh after child context:
- restore child context
- restore current question
- preserve session

### Tests

- missing attestation blocked
- invalid grade rejected
- nickname optional
- no email field
- cross-owner child ID rejected

### Commit

```text
feat: add parent child assessment start flow
```

---

# M6 — Rewrite Landing Product Surface

## M6.1 Site configuration

Update centralized product/site config.

Public name must be configurable.

Default primary assessment slug becomes:

```text
child-ai-readiness
```

## M6.2 Landing copy

Rewrite:

```text
src/content/vi/site-copy.ts
```

Required:
- parent audience
- child subject
- AI-era future skills
- 4 child dimensions
- 3–5 minute framing if supported
- no adult workplace/career language
- no “100% accurate”
- no “absolute security”

## M6.3 Header

Replace adult generic nav where useful with:

```text
Bài đánh giá cho con
4 trụ năng lực
Cách hoạt động
Câu hỏi thường gặp
```

Primary CTA:

```text
Bắt đầu cho con
```

## M6.4 Hero visual

Use a clearly labeled sample:

```text
Báo cáo minh họa
Con • Lớp 4
```

Do not imply a real user.

## M6.5 Sections

Implement correction-spec landing sequence.

## M6.6 Visual correction

Move away from the existing dark adult/enterprise AI surface.

Use canonical V2 design system.

### Tests

Assert hero contains:
- `con`
- parent context
- child CTA

Assert public landing does NOT contain:
- `nghề nghiệp`
- `môi trường làm việc`
- `cấp trên`
- `đồng nghiệp`
- `Chuẩn Xác 100%`

### Commit

```text
feat: retarget landing to parents and children
```

---

# M7 — Rewrite Assessment Runner Semantics

## M7.1 Context header

Render:

```text
Bé {nickname} • Lớp {grade}
```

or fallback:

```text
Con của bạn • Lớp {grade}
```

## M7.2 Instruction

Use observational wording.

## M7.3 Shared scale UX

The same 5 response levels should remain visually clear on mobile.

Do not expose “correct” answer direction.

## M7.4 Accessibility

Check:
- long question wrapping
- 5 answer touch targets
- keyboard
- selected state not color-only
- back/next
- progress

### Commit

```text
feat: adapt assessment runner for parent observations
```

---

# M8 — Result Experience V2

## M8.1 Title and copy

Replace adult result semantics with:

```text
Bản đồ 4 trụ của con
```

## M8.2 Radar labels

Use child pillar public labels.

## M8.3 Deterministic guidance

Create child-oriented deterministic guidance mapping.

For each dimension + band:
- observation copy
- at-home experiment
- conversation prompt

This must work without AI.

## M8.4 Disclaimer

Always display:
- not IQ
- not peer ranking
- not diagnosis
- current parent-observed snapshot

## M8.5 Full report CTA

Use:

```text
Nhận báo cáo chi tiết & kế hoạch 30 ngày cho con
```

### Commit

```text
feat: create parent friendly child result experience
```

---

# M9 — AI Report Child V2

## M9.1 Preserve legacy prompt

Keep:

```text
report-v1.ts
```

if required for legacy history.

## M9.2 New child prompt

Create:

```text
src/infrastructure/ai/prompts/report-child-v2.ts
```

or equivalent.

Prompt must state:
- parent respondent
- child subject
- observation not diagnosis
- scores immutable
- no peer ranking
- no career prediction
- no shame
- no screen-time maximization
- practical parent actions
- Vietnamese output

## M9.3 Report schema versioning

Add/report schema version metadata if missing.

If DB needs:

```text
report_schema_version
```

add non-destructive migration.

## M9.4 Child report output

Preferred:
- summaryForParent
- observedStrengths
- developmentSignals
- homeActivities
- conversationPrompts
- thirtyDayPlan
- disclaimer

## M9.5 Provider privacy

Ensure AI input does not include:
- parent email
- child nickname unless absolutely necessary
- referral code
- unrelated analytics

Grade can be included if useful.

### Commit

```text
feat: generate parent oriented child development reports
```

---

# M10 — Lead Capture Semantics

## M10.1 Parent contact

Form labels must explicitly say parent.

Example:

```text
Tên phụ huynh
Email của phụ huynh
```

Never:

```text
Email của con
```

## M10.2 Consent

Processing consent:

```text
Tôi đồng ý sử dụng email này để lưu/gửi báo cáo và quản lý hồ sơ đánh giá.
```

Marketing remains separate.

### Commit

```text
fix: make report contact capture parent explicit
```

---

# M11 — Parent Dashboard

## M11.1 Information architecture

Replace generic participant dashboard with parent-owned child profile view.

Suggested components:

```text
ParentDashboard
ChildProfileCard
ChildAssessmentHistory
```

## M11.2 Multiple-child readiness

Render list of child profiles.

If only one profile exists, UI may simplify but should not hardcode single child.

## M11.3 Legacy adult data

Do not mix a legacy adult assessment into a child's history.

If authenticated user owns old V1 adult sessions:
- show separately under legacy/history if necessary
- or omit from child cards
- do not relabel adult sessions as child sessions

### Commit

```text
feat: turn dashboard into parent child profiles
```

---

# M12 — Admin / Analytics / Referral Review

## M12.1 Admin

Update labels for child assessment.

Keep personal-data exposure minimal.

## M12.2 Analytics

Audit all event payloads.

Prohibit:
- child nickname
- parent email
- raw answers

## M12.3 Referral

Ensure ref works through:
- landing
- child context
- assessment
- result

Referral does not influence child score/report.

### Commit

```text
fix: align admin analytics and referral with child domain
```

---

# M13 — Privacy / Terms / SEO Rewrite

## M13.1 Privacy

Update for:
- parent respondent
- child profile
- minimal child data
- optional AI processing
- optional analytics
- no child contact data

Do not make unverified legal compliance claims.

## M13.2 Terms

Clarify:
- observational educational/self-reflection tool
- not IQ
- not clinical
- not guarantee of school/career outcome

## M13.3 SEO

Update metadata.

Noindex all private child surfaces.

### Commit

```text
docs: align privacy terms and metadata with child product
```

---

# M14 — Public Language / Legacy Sweep

Run searches.

Examples:

```bash
rg -n "nghề nghiệp|môi trường làm việc|cấp trên|đồng nghiệp|thẩm định nhân sự|Chuẩn Xác 100%|bảo mật tuyệt đối" app components src assessments
```

Review every match.

Allowed:
- legacy assessment file
- changelog/history
- migration docs describing old state

Not allowed:
- active child landing
- current child runner
- child result
- child report
- parent dashboard

### Commit

```text
fix: remove adult career language from child product surface
```

---

# M15 — UI UX V2 Audit

Use UI UX Pro Max on implemented pages.

Review:
- 375px
- 768px
- 1024px
- 1440px

Screens:
- landing
- child context
- question
- result
- full report form
- report
- dashboard
- admin

Check:
- first viewport product clarity
- long Vietnamese text
- radar overflow
- 5-option scale
- warm/light design consistency
- no adult enterprise impression
- accessibility

Create:

```text
docs/evidence/PRODUCT_CORRECTION_V2_UI.md
```

### Commit

```text
fix: close child product ui ux audit
```

---

# M16 — E2E V2

## Primary E2E

```text
landing
→ child CTA
→ child context
→ parent attestation
→ 10 answers
→ child result
→ refresh
```

## Full report E2E

AI available/mocked and unavailable branches.

## Auth/dashboard

Parent login → child profile → result.

## Security

Cross-owner child result denied.

## Referral

`?ref=DEMO123` survives.

## Mobile

At least primary E2E at mobile viewport.

Create:

```text
docs/evidence/PRODUCT_CORRECTION_V2_E2E.md
```

### Commit

```text
test: close parent child product correction e2e
```

---

# M17 — Documentation / OSS Release

## M17.1 README

Update product description.

Explain:
- generic OSS assessment engine
- first reference product is parent-facing child AI-era capabilities
- not validated clinical/psychological instrument

## M17.2 Architecture

Update respondent/subject distinction.

## M17.3 Changelog

Add V0.2.0 correction.

## M17.4 Evidence

Create:

```text
docs/evidence/PRODUCT_CORRECTION_V2_FINAL.md
```

Include:
- start SHA
- final SHA
- migration list
- preserved architecture
- new child domain
- tests
- UI screenshots if available
- AI behavior
- privacy changes
- known limitations

### Commit

```text
docs: document child ai school v0.2.0 correction
```

---

# M18 — Final Verification

Run from clean dependency state:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Then:

```bash
git status --short
git diff main...HEAD --stat
```

Search for secrets.

Search active public code for adult legacy language.

Do not claim PASS until green.

---

# M19 — Git Integration

If authorized and `main` has not diverged unexpectedly:

1. push branch
2. merge safely only after full green verification
3. push `main`
4. prepare/tag `v0.2.0` only after merge + green final state

If main diverged:
- do not force
- rebase/merge safely
- rerun full verification
- or leave branch and report

Record final GitHub SHA.

---

# M20 — Completion Status

Allowed:

```text
PASS
PASS_WITH_OWNER_ACTIONS
BLOCKED
```

The executor must NOT say “finished” merely because:
- landing looks correct
- copy changed
- tests from V1 still pass

Product correction is complete only when:
- domain
- data model
- questions
- results
- AI
- dashboard
- privacy
- E2E
are all aligned.
