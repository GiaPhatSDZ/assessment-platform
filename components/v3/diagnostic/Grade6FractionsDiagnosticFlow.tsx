"use client";

import React, { useState } from "react";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { evaluateSession } from "@/src/domain/diagnostic/engine";
import { detectKnowledgeGap, GapReport } from "@/src/domain/diagnostic/gap-engine";
import { generateLearningPack, LearningPack } from "@/src/domain/remediation/learning-pack";
import { ItemAttempt, NodeMasteryState } from "@/src/domain/diagnostic/types";
import { FocusDiagnosticWorkspace } from "@/components/v4/diagnostic/FocusDiagnosticWorkspace";
import { GapInsightView } from "@/components/v4/remediation/GapInsightView";
import { LearningPackView } from "../remediation/LearningPackView";
import { RetestWorkspace } from "../remediation/RetestWorkspace";
import { AppShell } from "@/components/v4/layout/AppShell";

type FlowPhase = "DIAGNOSTIC" | "GAP_REPORT" | "LEARNING_PACK" | "RETEST";

export function Grade6FractionsDiagnosticFlow() {
  const graph = CurriculumService.getFractionsKnowledgeGraph();
  const initialItems = CurriculumService.getInitialDiagnosticItems();
  const reTestItems = CurriculumService.getReTestItems();

  const [phase, setPhase] = useState<FlowPhase>("DIAGNOSTIC");
  const [sessionNodeStates, setSessionNodeStates] = useState<Record<string, NodeMasteryState>>({});
  const [gapReport, setGapReport] = useState<GapReport | null>(null);
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);

  // Phase 1 completion: Diagnostic completed
  const handleDiagnosticComplete = (attempts: ItemAttempt[]) => {
    const session = evaluateSession(
      `sess-${Date.now()}`,
      "math",
      "fractions",
      graph.nodes.map((n) => n.id),
      attempts
    );

    setSessionNodeStates(session.nodeStates);

    const report = detectKnowledgeGap(graph, session, "NODE-MATH-6-FRAC-03");
    setGapReport(report);

    const pack = generateLearningPack(report);
    setLearningPack(pack);

    setPhase("GAP_REPORT");
  };

  if (phase === "DIAGNOSTIC") {
    return (
      <AppShell mode="FOCUS" focusTitle="Toán Lớp 6 · Khảo sát mắt xích" focusExitHref="/learn">
        <FocusDiagnosticWorkspace
          items={initialItems}
          subjectTitle="Toán Lớp 6"
          topicTitle="Phép cộng phân số khác mẫu số"
          onComplete={handleDiagnosticComplete}
        />
      </AppShell>
    );
  }

  if (phase === "GAP_REPORT" && gapReport) {
    return (
      <AppShell mode="INSIGHT">
        <GapInsightView
          report={gapReport}
          graph={graph}
          nodeStates={sessionNodeStates}
          onProceedToLearningPack={() => setPhase("LEARNING_PACK")}
          onRetestDirectly={() => setPhase("RETEST")}
        />
      </AppShell>
    );
  }

  if (phase === "LEARNING_PACK" && learningPack) {
    return (
      <AppShell mode="INSIGHT">
        <LearningPackView
          pack={learningPack}
          onProceedToRetest={() => setPhase("RETEST")}
          onBackToReport={() => setPhase("GAP_REPORT")}
        />
      </AppShell>
    );
  }

  if (phase === "RETEST" && gapReport && learningPack) {
    return (
      <AppShell mode="FOCUS" focusTitle="Toán Lớp 6 · Kiểm tra lại sau khi ôn" focusExitHref="/learn">
        <RetestWorkspace
          reTestItems={reTestItems}
          targetNodeId={gapReport.targetNodeId}
          targetNodeLabel={gapReport.targetNodeLabel}
          learningPackId={learningPack.id}
        />
      </AppShell>
    );
  }

  return null;
}
