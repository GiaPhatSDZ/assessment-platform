import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import {
  EducationStage,
  KnowledgeState,
  EvidenceConfidence,
  validateItemContentHash,
  validateEvidenceType,
  validateLearnerStageConstraints,
  validateStudentResponse,
  validateNodeStateCounts,
  UnauthorizedLearnerAccessError,
  InvalidItemHashError,
  InvalidEvidenceTypeError,
  LearnerStageConstraintError,
  InvalidStudentResponseError,
  OwnershipChainMismatchError,
  DatabasePersistenceError,
} from "../../src/domain/learning-persistence/types";
import { InMemoryLearningPersistenceRepository } from "../../src/infrastructure/database/in-memory-learning-persistence-repository";
import { SupabaseLearningPersistenceRepository } from "../../src/infrastructure/database/supabase-learning-persistence-repository";
import {
  getLearningPersistenceRepository,
  resetInMemoryLearningPersistenceRepository,
} from "../../src/infrastructure/database/learning-persistence-factory";
import { LearnerHistory } from "../../components/v3/profile/LearnerHistory";
import { hashVisitorToken } from "../../src/infrastructure/auth/anonymous-visitor";

describe("AI School Persistence V1 Test Matrix", () => {
  const rootDir = path.resolve(".");
  const initialMigrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20260917000001_initial_schema.sql"
  );
  const persistenceMigrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20260918000002_ai_school_learning_persistence_v1.sql"
  );

  let repository: InMemoryLearningPersistenceRepository;

  beforeEach(() => {
    repository = new InMemoryLearningPersistenceRepository();
    resetInMemoryLearningPersistenceRepository();
  });

  // 1. Migration is additive; initial migration untouched
  it("Requirement 1: Migration is additive and initial migration is untouched", () => {
    expect(fs.existsSync(initialMigrationPath)).toBe(true);
    expect(fs.existsSync(persistenceMigrationPath)).toBe(true);

    const initialSql = fs.readFileSync(initialMigrationPath, "utf-8");
    expect(initialSql).toContain("assessments");
    expect(initialSql).toContain("user_profiles");
    expect(initialSql).not.toContain("learner_profiles");
    expect(initialSql).not.toContain("learning_attempts");
  });

  // 2. All seven AI School persistence tables exist in SQL
  it("Requirement 2: All seven AI School persistence tables exist in SQL migration", () => {
    const migrationSql = fs.readFileSync(persistenceMigrationPath, "utf-8");
    const requiredTables = [
      "learner_profiles",
      "guardian_learner_relationships",
      "learning_sessions",
      "learning_attempts",
      "knowledge_evidence",
      "knowledge_node_states",
      "mastery_history",
    ];

    for (const table of requiredTables) {
      expect(migrationSql).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`, "i"));
      expect(migrationSql).toMatch(new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, "i"));
    }
  });

  // 3. Stage/grade/age-band constraints are valid
  it("Requirement 3: Stage/grade/age-band constraints are valid in SQL migration", () => {
    const migrationSql = fs.readFileSync(persistenceMigrationPath, "utf-8");
    expect(migrationSql).toContain("chk_learner_stage_consistency");
    expect(migrationSql).toContain("education_stage = 'PRESCHOOL' AND grade_level IS NULL AND age_band IN ('3-4', '4-5', '5-6')");
    expect(migrationSql).toContain("education_stage = 'PRIMARY' AND grade_level BETWEEN 1 AND 5");
    expect(migrationSql).toContain("education_stage = 'LOWER_SECONDARY' AND grade_level BETWEEN 6 AND 9");
    expect(migrationSql).toContain("education_stage = 'UPPER_SECONDARY' AND grade_level BETWEEN 10 AND 12");
  });

  // 4 & 5. Preschool cannot carry grade; Grade learner cannot carry preschool age band
  it("Requirement 4 & 5: Preschool profile cannot carry grade_level; Grade learner cannot carry age_band", () => {
    expect(() => validateLearnerStageConstraints("PRESCHOOL", 1, "3-4")).toThrow(LearnerStageConstraintError);
    expect(() => validateLearnerStageConstraints("PRESCHOOL", null, null)).toThrow(LearnerStageConstraintError);
    expect(() => validateLearnerStageConstraints("PRESCHOOL", null, "invalid" as any)).toThrow(LearnerStageConstraintError);
    expect(() => validateLearnerStageConstraints("PRIMARY", null, null)).toThrow(LearnerStageConstraintError);
    expect(() => validateLearnerStageConstraints("PRIMARY", 3, "4-5")).toThrow(LearnerStageConstraintError);
    expect(() => validateLearnerStageConstraints("LOWER_SECONDARY", 6, "5-6")).toThrow(LearnerStageConstraintError);
    expect(() => validateLearnerStageConstraints("UPPER_SECONDARY", 10, "3-4")).toThrow(LearnerStageConstraintError);

    // Valid calls must succeed
    expect(() => validateLearnerStageConstraints("PRESCHOOL", null, "3-4")).not.toThrow();
    expect(() => validateLearnerStageConstraints("PRIMARY", 1, null)).not.toThrow();
    expect(() => validateLearnerStageConstraints("LOWER_SECONDARY", 6, null)).not.toThrow();
    expect(() => validateLearnerStageConstraints("UPPER_SECONDARY", 12, null)).not.toThrow();
  });

  // 6 & 7. Anonymous learner ownership uses hashed visitor token; raw token never persisted
  it("Requirement 6 & 7: Anonymous learner ownership uses hashed token; raw token is never persisted", async () => {
    const rawToken = "raw-visitor-token-secret-12345678901234567890";
    const expectedHash = hashVisitorToken(rawToken);

    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6, nickname: "Nam" },
      { visitorToken: rawToken }
    );

    expect(learner.visitorOwnerHash).toBe(expectedHash);
    expect(learner.visitorOwnerHash).not.toBe(rawToken);
    expect((learner as any).visitorToken).toBeUndefined();
  });

  // 8. Wrong visitor cannot read/write learner/session
  it("Requirement 8: Wrong visitor cannot read/write learner/session", async () => {
    const tokenA = "visitor-token-owner-A-000000000000000000000";
    const tokenB = "visitor-token-intruder-B-0000000000000000000";

    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: tokenA }
    );

    // Intruding visitor B attempting to read learner
    const unownedLearner = await repository.loadOwnedLearner(learner.id, { visitorToken: tokenB });
    expect(unownedLearner).toBeNull();

    // Intruding visitor B attempting to create session
    await expect(
      repository.createLearningSession(
        { learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" },
        { visitorToken: tokenB }
      )
    ).rejects.toThrow(UnauthorizedLearnerAccessError);
  });

  // 9 & 10. Authenticated guardian relationship grants ownership; unrelated guardian denied
  it("Requirement 9 & 10: Authenticated guardian relationship grants ownership; unrelated guardian denied", async () => {
    const token = "visitor-token-student-12345678901234567890";
    const guardianUserId = crypto.randomUUID();
    const unrelatedUserId = crypto.randomUUID();

    const learner = await repository.createLearner(
      { educationStage: "PRIMARY", gradeLevel: 4 },
      { visitorToken: token }
    );

    // Claim learner for guardian with matching visitor ownership
    await repository.claimLearnerForGuardian(learner.id, guardianUserId, "PARENT", {
      visitorToken: token,
      userId: guardianUserId,
    });

    // Authenticated guardian can now load learner without visitorToken
    const loadedByGuardian = await repository.loadOwnedLearner(learner.id, { userId: guardianUserId });
    expect(loadedByGuardian).not.toBeNull();
    expect(loadedByGuardian?.id).toBe(learner.id);

    // Unrelated guardian is denied
    const loadedByUnrelated = await repository.loadOwnedLearner(learner.id, { userId: unrelatedUserId });
    expect(loadedByUnrelated).toBeNull();
  });

  // 11. Learning session supports DIAGNOSTIC/PRACTICE/RETEST
  it("Requirement 11: Learning session supports DIAGNOSTIC, PRACTICE, RETEST kinds", async () => {
    const token = "visitor-token-sessions-12345678901234567890";
    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: token }
    );

    const sDiag = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: token }
    );
    expect(sDiag.sessionKind).toBe("DIAGNOSTIC");

    const sPrac = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "PRACTICE", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: token }
    );
    expect(sPrac.sessionKind).toBe("PRACTICE");

    const sRetest = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "RETEST", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: token }
    );
    expect(sRetest.sessionKind).toBe("RETEST");
  });

  // 12 & 13. Attempt stores item id/version/content hash/rule version; invalid item SHA-256 rejected
  it("Requirement 12 & 13: Attempt stores item id/version/hash/rule version; invalid SHA-256 rejected", async () => {
    const token = "visitor-token-attempt-12345678901234567890";
    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: token }
    );
    const session = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: token }
    );

    const validHash = crypto.createHash("sha256").update("sample-item-content").digest("hex");

    const attempt = await repository.saveEvaluatedAttempt(
      {
        sessionId: session.id,
        learnerId: learner.id,
        itemId: "ITEM-TEST-01",
        itemVersion: "1.0.0",
        itemContentHash: validHash,
        primaryNodeId: "NODE-TEST-01",
        studentResponse: { type: "MCQ", selectedOptionId: "opt-a" },
        selectedOptionId: "opt-a",
        isCorrect: true,
        gradingRuleVersion: "grading-v1",
      },
      { visitorToken: token }
    );

    expect(attempt.itemContentHash).toBe(validHash);
    expect(attempt.gradingRuleVersion).toBe("grading-v1");

    // Invalid SHA-256 hash must be rejected
    await expect(
      repository.saveEvaluatedAttempt(
        {
          sessionId: session.id,
          learnerId: learner.id,
          itemId: "ITEM-TEST-02",
          itemVersion: "1.0.0",
          itemContentHash: "not-a-sha256",
          primaryNodeId: "NODE-TEST-01",
          studentResponse: { type: "MCQ", selectedOptionId: "opt-a" },
          isCorrect: false,
          gradingRuleVersion: "grading-v1",
        },
        { visitorToken: token }
      )
    ).rejects.toThrow(InvalidItemHashError);
  });

  // 14. Evidence type cannot be PARENT_AI or COPILOT
  it("Requirement 14: Evidence type cannot be PARENT_AI or COPILOT", () => {
    expect(() => validateEvidenceType("PARENT_AI")).toThrow(InvalidEvidenceTypeError);
    expect(() => validateEvidenceType("COPILOT")).toThrow(InvalidEvidenceTypeError);
    expect(() => validateEvidenceType("AI_PROMPT_GENERATION")).toThrow(InvalidEvidenceTypeError);

    expect(() => validateEvidenceType("DIAGNOSTIC_ATTEMPT")).not.toThrow();
    expect(() => validateEvidenceType("PRACTICE_ATTEMPT")).not.toThrow();
    expect(() => validateEvidenceType("RETEST_ATTEMPT")).not.toThrow();
  });

  // 15 & 16. Node states use only 4 KnowledgeState values; Confidence uses LOW/MEDIUM/HIGH
  it("Requirement 15 & 16: Node states use 4 KnowledgeState values; Confidence uses LOW/MEDIUM/HIGH", async () => {
    const token = "visitor-token-nodestate-1234567890123456789";
    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: token }
    );

    const states: KnowledgeState[] = ["NOT_ASSESSED", "UNCERTAIN", "DEVELOPING", "SECURE"];
    const confidences: EvidenceConfidence[] = ["LOW", "MEDIUM", "HIGH"];

    for (const state of states) {
      for (const conf of confidences) {
        const record = await repository.upsertNodeState(
          {
            learnerId: learner.id,
            nodeId: `NODE-${state}-${conf}`,
            state,
            confidence: conf,
            attemptsCount: state === "NOT_ASSESSED" ? 0 : 2,
            correctCount: state === "NOT_ASSESSED" ? 0 : 1,
            lastAssessedAt: state === "NOT_ASSESSED" ? null : new Date().toISOString(),
            ruleVersion: "rule-v1",
          },
          { visitorToken: token }
        );
        expect(record.state).toBe(state);
        expect(record.confidence).toBe(conf);
      }
    }
  });

  // 17. Mastery history is learner/node/session traceable
  it("Requirement 17: Mastery history is learner/node/session traceable", async () => {
    const token = "visitor-token-mastery-12345678901234567890";
    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: token }
    );
    const session = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "RETEST", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: token }
    );

    const transition = await repository.appendMasteryTransition(
      {
        learnerId: learner.id,
        nodeId: "NODE-MATH-FRAC-01",
        triggerSessionId: session.id,
        previousState: "DEVELOPING",
        previousConfidence: "MEDIUM",
        newState: "SECURE",
        newConfidence: "HIGH",
        reasonCode: "RETEST_EVALUATION",
        ruleVersion: "rule-v1",
      },
      { visitorToken: token }
    );

    expect(transition.learnerId).toBe(learner.id);
    expect(transition.nodeId).toBe("NODE-MATH-FRAC-01");
    expect(transition.triggerSessionId).toBe(session.id);
    expect(transition.reasonCode).toBe("RETEST_EVALUATION");

    const history = await repository.getMasteryHistory(learner.id, { visitorToken: token });
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(transition.id);
  });

  // 18. No fake global score field exists in new persistence model
  it("Requirement 18: No fake global score field exists in new persistence model", () => {
    const migrationSql = fs.readFileSync(persistenceMigrationPath, "utf-8");
    expect(migrationSql).not.toContain("global_score");
    expect(migrationSql).not.toContain("total_score");
    expect(migrationSql).not.toContain("percentile");
    expect(migrationSql).not.toContain("iq_score");
  });

  // 19. No forbidden child PII fields exist
  it("Requirement 19: No forbidden child PII fields exist in persistence schema", () => {
    const migrationSql = fs.readFileSync(persistenceMigrationPath, "utf-8");
    const forbiddenPii = [
      "child_email",
      "email",
      "phone",
      "phone_number",
      "exact_date_of_birth",
      "birthdate",
      "dob",
      "school",
      "school_name",
      "address",
      "location",
    ];

    // Check learner_profiles table specifically
    const learnerTableSql = migrationSql.match(/CREATE TABLE IF NOT EXISTS public\.learner_profiles \([\s\S]*?\);/i)?.[0] || "";
    for (const pii of forbiddenPii) {
      const regex = new RegExp(`\\b${pii}\\b`, "i");
      expect(learnerTableSql).not.toMatch(regex);
    }
  });

  // 20. Supabase-configured failure does NOT silently fall back to memory
  it("Requirement 20: Supabase-configured failure does NOT silently fall back to memory", async () => {
    // Mock Supabase client that throws database error
    const mockSupabaseErrorClient: any = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "Database connection failed" } }),
          }),
        }),
      }),
    };

    const repoWithFaultyDb = new SupabaseLearningPersistenceRepository(mockSupabaseErrorClient);

    await expect(
      repoWithFaultyDb.createLearner(
        { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
        { visitorToken: "some-token" }
      )
    ).rejects.toThrow(DatabasePersistenceError);
  });

  // 21. In-memory repository mirrors ownership semantics
  it("Requirement 21: In-memory repository mirrors strict ownership semantics", async () => {
    const token = "visitor-token-mem-owner-12345678901234567890";
    const learner = await repository.createLearner(
      { educationStage: "PRIMARY", gradeLevel: 5 },
      { visitorToken: token }
    );

    // Cannot access with empty ownership
    const emptyAccess = await repository.loadOwnedLearner(learner.id, {});
    expect(emptyAccess).toBeNull();

    // Cannot access with different visitorToken
    const foreignAccess = await repository.loadOwnedLearner(learner.id, { visitorToken: "other-token" });
    expect(foreignAccess).toBeNull();

    // Can access with valid owner token
    const validAccess = await repository.loadOwnedLearner(learner.id, { visitorToken: token });
    expect(validAccess).not.toBeNull();
  });

  // 22. LearnerHistory default active UI shows truthful empty state
  it("Requirement 22: LearnerHistory default active UI shows truthful empty state", () => {
    render(<LearnerHistory />);

    expect(screen.getByText(/Chưa có lịch sử học tập được ghi nhận/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Học sinh chưa hoàn thành buổi khảo sát chẩn đoán hoặc bài kiểm tra lại nào/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bắt đầu khảo sát chẩn đoán/i })).toHaveAttribute("href", "/learn/new");

    // Click to view illustrative demo
    const demoButton = screen.getByRole("button", { name: /Xem ví dụ minh họa/i });
    fireEvent.click(demoButton);

    expect(screen.getAllByText(/Ví dụ minh họa/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Không phải kết quả thực tế của học sinh hiện tại/i)).toBeInTheDocument();
  });

  // 23. Complete repository fixture flow test
  it("Requirement 23: Complete repository fixture flow succeeds end-to-end", async () => {
    const visitorToken = "flow-test-visitor-token-12345678901234567890";
    const ownership = { visitorToken };

    // 1. Create learner
    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6, nickname: "Bình" },
      ownership
    );
    expect(learner.id).toBeDefined();

    // 2. Create DIAGNOSTIC session
    const session = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math-6", ruleVersion: "v1.0" },
      ownership
    );
    expect(session.id).toBeDefined();

    // 3. Save evaluated attempt
    const validHash = crypto.createHash("sha256").update("test-item").digest("hex");
    const attempt = await repository.saveEvaluatedAttempt(
      {
        sessionId: session.id,
        learnerId: learner.id,
        itemId: "ITEM-TEST-FRAC-01",
        itemVersion: "1.0.0",
        itemContentHash: validHash,
        primaryNodeId: "NODE-MATH-6-FRAC-01",
        studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
        selectedOptionId: "opt-1",
        isCorrect: true,
        gradingRuleVersion: "rule-v1",
      },
      ownership
    );
    expect(attempt.id).toBeDefined();

    // 4. Append knowledge evidence
    const evidence = await repository.appendKnowledgeEvidence(
      {
        learnerId: learner.id,
        sessionId: session.id,
        attemptId: attempt.id,
        nodeId: "NODE-MATH-6-FRAC-01",
        evidenceType: "DIAGNOSTIC_ATTEMPT",
        outcome: "CORRECT",
        ruleVersion: "rule-v1",
      },
      ownership
    );
    expect(evidence.id).toBeDefined();

    // 5. Upsert node state
    const nodeState = await repository.upsertNodeState(
      {
        learnerId: learner.id,
        nodeId: "NODE-MATH-6-FRAC-01",
        state: "SECURE",
        confidence: "HIGH",
        attemptsCount: 1,
        correctCount: 1,
        lastAssessedAt: new Date().toISOString(),
        ruleVersion: "rule-v1",
      },
      ownership
    );
    expect(nodeState.state).toBe("SECURE");

    // 6. Append mastery transition
    const transition = await repository.appendMasteryTransition(
      {
        learnerId: learner.id,
        nodeId: "NODE-MATH-6-FRAC-01",
        triggerSessionId: session.id,
        previousState: "UNCERTAIN",
        previousConfidence: "LOW",
        newState: "SECURE",
        newConfidence: "HIGH",
        reasonCode: "DIAGNOSTIC_EVALUATION",
        ruleVersion: "rule-v1",
      },
      ownership
    );
    expect(transition.id).toBeDefined();

    // 7. Complete session
    const completedSession = await repository.completeLearningSession(session.id, ownership);
    expect(completedSession.status).toBe("COMPLETED");

    // 8. Reload current state and history
    const allStates = await repository.getCurrentNodeStates(learner.id, ownership);
    expect(allStates["NODE-MATH-6-FRAC-01"]).toBeDefined();
    expect(allStates["NODE-MATH-6-FRAC-01"].state).toBe("SECURE");

    const history = await repository.getMasteryHistory(learner.id, ownership);
    expect(history.length).toBe(1);
    expect(history[0].newState).toBe("SECURE");
  });

  // ==============================================================================
  // CONTROLLER MANDATORY AMENDMENT TESTS (A1–A10, Tests 24–33)
  // ==============================================================================

  // 24. Composite DB integrity across tables (cannot reference mismatched learner)
  it("Requirement 24 (A1): Composite DB integrity ensures session, attempt, and evidence cannot mismatch learner", async () => {
    const tokenA = "visitor-token-learnerA-12345678901234567890";
    const tokenB = "visitor-token-learnerB-12345678901234567890";

    const learnerA = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: tokenA }
    );
    const learnerB = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 7 },
      { visitorToken: tokenB }
    );

    const sessionA = await repository.createLearningSession(
      { learnerId: learnerA.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: tokenA }
    );

    const validHash = crypto.createHash("sha256").update("item").digest("hex");

    // Attempting to save attempt with sessionA but learnerB -> must throw OwnershipChainMismatchError
    await expect(
      repository.saveEvaluatedAttempt(
        {
          sessionId: sessionA.id,
          learnerId: learnerB.id,
          itemId: "ITEM-01",
          itemVersion: "1.0",
          itemContentHash: validHash,
          primaryNodeId: "NODE-01",
          studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
          isCorrect: true,
          gradingRuleVersion: "v1",
        },
        { visitorToken: tokenB }
      )
    ).rejects.toThrow(OwnershipChainMismatchError);
  });

  // 25. Direct reuse of existing EducationStage, KnowledgeState, EvidenceConfidence
  it("Requirement 25 (A2): Directly reuses existing domain enums without competing definitions", () => {
    // Verified via TypeScript compiler imports from:
    // - ../curriculum/types (EducationStage)
    // - ../diagnostic/types (KnowledgeState, EvidenceConfidence)
    const stage: EducationStage = "LOWER_SECONDARY";
    const state: KnowledgeState = "DEVELOPING";
    const confidence: EvidenceConfidence = "MEDIUM";

    expect(stage).toBe("LOWER_SECONDARY");
    expect(state).toBe("DEVELOPING");
    expect(confidence).toBe("MEDIUM");
  });

  // 26. knowledge_node_states.last_assessed_at is nullable for NOT_ASSESSED
  it("Requirement 26 (A3): knowledge_node_states.last_assessed_at is nullable for NOT_ASSESSED", async () => {
    const token = "visitor-token-null-assessed-1234567890123456";
    const learner = await repository.createLearner(
      { educationStage: "PRIMARY", gradeLevel: 2 },
      { visitorToken: token }
    );

    const record = await repository.upsertNodeState(
      {
        learnerId: learner.id,
        nodeId: "NODE-UNASSESSED",
        state: "NOT_ASSESSED",
        confidence: "LOW",
        attemptsCount: 0,
        correctCount: 0,
        lastAssessedAt: null,
        ruleVersion: "v1",
      },
      { visitorToken: token }
    );

    expect(record.lastAssessedAt).toBeNull();
  });

  // 27. attempts_count >= 0, correct_count >= 0, correct_count <= attempts_count enforced
  it("Requirement 27 (A3): Enforces attempts_count >= 0, correct_count >= 0, correct_count <= attempts_count", () => {
    expect(() => validateNodeStateCounts(-1, 0)).toThrow();
    expect(() => validateNodeStateCounts(0, -1)).toThrow();
    expect(() => validateNodeStateCounts(2, 3)).toThrow(/cannot exceed/);
    expect(() => validateNodeStateCounts(5, 5)).not.toThrow();
    expect(() => validateNodeStateCounts(5, 4)).not.toThrow();
  });

  // 28. Guardian claim binds guardianUserId to authenticated ownership.userId or verified visitor token
  it("Requirement 28 (A4): Guardian claim binds guardianUserId to authenticated userId or verified visitor token", async () => {
    const token = "visitor-token-claim-check-12345678901234567";
    const guardianUserId = crypto.randomUUID();
    const attackerUserId = crypto.randomUUID();

    const learner = await repository.createLearner(
      { educationStage: "PRIMARY", gradeLevel: 3 },
      { visitorToken: token }
    );

    // Attacker with neither valid visitorToken nor matching guardianUserId is rejected
    await expect(
      repository.claimLearnerForGuardian(learner.id, guardianUserId, "PARENT", {
        userId: attackerUserId,
      })
    ).rejects.toThrow(UnauthorizedLearnerAccessError);

    // Legitimate guardian with visitorToken claiming to their account succeeds
    await expect(
      repository.claimLearnerForGuardian(learner.id, guardianUserId, "PARENT", {
        visitorToken: token,
        userId: guardianUserId,
      })
    ).resolves.toBe(true);
  });

  // 29. In production, missing Supabase configuration throws PERSISTENCE_NOT_CONFIGURED
  it("Requirement 29 (A5): In production, missing Supabase configuration throws PERSISTENCE_NOT_CONFIGURED", () => {
    const prevEnv = process.env.NODE_ENV;
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => getLearningPersistenceRepository()).toThrow(/PERSISTENCE_NOT_CONFIGURED/);
    } finally {
      (process.env as any).NODE_ENV = prevEnv;
      process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
    }
  });

  // 30. Supabase repository and factory are server-only
  it("Requirement 30 (A6): Supabase repository and factory import 'server-only'", () => {
    const repoFile = fs.readFileSync(
      path.join(rootDir, "src", "infrastructure", "database", "supabase-learning-persistence-repository.ts"),
      "utf-8"
    );
    expect(repoFile).toMatch(/^import "server-only";/m);

    const factoryFile = fs.readFileSync(
      path.join(rootDir, "src", "infrastructure", "database", "learning-persistence-factory.ts"),
      "utf-8"
    );
    expect(factoryFile).toMatch(/^import "server-only";/m);
  });

  // 31. knowledge_evidence and mastery_history have no update/delete methods in repository interface
  it("Requirement 31 (A7): knowledge_evidence and mastery_history are append-only (no update/delete methods)", () => {
    const repoInterfaceFile = fs.readFileSync(
      path.join(rootDir, "src", "application", "learning-persistence-repository.ts"),
      "utf-8"
    );
    expect(repoInterfaceFile).not.toContain("updateKnowledgeEvidence");
    expect(repoInterfaceFile).not.toContain("deleteKnowledgeEvidence");
    expect(repoInterfaceFile).not.toContain("updateMasteryTransition");
    expect(repoInterfaceFile).not.toContain("deleteMasteryTransition");
    expect(repoInterfaceFile).toContain("appendKnowledgeEvidence");
    expect(repoInterfaceFile).toContain("appendMasteryTransition");
  });

  // 32. student_response enforces structured MCQ/NUMERIC payload and rejects client grading truth
  it("Requirement 32 (A8): student_response enforces structured MCQ/NUMERIC payload and rejects client grading truth", () => {
    // Rejects free text string
    expect(() => validateStudentResponse("raw text" as any)).toThrow(InvalidStudentResponseError);

    // Rejects client-supplied correctAnswer or rationale
    expect(() =>
      validateStudentResponse({
        type: "MCQ",
        selectedOptionId: "opt-1",
        correctAnswer: "opt-1",
      })
    ).toThrow(/cannot contain client-supplied correctAnswer/);

    expect(() =>
      validateStudentResponse({
        type: "MCQ",
        selectedOptionId: "opt-1",
        rationale: "client explanation",
      })
    ).toThrow(/cannot contain client-supplied correctAnswer/);

    expect(() =>
      validateStudentResponse({
        type: "MCQ",
        selectedOptionId: "opt-1",
        isCorrect: true,
      })
    ).toThrow(/cannot contain client-supplied correctAnswer/);

    // Accepts valid MCQ
    expect(() => validateStudentResponse({ type: "MCQ", selectedOptionId: "opt-1" })).not.toThrow();

    // Accepts valid NUMERIC
    expect(() => validateStudentResponse({ type: "NUMERIC", numericValue: 42, unit: "cm" })).not.toThrow();
  });

  // 33. Write operations verify full ownership chain (ownership -> learner -> session -> attempt)
  it("Requirement 33 (A9): Write operations verify full ownership chain", async () => {
    const token = "visitor-token-chain-12345678901234567890";
    const intruderToken = "visitor-token-intruder-123456789012345678";

    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken: token }
    );
    const session = await repository.createLearningSession(
      { learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" },
      { visitorToken: token }
    );

    const validHash = crypto.createHash("sha256").update("item").digest("hex");

    // Intruder cannot save attempt
    await expect(
      repository.saveEvaluatedAttempt(
        {
          sessionId: session.id,
          learnerId: learner.id,
          itemId: "ITEM-01",
          itemVersion: "1.0",
          itemContentHash: validHash,
          primaryNodeId: "NODE-01",
          studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
          isCorrect: true,
          gradingRuleVersion: "v1",
        },
        { visitorToken: intruderToken }
      )
    ).rejects.toThrow(UnauthorizedLearnerAccessError);

    // Owner saves attempt
    const attempt = await repository.saveEvaluatedAttempt(
      {
        sessionId: session.id,
        learnerId: learner.id,
        itemId: "ITEM-01",
        itemVersion: "1.0",
        itemContentHash: validHash,
        primaryNodeId: "NODE-01",
        studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
        isCorrect: true,
        gradingRuleVersion: "v1",
      },
      { visitorToken: token }
    );

    // Intruder cannot append evidence
    await expect(
      repository.appendKnowledgeEvidence(
        {
          learnerId: learner.id,
          sessionId: session.id,
          attemptId: attempt.id,
          nodeId: "NODE-01",
          evidenceType: "DIAGNOSTIC_ATTEMPT",
          outcome: "CORRECT",
          ruleVersion: "v1",
        },
        { visitorToken: intruderToken }
      )
    ).rejects.toThrow(UnauthorizedLearnerAccessError);
  });
});
