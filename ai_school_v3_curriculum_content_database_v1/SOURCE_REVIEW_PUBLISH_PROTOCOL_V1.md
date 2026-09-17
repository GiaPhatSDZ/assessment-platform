# AI School V3 — SOURCE → REVIEW → PUBLISH Protocol V1

## Stage 1 — Register source
- identify authority
- capture URL/document number
- retrieval date
- curriculum status
- checksum if downloaded

Output:
`SOURCE_REGISTERED`

## Stage 2 — Extract
AI/parser may extract candidate outcomes.

Every candidate must include source locator.

Output:
`AI_DRAFT` / `EXTRACTED`

## Stage 3 — Source verification
Controller/reviewer confirms:
- text exists in source
- grade/stage/subject mapping is correct
- source status is correct

Output:
`SOURCE_LINKED`

## Stage 4 — Normalize into knowledge nodes
Create assessable nodes and prerequisite proposals.

Do not approve prerequisite inference automatically.

## Stage 5 — Author content
Create:
- lesson
- example
- questions
- explanations
- parent guide

AI assistance is allowed only as draft authoring.

## Stage 6 — Internal review
Check:
- correctness
- age/grade fit
- language
- answer key
- rationale
- math rendering
- source alignment
- copyright risk

Output:
`INTERNAL_REVIEWED`

## Stage 7 — Subject-expert review
When available, a qualified reviewer checks educational/content accuracy.

Output:
`SUBJECT_EXPERT_REVIEWED`

Never fake this field.

## Stage 8 — Publish beta
Allowed when project owner accepts internal-reviewed beta content.

Output:
`PUBLISHED_BETA`

UI labels beta coverage honestly.

## Stage 9 — Pilot
Collect:
- item completion
- wrong-answer distribution
- confusing wording reports
- re-test evidence
- content correction reports

Do not collect more child PII than needed.

## Stage 10 — Verified publication
After stronger review/pilot:

`PUBLISHED_VERIFIED`

This is still not the same as government endorsement.

## Hard rule
No student-facing generative fallback.

If content is not published:

`CONTENT_NOT_AVAILABLE`
