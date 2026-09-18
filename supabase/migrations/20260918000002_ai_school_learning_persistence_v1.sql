-- AI School Learning Persistence Schema V1 (Additive Migration)
-- Baseline: c7632e17ccd8c76353826bd01422be12c017d770
-- Preserves all legacy tables in 20260917000001_initial_schema.sql

-- ==============================================================================
-- 1. LEARNER PROFILES
-- Anonymous-first, privacy-by-design (zero child email, phone, exact DOB, address).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_owner_hash TEXT NOT NULL,
  nickname TEXT NULL,
  education_stage TEXT NOT NULL CHECK (education_stage IN ('PRESCHOOL', 'PRIMARY', 'LOWER_SECONDARY', 'UPPER_SECONDARY')),
  grade_level SMALLINT NULL,
  age_band TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_learner_stage_consistency CHECK (
    (education_stage = 'PRESCHOOL' AND grade_level IS NULL AND age_band IN ('3-4', '4-5', '5-6')) OR
    (education_stage = 'PRIMARY' AND grade_level BETWEEN 1 AND 5 AND age_band IS NULL) OR
    (education_stage = 'LOWER_SECONDARY' AND grade_level BETWEEN 6 AND 9 AND age_band IS NULL) OR
    (education_stage = 'UPPER_SECONDARY' AND grade_level BETWEEN 10 AND 12 AND age_band IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_learner_profiles_visitor_owner_hash ON public.learner_profiles(visitor_owner_hash);

-- ==============================================================================
-- 2. GUARDIAN LEARNER RELATIONSHIPS
-- Additive authenticated guardian linkage to anonymous/visitor-created learner profiles.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.guardian_learner_relationships (
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  guardian_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('PARENT', 'GUARDIAN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (guardian_user_id, learner_id)
);

CREATE INDEX IF NOT EXISTS idx_guardian_learner_rel_learner ON public.guardian_learner_relationships(learner_id);

-- ==============================================================================
-- 3. LEARNING SESSIONS
-- Tracks diagnostic, practice, and re-test sessions with composite learner integrity.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  session_kind TEXT NOT NULL CHECK (session_kind IN ('DIAGNOSTIC', 'PRACTICE', 'RETEST')),
  subject_id TEXT NOT NULL,
  topic_id TEXT NULL,
  target_node_id TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  rule_version TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_learning_sessions_id_learner UNIQUE (id, learner_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_learner_id ON public.learning_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_status ON public.learning_sessions(status);

-- ==============================================================================
-- 4. LEARNING ATTEMPTS
-- Immutable evaluated-attempt evidence linked to session and verified learner.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  learner_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_version TEXT NOT NULL,
  item_content_hash TEXT NOT NULL CHECK (item_content_hash ~ '^[a-f0-9]{64}$'),
  primary_node_id TEXT NOT NULL,
  student_response JSONB NOT NULL,
  selected_option_id TEXT NULL,
  is_correct BOOLEAN NOT NULL,
  misconception_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  grading_rule_version TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_learning_attempts_session_learner
    FOREIGN KEY (session_id, learner_id)
    REFERENCES public.learning_sessions(id, learner_id)
    ON DELETE CASCADE,
  CONSTRAINT uq_learning_attempts_id_learner_session UNIQUE (id, learner_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_attempts_session_id ON public.learning_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_attempts_learner_id ON public.learning_attempts(learner_id);
CREATE INDEX IF NOT EXISTS idx_learning_attempts_item_id ON public.learning_attempts(item_id);

-- ==============================================================================
-- 5. KNOWLEDGE EVIDENCE
-- Immutable evidence records derived from evaluated attempts.
-- Strictly excludes PARENT_AI / COPILOT outputs.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.knowledge_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL,
  session_id UUID NOT NULL,
  attempt_id UUID NOT NULL,
  node_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('DIAGNOSTIC_ATTEMPT', 'PRACTICE_ATTEMPT', 'RETEST_ATTEMPT')),
  outcome TEXT NOT NULL CHECK (outcome IN ('CORRECT', 'INCORRECT')),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rule_version TEXT NOT NULL,
  CONSTRAINT fk_knowledge_evidence_attempt_chain
    FOREIGN KEY (attempt_id, learner_id, session_id)
    REFERENCES public.learning_attempts(id, learner_id, session_id)
    ON DELETE CASCADE,
  CONSTRAINT uq_knowledge_evidence_attempt_node_type UNIQUE (attempt_id, node_id, evidence_type)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_evidence_learner_id ON public.knowledge_evidence(learner_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_evidence_node_id ON public.knowledge_evidence(node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_evidence_session_id ON public.knowledge_evidence(session_id);

-- ==============================================================================
-- 6. KNOWLEDGE NODE STATES
-- Current deterministic projection of node mastery for a learner.
-- Nullable last_assessed_at for NOT_ASSESSED; count invariants enforced.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.knowledge_node_states (
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('NOT_ASSESSED', 'UNCERTAIN', 'DEVELOPING', 'SECURE')),
  confidence TEXT NOT NULL CHECK (confidence IN ('LOW', 'MEDIUM', 'HIGH')),
  attempts_count INTEGER NOT NULL DEFAULT 0 CHECK (attempts_count >= 0),
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  misconception_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_assessed_at TIMESTAMPTZ NULL,
  rule_version TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (learner_id, node_id),
  CONSTRAINT chk_node_states_counts CHECK (correct_count <= attempts_count),
  CONSTRAINT chk_node_states_last_assessed CHECK (
    (state = 'NOT_ASSESSED' AND attempts_count = 0 AND correct_count = 0 AND last_assessed_at IS NULL) OR
    (state != 'NOT_ASSESSED' AND last_assessed_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_knowledge_node_states_learner_id ON public.knowledge_node_states(learner_id);

-- ==============================================================================
-- 7. MASTERY HISTORY
-- Append-only state transition history traceable to trigger session and learner.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL,
  node_id TEXT NOT NULL,
  trigger_session_id UUID NOT NULL,
  previous_state TEXT NOT NULL CHECK (previous_state IN ('NOT_ASSESSED', 'UNCERTAIN', 'DEVELOPING', 'SECURE')),
  previous_confidence TEXT NOT NULL CHECK (previous_confidence IN ('LOW', 'MEDIUM', 'HIGH')),
  new_state TEXT NOT NULL CHECK (new_state IN ('NOT_ASSESSED', 'UNCERTAIN', 'DEVELOPING', 'SECURE')),
  new_confidence TEXT NOT NULL CHECK (new_confidence IN ('LOW', 'MEDIUM', 'HIGH')),
  reason_code TEXT NOT NULL CHECK (reason_code IN ('DIAGNOSTIC_EVALUATION', 'PRACTICE_EVALUATION', 'RETEST_EVALUATION')),
  rule_version TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_mastery_history_session_learner
    FOREIGN KEY (trigger_session_id, learner_id)
    REFERENCES public.learning_sessions(id, learner_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mastery_history_learner_id ON public.mastery_history(learner_id);
CREATE INDEX IF NOT EXISTS idx_mastery_history_node_id ON public.mastery_history(node_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY
-- Enabled on all AI School tables. No public direct CRUD policies.
-- Server repository accesses tables exclusively through service-role admin key.
-- ==============================================================================
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_learner_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_node_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_history ENABLE ROW LEVEL SECURITY;
