# GEMINI — AI SCHOOL V4 ART DIRECTION EXECUTION

Repo: `GiaPhatSDZ/assessment-platform`

The owner rejects the current V3 look even though the legacy routing/font/math fixes are useful.

This task is NOT another color/padding pass.

It is a visual architecture redesign.

Read:
- `V4_VISUAL_DNA_REFERENCE_ANALYSIS.md`
- `V4_ART_DIRECTION_SPEC.md`
- `V4_PAGE_BLUEPRINTS.md`
- `V4_DESIGN_TOKENS.json`
- existing V3 product/curriculum/content authority docs

Use `Leonxlnx/taste-skill` for visual execution and anti-slop review.

## Preserve
- V3 routes
- math rendering fix
- curriculum truth
- diagnostic logic
- legacy route cutover
- content database boundaries
- no child runtime generative AI

## Replace
- current landing composition
- repetitive section/card system
- generic Tailwind SaaS hierarchy
- current hero
- current curriculum catalog presentation
- current visual treatment of diagnostic/result/parent surfaces

## Visual goal
Reference DNA:
- warm editorial canvas
- elegant serif brand typography
- clean sans-serif app UI
- actual product interface as the hero visual
- large product scenes
- strong whitespace
- low border/card noise
- one distinctive accent family
- product-storytelling sections

Do NOT clone any third-party page.

## Fonts
Use:
- Lora for marketing/display
- Be Vietnam Pro for UI

Both via `next/font/google`.

## Three modes
1. BRAND MODE
2. FOCUS MODE
3. INSIGHT MODE

Do not apply one universal card system to every page.

## Landing
Build 5 major acts, not 9 equal sections.

Act 1:
- split hero 5/7
- left editorial message
- right real KnowledgePathPreview

Act 2:
- sticky gap-tracing story
- problem → prerequisite → likely gap

Act 3:
- curriculum stage rail
- Mẫu giáo / Tiểu học / THCS / THPT
- honest coverage

Act 4:
- detect → learn → re-test product progression

Act 5:
- parent support scene
- Parent Copilot as contextual panel, not generic chat

Then source trust + FAQ + final CTA.

## Critical truth fixes
Remove ungrounded marketing claims such as:
- “chỉ cần học bù đúng 15 phút”
- “giải quyết dứt điểm”

Use evidence-safe wording.

## Student diagnostic
Make it almost distraction-free.
No marketing cards.
No glossy app dashboard.

## Gap result
Make the knowledge path the primary visual.
Use human language.
Do not expose developer labels such as `ROOT_GAP`.

## Curriculum
Use editorial stage rail + list rows.
Avoid equal card grids.

## Parent Copilot
Use contextual companion panel.
Keep AI clearly parent-only.
Show source grounding.

## No fake evidence
Do not create testimonials, stats, student outcomes, or completion numbers.

## Responsive
Review:
- 360
- 390
- 768
- 1024
- 1440

## Verification
Must pass:
- visual route screenshots
- no regression in V3 route cutover
- no raw LaTeX
- no legacy career question
- lint
- typecheck
- unit/integration tests
- E2E
- build

## Final evidence
Create:
`docs/evidence/V4_ART_DIRECTION_REPORT.md`

Include:
- before/after screenshots
- exact pages redesigned
- design tokens
- fonts
- motion
- accessibility
- rejected taste-skill suggestions
- test results
- final SHA

Do not expand curriculum content in this task.
