# AI School V3 — Curriculum Authority & Knowledge Graph Specification

**Status:** Architecture authority  
**Scope:** Preschool → Grade 12  
**Core principle:** Curriculum truth is source-controlled data with provenance, not model memory.

---

# 1. Curriculum Is Data, Not Prompt Text

Do not write:

```ts
if (grade === 6) topics = [...]
```

across UI/business logic.

Create a versioned curriculum domain.

Canonical hierarchy:

```text
CurriculumRelease
  └── Stage
       └── Grade / Age Band
            └── Subject / Development Domain
                 └── Strand
                      └── Topic
                           └── LearningOutcome
                                └── KnowledgeNode(s)
```

The exact hierarchy can vary by official source; do not force every source into artificial chapters.

---

# 2. Core Entities

## 2.1 Curriculum Release

```ts
interface CurriculumRelease {
  id: string;
  jurisdiction: "VN";
  authority: "MOET";
  title: string;
  status: "CURRENT_NATIONAL" | "PILOT" | "HISTORICAL" | "DRAFT";
  effectiveFrom?: string;
  effectiveTo?: string;
  sourceDocumentIds: string[];
  createdAt: string;
}
```

## 2.2 Source Document

```ts
interface CurriculumSource {
  id: string;
  authority: string;
  title: string;
  documentNumber?: string;
  issuedAt?: string;
  effectiveAt?: string;
  url: string;
  sha256?: string;
  retrievedAt: string;
  sourceTier: "A" | "B" | "C" | "D";
  notes?: string;
}
```

If a local official PDF is ingested, compute checksum.

## 2.3 Stage

```text
PRESCHOOL
PRIMARY
LOWER_SECONDARY
UPPER_SECONDARY
```

## 2.4 Learning Outcome

```ts
interface LearningOutcome {
  id: string;
  curriculumReleaseId: string;
  stage: string;
  grade?: number;
  ageBand?: string;
  subjectId: string;
  strandId?: string;
  officialText: string;
  normalizedSummary: string;
  sourceRef: SourceReference;
  reviewStatus: "EXTRACTED" | "REVIEWED" | "APPROVED";
}
```

`officialText` must come from source evidence.

`normalizedSummary` may be manually/AI normalized but cannot replace official text.

## 2.5 Knowledge Node

A learning outcome may need multiple assessable nodes.

```ts
interface KnowledgeNode {
  id: string;
  learningOutcomeId: string;
  label: string;
  description: string;
  kind:
    | "FACT"
    | "CONCEPT"
    | "PROCEDURE"
    | "SKILL"
    | "APPLICATION"
    | "FOUNDATIONAL_DEVELOPMENT";
  status: "DRAFT" | "REVIEWED" | "APPROVED";
}
```

---

# 3. Prerequisite Graph

```ts
interface PrerequisiteEdge {
  fromNodeId: string; // prerequisite
  toNodeId: string;   // depends on prerequisite
  strength: "REQUIRED" | "HELPFUL";
  rationale: string;
  evidence:
    | "CURRICULUM_EXPLICIT"
    | "EXPERT_REVIEW"
    | "EMPIRICAL"
    | "DRAFT_INFERENCE";
  sourceRefs: SourceReference[];
  reviewStatus: "DRAFT" | "REVIEWED" | "APPROVED";
}
```

AI may propose a prerequisite edge.

AI may NOT mark it approved.

---

# 4. Curriculum Coverage Registry

Create a registry rather than assuming “all subjects are already modeled”.

```ts
interface CoverageRecord {
  curriculumReleaseId: string;
  stage: string;
  gradeOrBand: string;
  subjectId: string;
  sourceIngested: boolean;
  outcomesExtracted: number;
  outcomesReviewed: number;
  nodesApproved: number;
  itemCoveragePercent?: number;
}
```

UI/admin can show:

```text
Grade 6 Math: source ingested, 80/80 outcomes reviewed, diagnostic coverage 22%
Grade 6 Literature: source ingested, item coverage 0%
```

This prevents false “full K-12 coverage”.

---

# 5. Preschool Is a Separate Model

Do not use school-style `subject/chapter/test` as the only representation.

Preschool source model may use:

```text
development_domain
→ expected experience / outcome
→ observable activity
```

Potential domains must be extracted from the applicable official program source.

Do not hard-code a final list from model memory.

Because 2026–2027 includes a new-program pilot, the database must distinguish:
- national current baseline
- pilot release
- scope/applicability

A preschool UI should ask/select relevant program context only if needed.

---

# 6. Grade 1–12 Subject Registry

The subject registry must be built from the official General Education Program and subject programs.

For upper secondary, the model explicitly supports:

```ts
interface StudentCurriculumProfile {
  grade: 10 | 11 | 12;
  mandatorySubjectIds: string[];
  selectedSubjectIds: string[];
  selectedSpecialTopicIds?: string[];
}
```

Do not generate diagnostics for an elective the student does not study unless intentionally chosen as enrichment.

---

# 7. Textbook Boundary

Curriculum says **what must be learned**.

Textbooks/resources are **ways to teach it**.

Therefore:

```text
LearningOutcome
  ├── Source: MOET curriculum
  └── LearningResources[]
       ├── approved textbook A
       ├── approved textbook B
       ├── teacher note
       └── trusted OER
```

Never encode a textbook's chapter ordering as the only curriculum truth.

---

# 8. AI Extraction Workflow

Allowed:

```text
Official PDF
→ parser / OCR if required
→ AI-assisted structure extraction
→ extracted JSON
→ source-line/page references
→ human/controller review
→ APPROVED curriculum data
```

Forbidden:

```text
Prompt model: “What does Grade 7 learn?”
→ model answers from memory
→ production curriculum
```

---

# 9. Provenance Requirements

Every production learning outcome needs:

```text
source_document_id
page_or_section
exact_or_traceable_source_text
retrieval_date
curriculum_release_id
review_status
```

If provenance is missing:

```text
NOT_PRODUCTION_READY
```

---

# 10. Versioning

Never edit official historical outcomes in place.

```text
curriculum_release_v1
curriculum_release_v2
```

Student attempts/results reference exact versions.

When official curriculum changes:
- create/update release
- map old nodes to new where possible
- never reinterpret old evidence silently

---

# 11. Proposed Repository Paths

```text
curriculum/
  sources/
    registry.json
  releases/
    vn-preschool-current/
    vn-preschool-pilot-2026/
    vn-gdpt-2018-consolidated/
  subjects/
  graphs/

src/domain/curriculum/
src/application/curriculum/
src/infrastructure/curriculum/

docs/evidence/curriculum/
```

Do not commit copyrighted textbooks unless licensing permits it.

Store references/metadata instead.

---

# 12. First Vertical Slice Selection

V3 architecture supports preschool–Grade 12.

Implementation begins with one subject/topic chain selected only after official source ingestion.

Preferred technical demonstration:

```text
Mathematics
→ one current-grade topic
→ at least one prerequisite from a prior grade
```

Why:
- dependency gaps are easier to demonstrate
- objective item scoring is easier
- root-gap logic can be tested

Do not freeze a specific “fractions” chain until the official Math program extraction verifies the exact outcomes and grade mapping.

This rule is deliberate: source first, topic second.
