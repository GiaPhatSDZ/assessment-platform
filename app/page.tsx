import { Suspense } from "react";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { V3VerticalSliceSection } from "@/components/marketing/V3VerticalSliceSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Faq } from "@/components/marketing/Faq";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Đang tải...</div>}>
          <Hero />
        </Suspense>
        <V3VerticalSliceSection />
        <HowItWorks />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
