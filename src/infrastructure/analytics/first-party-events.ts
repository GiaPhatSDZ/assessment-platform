import { AnalyticsEventName, AnalyticsEventPayload, AnalyticsTracker } from "../../application/analytics";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "../database/supabase-server";

export interface RecordedProductEvent {
  eventName: AnalyticsEventName;
  sessionId?: string;
  referralCode?: string;
  payload?: Record<string, any>;
  createdAt: string;
}

export class FirstPartyEventTracker implements AnalyticsTracker {
  private inMemoryLog: RecordedProductEvent[] = [];

  async track(eventName: AnalyticsEventName, payload?: AnalyticsEventPayload): Promise<void> {
    // Sanitize payload to guarantee strict privacy:
    // Exclude raw question text, answer labels, and prose
    const sanitizedPayload: Record<string, any> = {
      assessmentSlug: payload?.assessmentSlug,
      assessmentVersion: payload?.assessmentVersion,
      questionNumber: payload?.questionNumber,
      totalQuestions: payload?.totalQuestions,
      dimensionCounts: payload?.dimensionCounts,
      leadConsentedMarketing: payload?.leadConsentedMarketing,
      ...payload?.metadata,
    };

    const record: RecordedProductEvent = {
      eventName,
      sessionId: payload?.sessionId,
      referralCode: payload?.referralCode,
      payload: sanitizedPayload,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryLog.push(record);

    if (isSupabaseAdminConfigured()) {
      try {
        const supabase = getSupabaseAdminClient()!;
        await supabase.from("product_events").insert({
          event_name: eventName,
          session_id: payload?.sessionId || null,
          referral_code: payload?.referralCode || null,
          payload: sanitizedPayload,
        });
      } catch (err) {
        // Fail-useful principle: never let analytics failure crash product flow
        console.warn("Failed to write first-party product event to database", err);
      }
    }
  }

  getRecentEvents(): RecordedProductEvent[] {
    return [...this.inMemoryLog];
  }

  clear(): void {
    this.inMemoryLog = [];
  }
}

export const firstPartyEventTracker = new FirstPartyEventTracker();
