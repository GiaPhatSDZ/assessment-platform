import { describe, it, expect } from "vitest";
import {
  generateVisitorToken,
  hashVisitorToken,
  verifyVisitorTokenOwnership,
} from "./anonymous-visitor";

describe("Anonymous Visitor Ownership", () => {
  it("generates unique 64-character hex tokens", () => {
    const t1 = generateVisitorToken();
    const t2 = generateVisitorToken();
    expect(t1).toHaveLength(64);
    expect(t2).toHaveLength(64);
    expect(t1).not.toBe(t2);
  });

  it("produces deterministic SHA-256 hash for a given token", () => {
    const token = "fixed_test_token_1234567890abcdef1234567890abcdef";
    const h1 = hashVisitorToken(token);
    const h2 = hashVisitorToken(token);
    expect(h1).toHaveLength(64);
    expect(h1).toBe(h2);
  });

  it("verifies ownership successfully for matching token and hash", () => {
    const token = generateVisitorToken();
    const hash = hashVisitorToken(token);
    expect(verifyVisitorTokenOwnership(token, hash)).toBe(true);
  });

  it("rejects mismatched token or guessed session access", () => {
    const token = generateVisitorToken();
    const otherToken = generateVisitorToken();
    const hash = hashVisitorToken(token);

    expect(verifyVisitorTokenOwnership(otherToken, hash)).toBe(false);
    expect(verifyVisitorTokenOwnership(undefined, hash)).toBe(false);
    expect(verifyVisitorTokenOwnership(token, undefined)).toBe(false);
    expect(verifyVisitorTokenOwnership("", hash)).toBe(false);
  });
});
