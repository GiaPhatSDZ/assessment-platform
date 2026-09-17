# GEMINI — V3 WEB TEMPLATE REDESIGN

Repo: `GiaPhatSDZ/assessment-platform`

The owner rejects the current UI and explicitly does not want the old adult/career assessment content in the active product.

Read:
- `V3_WEB_DESIGN_TEMPLATES_SPEC.md`
- `V3_LEGACY_ROUTE_UI_CLEANUP_PLAN.md`
- existing AI School V3 architecture docs

Use installed `Leonxlnx/taste-skill` for composition, typography, spacing and anti-slop review only. It is not authority for curriculum/diagnostic/scoring.

## Fix these first

1. Legacy routing:
   - active V3 flows must never navigate to `/assessment/ai-career-readiness`
   - create `/learn/new`
   - update profile/learning CTAs

2. Raw math:
   - reviewed items contain LaTeX like `\\frac{3}{8}`
   - implement accessible math rendering
   - no raw TeX visible

3. Vietnamese typography:
   - use `Be Vietnam Pro` via `next/font/google`
   - remove generic `font-serif` from diagnostic headings/questions
   - visually verify Vietnamese diacritics

## Do not patch the old survey design
Create a new `components/v3/` template system.

Deliver at minimum:
- AppShell/ProductHeader
- Landing V3
- `/learn`
- `/learn/new`
- Diagnostic Workspace template
- Gap Report template
- Learning Pack template
- Re-test shell
- Learning History shell
- math components

Rehouse the existing Grade 6 Math vertical slice inside the new templates without making the whole product Grade 6 Math.

## Visual direction
Light-first.
Warm-neutral.
High-trust education.
Deep green/teal semantic accent.
Clear Vietnamese typography.
Evidence visualization.
Minimal decorative motion.

Avoid:
- dark AI SaaS
- purple gradient
- glassmorphism
- fake KPI cards
- fake numbers
- oversized blank hero
- generic AI copy

## Production cleanup
Remove developer-only controls such as:
- `Mô phỏng ngộ nhận thực tế`
- `Điền đáp án đúng toàn bộ`

Do not expose internal node intent before the student answers.

## Tests
Write failing tests first for:
- `/learn` new diagnostic CTA → `/learn/new`
- active V3 flow cannot render `Khi đọc một báo cáo nhận định chuyên môn`
- raw `\\frac` is not visible after rendering
- no production developer preset controls
- current V3 vertical slice still works
- responsive 375/768/1024/1440
- lint/typecheck/test/e2e/build

Do not expand curriculum content in this task.

Execute autonomously, verify, commit/push, and report final SHA + screenshots + test results.
