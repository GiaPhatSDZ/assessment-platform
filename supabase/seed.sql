-- Idempotent Seed for Assessment Studio Reference Assessment V1

INSERT INTO public.assessments (id, slug, title, locale)
VALUES (
  'asmt-ai-career-readiness-v1',
  'ai-career-readiness',
  'Đánh Giá Mức Độ Sẵn Sàng Nghề Nghiệp Trong Kỷ Nguyên AI',
  'vi'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  updated_at = NOW();

INSERT INTO public.assessment_versions (
  id,
  assessment_id,
  version,
  status,
  definition,
  published_at
)
VALUES (
  'asmt-ai-career-readiness-v1_v1',
  'asmt-ai-career-readiness-v1',
  1,
  'published',
  '{"id":"asmt-ai-career-readiness-v1","slug":"ai-career-readiness","title":"Đánh Giá Mức Độ Sẵn Sàng Nghề Nghiệp Trong Kỷ Nguyên AI","locale":"vi","version":1,"status":"published","description":"Công cụ tự đánh giá 4 nhóm năng lực cốt lõi...","questions":[]}'::jsonb,
  NOW()
)
ON CONFLICT (assessment_id, version) DO NOTHING;

-- Seed initial standard referral code for demonstration
INSERT INTO public.referral_sources (code, description)
VALUES
  ('DEMO123', 'Mã giới thiệu thử nghiệm hệ thống'),
  ('DIRECT', 'Truy cập trực tiếp không qua tiếp thị')
ON CONFLICT (code) DO NOTHING;
