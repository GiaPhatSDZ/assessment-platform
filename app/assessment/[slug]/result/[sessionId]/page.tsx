import { notFound } from "next/navigation";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { ResultPageContent } from "@/components/results/ResultPageContent";
import { AI_CAREER_READINESS_SLUG } from "@/assessments/ai-career-readiness-v1";

interface ResultPageProps {
  params: Promise<{
    slug: string;
    sessionId: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: "Kết Quả Đánh Giá Năng Lực — Assessment Studio",
    description: "Kết quả tự đánh giá năng lực nghề nghiệp chuẩn xác và bảo mật.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { slug, sessionId } = await params;

  if (slug !== AI_CAREER_READINESS_SLUG) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <ResultPageContent slug={slug} sessionId={sessionId} />
      </main>
      <Footer />
    </div>
  );
}
