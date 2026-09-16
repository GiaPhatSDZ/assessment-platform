import { AnalyticsEventName, AnalyticsEventPayload, AnalyticsTracker } from "../../application/analytics";

export class NoopAnalyticsTracker implements AnalyticsTracker {
  async track(_eventName: AnalyticsEventName, _payload?: AnalyticsEventPayload): Promise<void> {
    // Intentionally no-op
  }
}

export const noopAnalyticsTracker = new NoopAnalyticsTracker();
