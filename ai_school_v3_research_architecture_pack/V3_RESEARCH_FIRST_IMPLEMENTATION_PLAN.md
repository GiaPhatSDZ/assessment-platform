# AI School V3 — Research-First Architecture & Implementation Plan

**Status:** APPROVED plan  
**Rule:** No broad feature coding until curriculum source authority and one vertical slice are proven.

---

# Phase R0 — Freeze Wrong Product Assumptions

Create project decision record:

```text
V0.1 adult career = LEGACY_EXPERIMENT
V2 10-question child capability quiz = DO_NOT_SHIP
V3 Knowledge Control = PRIMARY_PRODUCT
```

Do not delete history.

Update README/status only after V3 documents are accepted.

---

# Phase R1 — Source Registry

Create:

```text
curriculum/sources/registry.json
```

Populate only verified sources.

Required initial source groups:

1. MOET consolidated General Education Program
2. official subject program selected for vertical slice
3. preschool current-national source
4. preschool pilot source/status
5. policy source for upper-secondary elective structure

Every source has:
- URL
- authority
- title
- document number if available
- retrieved date
- checksum if downloaded
- status

Acceptance:
- no source is “AI memory”
- pilot/current distinction explicit

---

# Phase R2 — Curriculum Schema

Implement only schema/tests first.

Domain:

```text
CurriculumRelease
CurriculumSource
Subject
LearningOutcome
KnowledgeNode
PrerequisiteEdge
CoverageRecord
```

Tests:
- missing source provenance rejected for APPROVED outcome
- invalid curriculum status rejected
- prerequisite self-loop rejected
- unknown nodes rejected
- version immutability rules

No UI required.

---

# Phase R3 — Official-Source Extraction Pipeline

Build controlled importer:

```text
official document
→ extracted candidate outcomes
→ provenance refs
→ review file
→ approved JSON
```

AI can assist extraction, but output defaults to:

```text
EXTRACTED
```

not `APPROVED`.

Never auto-approve.

Evidence file:

```text
docs/evidence/CURRICULUM_INGESTION_VERTICAL_SLICE.md
```

---

# Phase R4 — Select Vertical Slice From Source

Only after official outcomes are extracted:

Choose one Mathematics current-topic chain with at least one prior-grade prerequisite.

Selection criteria:
- clearly source-backed
- objective assessment feasible
- meaningful prerequisite relationship
- small enough to review manually

Do not select the topic solely because a model remembers it.

Create:

```text
docs/research/VERTICAL_SLICE_SELECTION.md
```

with source evidence.

---

# Phase R5 — Knowledge Graph Slice

For selected slice:

- map learning outcomes
- create nodes
- propose prerequisite edges
- review edges
- version graph

Every edge includes:
- rationale
- evidence class
- review status

No hidden graph generation.

---

# Phase R6 — Diagnostic Item Authoring

Create 3–6 reviewed items per primary node initially where practical.

Coverage across:
- understand
- apply
- transfer when appropriate

Each item:
- node
- answer spec
- rationale
- distractor/misconception rationale where used
- source reference
- review status

AI-generated draft item remains DRAFT until reviewed.

---

# Phase R7 — Diagnostic Engine V1

Implement transparent state model:

```text
NOT_ASSESSED
UNCERTAIN
DEVELOPING
SECURE
```

and:

```text
LOW / MEDIUM / HIGH confidence
```

No global ability percentile.

Add:
- item selection
- evidence aggregation
- stop/fatigue constraints
- prerequisite investigation

Test every transition.

---

# Phase R8 — Gap Engine V1

Implement:

```text
INSUFFICIENT_EVIDENCE
LOCAL_GAP_CANDIDATE
PREREQUISITE_GAP_CANDIDATE
```

Test:
- current node fails, prerequisite secure
- current node fails, prerequisite uncertain
- contradictory attempts
- too little evidence
- recursion depth stop

No AI dependency.

---

# Phase R9 — Student / Parent UX Slice

Flow:

```text
Parent/student profile
→ choose grade
→ choose subject/topic
→ diagnostic
→ evidence result
→ gap
→ “why this result”
```

Show supporting evidence.

Do not show fake K-12 coverage.

Show curriculum coverage status transparently.

---

# Phase R10 — Learning Pack Generator

Input:
- confirmed candidate gap
- knowledge node
- prerequisite path
- approved curriculum sources
- trusted learning resources

Output:
- objective
- source list
- parent/student guide
- worked-example plan
- practice plan
- Gemini Notebook launch instructions
- re-test criteria

No automatic mastery update.

---

# Phase R11 — Gemini Notebook Manual MVP

Implement:

```text
ManualGeminiNotebookProvider
```

UI:
- how to create/open notebook
- sources to add
- copyable versioned study prompt
- safety/age guidance
- “Return to re-test” action

Do not require API.

Do not scrape Notebook conversations.

---

# Phase R12 — Re-test / Mastery History

Re-test uses parallel/new evidence.

Persist:
- previous state
- new evidence
- new state
- rule version
- learning-pack ID

Parent/student can see:

```text
Before
Learning action
After
```

This is the first real product outcome loop.

---

# Phase R13 — Pilot Instrumentation

Collect only needed operational data:
- item attempts
- state transitions
- remediation started
- re-test
- outcome change

Do not claim validation yet.

Prepare future analysis for:
- item too easy/hard
- distractor behavior
- drop-off
- contradictory items
- gap/re-test outcomes

---

# Phase R14 — Scale Curriculum

After vertical slice passes:

Scale in this order:

1. same subject neighboring topics
2. same subject additional grades
3. second subject
4. broader grades
5. preschool branch
6. full catalog

Do not declare “K-12 complete” until coverage registry proves it.

---

# Phase R15 — Preschool Branch

Separate implementation.

Requirements:
- applicable curriculum release/current vs pilot
- age/development band
- activity/observation-based evidence
- parent/teacher facilitation
- no school-style exam UX

Requires its own acceptance spec.

---

# Phase R16 — Upper Secondary Branch

Support:
- mandatory subjects
- selected 4-of-9 electives
- special topics where applicable
- actual student study plan

Do not assess unselected electives by default.

---

# Phase R17 — Pathway Explorer Research

Only after Knowledge Control has meaningful history.

Research:
- grade 9 transition
- vocational/intermediate routes
- college/university routes
- official institution/program data
- interest measurement instruments

No production career recommendation in V3.

---

# Repository Architecture

Proposed:

```text
src/domain/curriculum/
src/domain/diagnostic/
src/domain/mastery/
src/domain/remediation/

src/application/curriculum/
src/application/diagnostic/
src/application/remediation/

src/infrastructure/curriculum/
src/infrastructure/remediation/gemini-notebook/

curriculum/
  sources/
  releases/
  graphs/

assessment-items/
  reviewed/

docs/research/
docs/evidence/
```

Reuse existing:
- auth
- child profile privacy concepts
- DB
- referral
- analytics boundary
- CI
- Vercel
- OSS infrastructure

---

# Stop Conditions

Stop implementation and mark `BLOCKED_BY_EVIDENCE` when:
- official source cannot be verified
- learning outcome provenance is missing
- prerequisite edge is disputed and material
- item answer cannot be justified
- AI-generated source content is the only basis for a curriculum claim

Do not “use best judgment” to fill official facts.

---

# V3 Vertical Slice Definition of Done

```text
[ ] official source registry
[ ] one official subject source ingested
[ ] source-linked learning outcomes
[ ] approved node graph
[ ] reviewed prerequisite edge(s)
[ ] reviewed diagnostic items
[ ] diagnostic engine deterministic
[ ] evidence state + confidence
[ ] gap classification
[ ] parent/student explanation
[ ] learning pack
[ ] Gemini Notebook manual protocol
[ ] re-test
[ ] mastery history
[ ] no AI mastery authority
[ ] no fake percentile
[ ] source provenance visible
[ ] tests
[ ] E2E
[ ] production build
```

Only then scale.
