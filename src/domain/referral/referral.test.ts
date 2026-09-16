import { describe, it, expect } from "vitest";
import { normalizeReferralCode, isValidReferralCode } from "./referral";

describe("Referral Attribution Parser", () => {
  it("normalizes and accepts valid alphanumeric referral codes", () => {
    expect(normalizeReferralCode("demo123")).toBe("DEMO123");
    expect(normalizeReferralCode("  partner_42  ")).toBe("PARTNER_42");
    expect(normalizeReferralCode("CAMPAIGN-2026")).toBe("CAMPAIGN-2026");
  });

  it("identifies valid referral codes correctly", () => {
    expect(isValidReferralCode("DEMO123")).toBe(true);
    expect(isValidReferralCode("REF_01")).toBe(true);
    expect(isValidReferralCode("A-1")).toBe(true);
  });

  it("rejects codes that are too short (<2 chars) or too long (>32 chars)", () => {
    expect(normalizeReferralCode("A")).toBeNull();
    expect(normalizeReferralCode("A".repeat(33))).toBeNull();
    expect(isValidReferralCode("A")).toBe(false);
  });

  it("rejects invalid characters, injection attempts, and symbols", () => {
    expect(normalizeReferralCode("DEMO; DROP TABLE--")).toBeNull();
    expect(normalizeReferralCode("<script>alert(1)</script>")).toBeNull();
    expect(normalizeReferralCode("ref code with spaces")).toBeNull();
    expect(normalizeReferralCode("ref$special#")).toBeNull();
    expect(normalizeReferralCode("")).toBeNull();
    expect(normalizeReferralCode(null as any)).toBeNull();
    expect(normalizeReferralCode(undefined as any)).toBeNull();
  });
});
