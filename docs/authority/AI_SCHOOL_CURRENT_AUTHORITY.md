# AI School — Current Product & Architectural Authority

**Document Status:**
```text
AUTHORITATIVE CURRENT TRUTH
SUPERSEDES: Historical Generic Assessment Platform (v0.1 / Transitional V1/V2)
FROZEN BASELINE: R2.1 Source Provenance / R2.2 Publication Gate / R2.2.1 Server Delivery Boundary
```

**Scope Jurisdiction:** Vietnam K-12 General Education Program (GDPT 2018)  
**Effective Date:** 2026-09-18  
**Repository:** `GiaPhatSDZ/assessment-platform`

---

## 1. Product Truth & Mission

**PRODUCT:**
AI School curriculum-grounded learning and Knowledge Control.

AI School is designed to replace opaque, high-stress testing and generic question dumps with deterministic, evidence-based knowledge tracing aligned with the Vietnamese National Curriculum (**Chương trình Giáo dục phổ thông 2018 - Ban hành kèm Thông tư 32/2018/TT-BGDĐT**).

### Core Invariants:
1. **Knowledge Control over Black-Box AI:** We do not use generative AI to invent questions, guess grades, or score tests. Every diagnostic item and prerequisite relationship is rooted in accredited national textbook and curriculum sources.
2. **Prerequisite Gap Tracing over Drill-and-Kill:** Instead of forcing students through dozens of repetitive exercises on their failing topic, the system traces the prerequisite graph (DAG) backwards to identify the true foundational blocker (e.g., missing Grade 5 common denominator technique blocking Grade 6 fraction addition).
3. **Evidence-Based Mastery:** Competence is demonstrated through concrete item attempts and targeted re-tests, not inferred from generic test scores or subjective confidence rankings.

---

## 2. Student Runtime Authority Contract

**STUDENT:**
- no runtime generative AI
- only reviewed/published curriculum content
- diagnostic → evidence → prerequisite gap → approved learning → retest
- no fake global score / intelligence inference

### Detailed Invariants:
- **No Runtime Generative AI:** Generative language models (LLMs) are strictly forbidden from generating questions, evaluating answers, scoring attempts, or interacting directly with students during diagnostic or learning workflows.
- **Only Reviewed / Published Content:** Only curriculum artifacts that have passed formal cryptographic review verification and have an explicit allowed maturity state (`REVIEWED`, `PILOT`, `CALIBRATED`) may be delivered to the student browser.
- **Deterministic Lifecycle:** `diagnostic → evidence → prerequisite gap → approved learning → retest`.
- **No Fake Global Score / Intelligence Inference:** The platform does not produce pseudo-IQ metrics, arbitrary percentage scores, or comparative intelligence rankings. All student feedback is qualitative, node-specific, and evidence-grounded.
- **Fail-Closed Presentation:** When content for a subject or grade has not completed human review verification (such as current Grade 6 Mathematics), the student interface fails closed to `CONTENT_NOT_AVAILABLE`. Zero draft material crosses to the client.

---

## 3. Parent Copilot Authority Contract

**PARENT:**
- Parent Copilot may use AI
- grounded in approved sources and child evidence context
- parent-facing only
- cannot change mastery/evidence state

### Detailed Invariants:
- **Parent Copilot May Use AI:** Generative AI is permitted exclusively within the parent domain (`/parent`, `ParentView`, `ManualGeminiNotebookProvider`) to assist parents in understanding their child's learning blockers and facilitating constructive home dialogue.
- **Grounded in Approved Sources & Child Evidence Context:** All parent prompts and AI responses must be strictly grounded in verified curriculum learning outcomes (YCCĐ) and the student's concrete gap report. AI must never hallucinate educational standards.
- **Parent-Facing Only:** Parent Copilot interfaces, instructions (`geminiNotebookInstructions`), and copyable prompts are strictly separated from student payloads (`LearningPack`).
- **Cannot Change Mastery/Evidence State:** The Parent Copilot is purely read-only and conversational. AI can never alter, create, or override a student's mastery record, diagnostic score, or evidence state.

---

## 4. Content Authority & Frozen R2 Invariants

**CONTENT AUTHORITY:**
- preserve frozen R2 invariants
- unpublished/DRAFT content server-only
- one publication gate
- human review attestation required
- reviewer authority fail-closed

### Detailed Architectural Specifications:
1. **Preserve Frozen R2 Invariants:**
   - Baseline commit: `7d21e1978d0d4fdfc11e04b3ba92aaf50b860eb2`
   - Content authority layer is completely frozen.
2. **Unpublished / DRAFT Content Server-Only (R2.2.1):**
   - Canonical curriculum JSON files (`question-bank/items.json`, `lessons/*.json`, `knowledge-nodes.json`, `prerequisite-edges.json`) are imported exclusively by server-only modules (`import "server-only"`).
   - Client components and client-callable services (`CurriculumService`, `generateLearningPack`) have zero static imports of unpublished curriculum JSON.
   - All student delivery occurs through sanitized, minimal DTOs (`DiagnosticDeliveryDto`, `LessonDeliveryDto`).
3. **One Publication Gate (R2.2):**
   - `assertPublishedForStudent(item)` and `filterPublishedForStudent(items)` form the single publication gate.
   - Requires deterministic canonical content hash verification: `computedHash === reviewAttestation.contentHash`.
   - Requires `hashAlgorithm: "SHA-256"` and `hashSchemaVersion: "content-hash-v1"`.
   - Rejects stale attestations immediately when content fields (`prompt`, `options`, `correctAnswer`, `sourceRefs`, `authoringOrigin`) are modified post-review.
4. **Human Review Attestation Required:**
   - Publication gate strictly mandates human review attestation (`ReviewAttestation`).
   - Self-promotion by AI (`authoringOrigin === "AI_GENERATED"`) without verified human pedagogical signoff is blocked with `SelfPromotionForbiddenError`.
5. **Reviewer Authority Fail-Closed:**
   - Production reviewer registry (`productionReviewerAuthority`) is read-only and empty by default (fail-closed).
   - Test registries may only be injected when `process.env.NODE_ENV === "test"`.
   - Arbitrary production authority injection throws `SECURITY_VIOLATION`.

---

## 5. Current Grade 6 Mathematics Content Status

**CURRENT GRADE 6 STATUS:**
- SOURCE_LINKED / AI_DRAFT / DRAFT
- zero production reviewer
- zero student-published diagnostic content

| Component | Identifier | Status | Student Delivery |
|---|---|---|---|
| Question Bank | `curriculum/.../math/question-bank/items.json` | `itemMaturity: "DRAFT"`, `reviewState: "AI_DRAFT"` | **BLOCKED** (`CONTENT_NOT_AVAILABLE`) |
| Lessons | `curriculum/.../math/lessons/fractions-addition.json` | `itemMaturity: "DRAFT"`, `reviewState: "AI_DRAFT"` | **BLOCKED** (`CONTENT_NOT_AVAILABLE`) |
| Knowledge Nodes | `curriculum/.../math/knowledge-nodes.json` | `reviewState: "SOURCE_LINKED"` | **BLOCKED** (`null`) |
| Prerequisite Edges | `curriculum/.../math/prerequisite-edges.json` | `reviewState: "SOURCE_LINKED"` | **BLOCKED** (`null`) |
| Reviewer Authority | `productionReviewerAuthority` | `0` verified human reviewers | **FAIL-CLOSED** |

- **SOURCE_LINKED / AI_DRAFT / DRAFT** status across all Grade 6 artifacts.
- **zero production reviewer** registered in production authority.
- **zero student-published diagnostic content** available in runtime.

---

## 6. Relationship to Platform Core & Reusable Infrastructure

The repository retains reusable, generic platform infrastructure developed in early milestones:
- Deterministic scoring engine (`src/domain/assessment/scoring.ts`)
- Anonymous cryptographic visitor token authentication (`src/infrastructure/auth/anonymous-visitor.ts`)
- Supabase PostgreSQL persistence adapter with in-memory fallback (`src/infrastructure/database/`)
- Admin metrics and funnel tracking (`components/admin/`)

These capabilities remain supported as **reusable platform-core infrastructure** (RETAINED AS REUSABLE PLATFORM-CORE REFERENCE), but do not define the primary product direction of AI School.
