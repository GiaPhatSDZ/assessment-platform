# AI School — Vietnam Curriculum Catalog V1
## Mẫu giáo 3–6 → Lớp 12

**Status:** Structural catalog authority
**Important:** This catalog defines the folder/subject structure. It does NOT mean all content is already populated.

---

# 1. Repository Folder Standard

```text
curriculum/
└── vietnam/
    ├── preschool/
    │   ├── current-national/
    │   │   ├── mau-giao-3-4/
    │   │   ├── mau-giao-4-5/
    │   │   └── mau-giao-5-6/
    │   └── pilot/
    │       └── <release-id>/
    │
    ├── primary/
    │   ├── grade-1/
    │   ├── grade-2/
    │   ├── grade-3/
    │   ├── grade-4/
    │   └── grade-5/
    │
    ├── lower-secondary/
    │   ├── grade-6/
    │   ├── grade-7/
    │   ├── grade-8/
    │   └── grade-9/
    │
    └── upper-secondary/
        ├── grade-10/
        ├── grade-11/
        └── grade-12/
```

---

# 2. Preschool / Mẫu giáo

V1 product scope begins at Mẫu giáo (approximately 3–6), not nursery.

Because the new preschool curriculum is in a pilot period, keep two independent releases:

```text
current-national
pilot/<release-id>
```

Do not merge them.

For preschool, DO NOT pre-populate final developmental-domain names from model memory.
The applicable official program source must be ingested first.

Each age band folder contains after review:

```text
source-registry.json
development-outcomes.json
knowledge-or-development-nodes.json
activities/
observation-items/
parent-guides/
publication-manifest.json
```

Student experience is activity/observation based, not school-style exams.

---

# 3. Primary / Tiểu học

## Grade 1

Mandatory:
- Tiếng Việt
- Toán
- Đạo đức
- Tự nhiên và Xã hội
- Giáo dục thể chất
- Nghệ thuật (Âm nhạc, Mĩ thuật)
- Hoạt động trải nghiệm

Optional:
- Tiếng dân tộc thiểu số
- Ngoại ngữ 1

## Grade 2

Same structural catalog as Grade 1.

## Grade 3

Mandatory:
- Tiếng Việt
- Toán
- Ngoại ngữ 1
- Đạo đức
- Tự nhiên và Xã hội
- Tin học và Công nghệ
- Giáo dục thể chất
- Nghệ thuật (Âm nhạc, Mĩ thuật)
- Hoạt động trải nghiệm

Optional:
- Tiếng dân tộc thiểu số

## Grade 4

Mandatory:
- Tiếng Việt
- Toán
- Ngoại ngữ 1
- Đạo đức
- Lịch sử và Địa lí
- Khoa học
- Tin học và Công nghệ
- Giáo dục thể chất
- Nghệ thuật (Âm nhạc, Mĩ thuật)
- Hoạt động trải nghiệm

Optional:
- Tiếng dân tộc thiểu số

## Grade 5

Same structural catalog as Grade 4.

---

# 4. Lower Secondary / THCS — Grades 6–9

Mandatory for the stage:
- Ngữ văn
- Toán
- Ngoại ngữ 1
- Giáo dục công dân
- Lịch sử và Địa lí
- Khoa học tự nhiên
- Công nghệ
- Tin học
- Giáo dục thể chất
- Nghệ thuật (Âm nhạc, Mĩ thuật)
- Hoạt động trải nghiệm, hướng nghiệp
- Nội dung giáo dục của địa phương

Optional:
- Tiếng dân tộc thiểu số
- Ngoại ngữ 2

Each Grade 6–9 folder has the same top-level subject registry but content/outcomes remain grade-versioned.

---

# 5. Upper Secondary / THPT — Grades 10–12

## Mandatory
- Ngữ văn
- Toán
- Ngoại ngữ 1
- Lịch sử
- Giáo dục thể chất
- Giáo dục quốc phòng và an ninh
- Hoạt động trải nghiệm, hướng nghiệp
- Nội dung giáo dục của địa phương

## Elective — student selects 4 of 9
- Địa lí
- Giáo dục kinh tế và pháp luật
- Vật lí
- Hóa học
- Sinh học
- Công nghệ
- Tin học
- Âm nhạc
- Mĩ thuật

## Optional
- Tiếng dân tộc thiểu số
- Ngoại ngữ 2

## Specialized learning topics
The curriculum also defines specialized topic clusters for relevant subjects.
A student profile must store actual selections rather than assuming one universal Grade 10–12 program.

---

# 6. Subject Folder Standard

Example:

```text
grade-6/
└── math/
    ├── source-registry.json
    ├── learning-outcomes.json
    ├── knowledge-nodes.json
    ├── prerequisite-edges.json
    ├── lessons/
    ├── examples/
    ├── question-bank/
    ├── explanations/
    ├── parent-guides/
    └── publication-manifest.json
```

Folder existence does not mean published coverage.

---

# 7. Coverage Registry

Every stage/grade/subject must have machine-readable coverage:

```json
{
  "grade": 6,
  "subject_id": "math",
  "source_status": "SOURCE_INGESTED",
  "outcomes_total": 0,
  "outcomes_reviewed": 0,
  "nodes_total": 0,
  "nodes_reviewed": 0,
  "questions_reviewed": 0,
  "lessons_published": 0,
  "diagnostic_ready": false
}
```

No fake percentage when denominator/content coverage is unknown.

---

# 8. UI Rule

If a folder exists but content is not ready:

```text
Đang xây dựng từ nguồn chương trình chính thức
```

Do not show an empty AI-generated test.
