# GEMINI — AI SCHOOL V3 RESEARCH-FIRST EXECUTION PROMPT

You are implementing the next architecture phase of `GiaPhatSDZ/assessment-platform`.

This is NOT permission to mass-generate preschool–Grade 12 curriculum or question banks.

Read these V3 authorities first:

```text
AI_SCHOOL_V3_EXECUTIVE_DECISION.md
V3_EVIDENCE_SOURCE_MATRIX.md
V3_CURRICULUM_AUTHORITY_AND_KNOWLEDGE_GRAPH_SPEC.md
V3_DIAGNOSTIC_GAP_ENGINE_SPEC.md
V3_GEMINI_NOTEBOOK_REMEDIATION_PROTOCOL.md
V3_PATHWAY_EXPLORER_BOUNDARY.md
V3_RESEARCH_FIRST_IMPLEMENTATION_PLAN.md
```

## Product correction

Treat:

```text
V0.1 career assessment = LEGACY_EXPERIMENT
V2 10-question child capability quiz = DO_NOT_SHIP
V3 Knowledge Control = PRIMARY
```

Do not delete legacy history.

## Primary task

Build the evidence infrastructure and ONE source-backed vertical slice.

Do NOT attempt full K-12 content.

## Source rules

Official curriculum claims require source provenance.

Never use model memory as curriculum authority.

If official source evidence is missing:

```text
UNKNOWN
BLOCKED_BY_EVIDENCE
```

Do not guess.

## AI rules

AI may:
- extract candidate structure from official documents
- draft nodes
- draft prerequisite relationships
- draft items
- draft explanations

AI may NOT automatically mark those outputs approved.

Use statuses:

```text
EXTRACTED / DRAFT
REVIEWED
APPROVED
```

Only controlled review promotes authority.

## Diagnostic rules

Do not create a global IQ/ability score.

Use:

```text
NOT_ASSESSED
UNCERTAIN
DEVELOPING
SECURE
```

with evidence confidence.

Every state must link to attempts.

## Gemini Notebook

Gemini Notebook is remediation support.

It does not set mastery state.

Implement manual integration first.

Do not depend on the Preview Enterprise API.

## Vertical slice selection

First ingest an official subject program.

Then choose one Mathematics topic with a cross-topic or cross-grade prerequisite chain that is clearly supported by the extracted source.

Do not preselect a topic purely from memory.

Write:

```text
docs/research/VERTICAL_SLICE_SELECTION.md
```

before implementing the slice.

## Existing architecture

Preserve useful existing infrastructure:
- Next.js
- Supabase
- auth
- secure ownership
- CI
- provider abstractions
- child data minimization
- OSS docs

Refactor only where the new domain requires it.

## Completion

A valid V3 result is one working evidence-complete loop:

```text
official curriculum
→ approved nodes
→ reviewed diagnostic items
→ student attempts
→ gap evidence
→ learning pack
→ Gemini Notebook instructions
→ re-test
→ mastery history
```

Do not claim “preschool–Grade 12 supported” merely because schemas accept a grade field.

Coverage must be reported from a coverage registry.

## Final evidence

Create:

```text
docs/evidence/V3_FINAL_IMPLEMENTATION_REPORT.md
```

Report:
- sources used
- checksums/retrieval dates
- extracted/reviewed/approved counts
- selected vertical slice
- knowledge graph
- item counts/status
- diagnostic rules/version
- gap rules/version
- Notebook integration mode
- tests/E2E/build
- unknowns
- blocked-by-evidence items
- exact coverage

The controller will audit after completion.
