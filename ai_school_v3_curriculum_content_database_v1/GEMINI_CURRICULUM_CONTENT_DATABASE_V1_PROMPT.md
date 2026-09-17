# GEMINI — CURRICULUM CATALOG + CONTENT DATABASE V1 EXECUTION PROMPT

You are working in `GiaPhatSDZ/assessment-platform`.

This task builds the structural curriculum/content database foundation.
It does NOT authorize mass AI generation of lessons/questions.

Read:
- `AI_SCHOOL_V3_PRODUCT_STANDARDS_V1.md`
- `VIETNAM_CURRICULUM_CATALOG_V1.md`
- `CONTENT_DATABASE_SPEC_V1.md`
- `PARENT_COPILOT_BOUNDARY_V1.md`
- `SOURCE_REVIEW_PUBLISH_PROTOCOL_V1.md`
- existing V3 research/evidence architecture

## Goal

Create the full folder/catalog structure from Mẫu giáo 3–6 through Grade 12 and populate the verified subject catalog.

Then implement schemas/validators/coverage registry.

Do NOT populate thousands of learning outcomes/questions yet.

## Exact work

1. Create `curriculum/vietnam/` structure.
2. Create stage/grade catalog from the approved catalog JSON.
3. Preserve preschool release separation:
   - current-national
   - pilot
4. Create subject folder scaffolding.
5. Add machine-readable coverage registry.
6. Implement schemas for:
   - SourceDocument
   - LearningOutcome
   - KnowledgeNode
   - PrerequisiteEdge
   - Lesson
   - QuestionItem
   - Explanation
   - ParentGuide
   - PublicationManifest
7. Add rich-content math model.
8. Add validators so unpublished/draft content cannot enter student runtime.
9. Add tests for subject availability by grade.
10. Add tests for THPT mandatory/elective rules.
11. Add tests proving student runtime cannot call AI generation fallback.
12. Add Parent Copilot grounding interface, but do NOT wire unrestricted child AI chat.
13. Preserve existing Grade 6 Math vertical slice; migrate its data incrementally to new schema without inventing new curriculum claims.
14. Update UI catalog to display honest coverage states.

## Critical restrictions

- No mass question generation.
- No mass lesson generation.
- No model-memory curriculum facts.
- No copying full textbooks.
- No child-facing runtime AI.
- No fake subject-expert review.
- No fake calibration.
- No claim of complete K–12 content.

## Coverage truth

Folder exists != content ready.

The UI must differentiate:
- NOT_INGESTED
- SOURCE_INGESTED
- OUTCOMES_EXTRACTED
- CONTENT_IN_REVIEW
- DIAGNOSTIC_READY
- PUBLISHED

## Parent AI

Only define/wire the boundary and grounding contract in this task.
AI is parent-only.

Parent Copilot may use reviewed/published content.
It may never change mastery.

## Verification

Run:
- lint
- typecheck
- unit tests
- integration tests
- E2E relevant to catalog navigation
- build

Create:
`docs/evidence/CURRICULUM_CONTENT_DATABASE_V1_REPORT.md`

Report exact coverage counts. No invented coverage.

Do not ask for intermediate approval.
