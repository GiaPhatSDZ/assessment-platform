# AI School V3 — Web Design Templates Spec

Status: APPROVED
Date: 2026-09-17
Repo: GiaPhatSDZ/assessment-platform

## Product flow
Choose learner → grade/stage → subject → supported topic → diagnostic → evidence-backed gap → learning pack → Gemini Notebook → re-test → learning history.

## Legacy rule
Do not use the adult V0.1 `AssessmentRunner`, career radar, or `/assessment/ai-career-readiness` as an active V3 product flow. Keep history only.

## Visual direction
- Light-first, warm-neutral education product.
- High-trust, editorial clarity, evidence-forward.
- Friendly for Vietnamese parents/students; not childish.
- Avoid dark AI SaaS, purple gradients, glassmorphism, fake KPIs, giant empty heroes.
- Use `taste-skill` for composition/taste, not for curriculum or diagnostic authority.

## Typography
Use `Be Vietnam Pro` via `next/font/google` as primary UI font.
Do not use bare Tailwind `font-serif` in diagnostic UI.
Check Vietnamese diacritics explicitly.

## Math
Raw LaTeX must never be visible.
Create:
- `components/math/MathText.tsx`
- `components/math/InlineMath.tsx`
- `components/math/BlockMath.tsx`

Use an accessible renderer such as KaTeX/react-katex if compatible.
Long-term item content should distinguish text and math segments instead of guessing with regex.

## Template 01 — Landing `/`
Hero:
- H1: `Tìm đúng chỗ con đang hổng. Học lại đúng phần cần thiết.`
- CTA: `Bắt đầu kiểm tra kiến thức`
- Secondary: `Xem cách hệ thống hoạt động`

Sections:
1. Gap tracing
2. Curriculum-backed trust
3. Stage/subject catalog preview
4. Before → gap → learn → re-test example
5. Gemini Notebook handoff
6. Parent role
7. Privacy/no ranking
8. FAQ
9. final CTA

## Template 02 — Learning Home `/learn`
Replace the adult ParticipantDashboard.
Primary CTA: `Bắt đầu chẩn đoán kiến thức` → `/learn/new`.

Show learner, subject states, recent activity, active remediation.
Do not show generic capability average `/100`.

Allowed states:
- Chưa kiểm tra
- Đang kiểm tra
- Có lỗ hổng cần học lại
- Đang học bù
- Đã có bằng chứng vững

## Template 03 — New Diagnostic Wizard `/learn/new`
Steps:
1. learner
2. grade/stage
3. subject
4. supported topic

Only real supported topics are selectable.
Unsupported topic must say it is not yet available.
Never generate a diagnostic dynamically with an LLM.

## Template 04 — Curriculum Explorer
Routes:
- `/curriculum`
- `/curriculum/[grade]`
- `/curriculum/[grade]/[subject]`

Show honest coverage:
- Đã có chẩn đoán
- Đang xây dựng
- Chưa hỗ trợ

Show official source/status where available.

## Template 05 — Diagnostic Workspace `/diagnostic/[sessionId]`
Not an adult survey card stack.
Layout:
- subject/grade/topic
- progress
- one problem at a time
- rendered math
- answer controls
- save/exit

Remove production developer buttons:
- `Mô phỏng ngộ nhận thực tế`
- `Điền đáp án đúng toàn bộ`

Do not expose internal node IDs or target hints before answering.

## Template 06 — Gap Report `/diagnostic/[sessionId]/result`
Blocks:
- What happened
- Evidence
- Prerequisite path
- Why this conclusion
- Next action

If weak evidence: `Chưa đủ bằng chứng để kết luận`.

Knowledge path example:
BCNN → Quy đồng mẫu → Cộng phân số khác mẫu.

CTA: `Mở gói học bù`.

## Template 07 — Learning Pack `/learning-pack/[id]`
Sections:
- learning objective
- why this prerequisite matters
- approved sources
- worked examples
- practice
- Gemini Notebook handoff
- re-test criteria

Gemini Notebook does not set mastery.

## Template 08 — Re-test `/retest/[sessionId]`
Use parallel items, not identical repeat.
Show before/after evidence carefully.
Do not imply permanent mastery from one item.

## Template 09 — Learning History `/learn/history`
Timeline:
diagnostic → gap → learning pack → re-test → evidence state.

Prefer timeline over fake KPI dashboard.

## Template 10 — Parent View `/parent`
Show:
- what child is learning
- gaps needing support
- suggested parent action
- recent re-test evidence

No IQ, ranking, percentile, or fake science.

## Component families
Create:
- `components/v3/layout/*`
- `components/v3/curriculum/*`
- `components/v3/diagnostic/*`
- `components/v3/remediation/*`
- `components/v3/profile/*`
- `components/math/*`

Do not keep expanding the 30K-line KnowledgeGapRunner.

## Route cutover
Active:
- `/`
- `/learn`
- `/learn/new`
- `/curriculum`
- `/diagnostic/...`
- `/learning-pack/...`
- `/retest/...`

Legacy:
- `/assessment/ai-career-readiness`

Remove legacy from all active navigation and CTAs.
If visited directly, label it legacy/experimental or move behind `/legacy`.

## Brand
`Assessment Studio` is temporary.
Centralize the product name in site config.
Do not hard-code it in header/metadata/dashboard/report.

## Metadata
Remove career-readiness, 10-question capability, `100% accurate`, and `absolute security` language.
Describe knowledge diagnosis and gap remediation.

## Acceptance
Reject design if it still looks like:
- HR assessment
- generic SaaS dashboard
- dark AI landing
- personality quiz
- survey app

Accept when it feels like:
- modern learning system
- knowledge map
- diagnostic tutor
- parent/student education product

## Tests
- no V3 CTA links to `/assessment/ai-career-readiness`
- `/learn` CTA → `/learn/new`
- legacy career question is unreachable from V3 flow
- raw `\\frac` never visible
- Vietnamese diacritics render correctly
- no developer preset controls in production
- 375/768/1024/1440 responsive review
- keyboard usable
- no horizontal overflow
- lint/typecheck/test/e2e/build pass
