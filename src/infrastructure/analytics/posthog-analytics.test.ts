import { describe, it, expect } from "vitest";
import { PostHogAnalyticsAdapter } from "./posthog-analytics";

describe("PostHog Analytics Adapter", () => {
  it("gracefully no-ops when API key is missing", async () => {
    const adapter = new PostHogAnalyticsAdapter({ apiKey: "" });
    expect(adapter.isConfigured()).toBe(false);

    await adapter.track("landing_view");
    expect(adapter.capturedEvents).toHaveLength(0);
  });

  it("captures events when configured with API key", async () => {
    const adapter = new PostHogAnalyticsAdapter({ apiKey: "phc_test_key_123" });
    expect(adapter.isConfigured()).toBe(true);

    await adapter.track("assessment_started", {
      sessionId: "sess_42",
      assessmentSlug: "ai-career-readiness",
      referralCode: "DEMO123",
    });

    expect(adapter.capturedEvents).toHaveLength(1);
    const captured = adapter.capturedEvents[0];
    expect(captured.event).toBe("assessment_started");
    expect(captured.distinctId).toBe("sess_42");
    expect(captured.properties.assessment_slug).toBe("ai-career-readiness");
    expect(captured.properties.referral_code).toBe("DEMO123");
  });
});
