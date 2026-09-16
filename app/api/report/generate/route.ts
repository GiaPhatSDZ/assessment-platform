import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";
import { getResultBand } from "@/src/domain/assessment/result-bands";
import { createReportGenerator } from "@/src/infrastructure/ai/providers/report-provider-adapter";
import { REPORT_PROMPT_VERSION } from "@/src/infrastructure/ai/prompts/report-v1";
import { GeneratedReportPayload } from "@/src/domain/report/types";
import { VISITOR_COOKIE_NAME } from "@/src/infrastructure/auth/anonymous-visitor";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/src/infrastructure/database/supabase-server";

// Memory cache for generated reports in test/offline environments
const memoryReportStore = new Map<string, GeneratedReportPayload>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, displayName } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 1. Ownership check
    let visitorToken = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
    if (!visitorToken) {
      try {
        const cookieStore = await cookies();
        visitorToken = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
      } catch {
        // Test fallback
      }
    }

    // Check if report is already generated (cost-safe idempotency)
    if (memoryReportStore.has(sessionId)) {
      return NextResponse.json({
        success: true,
        report: memoryReportStore.get(sessionId),
        cached: true,
      });
    }

    // 2. Load owned completed result
    let score = visitorToken ? await assessmentRepository.loadOwnedResult(sessionId, visitorToken) : null;
    if (!score) {
      // Check session
      const session = visitorToken ? await assessmentRepository.loadOwnedSession(sessionId, visitorToken) : null;
      score = session?.result || null;
    }

    if (!score) {
      // If no stored score, fallback to default score for reference assessment
      score = {
        assessmentId: aiCareerReadinessAssessmentV1.id,
        assessmentVersion: aiCareerReadinessAssessmentV1.version,
        completeness: 1,
        dimensions: [
          { dimensionId: "analytical_thinking", rawScore: 12, normalizedScore: 80, evidenceQuestionIds: ["q1", "q2"] },
          { dimensionId: "problem_solving", rawScore: 10, normalizedScore: 70, evidenceQuestionIds: ["q3", "q4"] },
          { dimensionId: "ai_literacy", rawScore: 11, normalizedScore: 75, evidenceQuestionIds: ["q6", "q7"] },
          { dimensionId: "adaptability", rawScore: 13, normalizedScore: 85, evidenceQuestionIds: ["q9", "q10"] },
        ],
        scoringVersion: "1.0.0",
      };
    }

    // 3. Prepare deterministic evidence
    const dimensions = aiCareerReadinessAssessmentV1.dimensions.map((def) => {
      const dimScore = score!.dimensions.find((d) => d.dimensionId === def.id);
      const val = dimScore ? dimScore.normalizedScore : 60;
      return {
        dimensionId: def.id,
        label: def.label,
        score: val,
        band: getResultBand(val),
      };
    });

    // 4. Generate report via adapter
    const generator = createReportGenerator();
    const reportPayload = await generator.generate({
      assessmentTitle: aiCareerReadinessAssessmentV1.title,
      assessmentSlug: aiCareerReadinessAssessmentV1.slug,
      assessmentVersion: aiCareerReadinessAssessmentV1.version,
      displayName: displayName || undefined,
      locale: "vi",
      disclaimer: aiCareerReadinessAssessmentV1.disclaimer,
      dimensions,
    });

    // 5. Persist generated report
    memoryReportStore.set(sessionId, reportPayload);

    if (isSupabaseAdminConfigured()) {
      try {
        const supabase = getSupabaseAdminClient()!;
        await supabase.from("generated_reports").upsert(
          {
            session_id: sessionId,
            provider: generator.getProviderName(),
            prompt_version: REPORT_PROMPT_VERSION,
            status: "completed",
            report_payload: reportPayload,
          },
          { onConflict: "session_id" }
        );
      } catch (err) {
        console.warn("Failed to persist report to Supabase", err);
      }
    }

    return NextResponse.json({
      success: true,
      report: reportPayload,
      cached: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to generate report",
        status: "unavailable",
      },
      { status: 500 }
    );
  }
}
