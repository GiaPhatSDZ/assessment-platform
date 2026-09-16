-- Assessment Platform Production Schema v1.1
-- Compliant with PostgreSQL / Supabase RLS

-- 1. Assessments metadata
CREATE TABLE IF NOT EXISTS public.assessments (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'vi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Assessment Versions (Immutable definitions)
CREATE TABLE IF NOT EXISTS public.assessment_versions (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  definition JSONB NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_id, version)
);

CREATE INDEX IF NOT EXISTS idx_assessment_versions_lookup ON public.assessment_versions(assessment_id, version);

-- 3. Referral Sources
CREATE TABLE IF NOT EXISTS public.referral_sources (
  code TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Profiles (Auth user linkage)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Assessment Sessions (Anonymous + Authenticated support)
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id TEXT PRIMARY KEY,
  assessment_version_id TEXT NOT NULL REFERENCES public.assessment_versions(id) ON DELETE RESTRICT,
  visitor_owner_hash TEXT NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  referral_code TEXT REFERENCES public.referral_sources(code) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_visitor ON public.assessment_sessions(visitor_owner_hash);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user ON public.assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON public.assessment_sessions(status);

-- 6. Assessment Answers
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_session ON public.assessment_answers(session_id);

-- 7. Assessment Results (Deterministic calculations only - AI prose strictly excluded)
CREATE TABLE IF NOT EXISTS public.assessment_results (
  session_id TEXT PRIMARY KEY REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL,
  assessment_version INTEGER NOT NULL,
  completeness NUMERIC(5, 4) NOT NULL DEFAULT 1.0,
  dimensions JSONB NOT NULL,
  scoring_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Leads (Delayed contact capture for full reports)
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  consent_processing_at TIMESTAMPTZ NOT NULL,
  consent_marketing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 9. Generated Reports (AI Structured Output)
CREATE TABLE IF NOT EXISTS public.generated_reports (
  session_id TEXT PRIMARY KEY REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT,
  prompt_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  report_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Product Events (Minimal first-party funnel metrics)
CREATE TABLE IF NOT EXISTS public.product_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  session_id TEXT REFERENCES public.assessment_sessions(id) ON DELETE SET NULL,
  referral_code TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_events_name ON public.product_events(event_name);
CREATE INDEX IF NOT EXISTS idx_product_events_created_at ON public.product_events(created_at);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

-- Public read policies for published assessments
CREATE POLICY "Public read published assessments" ON public.assessments
  FOR SELECT USING (true);

CREATE POLICY "Public read published assessment versions" ON public.assessment_versions
  FOR SELECT USING (status = 'published');

-- Server-side / Service role owns full read/write for assessment operations
-- In production, the Next.js backend uses server clients with ownership verification
