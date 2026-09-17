"use client";

import React, { useState } from "react";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { evaluateSession } from "@/src/domain/diagnostic/engine";
import { detectKnowledgeGap, GapReport } from "@/src/domain/diagnostic/gap-engine";
import { generateLearningPack, LearningPack } from "@/src/domain/remediation/learning-pack";
import { ItemAttempt, NodeMasteryState } from "@/src/domain/diagnostic/types";
import { DiagnosticWorkspace } from "./DiagnosticWorkspace";
import { GapReportView } from "../remediation/GapReportView";
import { LearningPackView } from "../remediation/LearningPackView";
import { RetestWorkspace } from "../remediation/RetestWorkspace";
import { AppShell } from "../layout/AppShell";

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

  return (
    <AppShell>
      <div className="py-6">
        {phase === "DIAGNOSTIC" && (
          <DiagnosticWorkspace
            items={initialItems}
            subjectTitle="Toán Lớp 6"
            topicTitle="Phép cộng phân số khác mẫu số"
            onComplete={handleDiagnosticComplete}
          />
        )}

        {phase === "GAP_REPORT" && gapReport && (
          <GapReportView
            report={gapReport}
            graph={graph}
            nodeStates={sessionNodeStates}
            onProceedToLearningPack={() => setPhase("LEARNING_PACK")}
            onRetestDirectly={() => setPhase("RETEST")}
          />
        )}

        {phase === "LEARNING_PACK" && learningPack && (
          <LearningPackView
            pack={learningPack}
            onProceedToRetest={() => setPhase("RETEST")}
            onBackToReport={() => setPhase("GAP_REPORT")}
          />
        )}

        {phase === "RETEST" && gapReport && learningPack && (
          <RetestWorkspace
            reTestItems={reTestItems}
            targetNodeId={gapReport.targetNodeId}
            targetNodeLabel={gapReport.targetNodeLabel}
            learningPackId={learningPack.id}
          />
        )}
      </div>
    </AppShell>
  );
}
