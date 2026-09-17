# V3 Legacy Route & UI Cleanup Plan

## Confirmed root causes
1. `app/assessment/[slug]/page.tsx` imports and renders `aiCareerReadinessAssessmentV1`.
2. `components/dashboard/ParticipantDashboard.tsx` links `Làm bài đánh giá mới` to `/assessment/ai-career-readiness`.
3. The dashboard imports legacy assessment metadata and displays generic normalized scores.
4. `app/layout.tsx` metadata still describes the adult career product.
5. `components/diagnostic/KnowledgeGapRunner.tsx` is a hard-coded Grade 6 fractions vertical slice, not a reusable V3 template.
6. Diagnostic JSON contains raw LaTeX, while the UI renders plain strings.
7. Generic `font-serif` is used without a Vietnamese-first font system.

## Required migration
- Remove all active public links to `/assessment/ai-career-readiness`.
- Preserve legacy route/history only.
- Create `/learn` and `/learn/new`.
- Replace `ParticipantDashboard` with a V3 learning profile dashboard.
- Replace CTA copy with `Bắt đầu chẩn đoán kiến thức`.
- Rewrite root metadata.
- Add Vietnamese-first font.
- Add math rendering components.
- Split KnowledgeGapRunner into reusable phase components.
- Remove developer scenario/autofill buttons from production.
- Add a regression test proving the legacy career question cannot appear in the V3 journey.
