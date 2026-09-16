import { LocalSessionDraft, SessionStore } from "../../application/session-store";
import { Answer, AssessmentScore } from "../../domain/assessment/types";

const STORAGE_PREFIX = "assessment_draft_";

export class LocalBrowserSessionStore implements SessionStore {
  private getKey(slug: string): string {
    return `${STORAGE_PREFIX}${slug}`;
  }

  getDraft(slug: string, expectedVersion?: number): LocalSessionDraft | null {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(this.getKey(slug));
      if (!raw) return null;

      const parsed: LocalSessionDraft = JSON.parse(raw);
      if (
        !parsed.sessionId ||
        !parsed.assessmentSlug ||
        typeof parsed.assessmentVersion !== "number" ||
        !Array.isArray(parsed.answers)
      ) {
        return null;
      }

      if (expectedVersion !== undefined && parsed.assessmentVersion !== expectedVersion) {
        this.clearDraft(slug);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  saveDraft(draft: LocalSessionDraft): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    try {
      draft.updatedAt = new Date().toISOString();
      window.localStorage.setItem(this.getKey(draft.assessmentSlug), JSON.stringify(draft));
    } catch (e) {
      console.warn("Failed to persist local assessment draft", e);
    }
  }

  updateAnswer(slug: string, answer: Answer, currentStepIndex: number): LocalSessionDraft {
    let draft = this.getDraft(slug);
    if (!draft) {
      draft = {
        sessionId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        assessmentId: "",
        assessmentSlug: slug,
        assessmentVersion: 1,
        currentStepIndex,
        answers: [],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const existingIdx = draft.answers.findIndex((a) => a.questionId === answer.questionId);
    if (existingIdx >= 0) {
      draft.answers[existingIdx] = {
        ...answer,
        answeredAt: new Date().toISOString(),
      };
    } else {
      draft.answers.push({
        ...answer,
        answeredAt: new Date().toISOString(),
      });
    }

    draft.currentStepIndex = currentStepIndex;
    this.saveDraft(draft);
    return draft;
  }

  setFinalizedScore(slug: string, score: AssessmentScore): LocalSessionDraft {
    const draft = this.getDraft(slug);
    if (!draft) {
      throw new Error(`Cannot set score for non-existent draft: ${slug}`);
    }

    draft.finalizedScore = score;
    this.saveDraft(draft);
    return draft;
  }

  clearDraft(slug: string): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem(this.getKey(slug));
    } catch (e) {
      console.warn("Failed to clear local draft", e);
    }
  }
}

export const localSessionStore = new LocalBrowserSessionStore();
