# AI School V3 — Gemini Notebook Remediation Protocol

**Current product name:** Gemini Notebook (formerly NotebookLM)  
**Role:** Source-grounded remediation assistant  
**Authority level:** Learning support only, not mastery authority

---

# 1. Boundary

Gemini Notebook may help a learner understand a confirmed/suspected knowledge gap.

It does NOT decide:
- curriculum truth
- diagnostic correctness
- mastery status
- educational placement
- career outcome

Canonical boundary:

```text
OUR PLATFORM
  detects evidence-backed gap
        ↓
Learning Pack
        ↓
GEMINI NOTEBOOK
  helps explain/practice
        ↓
OUR PLATFORM
  performs re-test
```

---

# 2. Why Gemini Notebook Fits

Current Google documentation describes Gemini Notebook as a source-grounded research assistant that can:
- ingest PDF
- web pages
- YouTube
- audio
- Google Docs
- Google Slides
- produce study guides and other learning outputs
- provide citations linked to sources

This is useful because remediation can be constrained to trusted learning materials.

---

# 3. Source-grounding Rule

For strict curriculum remediation:

Prefer:

```text
Standalone Gemini Notebook
```

with approved sources.

Do not assume the Gemini app or Search AI Mode has identical source isolation; current Google help distinguishes source grounding behavior across products.

The remediation instruction should say:

```text
Answer only from the provided learning sources.
If the sources do not contain enough information, say so.
Do not invent curriculum requirements.
```

Even then, AI output remains fallible.

---

# 4. Learner Age Rule

The platform spans preschool–Grade 12.

Do not assume every learner can independently access Gemini Notebook.

### Young learner

```text
Parent/teacher operates Notebook
→ explains/uses activity with child
```

### Older eligible learner

```text
Parent/teacher setup
→ guided independent study
→ re-test in our platform
```

Account/service eligibility is governed by Google and may vary by age/account/country/education tenancy.

The product must not hard-code a universal consumer eligibility age as legal truth.

---

# 5. Learning Pack

Our platform produces a pack.

```ts
interface LearningPack {
  id: string;
  studentId: string;
  gapId: string;
  targetNodeId: string;
  prerequisitePath: string[];
  curriculumSourceRefs: SourceReference[];
  learningResourceRefs: LearningResourceReference[];
  objective: string;
  parentGuide: string;
  learnerGuide: string;
  workedExamplePlan: string[];
  practicePlan: string[];
  reTestCriteria: string[];
  generatedAt: string;
  version: string;
}
```

Do not include unnecessary PII.

---

# 6. Suggested Notebook Structure

One notebook should be scoped tightly enough to remain useful.

Example:

```text
Notebook:
“Math — Current Gap — Equivalent Fractions”

Sources:
1. official curriculum excerpt/reference
2. approved textbook/resource section
3. teacher explanation
4. worked examples
5. student's anonymized error examples (optional)
```

Avoid dumping an entire K-12 corpus into one remediation notebook.

---

# 7. Parent Prompt Template

```text
Bạn là trợ lý học tập dựa trên các nguồn trong notebook này.

Mục tiêu:
Giúp học sinh hiểu [LEARNING_OBJECTIVE].

Quy tắc:
- Chỉ dựa trên nguồn được cung cấp.
- Nếu nguồn không đủ, nói rõ.
- Không tự tạo yêu cầu chương trình học mới.
- Không đưa đáp án ngay khi có thể hướng dẫn từng bước.
- Hỏi một câu ngắn để kiểm tra hiểu biết trước khi chuyển bước.
- Dùng ngôn ngữ phù hợp với học sinh [GRADE/AGE CONTEXT].
- Khi học sinh sai, giải thích nguyên nhân và cho một ví dụ tương tự.
- Không kết luận IQ, khả năng cố định hay nghề nghiệp.
- Kết thúc bằng 3–5 câu luyện tập, nhưng điểm mastery chính thức do hệ thống bên ngoài kiểm tra lại.
```

The exact prompt is versioned.

---

# 8. Remediation Sequence

Recommended:

```text
1. Activate prior knowledge
2. Explain one concept
3. Worked example
4. Guided practice
5. Learner explains back
6. Retrieval quiz
7. Short break/delay where practical
8. Re-test in our platform
```

Do not produce a giant lecture.

---

# 9. Parent Responsibilities by Age

## Preschool / early primary

Parent/teacher:
- controls sources
- asks/reads prompts
- turns learning into physical/play activity
- avoids long AI chat

## Primary

Parent:
- supervises
- lets child explain answers
- prevents answer-copying

## Lower secondary

Parent:
- sets source notebook
- monitors plan
- gradually transfers responsibility

## Upper secondary

Student can increasingly:
- manage sources
- ask questions
- create study guides
- self-check

But platform re-test remains separate.

---

# 10. AI Output Is Not Evidence

The following does NOT update mastery:

```text
“Gemini says the learner understands.”
```

Only diagnostic/re-test evidence updates mastery.

Chat transcript may be stored as optional learning history but cannot act as score authority in V3.

---

# 11. Hallucination Handling

If Gemini Notebook response conflicts with:
- curriculum source
- answer key
- trusted resource

the source/controlled assessment wins.

UI should teach:

```text
“AI có thể sai. Hãy kiểm tra trích dẫn và nguồn.”
```

---

# 12. MVP Integration

Do NOT depend on Enterprise API.

MVP:

```text
Gap
→ Generate Learning Pack page/file
→ provide source list/downloads/links
→ parent creates or opens Gemini Notebook
→ uses provided prompt
→ returns to platform
→ Re-test
```

Track:

```text
remediation_started
retest_started
retest_completed
```

Do not require tracking private Notebook conversations.

---

# 13. Future Provider Adapter

```ts
interface RemediationNotebookProvider {
  createNotebook?(...): Promise<...>;
  addSource?(...): Promise<...>;
  createLaunchInstructions(...): Promise<...>;
}
```

Implement first:

```text
ManualGeminiNotebookProvider
```

Future optional:

```text
GeminiNotebookEnterpriseProvider
```

Enterprise API is currently Preview/Pre-GA, so core architecture must tolerate removal/change.

---

# 14. Data Privacy

Never automatically send:
- full child identity
- parent email
- address
- school name
- sensitive profile data

Prefer:
- grade/band
- knowledge-node ID
- learning objective
- anonymized error pattern

Source upload permissions must be respected.

---

# 15. Remediation Success

Success is not:

```text
Notebook session completed
```

Success is:

```text
Re-test provides stronger evidence of learning
```

This distinction is mandatory.
