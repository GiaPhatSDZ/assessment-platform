import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "./supabase-server";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";

export async function seedReferenceAssessment(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseAdminConfigured()) {
    return {
      success: false,
      message: "Supabase admin credentials not configured. Skipping remote database seed.",
    };
  }

  const supabase = getSupabaseAdminClient()!;

  // 1. Upsert assessment identity
  const { error: asmtError } = await supabase.from("assessments").upsert(
    {
      id: aiCareerReadinessAssessmentV1.id,
      slug: aiCareerReadinessAssessmentV1.slug,
      title: aiCareerReadinessAssessmentV1.title,
      locale: aiCareerReadinessAssessmentV1.locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (asmtError) {
    return { success: false, message: `Failed to seed assessment: ${asmtError.message}` };
  }

  // 2. Upsert assessment version
  const versionId = `${aiCareerReadinessAssessmentV1.id}_v${aiCareerReadinessAssessmentV1.version}`;
  const { error: versionError } = await supabase.from("assessment_versions").upsert(
    {
      id: versionId,
      assessment_id: aiCareerReadinessAssessmentV1.id,
      version: aiCareerReadinessAssessmentV1.version,
      status: aiCareerReadinessAssessmentV1.status,
      definition: aiCareerReadinessAssessmentV1,
      published_at: new Date().toISOString(),
    },
    { onConflict: "assessment_id,version" }
  );

  if (versionError) {
    return { success: false, message: `Failed to seed version: ${versionError.message}` };
  }

  // 3. Seed demo referral source
  await supabase.from("referral_sources").upsert(
    [
      { code: "DEMO123", description: "Mã giới thiệu demo" },
      { code: "DIRECT", description: "Truy cập trực tiếp" },
    ],
    { onConflict: "code" }
  );

  return { success: true, message: "Successfully seeded reference assessment" };
}
