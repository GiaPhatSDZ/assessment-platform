# AI School V3 — Executive Product Decision

**Status:** APPROVED research/architecture authority  
**Date:** 2026-09-17  
**Repository target:** `GiaPhatSDZ/assessment-platform`  
**V2 child-capability 10-question content status:** `DO NOT SHIP`  
**V0.1 adult/career assessment status:** `LEGACY / NOT ACCEPTED AS VALIDATED CAREER ASSESSMENT`

---

## 1. Final Product Direction

The primary product is no longer a generic capability quiz.

The primary product is:

> **A curriculum-grounded knowledge-control system from preschool through Grade 12 that identifies what a learner knows, where knowledge gaps exist, what prerequisite knowledge may be missing, and guides remediation before re-testing.**

Canonical loop:

```text
Curriculum Authority
        ↓
Knowledge Graph
        ↓
Diagnostic Assessment
        ↓
Evidence-backed Gap Detection
        ↓
Remediation Learning Pack
        ↓
Gemini Notebook / parent / teacher guided learning
        ↓
Practice
        ↓
Re-test
        ↓
Mastery History
```

The system's core question is:

> **“Con đang hổng kiến thức nào, bằng chứng nào cho thấy điều đó, và nên học lại từ đâu?”**

Not:

> “Con thông minh bao nhiêu?”  
> “Con phù hợp nghề nào chỉ sau 10 câu?”  
> “Con có AI readiness 78/100?”

---

## 2. Product Pillars

### Pillar A — Knowledge Control (CORE)

Age/stage coverage:
- Preschool
- Grade 1–5
- Grade 6–9
- Grade 10–12

Functions:
- curriculum map
- knowledge nodes
- prerequisite graph
- diagnostic items
- misconception evidence
- mastery state
- remediation
- re-test
- learning history

This is the product's main authority.

### Pillar B — Gemini Notebook Remediation

Gemini Notebook is a **learning/remediation tool**, not the grading authority.

It receives:
- trusted learning sources
- the identified gap
- prerequisites
- parent/teacher instructions
- learning objectives

It may:
- explain
- create study guides
- create quizzes/flashcards
- answer source-grounded questions
- support guided learning

It may NOT:
- set authoritative mastery state
- invent curriculum outcomes
- alter diagnostic evidence
- decide educational/career placement

### Pillar C — Pathway Explorer (LATER)

For older learners, add a separate module for:
- interest exploration
- subject strengths
- mastery history
- educational pathway exploration
- upper-secondary subject choices
- vocational / intermediate / college / university routes

This module is NOT accepted in V3 core.

---

## 3. What Happens to V0.1 and V2

### V0.1 Adult/Career Assessment

Keep code/history for traceability.

Do NOT treat it as a validated career guidance instrument.

Status:

```text
LEGACY_EXPERIMENT
```

It may later inform a new Pathway Explorer after separate research.

### V2 Parent-Observed Child Capability Quiz

The parent/child domain insight remains useful:
- parent owns child profile
- child privacy rules
- parent-guided learning
- no child email/phone/DOB

But the 10-question “capability radar” is not the core assessment.

Status:

```text
DRAFT_CONTENT_DO_NOT_SHIP
```

Do not remove it from Git history. Do not market it as validated.

---

## 4. Key Scientific/Product Boundary

A mathematically deterministic score is not automatically a valid educational measure.

Therefore:

```text
correct code
≠
valid item
≠
valid construct
≠
valid educational conclusion
```

V3 stores evidence and uncertainty explicitly.

---

## 5. Core Student State Model

Do not default to a global 0–100 “ability score”.

For each curriculum knowledge node:

```text
NOT_ASSESSED
UNCERTAIN
DEVELOPING
SECURE
```

And an evidence confidence:

```text
LOW
MEDIUM
HIGH
```

A state must always be traceable to:
- assessment item attempts
- scoring rule
- node version
- curriculum source
- evidence timestamp

No peer percentile unless a future validated normative dataset exists.

---

## 6. Age/Stage Architecture

### Preschool

Do NOT model preschool as “small Grade 1 subjects”.

Use:
- developmental domains
- foundational language
- early mathematical thinking
- observation/exploration
- play-based learning
- social-emotional/self-regulation development
- physical development
- aesthetic/creative experiences

Important current-state rule:
Vietnam is piloting a new preschool curriculum in the 2026–2027 school year. Therefore V3 must support curriculum source status:

```text
CURRENT_NATIONAL
PILOT
HISTORICAL
DRAFT
```

Do not merge pilot outcomes into national baseline without explicit source status.

### Grade 1–5

Curriculum-grounded subject learning outcomes.

Main use:
- foundational reading/language
- mathematics
- science/social foundations according to official grade program
- technology/digital foundations where officially specified
- subject-specific knowledge control

### Grade 6–9

Stronger prerequisite graph.

Main use:
- subject diagnostic
- cross-grade gap tracing
- misconception detection
- study independence
- beginning pathway exploration, but no “career verdict”

### Grade 10–12

Support:
- mandatory subjects
- selected subjects
- subject learning outcomes
- mastery history
- exam/preparation learning
- stronger pathway exploration

Upper-secondary subject configuration must reflect the student's actual chosen subjects.

---

## 7. Parent Role

Parents are not expected to become subject experts.

Parent functions:
- create/manage child profile
- choose current grade
- choose subject/topic
- launch diagnostic
- see evidence-backed gap
- open remediation pack
- supervise younger learners' AI usage
- review re-test progress

The product should explain:

```text
“Bạn không cần tự biết cách dạy lại bài.
Hệ thống giúp xác định phần cần học lại và chuẩn bị nguồn học có căn cứ.”
```

---

## 8. Student Role

Depends on age and context.

Young children:
- parent/teacher guided
- short activity/task
- minimal independent AI interaction

Older students:
- gradually more independent
- can study with Gemini Notebook when account/service eligibility permits
- can perform re-tests directly

The platform must not assume every child can legally or practically use Gemini Notebook independently.

---

## 9. Architecture Outcome

```text
AI SCHOOL
│
├── Curriculum Authority Layer
│   └── official source provenance
│
├── Knowledge Graph
│   ├── learning outcomes
│   └── prerequisite edges
│
├── Diagnostic Engine
│   ├── item bank
│   ├── attempts
│   ├── misconceptions
│   └── evidence state
│
├── Gap Engine
│   ├── current-node gap
│   ├── prerequisite investigation
│   └── confidence
│
├── Remediation
│   ├── learning pack
│   ├── Gemini Notebook protocol
│   └── parent/teacher guide
│
├── Re-test / Mastery History
│
└── Pathway Explorer (future)
```

---

## 10. V3 Development Rule

Do NOT build all preschool–Grade 12 content at once.

Architecture must support the full range.

Implementation must first prove one evidence-complete vertical slice:

```text
Official curriculum source
→ extracted learning outcomes
→ knowledge nodes
→ prerequisite links
→ reviewed diagnostic items
→ gap detection
→ remediation pack
→ re-test
```

Only after that slice passes should content ingestion scale across subjects/grades.

---

## 11. V3 Product Promise

Approved product promise:

> **Không chỉ nói con đang sai bài nào. Hệ thống lần theo kiến thức nền để tìm phần con đang hổng, đưa đúng nguồn học để học lại, rồi kiểm tra lại xem lỗ hổng đã được lấp chưa.**

This promise is acceptable only when every detected gap is evidence-backed and source-linked.

---

## 12. Definition of “No Hallucination” for This Project

No hallucination means:

1. Curriculum outcomes must have source provenance.
2. AI cannot invent a curriculum node and silently mark it official.
3. Prerequisite relationships must be reviewed/versioned.
4. Diagnostic items must have answer keys/rationales from a controlled authoring process.
5. AI-generated explanations are not mastery evidence.
6. Mastery state is not changed by chat sentiment.
7. Uncertainty must be represented explicitly.
8. Unknown information remains `UNKNOWN`, never guessed.
