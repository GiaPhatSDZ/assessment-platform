# AI School V3 — Research Evidence & Authority Matrix

**Research date:** 2026-09-17  
**Purpose:** Prevent product decisions from being presented as facts without source authority.

---

# 1. Source Hierarchy

## Tier A — Legal / Official Curriculum Authority

Use for canonical curriculum outcomes:
- Vietnam Ministry of Education and Training (MOET)
- consolidated legal curriculum documents
- officially issued subject programs
- official preschool curriculum documents
- official pilot documents clearly marked as pilot

These sources define **what belongs to the curriculum**.

## Tier B — Official Implementation / Policy Guidance

Examples:
- Government Portal (`baochinhphu.vn`)
- official MOET implementation guidance

Use for:
- implementation status
- pilot status
- subject-choice rules
- deployment timelines

Do not use Tier B summaries to replace detailed Tier A subject learning outcomes when Tier A exists.

## Tier C — High-quality Educational Research / Frameworks

Examples:
- UNESCO
- UNICEF
- OECD
- Education Endowment Foundation (EEF)
- US Institute of Education Sciences / What Works Clearinghouse

Use for:
- assessment architecture
- formative feedback principles
- metacognition
- AI competency framing
- child-centered AI safeguards

Do not overwrite Vietnamese curriculum content with international frameworks.

## Tier D — Approved / Trusted Learning Materials

Examples:
- official/approved textbooks
- teacher materials
- school materials
- parent-provided workbooks

Use for:
- explanation
- examples
- practice
- remediation packs

A textbook is NOT the same thing as the national curriculum authority.

## Tier E — AI-generated Content

Use for:
- draft explanations
- draft examples
- draft practice items

Never automatically promote to:
- official curriculum
- validated diagnostic item
- authoritative prerequisite
- mastery evidence

Human/review workflow is required.

---

# 2. Vietnam General Education Curriculum

## Source

MOET consolidated document for the General Education Program:
- https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1483/vbhn-ttu-322018-202021-132022-ttbgddt.pdf
- consolidated program overview:
  https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1483/vbhn-chuong-trinh-tong-the.pdf

### Verified facts

The General Education Program issued under Circular 32/2018 was phased in through Grade 12, with Grade 5, Grade 9, and Grade 12 entering the schedule in the 2024–2025 school year.

The consolidated program includes:
- overall curriculum
- subject/activity programs for primary
- lower secondary
- upper secondary

### V3 consequence

Curriculum ingestion must use:
- program version
- subject program
- grade
- learning outcome
- exact source reference

Do not derive all learning outcomes from textbook table of contents.

---

# 3. Upper Secondary Current Subject Structure

## Sources

Official MOET / Government reporting on Circular 13/2022:
- https://www.moet.gov.vn/tintuc/Pages/CT-GDPT-Tong-The.aspx?ItemID=8013
- https://baochinhphu.vn/bo-gddt-sua-doi-bo-sung-chuong-trinh-giao-duc-pho-thong-dac-biet-nhan-manh-mon-lich-su-102220803182224737.htm

### Verified facts

At upper-secondary level, History was made mandatory.

Mandatory subjects/activities include:
- Literature
- Mathematics
- Foreign Language 1
- History
- Physical Education
- National Defense and Security Education
- Experiential/Career Guidance Activities
- Local Education Content

Nine elective subjects are:
- Geography
- Economic and Legal Education
- Physics
- Chemistry
- Biology
- Technology
- Informatics
- Music
- Fine Arts

Students select 4 of the 9 elective subjects.

### V3 consequence

A Grade 10–12 student profile must not assume every student studies the same set of elective subjects.

Required data structure:

```text
mandatory_subjects
selected_subjects[]
selected_specialized_topics[]
```

---

# 4. Preschool — Current 2026 Status

## Sources

MOET draft/project documentation:
- https://moet.gov.vn/content/vanban/Lists/VBDT/Attachments/1684/5-dt-de-an-ctgdmn-91.pdf

Government 2026 school-year direction:
- https://www2.en.baochinhphu.vn/cac-nhiem-vu-trong-tam-nam-hoc-2026-2027-102260805161858624.htm
- https://cms.baochinhphu.vn/chi-dao-dieu-hanh-cua-chinh-phu-thu-tuong-chinh-phu-ngay-5-8-2026-102260805193538495.htm

Existing preschool program historical/current-national baseline documentation:
- Program originally issued under Circular 17/2009 and amended in 2016 and 2020.
- MOET evaluation source:
  https://moet.gov.vn/content/vanban/Lists/VBDT/Attachments/1642/4bao-cao-thuc-hien-ctgdmn.pdf

### Verified facts

As of the 2026–2027 school year, Vietnam is implementing a pilot of a new preschool education program.

The existing national preschool program originated in 2009 and was amended in 2016 and 2020.

### Important uncertainty

Do NOT assume the pilot program is already the single nationwide production curriculum.

### V3 consequence

Every preschool curriculum node requires:

```text
curriculum_status:
  CURRENT_NATIONAL | PILOT | HISTORICAL | DRAFT

source_effective_from
source_effective_to
pilot_scope (if known)
```

The product must allow a parent/school context to choose the applicable curriculum source if pilot scope matters.

---

# 5. Formative / Diagnostic Assessment Evidence

## IES source

Formative assessment review:
- https://ies.ed.gov/use-work/resource-library/report/descriptive-study/formative-assessment-and-elementary-school-student-academic-achievement-review-evidence

### Verified research conclusion

Formative assessment is a process of gathering, interpreting, and using evidence about what/how students are learning to adjust instruction.

The review found positive academic effects overall across rigorous studies, with meaningful support for using evidence to modify instruction.

### V3 consequence

Assessment output should produce:

```text
what evidence says now
→ what needs further evidence
→ what to teach/practice next
→ re-check
```

Not merely a score.

---

# 6. Feedback

## EEF sources

Feedback Toolkit:
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback

Guidance:
- https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback

### Verified conclusion

Feedback is useful when it helps the learner understand:
- current state
- success criteria
- specific next steps

### V3 consequence

Every gap result should have an actionable next step, not just an error label.

---

# 7. Metacognition and Self-Regulation

## EEF sources

- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation
- https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition

### Verified conclusion

Teaching learners to plan, monitor, and evaluate learning is supported by a substantial evidence base.

EEF emphasizes applying metacognitive strategies to actual curriculum content rather than teaching generic “thinking skills” in isolation.

### V3 consequence

The remediation workflow should include:
- plan
- explain strategy
- practice
- self-check
- re-test
- reflect

Metacognition belongs inside subject learning.

---

# 8. Retrieval / Practice

## IES What Works Clearinghouse

- https://ies.ed.gov/ncee/wwc/practiceguide/1

### Verified guidance

Evidence-backed recommendations include:
- spacing learning
- worked examples mixed with problem solving
- active quizzing/retrieval
- helping students identify what they know and what needs further study
- deep explanatory questions

### V3 consequence

Learning packs should support:
- worked examples
- guided practice
- retrieval
- delayed re-test
- deeper “why/how” questions

The platform should not equate re-reading with mastery.

---

# 9. AI Competency

## UNESCO AI Competency Framework for Students

- https://www.unesco.org/en/articles/ai-competency-framework-students

### Verified facts

UNESCO describes 12 student competencies across four dimensions:
- human-centred mindset
- ethics of AI
- AI techniques and applications
- AI system design

Progression levels:
- Understand
- Apply
- Create

### V3 consequence

AI literacy can become curriculum/enrichment nodes, but should not be represented as “frequency of ChatGPT use”.

The framework informs AI-learning content; it does not override Vietnam's official curriculum.

---

# 10. Child-centered AI

## UNICEF Guidance on AI and Children, Version 3.0 (2025)

- https://www.unicef.org/innocenti/reports/policy-guidance-ai-children

### Verified principles

UNICEF emphasizes:
- safety
- privacy/data protection
- fairness
- transparency/accountability
- best interests and development
- inclusion
- skills for an AI future

### V3 consequence

For minors:
- minimize PII
- parent/teacher oversight for young learners
- no manipulative AI
- no high-stakes automated conclusions
- explain why a recommendation is made

---

# 11. Gemini Notebook — Current Product Status

## Rename

Google announced on 2026-07-16:
- NotebookLM is now **Gemini Notebook**
- same standalone research-focused product

Source:
- https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/

## Source-grounded behavior

Google Help:
- https://support.google.com/gemininotebook/answer/16164461

Gemini Notebook can:
- ingest PDFs
- websites
- YouTube
- audio
- Google Docs
- Google Slides
- use source-grounded chat with citations
- create study-oriented outputs

Important nuance:
- Gemini Notebook standalone grounds answers in notebook sources.
- In Gemini Apps / AI Mode, notebook context may be combined with additional tools/web behavior.

Source:
- https://support.google.com/gemininotebook/answer/17513891

### V3 consequence

For strict remediation based only on approved sources, prefer the standalone Gemini Notebook context.

---

# 12. Gemini Notebook — Younger Users

Google announcement:
- https://blog.google/feed/notebooklm-is-now-available-to-younger-users/

Verified:
- consumer access for users 13+ or applicable minimum age in their country (subject to Google's terms)
- stricter policies for under-18 users
- Workspace for Education can provide Notebook as a core service for all ages under education terms

Current Help Center also conditions availability on applicable age/account eligibility.

### V3 consequence

The product must not promise independent Gemini Notebook access to every preschool–Grade 12 learner.

Default:

```text
young learner
→ parent/teacher guided Notebook use
```

Older eligible learner:

```text
guided use
→ optional independent use
```

No exact Vietnam consumer age assumption should be hard-coded without legal/account-policy verification.

---

# 13. Gemini Notebook Enterprise API

Google Cloud docs:
- https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks
- https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks-sources

Current state:
- Preview / Pre-GA
- supports programmatic notebook/source management
- requires enterprise setup/licensing

### V3 consequence

Do NOT make core remediation depend on Enterprise API.

MVP integration:

```text
Platform generates Learning Pack
→ parent/student imports/opens sources in Gemini Notebook
```

Future adapter:

```text
NotebookProvider
  ├── ManualGeminiNotebookAdapter
  └── GeminiNotebookEnterpriseAdapter (optional/preview)
```

---

# 14. OECD / PISA Use

OECD PISA:
- https://www.oecd.org/en/publications/pisa-2022-assessment-and-analytical-framework_dfe0bf9c-en.html
- creative thinking:
  https://www.oecd.org/en/topics/sub-issues/creative-thinking/pisa-2022-creative-thinking.html

Useful principle:
PISA distinguishes reproducing knowledge from applying knowledge in unfamiliar contexts.

### V3 consequence

Diagnostic item banks should eventually include:
- recall/recognition
- understanding
- application
- transfer

But PISA is mainly designed for 15-year-old assessment and cannot be directly copied as a preschool–Grade 12 instrument.

---

# 15. Evidence Gaps / NOT YET KNOWN

The following are explicitly NOT established yet:

- a complete machine-readable MOET curriculum graph
- validated prerequisite graph across all subjects/grades
- calibrated item difficulty
- normative student percentiles
- validated mastery thresholds
- a validated universal preschool–Grade 12 diagnostic algorithm
- proof that Gemini Notebook remediation improves outcomes in this product
- validated career recommendations from V0.1
- complete current list of pilot preschool sites

These remain:

```text
TBD / REQUIRES SOURCE OR PILOT DATA
```

Do not allow an AI coding agent to “fill them in”.
