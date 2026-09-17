import { AppShell } from "@/components/v3/layout/AppShell";
import { HeroSection } from "@/components/v3/landing/HeroSection";
import { GapTracingSection } from "@/components/v3/landing/GapTracingSection";
import { CurriculumTrustSection } from "@/components/v3/landing/CurriculumTrustSection";
import { CatalogPreviewSection } from "@/components/v3/landing/CatalogPreviewSection";
import { WorkflowExampleSection } from "@/components/v3/landing/WorkflowExampleSection";
import { GeminiHandoffSection } from "@/components/v3/landing/GeminiHandoffSection";
import { ParentRoleSection } from "@/components/v3/landing/ParentRoleSection";
import { PrivacyNoRankingSection } from "@/components/v3/landing/PrivacyNoRankingSection";
import { FaqSection } from "@/components/v3/landing/FaqSection";
import { FinalCtaSection } from "@/components/v3/landing/FinalCtaSection";

export default function HomePage() {
  return (
    <AppShell>
      <HeroSection />
      <GapTracingSection />
      <CurriculumTrustSection />
      <CatalogPreviewSection />
      <WorkflowExampleSection />
      <GeminiHandoffSection />
      <ParentRoleSection />
      <PrivacyNoRankingSection />
      <FaqSection />
      <FinalCtaSection />
    </AppShell>
  );
}
