# AI School V3 — Parent Copilot Boundary V1

**Status:** APPROVED
**Core rule:** AI helps the parent teach; AI does not become the child's source of truth.

---

# 1. Parent Copilot Entry Points

Parent can open AI from:
- lesson page
- wrong-answer review
- gap report
- learning pack
- homework-help context

Examples:

```text
Giải thích bài này cho tôi trước
Tại sao con tôi sai ở bước này?
Tôi nên gợi ý thế nào mà không nói đáp án?
Cho tôi một ví dụ đời thường
Giải đầy đủ để phụ huynh hiểu
```

---

# 2. Grounding Corpus

Parent Copilot can retrieve only:

```text
published learning outcomes
published lessons
published explanations
published parent guides
approved source excerpts/metadata
current child gap context
current reviewed question + answer rationale
```

It cannot search arbitrary unreviewed curriculum data as authority.

---

# 3. Two Parent Modes

## A. `Hướng dẫn con`

Default.

AI should:
1. explain the concept to parent
2. identify likely error using reviewed rationale
3. offer one hint
4. suggest one question parent can ask
5. avoid immediately giving final answer when possible

## B. `Giải cho phụ huynh`

Explicit parent-only action.

AI may show:
- full worked solution
- why each step is valid
- source references
- how to translate the solution into child-friendly guidance

This mode must be visually marked:

```text
Dành cho phụ huynh
```

---

# 4. No Child AI Chat

Student-facing product does not expose unrestricted generative chat.

Child receives:
- reviewed lesson
- reviewed hint
- reviewed explanation
- reviewed practice
- deterministic diagnostic feedback

This is a deliberate product policy.

---

# 5. AI Cannot Update Learning State

Parent Copilot conversation does not change:

```text
UNCERTAIN
DEVELOPING
SECURE
```

Only assessment/re-test evidence can.

---

# 6. Response Contract

Every Parent Copilot response should contain where applicable:

```text
Tóm tắt cho phụ huynh
Điểm con đang vướng
Cách gợi ý
Ví dụ
Nguồn đang dùng
```

If evidence is insufficient:

```text
Nguồn hiện có chưa đủ để trả lời chắc chắn.
```

Do not fill the gap from model memory while presenting it as curriculum truth.

---

# 7. Privacy

Do not send unnecessary:
- child full name
- parent email
- school name
- address
- phone
- precise location

Use:
- grade
- subject
- node
- anonymized answer/error
- relevant reviewed content

---

# 8. Parent Responsibility UX

The interface should communicate:

> Trợ lý giúp phụ huynh hiểu bài và cách hướng dẫn. Nội dung học chính của trẻ vẫn đến từ kho kiến thức đã được kiểm duyệt.

This sentence captures the product boundary.
