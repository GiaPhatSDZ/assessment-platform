import { describe, it, expect, beforeEach } from "vitest";
import { LocalBrowserSessionStore } from "./local-session-store";
import { LocalSessionDraft } from "../../application/session-store";

describe("LocalBrowserSessionStore", () => {
  let store: LocalBrowserSessionStore;

  beforeEach(() => {
    localStorage.clear();
    store = new LocalBrowserSessionStore();
  });

  it("saves and loads a draft successfully", () => {
    const draft: LocalSessionDraft = {
      sessionId: "sess-1",
      assessmentId: "asmt-1",
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      currentStepIndex: 2,
      answers: [{ questionId: "q1", optionId: "q1_opt1" }],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.saveDraft(draft);
    const loaded = store.getDraft("ai-career-readiness");

    expect(loaded).toEqual(draft);
  });

  it("updates existing answer and updates step index", () => {
    const initial: LocalSessionDraft = {
      sessionId: "sess-1",
      assessmentId: "asmt-1",
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      currentStepIndex: 0,
      answers: [{ questionId: "q1", optionId: "q1_opt1" }],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.saveDraft(initial);

    const updated = store.updateAnswer(
      "ai-career-readiness",
      { questionId: "q1", optionId: "q1_opt5" },
      1
    );

    expect(updated.currentStepIndex).toBe(1);
    expect(updated.answers).toHaveLength(1);
    expect(updated.answers[0].optionId).toBe("q1_opt5");
  });

  it("safely handles corrupted JSON in localStorage", () => {
    localStorage.setItem("assessment_draft_ai-career-readiness", "{ bad-json");
    const loaded = store.getDraft("ai-career-readiness");
    expect(loaded).toBeNull();
  });

  it("safely rejects draft with version mismatch", () => {
    const draft: LocalSessionDraft = {
      sessionId: "sess-old",
      assessmentId: "asmt-1",
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 999, // mismatch
      currentStepIndex: 0,
      answers: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.saveDraft(draft);

    const loaded = store.getDraft("ai-career-readiness", 1);
    expect(loaded).toBeNull();
  });
});
