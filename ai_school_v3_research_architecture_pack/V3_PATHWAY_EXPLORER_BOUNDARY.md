# AI School V3 — Pathway Explorer Boundary

**Status:** Future module boundary  
**V0.1 career assessment:** NOT ACCEPTED as validated pathway guidance  
**Core V3 dependency:** Knowledge Control can ship without Pathway Explorer.

---

# 1. Why V0.1 Is Not Accepted

The V0.1 adult/career assessment uses a small self-report style item set and workplace framing.

It is insufficient to justify:
- vocational track selection
- university major recommendation
- career fit
- educational placement

Keep it as:

```text
LEGACY_EXPERIMENT
```

Do not market it as a validated assessment.

---

# 2. Future Pathway Explorer Goal

Help older learners and parents explore educational pathways using multiple evidence types.

Not:

```text
10 questions → “You should become a programmer”
```

Instead:

```text
mastery history
+ subjects actually studied
+ interests
+ preferred activities
+ projects / demonstrated skills
+ learning behaviors
+ education pathway data
→ options to explore
```

The output is an exploration set, not a verdict.

---

# 3. Age Staging

## Preschool – Grade 5

No career recommendations.

Possible:
- interests
- enjoyable activities
- learning experiences

No occupational fit score.

## Grade 6–8

Light exploration:
- subject interests
- activities
- project preferences
- exposure to broad fields

Do not prescribe postsecondary route.

## Grade 9

Transition exploration may become relevant:
- upper-secondary pathways
- vocational education options
- subject planning

Requires a separate Vietnam pathway data source.

## Grade 10–12

Fuller pathway exploration:
- current mandatory/selected subjects
- mastery evidence
- interests
- projects
- vocational/intermediate/college/university pathways

---

# 4. University Is Not the Only Output

Future model must represent:

```text
Upper-secondary continuation
Vocational education
Intermediate-level training
College
University
Other recognized learning/training routes
```

Do not rank all students toward university.

---

# 5. Evidence Inputs

Allowed future inputs:

```text
Knowledge mastery history
Subject choices
Subject assessment evidence
Interest inventory (validated/researched separately)
Projects/portfolio
Self-reported preferences
Parent/teacher context
Pathway prerequisites
```

Not enough on its own:

```text
one AI-generated personality profile
```

---

# 6. Output Language

Use:

```text
“Các hướng nên khám phá”
“Các điều kiện đầu vào cần tìm hiểu”
“Các môn/kỹ năng liên quan”
“Bằng chứng hiện có”
“Thông tin còn thiếu”
```

Avoid:

```text
“nghề phù hợp nhất”
“bạn chắc chắn nên học”
“xác suất thành công”
```

without validated evidence.

---

# 7. Separate Data Authority

Pathway data will need separate authoritative sources:
- education/training program databases
- admission/prerequisite rules
- vocational pathways
- institutions
- occupations

This is outside V3 Knowledge Control scope.

Do not scrape or invent it during core build.

---

# 8. Dependency Rule

```text
Knowledge Control
does NOT depend on
Pathway Explorer
```

Pathway Explorer may depend on Knowledge Control history later.

This keeps the primary product useful from preschool onward.
