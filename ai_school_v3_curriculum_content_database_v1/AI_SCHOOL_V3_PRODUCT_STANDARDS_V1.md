# AI School V3 — Product Standards V1
## Curriculum-grounded learning for Vietnamese families

**Status:** APPROVED
**Date:** 2026-09-17
**Scope:** Mẫu giáo (3–6 tuổi) → Lớp 12

---

# 1. Product Promise

AI School is a learning and knowledge-control system, not an AI chatbot for children.

The product must help answer:

> Con đang học gì theo chương trình?
> Con đang hổng kiến thức nào?
> Bằng chứng nào cho thấy điều đó?
> Nên học lại từ đâu?
> Sau khi học lại, bằng chứng mới có tốt hơn không?

---

# 2. Three Product Layers

```text
STUDENT LEARNING SYSTEM
(no runtime generative AI)
        │
        ├── reviewed lessons
        ├── reviewed examples
        ├── reviewed question bank
        ├── deterministic diagnostics
        ├── static reviewed hints
        └── re-tests

KNOWLEDGE CONTROL ENGINE
        │
        ├── curriculum authority
        ├── knowledge graph
        ├── prerequisite graph
        ├── evidence state
        ├── gap detection
        └── mastery history

PARENT COPILOT
(AI allowed)
        │
        ├── explain lesson to parent
        ├── explain child's error
        ├── suggest questions to ask child
        ├── show guided solution to parent
        └── grounded only in approved sources
```

The same curriculum/content truth powers all three layers.

---

# 3. Non-negotiable Student Rule

The child-facing runtime must NOT generate new learning truth with an LLM.

A student can see only content with an allowed publication state.

No behavior such as:

```text
missing lesson → ask AI to create one → show directly to student
```

If reviewed content does not exist:

```text
CONTENT_NOT_AVAILABLE
```

---

# 4. Parent AI Rule

AI exists for the parent/guardian, not as the child's unrestricted tutor.

Parent Copilot can:
- teach the parent first
- explain the official learning objective in simple language
- explain why an answer is wrong
- give a worked solution for the parent
- produce child-safe hints based on approved material
- propose questions the parent can ask
- show where in the trusted source the concept comes from

Parent Copilot cannot:
- invent curriculum outcomes
- publish new student lessons automatically
- change mastery state
- change correct answers
- create official-looking source claims
- diagnose IQ or intelligence
- give career verdicts

---

# 5. Website Quality Standard

Every production screen must satisfy all four:

```text
DESIGN QUALITY
+ LEARNING CLARITY
+ SOURCE TRUST
+ PARENT USABILITY
```

The website must not look like:
- an HR assessment tool
- a generic AI SaaS
- a dark survey app
- a personality quiz
- a fake science dashboard

It should feel like:
- a modern Vietnamese learning product
- a structured knowledge map
- a diagnostic tutor
- a parent-support tool
- a trustworthy curriculum library

---

# 6. Curriculum Coverage Truth

Architecture covers:

```text
Mẫu giáo 3–4
Mẫu giáo 4–5
Mẫu giáo 5–6
Lớp 1
...
Lớp 12
```

But the UI must never claim all content is complete merely because folders exist.

Coverage status is explicit:

```text
NOT_INGESTED
SOURCE_INGESTED
OUTCOMES_EXTRACTED
CONTENT_IN_REVIEW
DIAGNOSTIC_READY
PUBLISHED
```

---

# 7. Authority Rule

Curriculum truth:

```text
Official MOET curriculum / legal documents
```

Teaching truth:

```text
Approved/trusted learning sources
```

Student question truth:

```text
Reviewed original item bank aligned to official learning outcomes
```

AI output:

```text
DRAFT / EXPLANATION
```

Never reverse this hierarchy.

---

# 8. No Hallucination Standard

Production curriculum data requires provenance.

Every official learning outcome must trace to:
- source document
- version
- section/page if available
- retrieval date
- review state

Every student-facing question must trace to:
- learning outcome
- knowledge node
- answer key
- rationale
- review state

If evidence is missing, keep:

```text
UNKNOWN
```

Do not infer and silently publish.
