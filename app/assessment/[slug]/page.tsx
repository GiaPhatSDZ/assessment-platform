import { notFound } from "next/navigation";
import { Suspense } from "react";
import { aiCareerReadinessAssessmentV1, AI_CAREER_READINESS_SLUG } from "@/assessments/ai-career-readiness-v1";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";

interface AssessmentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AssessmentPageProps) {
  const { slug } = await params;
  if (slug !== AI_CAREER_READINESS_SLUG) {
    return { title: "Không tìm thấy bài đánh giá" };
  }
  return {
    title: `${aiCareerReadinessAssessmentV1.title} — Assessment Studio`,
    description: aiCareerReadinessAssessmentV1.description,
  };
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { slug } = await params;

  if (slug !== AI_CAREER_READINESS_SLUG) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center">Đang tải bài đánh giá...</div>}>
          <AssessmentRunner assessment={aiCareerReadinessAssessmentV1} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
