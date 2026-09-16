import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { aiCareerReadinessAssessmentV1, AI_CAREER_READINESS_SLUG } from "@/assessments/ai-career-readiness-v1";
import { scoreAssessment } from "@/src/domain/assessment/scoring";
import { Answer } from "@/src/domain/assessment/types";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";
import {
  VISITOR_COOKIE_NAME,
  VISITOR_COOKIE_OPTIONS,
  generateVisitorToken,
} from "@/src/infrastructure/auth/anonymous-visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, slug, answers, referralCode } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if (slug !== AI_CAREER_READINESS_SLUG) {
      return NextResponse.json({ error: "Unknown assessment slug" }, { status: 404 });
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers array" }, { status: 400 });
    }

    // Retrieve or establish HttpOnly visitor token cookie
    let visitorToken = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
    if (!visitorToken) {
      try {
        const cookieStore = await cookies();
        visitorToken = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
      } catch {
        // Safe fallback in test environments
      }
    }

    let isNewVisitorToken = false;
    if (!visitorToken) {
      visitorToken = generateVisitorToken();
      isNewVisitorToken = true;
    }

    // 1. Ensure server session exists or create it
    let session = await assessmentRepository.loadOwnedSession(sessionId, visitorToken);
    if (!session) {
      session = await assessmentRepository.createSession({
        sessionId,
        assessmentSlug: slug,
        assessmentVersion: aiCareerReadinessAssessmentV1.version,
        visitorToken,
        referralCode,
      });
    }

    // 2. Authoritative server-side recomputation
    const typedAnswers: Answer[] = answers.map((a: any) => ({
      questionId: String(a.questionId),
      optionId: String(a.optionId),
      answeredAt: a.answeredAt || new Date().toISOString(),
    }));

    const computedScore = scoreAssessment(aiCareerReadinessAssessmentV1, typedAnswers);

    // 3. Persist authoritative score into database
    await assessmentRepository.finalizeSession(
      sessionId,
      visitorToken,
      typedAnswers,
      computedScore
    );

    const response = NextResponse.json({
      success: true,
      sessionId,
      score: computedScore,
    });

    if (isNewVisitorToken) {
      response.cookies.set(
        VISITOR_COOKIE_NAME,
        visitorToken,
        VISITOR_COOKIE_OPTIONS
      );
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Scoring calculation failed" },
      { status: 400 }
    );
  }
}
