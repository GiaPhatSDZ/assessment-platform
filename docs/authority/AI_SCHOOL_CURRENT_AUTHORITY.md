# AI School — Current Product & Architectural Authority

**Document Status:**
```text
AUTHORITATIVE CURRENT TRUTH
SUPERSEDES: Historical Generic Assessment Platform (v0.1 / Transitional V1/V2)
FROZEN BASELINE: R2.1 Source Provenance / R2.2 Publication Gate / R2.2.1 Server Delivery Boundary
```

**Product Scope:** Preschool (ages 3–6) through Grade 12  
**Effective Date:** 2026-09-18  
**Repository:** `GiaPhatSDZ/assessment-platform`

---

## 1. Product Truth & Stage-Specific Scope

**PRODUCT:**
AI School curriculum-grounded learning and Knowledge Control across Preschool (ages 3–6) through Grade 12.

AI School is designed to replace opaque, high-stress testing, drill-and-kill, and generic black-box question dumps with deterministic, evidence-based knowledge tracing. The platform spans two distinct educational stages governed by separate national curriculum authorities:

### 1.1 Stage-Specific Curriculum Authority

#### PRESCHOOL (Ages 3–4, 4–5, 5–6)
- **Governing Authority:** Current National Preschool Curriculum Authority (Chương trình Giáo dục Mầm non ban hành kèm Thông tư 17/2009/TT-BGDĐT, sửa đổi bổ sung theo Thông tư 28/2016/TT-BGDĐT và Thông tư 51/2020/TT-BGDĐT).
- **Separation of Pilot Regimes:** Pilot or experimental preschool programs (e.g. Đề án thí điểm GDMN mới 2026-2027) must remain strictly classified under Tier B and separated from current national standards.
- **Pedagogical Model:** Developmental, play-based, observational, and parent-guided activity model.
- **Preschool Invariant:** Preschool is **NOT "small Grade 1"**. Preschool learning must never be forced into formal academic drills, mechanical testing, or elementary school prerequisites.
- **Authority Boundary:** Preschool is **NOT governed by TT 32/2018/TT-BGDĐT (GDPT 2018)**.

#### GRADE 1–12 (Primary through Upper Secondary)
- **Governing Authority:** Current Vietnamese General Education Program (Chương trình Giáo dục phổ thông 2018 - Ban hành kèm Thông tư 32/2018/TT-BGDĐT, sửa đổi bổ sung theo Thông tư 13/2022/TT-BGDĐT).
- **Provenance Model:** Subject-specific provenance adhering to the frozen R2.1 source provenance model and official textbook/resource authorities.

### 1.2 Core Product Invariants
1. **Knowledge Control over Black-Box AI:** We do not use generative AI to invent questions, guess grades, or score tests. Every diagnostic item links to verified curriculum and textbook sources.
2. **Prerequisite Gap Tracing over Drill-and-Kill:** Instead of forcing students through repetitive exercises on a failing topic, the system traces the prerequisite graph (DAG) backwards to identify the true foundational blocker (e.g. missing Grade 5 common denominator technique blocking Grade 6 fraction addition).
3. **Prerequisite Evidence Model:** Prerequisite relationships are not assumed to be verbatim quotes from textbooks; they are governed by the formal 4-tier evidence model:
   - `CURRICULUM_EXPLICIT`: Directly mandated by national curriculum learning outcomes (YCCĐ).
   - `EXPERT_REVIEW`: Validated by subject pedagogical expert consensus.
   - `EMPIRICAL`: Supported by statistical student response and mastery transition data.
   - `DRAFT_INFERENCE`: Preliminary draft inference; fails closed for student delivery until human review signoff.
   Only sufficiently evidenced and reviewed graph content may be published for student runtime.
4. **Evidence-Based Mastery:** Competence is demonstrated through concrete item attempts and targeted re-tests, not inferred from generic test scores or subjective confidence rankings.

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
4. **Human Review Attestation Required & Authoring Origins:**
   - Publication gate strictly mandates human review attestation (`ReviewAttestation`).
   - Valid schema authoring origins: `HUMAN`, `AI_ASSISTED`, `ADAPTED_WITH_PERMISSION`.
   - AI-assisted drafting (`authoringOrigin: "AI_ASSISTED"`) is permitted in authoring pipelines, but self-promotion without verified human pedagogical review signoff is strictly blocked with `SelfPromotionForbiddenError`.
   - Human review attestation before student publication is mandatory regardless of authoring origin.
5. **Reviewer Authority Fail-Closed:**
   - Production reviewer registry (`productionReviewerAuthority`) is read-only and empty by default (fail-closed; 0 production reviewers).
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
| Reviewer Authority | `productionReviewerAuthority` | zero production reviewer | **FAIL-CLOSED** |

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
