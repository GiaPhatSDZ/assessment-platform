# AI School V4 — Art Direction Specification
## Premium Editorial Education + Product UI

**Status:** APPROVED
**Date:** 2026-09-17

---

# 1. Brand character

AI School should feel:

```text
calm
intelligent
warm
editorial
serious about learning
friendly to families
modern but not trendy-for-trend's-sake
```

Do not feel:
- corporate HR
- exam-prep factory
- children's cartoon app
- generic AI startup
- government portal

---

# 2. Typography

Use two deliberate families.

## Display / marketing

Preferred:

```text
Lora
```

via `next/font/google`.

Use for:
- H1
- major section statements
- selected insight/result titles

Rules:
- desktop hero: clamp(52px, 6vw, 92px)
- line-height: 0.95–1.04
- letter-spacing: slightly tight
- max 2–4 lines
- avoid bold-black weight; use 500–600

## Interface / body

```text
Be Vietnam Pro
```

Use for:
- navigation
- buttons
- forms
- diagnostic questions
- supporting body copy
- source metadata
- evidence labels

Do not use serif in answer choices or dense app UI.

---

# 3. Color tokens

Use a warm, ownable palette.

```json
{
  "canvas": "#F5F1E8",
  "surface": "#FFFDF8",
  "surfaceStrong": "#FFFFFF",
  "ink": "#1D211D",
  "inkMuted": "#677069",
  "line": "#D8D5CC",
  "brand": "#245B47",
  "brandDark": "#143C2F",
  "brandSoft": "#DDEBE3",
  "accent": "#E9B44C",
  "accentSoft": "#F8EAC1",
  "danger": "#B6473A",
  "dangerSoft": "#F5DDD7",
  "info": "#315E9B",
  "infoSoft": "#DDE8F6"
}
```

These are semantic defaults, not hard-coded everywhere.

No purple as primary AI signal.

---

# 4. Surface language

Marketing:
- large edge-to-edge sections
- product windows with 18–28px radius
- almost no shadow; use subtle border + ambient background
- occasional irregular/asymmetric grouping

App:
- 12–16px radius
- 1px neutral border
- no nested shadow stacks

---

# 5. Motion

Use Motion/Framer Motion only where it teaches.

Allowed:
- knowledge path draws in
- node state transitions
- product preview subtle parallax
- section reveal
- horizontal carousel with real content
- sticky story transitions

Avoid:
- bouncing CTA
- sparkles
- floating random shapes
- endless marquees unless informative
- parallax on diagnostic/task pages

Respect `prefers-reduced-motion`.

---

# 6. Hero blueprint

Desktop minimum height:
```text
min(860px, 92vh)
```

Layout:
```text
12-column
left 5 columns = message
right 7 columns = product scene
```

H1:
```text
Tìm đúng chỗ con đang hổng.
Học lại đúng phần cần thiết.
```

Supporting:
```text
Theo chương trình học đã được kiểm duyệt, hệ thống lần theo kiến thức nền,
chỉ ra phần cần củng cố và kiểm tra lại sau khi học.
```

Primary CTA:
```text
Bắt đầu kiểm tra kiến thức
```

Secondary text link:
```text
Xem một lỗ hổng được tìm như thế nào →
```

No trust-pill above H1.

Below CTA, one quiet trust row:
```text
Theo nguồn chương trình • Không xếp hạng trẻ • Có bằng chứng cho từng kết luận
```

Right-side hero product:
- actual `KnowledgePathPreview`
- 3–5 nodes max
- one gap state
- one parent-support action
- no fake student score

Atmospheric glow:
- large, soft accent/brand gradients BEHIND product only
- opacity low
- no neon

---

# 7. Navigation

Header height:
```text
72–80px desktop
64px mobile
```

Brand left.

Center:
```text
Học tập
Chương trình
Cách hoạt động
Phụ huynh
```

Right:
```text
Đăng nhập
[Bắt đầu]
```

Header:
- transparent over top hero
- gains soft surface/backdrop after scroll
- no heavy border at page top

---

# 8. Landing story

Do not build 9 identical sections.

Use five major story acts:

## ACT 1 — Problem
Hero + product preview.

## ACT 2 — Why wrong answers happen
Sticky split-story.
Left: one statement.
Right: problem → prerequisite graph → root gap.

## ACT 3 — Curriculum depth
Large stage selector:
Mẫu giáo / Tiểu học / THCS / THPT.
Show real coverage, not fake completion.

## ACT 4 — From gap to learning
A horizontal or scroll progression:
Detect → Explain → Learn → Re-test.
Use actual product UI scenes.

## ACT 5 — Parent support
Editorial split:
left = parent problem statement
right = Parent Copilot preview grounded in reviewed content.

Final CTA:
short, large, quiet.

---

# 9. Student Focus UI

Diagnostic page:
- max width 820px
- mostly off-white background
- no full application dashboard chrome
- top progress only
- one task
- answer choices use thin lines and strong selected state
- large math
- no developer metadata

Example:

```text
Toán · Lớp 6                              2 / 6

Cộng hai phân số khác mẫu

        3       5
        ─   +   ─
        8      12

[ 19/24 ]
[ 8/20  ]
[ 2/5   ]
[ 11/24 ]

                               Tiếp tục →
```

---

# 10. Gap Insight UI

This is the product's strongest visual moment.

Structure:
- big serif conclusion headline
- knowledge path visualization
- evidence summary
- next learning action

Do not say `ROOT GAP` as developer text.

Human copy:
```text
Có dấu hiệu con cần củng cố “Quy đồng mẫu số” trước.
```

Evidence:
```text
3 câu kiểm tra
2 lỗi cùng mẫu
1 kiến thức nền chưa chắc
```

Then:
```text
Vì sao hệ thống đưa ra gợi ý này?
```

Expandable explanation.

---

# 11. Curriculum catalog

Avoid equal SaaS cards.

Desktop:
- large typographic stage rail
- content panel changes beside it

Example:

```text
Mẫu giáo
Tiểu học
THCS      ← active
THPT

             Lớp 6
             Lớp 7
             Lớp 8
             Lớp 9
```

Then subjects as editorial list rows with states, not tiles.

States:
- Đã có nội dung
- Đang kiểm duyệt
- Chưa hỗ trợ

---

# 12. Parent Copilot

Do NOT look like generic chat.

Use a contextual assistant panel:
- `Dành cho phụ huynh`
- current concept
- child mistake summary
- suggested question to ask child
- optional `Giải thích cho tôi`
- sources

AI conversation can expand after explicit parent action.

---

# 13. Mobile behavior

Mobile landing:
- headline first
- product preview directly below CTA
- no cramped side-by-side
- keep product preview horizontally scrollable only if necessary

Diagnostic:
- no sticky bottom bars covering answers
- 16–18px question body minimum
- math fits viewport
- touch targets >= 44px

---

# 14. Accessibility

- AA contrast minimum
- clear focus rings
- no motion-only meaning
- knowledge path states use icon/text + color
- math has spoken text where possible
- source links keyboard accessible
