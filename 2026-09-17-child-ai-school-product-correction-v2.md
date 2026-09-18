# Assessment Platform — Product Correction Specification V2
## Parent → Child → AI School

> [!NOTE]
> **HISTORICAL BASELINE**  
> **SUPERSEDED FOR CURRENT PUBLIC PRODUCT DIRECTION**  
> **RETAINED AS REUSABLE PLATFORM-CORE REFERENCE**  
> *This specification reflects the transitional V2 product correction. The current authoritative product specification and architecture is defined in [docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md](docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md).*

**Status:** Historical Baseline (Superseded by AI School Current Authority)  
**Date:** 2026-09-17  
**Repository:** `GiaPhatSDZ/assessment-platform`  
**Audited baseline:** `main@600db58d9a81301634b4ba32a35263db30b08cfc`  
**Correction type:** Product-domain correction; preserve reusable core architecture  
**Public product direction:** Parent-facing child future-skills / AI-readiness assessment  
**Primary respondent:** Parent or legal guardian  
**Assessment subject:** Child  
**Initial content target:** Vietnamese school-age children, with V2 questions written most naturally for approximately grades 3–9  
**Core rule:** Do not rebuild working infrastructure merely because the public product domain changes.

---

# 0. Why This Correction Exists

The current V1 implementation is technically coherent but product-domain incorrect.

It currently frames the experience as:
- adult self-assessment
- career readiness
- workplace problem solving
- personal AI literacy
- professional development

The intended product is:

```text
Parent
  ↓
observes and answers about child
  ↓
Child profile
  ↓
4 future-skill / AI-era dimensions
  ↓
Parent-friendly result
  ↓
Practical development actions
  ↓
Optional full AI-assisted parent report
  ↓
Optional AI School learning path / consultation CTA
  ↓
Reassessment over time
```

This correction MUST preserve good V1 engineering while replacing the incorrect public domain.

---

# 1. Product Truth

## 1.1 Primary user

The primary user is a **parent or legal guardian**.

The parent:
- opens the website
- creates/uses a child profile
- answers observational questions about the child
- receives the result
- optionally provides the parent's own email
- owns the account/dashboard
- manages one or more child profiles

The child is NOT the account holder in V2.

## 1.2 Assessment subject

The assessment subject is a child.

The platform must distinguish:

```text
respondent = parent/guardian
subject = child
account owner = parent/guardian
```

Never collapse these three concepts into one generic `participant` when doing so changes meaning.

## 1.3 Product purpose

Help parents understand **observable development signals** across four capabilities relevant to learning and growing up in an AI-rich world.

The product does NOT:
- measure IQ
- diagnose a child
- rank a child against peers
- claim psychological/educational clinical validity
- predict future success
- claim that a 0–100 score is a percentile
- claim that the first 10-question instrument is psychometrically validated

## 1.4 Business/product loop

```text
Landing for parents
→ minimal child context
→ parent-observed assessment
→ immediate 4-pillar map
→ explanation for parent
→ optional full report
→ home activities / 30-day plan
→ optional AI School next step
→ saved child profile
→ reassessment later
```

---

# 2. What Must Be Preserved

The following V1 architecture is valuable and should be retained unless a concrete bug requires a targeted fix:

- Next.js application architecture
- TypeScript strictness
- deterministic scoring engine
- Zod validation
- score normalization
- assessment versioning
- published-version immutability principle
- anonymous-session ownership security
- Supabase/PostgreSQL architecture
- assessment repositories
- referral attribution infrastructure
- first-party analytics abstraction
- optional PostHog adapter
- AI provider abstraction
- structured AI output validation
- magic-link authentication
- admin authorization
- CI
- security hardening
- accessibility infrastructure
- OSS docs/governance
- Vercel readiness

The correction must be a **domain migration**, not a reckless rewrite.

---

# 3. What Must Change

The following are incorrect for the desired product and must change:

- public positioning
- hero/landing copy
- dark enterprise/career visual framing
- adult/career assessment definition
- adult/workplace questions
- dimension public labels
- result language
- AI report prompt
- dashboard language and information architecture
- contact/lead semantics
- data model around assessment subject
- privacy treatment because the product now handles information about children
- future-learning CTA semantics
- FAQ
- metadata/SEO
- sample report visual
- tests that encode adult/career wording

---

# 4. Public Brand Positioning

## 4.1 Working product label

The public brand name MUST remain centralized/configurable.

Until the owner chooses the final brand, use a replaceable working label such as:

```text
AI School
```

or a neutral configured site name.

Do not hard-code `Assessment Studio` throughout public UI.

The GitHub/repository can remain `assessment-platform`.

## 4.2 Category

Public category:

```text
Bản đồ năng lực tương lai dành cho trẻ trong kỷ nguyên AI
```

This is not an adult career-assessment SaaS on the public surface.

## 4.3 Core message

Recommended canonical hero direction:

### Badge

```text
Dành cho phụ huynh • Khoảng 3–5 phút
```

### H1

```text
Hiểu con hôm nay.
Chuẩn bị cho con một tương lai cùng AI.
```

Alternative approved direction:

```text
Con không chỉ cần biết dùng AI.
Con cần biết tư duy, sáng tạo và làm chủ AI.
```

Do not copy MindX wording verbatim.

### Supporting copy

```text
10 tình huống quan sát ngắn giúp phụ huynh nhìn rõ 4 nhóm năng lực quan trọng của con:
tư duy, giải quyết vấn đề & sáng tạo, công nghệ & AI, tự học & thích nghi.
```

### Primary CTA

```text
Bắt đầu đánh giá cho con
```

### Secondary CTA

```text
Xem 4 trụ năng lực
```

### Trust line

```text
Không cần đăng nhập trước • Không chấm IQ • Không chẩn đoán tâm lý
```

Remove claims such as:
- “Chuẩn xác 100%”
- “bảo mật tuyệt đối”
- “chuẩn khoa học” unless evidence exists.

---

# 5. Public UX Tone

The experience should feel:

- warm
- educational
- modern
- parent-trustworthy
- optimistic
- serious enough for parents
- friendly without becoming cartoonish
- AI-aware without looking like a dark enterprise AI dashboard

Avoid:
- generic dark navy AI hero
- neon AI aesthetic
- “career performance” language
- corporate workplace terminology
- fake science
- fear-based parenting
- shame
- comparison against other children
- overuse of “điểm yếu”
- aggressive conversion

Use UI UX Pro Max again with a corrected product query.

Canonical design intent:

```text
Vietnamese parent-facing child education / AI school assessment.
Warm-light interface, trustworthy, modern, family-friendly, not childish.
Strong data visualization but gentle language.
Mobile-first.
Parent is respondent; child is assessment subject.
No generic enterprise SaaS aesthetic.
No dark AI hero.
No fake scientific claims.
```

Update:

```text
docs/design/DESIGN_SYSTEM.md
docs/evidence/UI_UX_AUDIT.md
```

---

# 6. Child Profile Domain

## 6.1 Required conceptual entity

Introduce:

```ts
interface ChildProfile {
  id: string;
  parentUserId?: string | null;
  anonymousOwnerId?: string | null;
  nickname?: string | null;
  grade?: number | null;
  createdAt: string;
  updatedAt: string;
}
```

Exact storage naming may differ.

## 6.2 Data minimization

V2 should NOT collect:
- child's email
- child's phone
- exact date of birth
- school name
- school address
- home address
- government ID
- social account
- precise location

Default data:
- optional nickname/display name
- grade or grade band
- parent/guardian attestation/consent

Prefer a nickname.

UI helper text:

```text
Bạn có thể dùng tên gọi ở nhà của con. Không cần nhập họ tên đầy đủ.
```

## 6.3 Grade

Use grade rather than exact DOB.

Initial valid range may be:

```text
1..12
```

The V2 questionnaire is primarily authored for grades 3–9.

If grade falls outside the primary authored range:
- do not refuse the user
- show a note that the current question set is most suitable for the stated primary range
- do not pretend the instrument is normed for every age

Future content versions can be age/grade-specific.

## 6.4 Multiple children

Architecture should support one parent having multiple child profiles.

V2 UI does not need an elaborate family-management system, but schema must not assume exactly one child per parent forever.

---

# 7. Revised User Flow

## 7.1 Landing

```text
/
```

Primary CTA:

```text
Bắt đầu đánh giá cho con
```

## 7.2 Child context step

Before Q1, collect minimal subject context:

```text
Tên gọi của con (optional)
Con đang học lớp mấy? (required or strongly recommended)
[x] Tôi là phụ huynh/người giám hộ và đang trả lời dựa trên quan sát của mình.
```

Do NOT ask parent email here.

## 7.3 Observation framing

Before questions:

```text
Hãy trả lời dựa trên những gì bạn thực sự quan sát ở con trong khoảng 4–8 tuần gần đây.
Không có câu trả lời “đẹp” hay “xấu”.
```

## 7.4 Assessment

Parent answers 10 child-observation questions.

## 7.5 Result

Immediate, no email required.

Show:

```text
Bản đồ 4 trụ của con
```

not:

```text
Điểm năng lực nghề nghiệp của bạn
```

## 7.6 Full report

After parent sees meaningful result:

```text
Nhận báo cáo chi tiết & kế hoạch 30 ngày cho con
```

Collect:
- parent's display name
- parent's email
- processing consent
- optional marketing consent

Never imply that the email belongs to the child.

## 7.7 Dashboard

Parent-facing dashboard:

```text
Hồ sơ của con
```

or:

```text
Gia đình của tôi
```

Each child card may show:
- nickname
- grade
- latest assessment date
- 4-pillar summary
- report link
- reassessment CTA

---

# 8. Four Pillars V2

Use these public dimensions.

## 8.1 `thinking_analysis`

Vietnamese:

```text
Tư duy & Phân tích
```

Meaning:
- asks why/how
- looks for reasons
- distinguishes information
- compares evidence
- recognizes patterns

Do not equate with IQ.

## 8.2 `problem_solving_creativity`

Vietnamese:

```text
Giải quyết vấn đề & Sáng tạo
```

Meaning:
- tries alternatives
- breaks problems down
- generates more than one solution
- learns from failed attempts
- combines ideas

## 8.3 `technology_ai`

Vietnamese:

```text
Công nghệ & AI
```

Meaning:
- purposeful technology use
- basic AI interaction
- healthy skepticism toward AI output
- information verification
- digital/privacy awareness

This dimension is not “how often the child uses ChatGPT.”

## 8.4 `self_learning_adaptability`

Vietnamese:

```text
Tự học & Thích nghi
```

Meaning:
- seeks learning resources
- persists
- changes strategy
- accepts feedback
- adapts to new tools/tasks

---

# 9. V2 Result Language

Do not use labels that sound like fixed intelligence rankings.

Approved deterministic bands:

```text
0–39   Tín hiệu hiện tại chưa rõ
40–59  Đang hình thành
60–79  Đang phát triển rõ
80–100 Thể hiện nổi bật trong quan sát hiện tại
```

Every result page must explain:

```text
Chỉ số phản ánh các hành vi phụ huynh quan sát ở thời điểm hiện tại.
Đây không phải điểm IQ, không phải xếp hạng so với trẻ khác và không phải chẩn đoán.
```

Do not use:
- “yếu”
- “kém”
- “tụt hậu”
- “không có năng lực”
- “không phù hợp”
- “thiếu thông minh”

as deterministic labels.

---

# 10. Canonical V2 Assessment Content

## 10.1 Observation window

Use:

```text
Trong khoảng 4–8 tuần gần đây...
```

## 10.2 Shared response scale

All 10 questions should use the same five-point frequency scale unless a compelling implementation reason exists:

```text
1 — Hầu như chưa thấy
2 — Hiếm khi
3 — Thỉnh thoảng
4 — Thường xuyên
5 — Rất thường xuyên / Con khá chủ động
```

The UI may shorten labels on mobile while preserving semantics.

## 10.3 Questions

### Q1 — Thinking & Analysis

```text
Khi gặp một điều chưa hiểu, con thường hỏi “vì sao?”, “bằng cách nào?” hoặc muốn biết nguyên nhân thay vì chỉ chấp nhận câu trả lời có sẵn.
```

Scoring:

```text
thinking_analysis: 1.2
```

### Q2 — Thinking & Analysis — reverse scored

```text
Khi gặp hai thông tin khác nhau, con thường chọn ngay thông tin nghe hợp lý hơn mà ít kiểm tra hoặc hỏi thêm.
```

Scoring:

```text
thinking_analysis: 1.0, reverse=true
```

### Q3 — Problem Solving & Creativity

```text
Khi một cách làm không hiệu quả, con thường thử một cách khác thay vì bỏ cuộc ngay.
```

Scoring:

```text
problem_solving_creativity: 1.3
```

### Q4 — Problem Solving & Creativity

```text
Với một bài tập, trò chơi hoặc vấn đề thực tế, con thường nghĩ ra hơn một cách để giải quyết.
```

Scoring:

```text
problem_solving_creativity: 1.2
```

### Q5 — Problem Solving + Thinking

```text
Khi gặp một nhiệm vụ lớn hoặc khó, con có xu hướng chia nó thành các bước nhỏ hoặc xác định nên làm gì trước.
```

Scoring:

```text
problem_solving_creativity: 0.8
thinking_analysis: 0.5
```

### Q6 — Technology & AI

```text
Khi sử dụng công nghệ hoặc AI, con có thể nói rõ mình muốn công cụ giúp việc gì thay vì chỉ dùng ngẫu nhiên.
```

Scoring:

```text
technology_ai: 1.2
```

### Q7 — Technology & AI — reverse scored

```text
Khi AI hoặc Internet đưa ra một câu trả lời nghe có vẻ hợp lý, con có xu hướng tin ngay mà không kiểm tra thêm.
```

Scoring:

```text
technology_ai: 1.2, reverse=true
```

### Q8 — Technology & AI

```text
Con hiểu rằng không nên tùy tiện đưa thông tin riêng tư, mật khẩu, ảnh cá nhân hoặc thông tin của gia đình cho AI hay các website lạ.
```

Scoring:

```text
technology_ai: 1.0
```

### Q9 — Self-learning & Adaptability

```text
Khi chưa biết một điều gì, con chủ động tìm cách học thêm từ sách, video, người lớn hoặc công cụ số và cố gắng giải thích lại theo cách của mình.
```

Scoring:

```text
self_learning_adaptability: 1.2
```

### Q10 — Self-learning & Adaptability

```text
Sau khi được góp ý hoặc nhận ra mình làm sai, con có thể điều chỉnh cách làm và thử lại.
```

Scoring:

```text
self_learning_adaptability: 1.3
```

## 10.4 Interpretation limit

These questions are a V2 product instrument, not a validated standardized test.

Do not claim:
- norms
- percentiles
- causal predictions
- age-standardized interpretation

---

# 11. Assessment Versioning Migration Rule

DO NOT mutate the meaning of the existing published adult assessment in place.

Existing V1 adult assessment:
- preserve for history / legacy reference
- remove from primary public navigation
- optionally mark as legacy/archived at metadata level
- do not rewrite historical scores as if they belonged to the child instrument

Create a NEW assessment:

Recommended slug:

```text
child-ai-readiness
```

Recommended ID:

```text
asmt-child-ai-readiness-v1
```

Recommended version:

```text
1
```

Public homepage defaults to this new assessment.

Historical adult sessions remain valid as legacy records.

---

# 12. Database Migration V2

Do not rewrite the existing initial migration if it may already have been applied.

Add a new migration.

Conceptual additions:

```sql
CREATE TABLE child_profiles (...);

ALTER TABLE assessment_sessions
  ADD COLUMN child_profile_id ... NULL REFERENCES child_profiles(...);
```

Legacy sessions may have `child_profile_id = NULL`.

For new child assessment sessions, application logic must require a valid owned child profile.

Suggested child profile fields:

```text
id
visitor_owner_hash
parent_user_id nullable
nickname nullable
grade nullable
parent_guardian_attested_at
created_at
updated_at
```

Indexes:
- anonymous owner
- parent user
- parent user + child profile lookup

Ownership:
- anonymous owner can access only their child profile
- authenticated parent can access only associated profiles
- claim/association requires current anonymous ownership
- matching email alone never transfers a child profile

Do not expose child profiles through an unrestricted browser table policy.

---

# 13. Parent / Child Privacy Rules

Because the product now stores information about children, V2 must be more conservative than the adult V1.

## 13.1 Never send to analytics

Do not send to PostHog/third-party analytics:
- child nickname
- grade if not needed
- answer text
- individual answer selections
- report prose
- parent email

Use event IDs/statuses only.

## 13.2 AI provider input

Do not send:
- parent email
- parent identity
- child full legal name
- school
- location

AI may receive:
- grade or broad grade context when useful
- deterministic dimension scores
- non-identifying behavioral evidence summaries
- assessment version
- disclaimer

Prefer referring to subject as:

```text
“con”
```

rather than sending a name.

## 13.3 Public indexing

Noindex:
- child result pages
- AI reports
- dashboards
- child profile pages
- admin pages

## 13.4 Legal language

Do not claim compliance with COPPA, GDPR-K, Vietnamese child-data law, or any certification unless reviewed and actually implemented.

Privacy page should say what the product currently does, not make legal-marketing claims.

---

# 14. Landing Page V2 Structure

Recommended sequence:

## Section 1 — Hero

Parent problem + value + sample child radar.

The radar/sample report must be clearly labeled:

```text
Minh họa
```

Do not present fabricated child data as a real case.

## Section 2 — Why this matters

Message:

```text
AI đang thay đổi cách trẻ học và giải quyết vấn đề.
Biết dùng công cụ là chưa đủ — điều quan trọng là cách con suy nghĩ khi có công cụ trong tay.
```

## Section 3 — Four pillars

Show the four child-focused dimensions.

## Section 4 — How it works

```text
1. Phụ huynh quan sát & trả lời 10 tình huống
2. Nhận bản đồ 4 trụ ngay
3. Nhận gợi ý hoạt động & lộ trình phát triển
```

## Section 5 — Sample report

Show:
- radar
- one positive signal
- one development signal
- one home activity

## Section 6 — What parent can do next

Examples:
- conversation prompt
- home challenge
- 30-day experiment

## Section 7 — Privacy

Explicit:
- no child email
- no exact DOB
- no IQ claim
- no diagnosis

## Section 8 — FAQ

Questions should include:
- Ai là người làm bài?
- Bài này có đo IQ không?
- Con tôi học lớp nào thì phù hợp?
- AI có chấm điểm con không?
- Có cần nhập email trước không?
- Dữ liệu của con được dùng thế nào?

## Final CTA

```text
Bắt đầu hiểu con rõ hơn
```

---

# 15. Assessment Runner V2

Header context should make the respondent role obvious.

Example:

```text
Bạn đang đánh giá dựa trên quan sát về: Bé Minh • Lớp 4
```

If no nickname:

```text
Con của bạn • Lớp 4
```

Progress:

```text
Câu 4/10
```

Helper:

```text
Hãy chọn phương án gần nhất với những gì bạn quan sát gần đây.
```

Do not show:
- scoring weights
- dimension mapping per question
- “correct answer”
- score manipulation hints

---

# 16. Result Page V2

Canonical title:

```text
Bản đồ 4 trụ của con
```

Subcopy:

```text
Đây là bức ảnh chụp từ những quan sát hiện tại — không phải nhãn cố định về năng lực của con.
```

For each dimension display:
- score/index
- neutral band
- 1 deterministic explanation
- “Phụ huynh có thể thử” activity

Do not compare to:
- “trẻ cùng tuổi”
- “top X%”
- national averages

unless real norm data exists later.

---

# 17. Deterministic Parent Guidance

Before AI, every dimension/band should have deterministic parent-oriented guidance.

Example structure:

```ts
{
  dimensionId,
  band,
  parentObservation,
  tryAtHome,
  conversationPrompt
}
```

This ensures useful output even with no AI key.

Example for `technology_ai` middle band:

```text
Quan sát:
Con đã có một số hành vi sử dụng công nghệ có mục đích, nhưng việc kiểm chứng thông tin có thể chưa ổn định.

Thử tại nhà:
Cùng con hỏi AI một câu theo 2–3 cách rồi so sánh câu trả lời.

Câu hỏi gợi mở:
“Điều gì khiến con tin câu trả lời này là đúng?”
```

---

# 18. AI Report V2

Do NOT overwrite the legacy adult prompt in a way that makes historical reports unreproducible.

Create a new versioned prompt, e.g.:

```text
report-child-v2.ts
CHILD_REPORT_PROMPT_VERSION = child-report-v2.0.0
```

System role:

```text
You are an educational parent-guidance assistant interpreting a parent-observed child future-skills assessment.
```

Vietnamese output.

Rules:
- score is immutable
- parent is respondent
- child is subject
- use observational language
- no diagnosis
- no fixed intelligence labels
- no peer ranking
- no fear
- no shame
- no prediction of career/success
- suggestions should be age-appropriate and low-risk
- provide practical at-home experiments
- do not advise parents to force more screen time merely to raise AI score

Recommended structured report fields:

```ts
{
  summaryForParent: string;
  observedStrengths: Insight[];
  developmentSignals: Insight[];
  homeActivities: Activity[];
  conversationPrompts: string[];
  thirtyDayPlan: ActionItem[];
  schoolNextStep?: string;
  disclaimer: string;
}
```

If backward compatibility favors keeping the generic schema, a versioned adapter may map child-specific semantics into existing storage.

Store report schema version.

---

# 19. AI School Conversion Layer

The product may eventually lead to an AI School program.

V2 rule:

The result/report may show a configured CTA:

```text
Khám phá lộ trình AI phù hợp với độ tuổi
```

or:

```text
Trao đổi về lộ trình học cho con
```

BUT:
- hide CTA if no real destination/program exists
- do not claim a specific class is “perfect for your child” based only on 10 questions
- no fake urgency
- no fake enrollment scarcity
- no deterministic course recommendation unless a real program catalog + mapping contract is later specified

Use configuration:

```text
AI_SCHOOL_CTA_ENABLED
AI_SCHOOL_CTA_URL
```

or equivalent centralized config.

---

# 20. Dashboard V2

Replace adult-centered language.

Current idea:

```text
Bảng điều khiển / lịch sử đánh giá năng lực của bạn
```

becomes:

```text
Hồ sơ của con
```

or:

```text
Hồ sơ gia đình
```

Parent dashboard hierarchy:

```text
Parent account
  ├── Child A
  │   ├── latest result
  │   └── history
  └── Child B
      ├── latest result
      └── history
```

V2 minimum:
- list child profiles
- latest child assessment
- open result/report
- reassess

If multi-child UI is too large for this correction, schema must support it and UI may initially show one-or-more simple child cards.

---

# 21. Admin V2

Admin metrics remain useful.

Add domain clarity:
- sessions by child assessment version
- completions
- report requests
- referral attribution

Do not expose child nickname in aggregate dashboard unless needed.

Session inspection should minimize child data.

---

# 22. Referral V2

Referral architecture stays.

Referral can represent:
- campaign
- school partner
- educator
- parent community
- advisor

Referral never changes:
- score
- report interpretation
- program eligibility

---

# 23. Analytics V2

Keep existing event names where possible.

Add only if needed:

```text
child_context_created
reassessment_started
school_cta_clicked
```

Never include child PII in event payloads.

---

# 24. SEO V2

Public metadata should target parent intent.

Example title:

```text
Bản đồ năng lực tương lai cho trẻ trong kỷ nguyên AI
```

Example description:

```text
Bài đánh giá ngắn dành cho phụ huynh giúp nhìn rõ 4 nhóm năng lực của con: tư duy, giải quyết vấn đề & sáng tạo, công nghệ & AI, tự học & thích nghi.
```

Do not use:
- “test IQ”
- “chẩn đoán”
- “đo chính xác trí thông minh”
- “dự đoán nghề nghiệp”

---

# 25. Testing V2

Preserve existing domain-neutral tests.

Add/replace product-domain tests.

## Required tests

### Domain
- new 4 dimension IDs validate
- reverse scoring works for Q2/Q7
- 10-question child definition validates
- published adult definition remains unchanged
- new child assessment produces deterministic result

### Child profile
- anonymous owner can create/read own profile
- other anonymous owner cannot read
- authenticated parent can claim owned profile
- matching email alone cannot claim
- no child email/phone fields exist in V2 form/domain

### Flow
- landing CTA says child/parent intent
- child context step
- 10 questions
- refresh recovery
- child result title
- full report gate occurs after result
- parent's email, not child's

### AI
- child prompt says parent is respondent
- child prompt prohibits diagnosis/ranking
- child report rejects malformed schema
- AI disabled fallback works

### Privacy
- private result noindex
- third-party analytics payload excludes child nickname/email

### Dashboard
- parent sees only owned child profiles
- child cards map correct assessments

---

# 26. E2E Acceptance V2

Primary:

```text
landing
→ Bắt đầu đánh giá cho con
→ enter nickname optional + grade
→ parent attestation
→ answer 10 questions
→ result “Bản đồ 4 trụ của con”
→ refresh
→ result survives
```

Full report:

```text
result
→ parent enters parent name/email
→ consent
→ report generated or graceful AI unavailable state
→ parent-oriented report
```

Account:

```text
parent magic link
→ dashboard
→ child profile
→ result/report
```

Privacy negative:
- one anonymous owner cannot access another child's session/result

---

# 27. UI Acceptance V2

At 375px, landing must communicate within first viewport:
- for parents
- about child
- AI-era future skills
- CTA for child

The first viewport must NOT be reasonably interpreted as:
- career assessment for adults
- employee assessment
- corporate AI-readiness SaaS

Use screenshot review at:
- 375
- 768
- 1024
- 1440

Record in:

```text
docs/evidence/PRODUCT_CORRECTION_V2_UI.md
```

---

# 28. Content Acceptance

Search the public UI for legacy phrases.

The following must not appear in the current child product surface except inside legacy docs/history:

```text
nghề nghiệp
cơ hội nghề nghiệp
môi trường làm việc
cấp trên
đồng nghiệp
thẩm định nhân sự
năng lực nghề nghiệp
```

Contextual exceptions require review.

Also search for misleading claims:

```text
chuẩn xác 100%
bảo mật tuyệt đối
khoa học
được chứng minh
```

Remove unless truly supported.

---

# 29. OSS / Versioning

Do not erase V0.1 history.

Correction release:

```text
v0.2.0
```

Changelog should explicitly state:

```text
Product correction: parent-facing child AI-era capability assessment.
Core deterministic assessment architecture retained.
Adult career reference assessment moved to legacy/non-primary status.
```

This is healthier OSS history than pretending V0.1 never existed.

---

# 30. Definition of Done — Product Correction V2

```text
[ ] Current homepage is unmistakably parent/child AI-school oriented
[ ] Public surface contains no adult-career primary positioning
[ ] New child assessment exists as new versioned assessment, not mutation of legacy history
[ ] Exactly 10 V2 child-observation questions
[ ] Parent is respondent, child is subject
[ ] Child profile is modeled separately
[ ] Child data is minimized
[ ] Child email/phone/exact DOB not requested
[ ] Results use neutral developmental language
[ ] No IQ/peer-ranking/diagnosis claims
[ ] Deterministic scorer remains authority
[ ] Server recomputation remains authority
[ ] AI report is parent-oriented and versioned
[ ] AI key remains optional
[ ] Dashboard is parent/child oriented
[ ] Referral/analytics preserved without child PII leakage
[ ] New DB migration is non-destructive
[ ] Existing V0.1 history remains reproducible
[ ] UI UX Pro Max design system re-run for child/parent context
[ ] mobile E2E passes
[ ] lint passes
[ ] typecheck passes
[ ] tests pass
[ ] E2E passes
[ ] production build passes
[ ] docs/README/privacy updated
[ ] final correction evidence exists
[ ] v0.2.0 prepared only after green verification
```

---

# 31. Authority

This document overrides the earlier V1 product-domain assumptions wherever they conflict.

It does NOT invalidate the reusable architectural principles of the previous spec.

Priority:

```text
Product Correction V2
    ↓
Existing architecture where compatible
    ↓
Migration plan V2
    ↓
Implementation details
```

When in doubt:

```text
Keep the core.
Correct the domain.
Protect the child.
Serve the parent.
Do not fake science.
```
