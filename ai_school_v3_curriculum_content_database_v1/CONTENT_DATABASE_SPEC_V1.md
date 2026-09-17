# AI School V3 — Content Database Specification V1

**Status:** APPROVED
**Purpose:** Define exactly how curriculum truth becomes student-facing content.

---

# 1. Content Pipeline

```text
OFFICIAL SOURCE
      ↓
LEARNING OUTCOME
      ↓
KNOWLEDGE NODE
      ↓
PREREQUISITE GRAPH
      ↓
TRUSTED LEARNING SOURCE
      ↓
LESSON / EXAMPLE / ITEM DRAFT
      ↓
REVIEW
      ↓
PUBLISH
      ↓
STUDENT
```

AI can assist DRAFT creation.
AI cannot skip REVIEW.

---

# 2. Source Registry

```ts
interface SourceDocument {
  id: string;
  authority: string;
  title: string;
  documentNumber?: string;
  sourceType:
    | "OFFICIAL_CURRICULUM"
    | "OFFICIAL_GUIDANCE"
    | "APPROVED_TEXTBOOK_METADATA"
    | "TRUSTED_LEARNING_RESOURCE"
    | "INTERNAL_REVIEWED_RESOURCE";
  url?: string;
  localChecksum?: string;
  issuedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  retrievedAt: string;
  curriculumStatus?: "CURRENT_NATIONAL" | "PILOT" | "HISTORICAL" | "DRAFT";
  rightsNotes?: string;
}
```

Never commit copyrighted full-text material unless permitted.

---

# 3. Learning Outcome

```ts
interface LearningOutcome {
  id: string;
  gradeOrAgeBand: string;
  subjectId: string;
  officialText: string;
  normalizedSummary: string;
  sourceRefs: SourceRef[];
  reviewState: ReviewState;
}
```

`officialText` must be source-derived.

`normalizedSummary` may be AI-assisted but reviewed.

---

# 4. Knowledge Node

```ts
interface KnowledgeNode {
  id: string;
  learningOutcomeIds: string[];
  label: string;
  description: string;
  type: "FACT" | "CONCEPT" | "PROCEDURE" | "SKILL" | "APPLICATION" | "DEVELOPMENT";
  reviewState: ReviewState;
}
```

---

# 5. Prerequisite Edge

```ts
interface PrerequisiteEdge {
  prerequisiteNodeId: string;
  targetNodeId: string;
  strength: "REQUIRED" | "HELPFUL";
  rationale: string;
  evidenceType: "CURRICULUM_EXPLICIT" | "EXPERT_REVIEW" | "EMPIRICAL" | "DRAFT_INFERENCE";
  reviewState: ReviewState;
}
```

AI-proposed edges remain draft.

---

# 6. Lesson

```ts
interface Lesson {
  id: string;
  nodeIds: string[];
  title: string;
  learnerText: RichContent[];
  workedExamples: string[];
  approvedSourceRefs: SourceRef[];
  ageOrGradeFit: string[];
  reviewState: ReviewState;
  publicationState: PublicationState;
}
```

Student runtime only sees published lessons.

---

# 7. Question Item

```ts
interface QuestionItem {
  id: string;
  primaryNodeId: string;
  supportingNodeIds: string[];
  type:
    | "MULTIPLE_CHOICE"
    | "NUMERIC"
    | "SHORT_RESPONSE"
    | "MATCHING"
    | "ORDERING"
    | "ACTIVITY"
    | "OBSERVATION";
  cognitiveDemand: "RECALL" | "UNDERSTAND" | "APPLY" | "TRANSFER";
  prompt: RichContent[];
  answerSpec: unknown;
  rationale: string;
  distractorRationales?: Record<string, string>;
  misconceptionTags: string[];
  sourceRefs: SourceRef[];
  authoringOrigin: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
  itemMaturity: "DRAFT" | "REVIEWED" | "PILOT" | "CALIBRATED";
  reviewState: ReviewState;
  publicationState: PublicationState;
}
```

Never label `CALIBRATED` without real pilot/statistical evidence.

---

# 8. Explanation

Separate student explanation from answer key.

```ts
interface Explanation {
  itemId: string;
  shortExplanation: RichContent[];
  stepByStep: RichContent[];
  commonMistakeExplanation?: RichContent[];
  sourceRefs: SourceRef[];
  reviewState: ReviewState;
}
```

No runtime LLM is required for the student.

---

# 9. Parent Guide

```ts
interface ParentGuide {
  nodeId: string;
  parentSummary: string;
  whatChildNeedsToUnderstand: string[];
  commonDifficulties: string[];
  questionsToAskChild: string[];
  hintsWithoutGivingAnswer: string[];
  everydayExamples: string[];
  fullParentSolutionGuide?: RichContent[];
  sourceRefs: SourceRef[];
  reviewState: ReviewState;
}
```

This data is also a grounding source for Parent Copilot.

---

# 10. Review State

Use explicit maturity:

```text
AI_DRAFT
SOURCE_LINKED
INTERNAL_REVIEWED
SUBJECT_EXPERT_REVIEWED
PILOTED
```

Do not imply expert review if none occurred.

Recommended student publication threshold for beta:

```text
INTERNAL_REVIEWED
```

with clear beta status.

For high-stakes/public trust claims, require:

```text
SUBJECT_EXPERT_REVIEWED
```

---

# 11. Publication State

```text
DRAFT
READY_FOR_REVIEW
PUBLISHED_BETA
PUBLISHED_VERIFIED
RETIRED
```

Student UI only reads:

```text
PUBLISHED_BETA | PUBLISHED_VERIFIED
```

Parent AI grounding can use the same published set plus approved source excerpts.

---

# 12. Rich Content

Do not store math as ambiguous plain text.

```ts
type RichContent =
  | { type: "text"; value: string }
  | { type: "inline_math"; latex: string; spokenText?: string }
  | { type: "block_math"; latex: string; spokenText?: string }
  | { type: "image"; assetId: string; alt: string }
  | { type: "table"; data: unknown };
```

This prevents raw `\frac` bugs.

---

# 13. Question Authoring Rule

A question can be generated only after:

```text
learning outcome exists
AND
knowledge node exists
AND
source is known
```

Question authors must be able to answer:

1. What node does this test?
2. Why is it appropriate for this grade?
3. What is the correct answer?
4. Why is that answer correct?
5. What does each distractor mean?
6. What source supports the underlying content?
7. Has it been reviewed?

If not, do not publish.

---

# 14. Copyright Rule

Official curriculum outcomes can be referenced/quoted within appropriate legal limits.

Do not bulk-copy copyrighted textbooks into the public repository unless licensing permits it.

Preferred:
- store bibliographic reference
- section/page locator
- original reviewed explanation
- original question wording

---

# 15. Student Runtime

Student endpoints/query layer only return published content.

No endpoint like:

```text
POST /api/generate-question-with-ai
```

for child-facing runtime.

If a question is missing:

```text
NO_REVIEWED_ITEM_AVAILABLE
```

---

# 16. Audit Trail

Every published content record should retain:
- created by
- AI-assisted? yes/no
- reviewed by
- review timestamp
- source refs
- content version
- previous version
- publication state

Never silently overwrite a published item.
