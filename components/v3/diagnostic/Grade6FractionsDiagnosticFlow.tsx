"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, ShieldAlert, ArrowRight } from "lucide-react";
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
import { MathText } from "@/components/math/MathText";

type FlowPhase = "DIAGNOSTIC" | "GAP_REPORT" | "LEARNING_PACK" | "RETEST";

export function Grade6FractionsDiagnosticFlow() {
  const graph = CurriculumService.getFractionsKnowledgeGraph();
  const initialItems = CurriculumService.getInitialDiagnosticItems();
  const reTestItems = CurriculumService.getReTestItems();

  const [phase, setPhase] = useState<FlowPhase>("DIAGNOSTIC");
  const [sessionNodeStates, setSessionNodeStates] = useState<Record<string, NodeMasteryState>>({});
  const [gapReport, setGapReport] = useState<GapReport | null>(null);
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);

  // Fail-closed gate: When items are unreviewed/DRAFT, fail closed to CONTENT_NOT_AVAILABLE
  if (initialItems.length === 0) {
    return (
      <AppShell mode="FOCUS" focusTitle="Toán Lớp 6 · Trạng thái thẩm định học liệu" focusExitHref="/learn">
        <div data-testid="content-not-available" className="mx-auto w-full max-w-diagnostic space-y-8 animate-fadeIn py-8">
          <div className="rounded-marketingWindow border border-amber-200/80 bg-surface p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-amber-50 border border-amber-200 px-3 py-1 font-mono text-2xs font-bold text-amber-800">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>CONTENT_NOT_AVAILABLE · ĐANG THẨM ĐỊNH (DRAFT)</span>
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink tracking-tight">
                Học liệu chẩn đoán đang trong quá trình thẩm định sư phạm
              </h1>
              <div className="text-xs font-semibold text-brand">
                <MathText text="Chủ đề chẩn đoán: Phép cộng phân số $\frac{a}{m} + \frac{b}{n}$ (Toán Lớp 6)" />
              </div>
              <p className="text-sm text-ink-muted leading-relaxed font-normal">
                Toàn bộ câu hỏi chẩn đoán môn Toán Lớp 6 (Chủ đề: Phép cộng phân số khác mẫu số) hiện ở trạng thái <strong className="font-semibold text-ink">DRAFT</strong> và đang chờ biên bản thẩm định độc lập từ hội đồng chuyên môn theo Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT).
              </p>
            </div>

            <div className="rounded-app border border-line/70 bg-surfaceStrong p-4 sm:p-5 space-y-3 text-xs text-ink">
              <div className="font-semibold text-brand flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-brand" />
                <span>Cam kết an toàn sư phạm &amp; Cổng phát hành R2.2:</span>
              </div>
              <ul className="space-y-2 text-ink-muted list-disc list-inside">
                <li>
                  <strong className="text-ink">Không phục vụ câu hỏi chưa kiểm duyệt:</strong> Hệ thống tự động đóng phòng thi khi chưa có chữ ký số xác thực từ chuyên gia sư phạm.
                </li>
                <li>
                  <strong className="text-ink">Nghiêm cấm AI tạo sinh tùy tiện:</strong> Không dùng Generative AI để tự bịa câu hỏi hay giả lập đánh giá năng lực học sinh.
                </li>
                <li>
                  <strong className="text-ink">Đối soát nguồn gốc minh bạch:</strong> Học liệu sẽ được mở ngay sau khi hoàn tất quy trình thẩm định nội dung.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line/50">
              <Link
                href="/curriculum"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-dark transition"
              >
                <span>Xem danh mục chương trình chuẩn</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/learn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition"
              >
                <span>Quay lại góc học tập</span>
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

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
