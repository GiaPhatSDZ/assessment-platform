import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { ReportPageContent } from "@/components/report/ReportPageContent";

interface ReportPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: "Báo Cáo Năng Lực Chi Tiết — Assessment Studio",
    description: "Báo cáo phân tích chuyên sâu và kế hoạch hành động cá nhân hóa.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <ReportPageContent sessionId={sessionId} />
      </main>
      <Footer />
    </div>
  );
}
