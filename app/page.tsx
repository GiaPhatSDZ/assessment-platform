import { AppShell } from "@/components/v4/layout/AppShell";
import { HeroAct } from "@/components/v4/landing/HeroAct";
import { GapTracingAct } from "@/components/v4/landing/GapTracingAct";
import { CurriculumRailAct } from "@/components/v4/landing/CurriculumRailAct";
import { ProductProgressionAct } from "@/components/v4/landing/ProductProgressionAct";
import { ParentSupportAct } from "@/components/v4/landing/ParentSupportAct";
import { SourceTrustBand } from "@/components/v4/landing/SourceTrustBand";
import { FaqSection } from "@/components/v4/landing/FaqSection";
import { FinalCtaSection } from "@/components/v4/landing/FinalCtaSection";

export default function HomePage() {
  return (
    <AppShell mode="BRAND">
      {/* Act 1: Problem & Product Window */}
      <HeroAct />

      {/* Act 2: Why Wrong Answers Happen & Prerequisite Tracing */}
      <GapTracingAct />

      {/* Act 3: Curriculum Depth & Stage Rail */}
      <CurriculumRailAct />

      {/* Act 4: From Gap to Learning Progression */}
      <ProductProgressionAct />

      {/* Act 5: Parent Support Scene with Contextual Copilot */}
      <ParentSupportAct />

      {/* Authority Accreditation, FAQ & Final CTA */}
      <SourceTrustBand />
      <FaqSection />
      <FinalCtaSection />
    </AppShell>
  );
}
