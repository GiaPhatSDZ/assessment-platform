-- ==============================================================================
-- AI School Database Migration: Server-Side Diagnostic Grading V1
-- File: supabase/migrations/20260919000003_server_diagnostic_grading_v1.sql
--
-- Controller Mandates:
-- 1. Adds unique constraint on (session_id, item_id) to prevent replay/duplicate attempts.
-- 2. Implements atomic persistence RPC function record_atomic_diagnostic_grading.
-- 3. A3: Concurrency-safe node projection lock / CAS returning STATE_CONFLICT_RETRY.
-- 4. A4: Service-role only execution, search_path locked.
-- ==============================================================================

-- 1. Enforce duplicate/replay prevention at the database level
ALTER TABLE public.learning_attempts
  ADD CONSTRAINT uq_learning_attempts_session_item UNIQUE (session_id, item_id);

-- 2. Atomic Diagnostic Grading Transaction RPC
CREATE OR REPLACE FUNCTION public.record_atomic_diagnostic_grading(
  p_learner_id UUID,
  p_session_id UUID,
  p_item_id TEXT,
  p_item_version TEXT,
  p_item_content_hash TEXT,
  p_primary_node_id TEXT,
  p_student_response JSONB,
  p_selected_option_id TEXT,
  p_is_correct BOOLEAN,
  p_misconception_tags JSONB,
  p_grading_rule_version TEXT,
  p_evidence_rule_version TEXT,
  p_node_state TEXT,
  p_node_confidence TEXT,
  p_attempts_count INT,
  p_correct_count INT,
  p_last_assessed_at TIMESTAMPTZ,
  p_node_rule_version TEXT,
  p_expected_node_updated_at TIMESTAMPTZ DEFAULT NULL,
  p_has_mastery_transition BOOLEAN DEFAULT FALSE,
  p_previous_state TEXT DEFAULT NULL,
  p_previous_confidence TEXT DEFAULT NULL,
  p_new_state TEXT DEFAULT NULL,
  p_new_confidence TEXT DEFAULT NULL,
  p_reason_code TEXT DEFAULT NULL,
  p_mastery_rule_version TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session RECORD;
  v_current_node RECORD;
  v_attempt_id UUID;
  v_evidence_id UUID;
  v_mastery_id UUID := NULL;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- A3: Serialize learnerId + nodeId projection updates using row lock / transaction lock
  PERFORM pg_advisory_xact_lock(hashtext(p_learner_id::text || ':' || p_primary_node_id));

  -- 1. Validate session
  SELECT id, learner_id, session_kind, status INTO v_session
  FROM public.learning_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND: Session % does not exist', p_session_id;
  END IF;

  IF v_session.learner_id != p_learner_id THEN
    RAISE EXCEPTION 'SESSION_OWNERSHIP_MISMATCH: Session % does not belong to learner %', p_session_id, p_learner_id;
  END IF;

  IF v_session.session_kind != 'DIAGNOSTIC' THEN
    RAISE EXCEPTION 'INVALID_SESSION_KIND: Diagnostic grading only applies to DIAGNOSTIC sessions (found %)', v_session.session_kind;
  END IF;

  IF v_session.status NOT IN ('STARTED', 'IN_PROGRESS') THEN
    RAISE EXCEPTION 'SESSION_CLOSED: Session % is closed with status %', p_session_id, v_session.status;
  END IF;

  -- 2. Check duplicate / replay attempt
  IF EXISTS (SELECT 1 FROM public.learning_attempts WHERE session_id = p_session_id AND item_id = p_item_id) THEN
    RAISE EXCEPTION 'ATTEMPT_ALREADY_RECORDED: Item % has already been attempted in session %', p_item_id, p_session_id;
  END IF;

  -- 3. A3: CAS check on existing node state if caller specified expected projection timestamp
  SELECT learner_id, node_id, state, confidence, updated_at INTO v_current_node
  FROM public.knowledge_node_states
  WHERE learner_id = p_learner_id AND node_id = p_primary_node_id;

  IF p_expected_node_updated_at IS NOT NULL THEN
    IF v_current_node.updated_at IS DISTINCT FROM p_expected_node_updated_at THEN
      RAISE EXCEPTION 'STATE_CONFLICT_RETRY: Node state for node % was modified concurrently (expected %, found %)',
        p_primary_node_id, p_expected_node_updated_at, v_current_node.updated_at;
    END IF;
  END IF;

  -- 4. Insert learning attempt
  INSERT INTO public.learning_attempts (
    session_id,
    learner_id,
    item_id,
    item_version,
    item_content_hash,
    primary_node_id,
    student_response,
    selected_option_id,
    is_correct,
    misconception_tags,
    grading_rule_version,
    attempted_at
  ) VALUES (
    p_session_id,
    p_learner_id,
    p_item_id,
    p_item_version,
    p_item_content_hash,
    p_primary_node_id,
    p_student_response,
    p_selected_option_id,
    p_is_correct,
    p_misconception_tags,
    p_grading_rule_version,
    v_now
  )
  RETURNING id INTO v_attempt_id;

  -- 5. Insert knowledge evidence
  INSERT INTO public.knowledge_evidence (
    learner_id,
    session_id,
    attempt_id,
    node_id,
    evidence_type,
    outcome,
    rule_version,
    observed_at
  ) VALUES (
    p_learner_id,
    p_session_id,
    v_attempt_id,
    p_primary_node_id,
    'DIAGNOSTIC_ATTEMPT',
    CASE WHEN p_is_correct THEN 'CORRECT' ELSE 'INCORRECT' END,
    p_evidence_rule_version,
    v_now
  )
  RETURNING id INTO v_evidence_id;

  -- 6. Upsert knowledge node state
  INSERT INTO public.knowledge_node_states (
    learner_id,
    node_id,
    state,
    confidence,
    attempts_count,
    correct_count,
    misconception_tags,
    last_assessed_at,
    rule_version,
    updated_at
  ) VALUES (
    p_learner_id,
    p_primary_node_id,
    p_node_state,
    p_node_confidence,
    p_attempts_count,
    p_correct_count,
    p_misconception_tags,
    p_last_assessed_at,
    p_node_rule_version,
    v_now
  )
  ON CONFLICT (learner_id, node_id) DO UPDATE SET
    state = EXCLUDED.state,
    confidence = EXCLUDED.confidence,
    attempts_count = EXCLUDED.attempts_count,
    correct_count = EXCLUDED.correct_count,
    misconception_tags = EXCLUDED.misconception_tags,
    last_assessed_at = EXCLUDED.last_assessed_at,
    rule_version = EXCLUDED.rule_version,
    updated_at = v_now;

  -- 7. Insert mastery transition if state or confidence actually changed
  IF p_has_mastery_transition THEN
    INSERT INTO public.mastery_history (
      learner_id,
      node_id,
      trigger_session_id,
      previous_state,
      previous_confidence,
      new_state,
      new_confidence,
      reason_code,
      rule_version,
      occurred_at
    ) VALUES (
      p_learner_id,
      p_primary_node_id,
      p_session_id,
      p_previous_state,
      p_previous_confidence,
      p_new_state,
      p_new_confidence,
      p_reason_code,
      p_mastery_rule_version,
      v_now
    )
    RETURNING id INTO v_mastery_id;
  END IF;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'evidence_id', v_evidence_id,
    'mastery_id', v_mastery_id,
    'node_updated_at', v_now
  );
END;
$$;

-- A4: Restrict execution to service-role only; revoke from PUBLIC, anon, authenticated
REVOKE ALL ON FUNCTION public.record_atomic_diagnostic_grading FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_atomic_diagnostic_grading FROM anon;
REVOKE ALL ON FUNCTION public.record_atomic_diagnostic_grading FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_atomic_diagnostic_grading TO service_role;
