import { describe, it, expect } from "vitest";
import { sanitizeRedirectUrl } from "./safe-redirect";

describe("sanitizeRedirectUrl", () => {
  it("allows safe internal relative paths", () => {
    expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/assessment/ai-career-readiness")).toBe(
      "/assessment/ai-career-readiness"
    );
    expect(sanitizeRedirectUrl("/")).toBe("/");
    expect(sanitizeRedirectUrl("/report/session-123?tab=action-plan")).toBe(
      "/report/session-123?tab=action-plan"
    );
  });

  it("returns fallback for null, undefined, empty, or whitespace strings", () => {
    expect(sanitizeRedirectUrl(null)).toBe("/dashboard");
    expect(sanitizeRedirectUrl(undefined)).toBe("/dashboard");
    expect(sanitizeRedirectUrl("")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("   ")).toBe("/dashboard");
    expect(sanitizeRedirectUrl(null, "/custom-fallback")).toBe("/custom-fallback");
  });

  it("blocks external protocol URLs", () => {
    expect(sanitizeRedirectUrl("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("http://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("ftp://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
  });

  it("blocks protocol-relative and backslash bypass attempts", () => {
    expect(sanitizeRedirectUrl("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("///evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/\\evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("\\evil.com")).toBe("/dashboard");
  });

  it("blocks control characters or CRLF injection", () => {
    expect(sanitizeRedirectUrl("/dashboard\r\nSet-Cookie: evil")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/dashboard\n")).toBe("/dashboard");
  });
});
