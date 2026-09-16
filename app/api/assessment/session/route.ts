import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { aiCareerReadinessAssessmentV1, AI_CAREER_READINESS_SLUG } from "@/assessments/ai-career-readiness-v1";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";
import {
  VISITOR_COOKIE_NAME,
  VISITOR_COOKIE_OPTIONS,
  generateVisitorToken,
} from "@/src/infrastructure/auth/anonymous-visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, slug, referralCode, answer } = body;

    if (slug !== AI_CAREER_READINESS_SLUG) {
      return NextResponse.json({ error: "Unknown assessment slug" }, { status: 404 });
    }

    let visitorToken = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
    if (!visitorToken) {
      try {
        const cookieStore = await cookies();
        visitorToken = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
      } catch {
        // Safe fallback in test environments
      }
    }

    let isNewToken = false;
    if (!visitorToken) {
      visitorToken = generateVisitorToken();
      isNewToken = true;
    }

    let session = sessionId
      ? await assessmentRepository.loadOwnedSession(sessionId, visitorToken)
      : null;

    if (!session) {
      session = await assessmentRepository.createSession({
        sessionId,
        assessmentSlug: slug,
        assessmentVersion: aiCareerReadinessAssessmentV1.version,
        visitorToken,
        referralCode,
      });
    }

    if (answer && answer.questionId && answer.optionId) {
      await assessmentRepository.saveAnswer(session.id, visitorToken, {
        questionId: String(answer.questionId),
        optionId: String(answer.optionId),
        answeredAt: new Date().toISOString(),
      });
    }

    const response = NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        answersCount: session.answers.length,
        referralCode: session.referralCode,
      },
    });

    if (isNewToken) {
      response.cookies.set(VISITOR_COOKIE_NAME, visitorToken, VISITOR_COOKIE_OPTIONS);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process session action" },
      { status: 500 }
    );
  }
}
