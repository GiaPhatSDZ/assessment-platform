import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAuthorizedAdmin, getAdminEmails } from "./admin-auth";

describe("Admin Authorization", () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ADMIN_EMAILS = originalEnv;
    } else {
      delete process.env.ADMIN_EMAILS;
    }
  });

  it("parses comma-separated admin emails in normalized lowercase", () => {
    process.env.ADMIN_EMAILS = "Admin@Example.com , ROOT@PLATFORM.VN,  lead@assessment.vn ";
    const list = getAdminEmails();
    expect(list).toEqual(["admin@example.com", "root@platform.vn", "lead@assessment.vn"]);
  });

  it("authorizes listed admin email regardless of case or whitespace", () => {
    process.env.ADMIN_EMAILS = "admin@platform.vn,manager@platform.vn";
    expect(isAuthorizedAdmin("admin@platform.vn")).toBe(true);
    expect(isAuthorizedAdmin("ADMIN@PLATFORM.VN ")).toBe(true);
    expect(isAuthorizedAdmin("manager@platform.vn")).toBe(true);
  });

  it("rejects unauthorized emails", () => {
    process.env.ADMIN_EMAILS = "admin@platform.vn";
    expect(isAuthorizedAdmin("learner@platform.vn")).toBe(false);
    expect(isAuthorizedAdmin("attacker@example.com")).toBe(false);
    expect(isAuthorizedAdmin("admin@platform.vn.evil.com")).toBe(false);
  });

  it("rejects null, undefined, empty, or non-string inputs", () => {
    process.env.ADMIN_EMAILS = "admin@platform.vn";
    expect(isAuthorizedAdmin(null)).toBe(false);
    expect(isAuthorizedAdmin(undefined)).toBe(false);
    expect(isAuthorizedAdmin("")).toBe(false);
    expect(isAuthorizedAdmin("   ")).toBe(false);
  });

  it("denies access when ADMIN_EMAILS is empty in production", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.ADMIN_EMAILS;
    expect(isAuthorizedAdmin("admin@example.com")).toBe(false);
    expect(isAuthorizedAdmin("anyone@example.com")).toBe(false);
  });
});
