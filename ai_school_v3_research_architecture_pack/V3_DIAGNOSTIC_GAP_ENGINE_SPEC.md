# AI School V3 — Diagnostic & Knowledge Gap Engine Specification

**Status:** Architecture authority  
**Principle:** Evidence first; uncertainty explicit; AI is not the mastery authority.

---

# 1. Goal

Given:
- approved curriculum knowledge nodes
- approved diagnostic items
- student attempts

Determine:
1. which nodes have evidence
2. which nodes need more evidence
3. which nodes show a likely gap
4. whether a prerequisite may explain the observed failure
5. what to assess next
6. what to remediate next

---

# 2. Do Not Start With a Global Score

Avoid:

```text
Math = 62/100
```

as the primary state.

Prefer:

```text
Fractions
├── concept ............... SECURE / HIGH confidence
├── equivalence ........... DEVELOPING / MEDIUM
├── common denominator .... UNCERTAIN / LOW
└── add/subtract .......... NOT_ASSESSED
```

A summary score may be added later only with documented interpretation.

---

# 3. Knowledge State

```ts
type KnowledgeState =
  | "NOT_ASSESSED"
  | "UNCERTAIN"
  | "DEVELOPING"
  | "SECURE";

type EvidenceConfidence =
  | "LOW"
  | "MEDIUM"
  | "HIGH";
```

The state is versioned:

```text
state_rule_version
```

---

# 4. Diagnostic Item Model

```ts
interface DiagnosticItem {
  id: string;
  nodeIds: string[];
  primaryNodeId: string;
  type:
    | "MULTIPLE_CHOICE"
    | "NUMERIC"
    | "SHORT_RESPONSE"
    | "MATCHING"
    | "ORDERING"
    | "CONSTRUCTED_RESPONSE"
    | "OBSERVATION_TASK";
  cognitiveDemand:
    | "RECALL"
    | "UNDERSTAND"
    | "APPLY"
    | "TRANSFER";
  prompt: string;
  answerSpec: unknown;
  rationale: string;
  misconceptionTags: string[];
  itemStatus:
    | "DRAFT"
    | "REVIEWED"
    | "PILOT"
    | "CALIBRATED";
  sourceRefs: SourceReference[];
}
```

Do not call an item “calibrated” without pilot data.

---

# 5. Attempt Evidence

```ts
interface ItemAttempt {
  id: string;
  studentId: string;
  itemId: string;
  curriculumVersion: string;
  response: unknown;
  scoreEvidence: "CORRECT" | "PARTIAL" | "INCORRECT" | "UNSCORABLE";
  misconceptionTags: string[];
  hintCount?: number;
  createdAt: string;
}
```

Response time may be stored for UX/operations but must not automatically affect ability state without evidence supporting that interpretation.

---

# 6. MVP Evidence Rule

The first V3 implementation uses transparent heuristics, not fake psychometrics.

Example behavior:

### No evidence
```text
NOT_ASSESSED
```

### One item only
Usually:
```text
UNCERTAIN
```

### Contradictory evidence
```text
UNCERTAIN
```
and select another independent item.

### Repeated difficulty
If multiple reviewed items for the same node show consistent difficulty:
```text
DEVELOPING
```
and investigate prerequisites.

### Secure
Only after multiple independent reviewed items show consistent success, including at least one application/transfer item when appropriate:
```text
SECURE
```

Exact numeric thresholds are configurable and labeled:

```text
MVP_HEURISTIC_V1
```

They are not scientific norms.

---

# 7. Gap Investigation

Pseudo-flow:

```text
student fails current node
        ↓
is evidence sufficient?
  ├── no → ask another item
  └── yes
        ↓
inspect prerequisite edges
        ↓
test strongest prerequisite not recently secure
        ↓
prerequisite fails?
  ├── yes → ROOT_GAP_CANDIDATE
  └── no  → LOCAL_GAP_CANDIDATE
```

Never recursively quiz forever.

Set:
- depth limit
- item limit
- session fatigue limit

---

# 8. Gap Record

```ts
interface KnowledgeGap {
  id: string;
  studentId: string;
  targetNodeId: string;
  rootCandidateNodeId?: string;
  classification:
    | "LOCAL_GAP_CANDIDATE"
    | "PREREQUISITE_GAP_CANDIDATE"
    | "INSUFFICIENT_EVIDENCE";
  confidence: EvidenceConfidence;
  supportingAttemptIds: string[];
  ruleVersion: string;
  detectedAt: string;
}
```

Use “candidate” until evidence is sufficient.

---

# 9. Misconceptions

A wrong answer is not automatically a misconception.

Misconception tagging requires:
- item distractor deliberately linked to a known misconception, or
- reviewed rule for constructed response

Example:

```text
wrong
≠
misconception
```

AI may suggest a misconception from a response, but this is:

```text
AI_SUGGESTED
```

until verified by scoring logic/reviewer.

---

# 10. Adaptive Item Selection

MVP selection order:

1. target node
2. gather minimum independent evidence
3. if uncertain, ask another target item
4. if likely gap, inspect prerequisite
5. stop after evidence/fatigue limits

Avoid “adaptive” marketing unless real adaptive logic is active.

---

# 11. Age / Development

The engine can share evidence architecture across ages.

The item type cannot be shared blindly.

Preschool:
- observation/activity/task
- parent/teacher facilitation
- minimal reading demand

Young primary:
- short text
- audio/image interaction if implemented

Older students:
- direct subject tasks
- constructed responses where scorable

---

# 12. Scoring Authority

Deterministic scoring for objective items.

Constructed responses:
- exact/rule scoring where feasible
- human review for high-stakes ambiguity
- AI-assisted scoring allowed only as `AI_SUGGESTED_SCORE`, never silently authoritative in V3

Do not use LLM confidence as mastery confidence.

---

# 13. Learning Pack Trigger

A remediation pack is generated only when:

```text
gap.classification != INSUFFICIENT_EVIDENCE
```

Pack references:
- exact node
- prerequisite path
- supporting evidence
- trusted sources
- learning objective
- recommended practice
- re-test criteria

---

# 14. Re-test

Do not immediately repeat the same item.

Use:
- parallel item
- delayed retrieval when possible
- application variant

On re-test:
- append new evidence
- do not delete old attempts
- update mastery state with versioned rules

---

# 15. Future Psychometrics

Possible later research:
- IRT
- Bayesian Knowledge Tracing
- Deep Knowledge Tracing
- calibrated adaptive testing

Do NOT implement these because the names sound advanced.

They require:
- enough high-quality attempt data
- item quality control
- validation
- bias/fairness review

V3 begins with transparent rules that can be audited.

---

# 16. Auditability

Every state displayed to a parent/student should be explainable:

```text
Why DEVELOPING?
→ 3 reviewed items attempted
→ 1 correct, 2 incorrect
→ errors consistent on equivalent transformation
→ prerequisite node currently UNCERTAIN
→ next action: verify prerequisite
```

This is more valuable than a mysterious AI score.
