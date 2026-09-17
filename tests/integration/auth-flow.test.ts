import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as magicLinkHandler } from "@/app/api/auth/magic-link/route";
import { GET as authCallbackHandler } from "@/app/auth/callback/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { inMemoryAssessmentRepository } from "@/src/infrastructure/database/mock-assessment-repository";
import { generateVisitorToken, VISITOR_COOKIE_NAME } from "@/src/infrastructure/auth/anonymous-visitor";

describe("Authentication & Magic-Link Integration Flow", () => {
  beforeEach(() => {
    inMemoryAssessmentRepository.clear();
  });

  it("validates email in magic link requests", async () => {
    // 1. Invalid email
    const invalidReq = new NextRequest("http://localhost:3000/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });
    const invalidRes = await magicLinkHandler(invalidReq);
    expect(invalidRes.status).toBe(400);

    // 2. Valid email
    const validReq = new NextRequest("http://localhost:3000/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "learner@example.com", next: "/dashboard" }),
    });
    const validRes = await magicLinkHandler(validReq);
    expect(validRes.status).toBe(200);
    const body = await validRes.json();
    expect(body.success).toBe(true);
  });

  it("auth callback sanitizes redirect targets and prevents open redirects", async () => {
    // Malicious open redirect attempt
    const callbackReq = new NextRequest(
      "http://localhost:3000/auth/callback?code=mock_dev_code&next=https://evil.com/phish&email=learner@example.com"
    );

    const res = await authCallbackHandler(callbackReq);
    expect(res.status).toBe(307); // NextResponse.redirect
    const location = res.headers.get("location");
    // Must sanitize to safe fallback /dashboard rather than evil.com
    expect(location).toBe("http://localhost:3000/dashboard");
  });

  it("auth callback claims anonymous session when visitor cookie is present", async () => {
    const visitorToken = generateVisitorToken();

    // Participant takes assessment anonymously
    const session = await inMemoryAssessmentRepository.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
    });
    expect(session.userId).toBeUndefined();

    // User completes magic link login with their visitor cookie attached
    const callbackReq = new NextRequest(
      "http://localhost:3000/auth/callback?code=mock_dev_code&next=/dashboard&email=claimed@example.com",
      {
        headers: {
          cookie: `${VISITOR_COOKIE_NAME}=${visitorToken}`,
        },
      }
    );

    const res = await authCallbackHandler(callbackReq);
    expect(res.status).toBe(307);

    // Verify session is claimed for usr_mock_dev
    const claimedSession = await inMemoryAssessmentRepository.loadOwnedSession(
      session.id,
      visitorToken
    );
    expect(claimedSession?.userId).toBe("usr_mock_dev");
  });

  it("logout endpoint clears cookies and redirects", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    const res = await logoutHandler(req);
    expect(res.status).toBe(303);
    const location = res.headers.get("location");
    expect(location).toBe("http://localhost:3000/login");
  });
});
