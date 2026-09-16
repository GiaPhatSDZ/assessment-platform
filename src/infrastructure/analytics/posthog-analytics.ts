import { AnalyticsEventName, AnalyticsEventPayload, AnalyticsTracker } from "../../application/analytics";

export interface PostHogConfig {
  apiKey?: string;
  host?: string;
}

export class PostHogAnalyticsAdapter implements AnalyticsTracker {
  private apiKey?: string;
  private host: string;
  public capturedEvents: { event: string; distinctId: string; properties: any }[] = [];

  constructor(config?: PostHogConfig) {
    this.apiKey = config?.apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY;
    this.host = config?.host || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async track(eventName: AnalyticsEventName, payload?: AnalyticsEventPayload): Promise<void> {
    if (!this.isConfigured()) {
      return; // Graceful no-op when PostHog is unconfigured
    }

    const distinctId = payload?.sessionId || "anonymous_user";
    const properties = {
      $current_url: typeof window !== "undefined" ? window.location.href : undefined,
      assessment_slug: payload?.assessmentSlug,
      assessment_version: payload?.assessmentVersion,
      referral_code: payload?.referralCode,
      question_number: payload?.questionNumber,
      total_questions: payload?.totalQuestions,
      ...payload?.metadata,
    };

    this.capturedEvents.push({
      event: eventName,
      distinctId,
      properties,
    });

    // In a browser runtime with posthog-js, this calls posthog.capture(...)
  }
}

export const postHogAnalytics = new PostHogAnalyticsAdapter();
