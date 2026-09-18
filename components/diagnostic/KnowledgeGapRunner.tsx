/**
 * @deprecated HISTORICAL_BASELINE_PROTOTYPE
 *
 * HISTORICAL BASELINE
 * SUPERSEDED FOR CURRENT PUBLIC PRODUCT DIRECTION
 * RETAINED AS REUSABLE PLATFORM-CORE REFERENCE
 *
 * This component contains obsolete demo/Gemini prompt-runner behavior from early prototyping.
 * Under current AI School authority (docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md):
 * - Student runtime must NOT execute generative AI directly.
 * - Diagnostic flows must source exclusively through reviewed and published curriculum gates.
 * - This component is NOT part of the active student runtime and is unreferenced by production routes.
 *
 * DO NOT IMPORT THIS COMPONENT INTO ACTIVE STUDENT ROUTES.
 */
"use client";

import React, { useState } from "react";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { gradeAttempt, evaluateSession } from "@/src/domain/diagnostic/engine";
import { detectKnowledgeGap, GapReport } from "@/src/domain/diagnostic/gap-engine";
import { generateLearningPack, LearningPack } from "@/src/domain/remediation/learning-pack";
import { ManualGeminiNotebookProvider } from "@/src/infrastructure/remediation/gemini-notebook/manual-provider";
import { processReTestOutcome, MasteryTransitionRecord } from "@/src/domain/mastery/history";
import { ItemAttempt } from "@/src/domain/diagnostic/types";

export function KnowledgeGapRunner() {
  const graph = CurriculumService.getFractionsKnowledgeGraph();
  const initialItems = CurriculumService.getInitialDiagnosticItems();
  const reTestItems = CurriculumService.getReTestItems();

  // State
  const [currentPhase, setCurrentPhase] = useState<"DIAGNOSTIC" | "GAP_REPORT" | "LEARNING_PACK" | "RETEST" | "MASTERY_ACHIEVED">("DIAGNOSTIC");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [gapReport, setGapReport] = useState<GapReport | null>(null);
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);
  const [reTestAnswers, setReTestAnswers] = useState<Record<string, string>>({});
  const [masteryRecord, setMasteryRecord] = useState<MasteryTransitionRecord | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Phase 1: Diagnostic submission
  const handleDiagnosticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attempts: ItemAttempt[] = initialItems.map((item) => {
      const selected = userAnswers[item.id] || "";
      return gradeAttempt(item, selected);
    });

    const session = evaluateSession(
      `sess-${Date.now()}`,
      "math",
      "fractions",
      graph.nodes.map((n) => n.id),
      attempts
    );

    const report = detectKnowledgeGap(graph, session, "NODE-MATH-6-FRAC-03");
    setGapReport(report);

    const pack = generateLearningPack(report);
    setLearningPack(pack);

    setCurrentPhase("GAP_REPORT");
  };

  // Phase 4: Re-test submission
  const handleReTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attempts: ItemAttempt[] = reTestItems.map((item) => {
      const selected = reTestAnswers[item.id] || "";
      return gradeAttempt(item, selected);
    });

    if (gapReport) {
      const transition = processReTestOutcome(
        "student-local",
        gapReport.targetNodeId,
        gapReport.targetNodeLabel,
        "DEVELOPING",
        "MEDIUM",
        attempts,
        learningPack?.id
      );
      setMasteryRecord(transition);
      setCurrentPhase("MASTERY_ACHIEVED");
    }
  };

  const handleCopyPrompt = () => {
    if (learningPack) {
      const guide = ManualGeminiNotebookProvider.getRemediationGuide(learningPack);
      navigator.clipboard.writeText(guide.suggestedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  // Quick preset buttons for demonstration
  const handleLoadTypicalStruggleScenario = () => {
    // Typical student: Fails target node with distractor B (cộng tử với tử, mẫu với mẫu)
    // Fails common denom node with distractor B (nhân 6*9=54 thay vì BCNN)
    // Fails BCNN node with distractor B (nhầm ƯCLN)
    // Passes same denom addition
    setUserAnswers({
      "ITEM-DIAG-FRAC-01": "B",
      "ITEM-DIAG-FRAC-02": "B",
      "ITEM-DIAG-INT-01": "B",
      "ITEM-DIAG-FRAC-SAME-01": "A",
    });
  };

  const handleLoadCorrectPreset = () => {
    setUserAnswers({
      "ITEM-DIAG-FRAC-01": "A",
      "ITEM-DIAG-FRAC-02": "A",
      "ITEM-DIAG-INT-01": "A",
      "ITEM-DIAG-FRAC-SAME-01": "A",
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Historical Prototype Archival Notice */}
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <p className="font-bold uppercase tracking-wide">
          [LƯU TRỮ LỊCH SỬ · NGUYÊN MẪU THỬ NGHIỆM KHÔNG THUỘC QUY TRÌNH CHÍNH THỨC]
        </p>
        <p className="mt-1 leading-relaxed">
          Thành phần này là nguyên mẫu demo lịch sử (Gemini-prompt flow). Quy trình học sinh hiện tại tuân thủ AI School Authority (không chạy AI tạo sinh trực tiếp trên client; chỉ hiển thị nội dung đã qua kiểm duyệt).
        </p>
      </div>

      {/* Official Curriculum Header Banner */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chuẩn Chương Trình GDPT 2018 · Bộ GD&ĐT
            </span>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            Thông tư 32/2018/TT-BGDĐT
          </span>
        </div>
        <div className="mt-4">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Chẩn Đoán & Lần Theo Lỗ Hổng Kiến Thức: Phân Số (Toán Lớp 6)
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Hệ thống không đánh giá điểm số chung chung hay dùng AI để phỏng đoán. Mọi chẩn đoán đều đối chiếu chính xác với cây kiến thức tiên quyết có căn cứ nguồn chính thức.
          </p>
        </div>

        {/* Phase progress indicator */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
          <span className={`rounded-lg px-3 py-1.5 transition-colors ${currentPhase === "DIAGNOSTIC" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
            1. Bài Chẩn Đoán Ban Đầu
          </span>
          <span className={`rounded-lg px-3 py-1.5 transition-colors ${currentPhase === "GAP_REPORT" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
            2. Cây Lỗ Hổng Tiên Quyết
          </span>
          <span className={`rounded-lg px-3 py-1.5 transition-colors ${currentPhase === "LEARNING_PACK" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
            3. Gói Học Tập & Gemini Notebook
          </span>
          <span className={`rounded-lg px-3 py-1.5 transition-colors ${currentPhase === "RETEST" || currentPhase === "MASTERY_ACHIEVED" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
            4. Kiểm Tra Lại & Khắc Phục Lỗ Hổng
          </span>
        </div>
      </div>

      {/* PHASE 1: DIAGNOSTIC RUNNER */}
      {currentPhase === "DIAGNOSTIC" && (
        <form onSubmit={handleDiagnosticSubmit} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-500 uppercase">
              Trả lời 4 câu hỏi chẩn đoán để rà soát toàn diện:
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLoadTypicalStruggleScenario}
                className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
              >
                Mô phỏng ngộ nhận thực tế (Học sinh hổng BCNN)
              </button>
              <button
                type="button"
                onClick={handleLoadCorrectPreset}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Điền đáp án đúng toàn bộ
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {initialItems.map((item, idx) => {
              const selected = userAnswers[item.id] || "";
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Câu {idx + 1} / {initialItems.length}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Mục tiêu: {graph.nodes.find((n) => n.id === item.primaryNodeId)?.label}
                    </span>
                  </div>

                  <p className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
                    {item.prompt}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {item.options?.map((opt) => {
                      const isSelected = selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setUserAnswers((prev) => ({ ...prev, [item.id]: opt.id }))}
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={Object.keys(userAnswers).length < initialItems.length}
              className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              Chẩn Đoán Lỗ Hổng Kiến Thức →
            </button>
          </div>
        </form>
      )}

      {/* PHASE 2: GAP REPORT & PREREQUISITE GRAPH VISUALIZATION */}
      {currentPhase === "GAP_REPORT" && gapReport && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-3 w-3 rounded-full ${gapReport.classification === "NO_GAP" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Kết Quả Phân Tích Lỗ Hổng Tiên Quyết
              </h2>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
              <p className="font-semibold">{gapReport.explanation}</p>
              <p className="mt-1 text-xs opacity-90">{gapReport.actionableNextStep}</p>
            </div>

            {/* Tree visualization */}
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sơ đồ chuỗi tri thức tiên quyết & bằng chứng thu thập được:
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {graph.nodes.map((node) => {
                  const isFailingRoot = node.id === gapReport.rootPrerequisiteNodeId;
                  const isTarget = node.id === gapReport.targetNodeId;
                  const isSecure = !isFailingRoot && (!isTarget || gapReport.classification === "NO_GAP");

                  return (
                    <div
                      key={node.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isFailingRoot
                          ? "border-amber-400 bg-amber-50/80 shadow-sm dark:border-amber-600 dark:bg-amber-950/40"
                          : isTarget && gapReport.classification !== "NO_GAP"
                          ? "border-red-300 bg-red-50/40 dark:border-red-800 dark:bg-red-950/30"
                          : "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                          {node.code} (Lớp {node.grade})
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isFailingRoot
                              ? "bg-amber-600 text-white"
                              : isTarget && gapReport.classification !== "NO_GAP"
                              ? "bg-red-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isFailingRoot ? "GỐC RỄ LỖ HỔNG" : isTarget && gapReport.classification !== "NO_GAP" ? "CHƯA ĐẠT" : "ĐÃ VỮNG"}
                        </span>
                      </div>
                      <h4 className="mt-2 font-serif text-base font-bold text-slate-900 dark:text-white">
                        {node.label}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {node.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detected Misconceptions */}
            {gapReport.detectedMisconceptions.length > 0 && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ngộ nhận sư phạm phát hiện qua phương án chọn:
                </h4>
                <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {gapReport.detectedMisconceptions.map((tag) => (
                    <li key={tag} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>{tag === "ADD_NUM_AND_DENOM_DIRECTLY" ? "Ngộ nhận cộng trực tiếp cả tử số và mẫu số với nhau: (a+c)/(b+d)" : tag === "CONFUSE_GCD_WITH_LCM" ? "Nhầm lẫn giữa Ước chung lớn nhất (ƯCLN) và Bội chung nhỏ nhất (BCNN)" : tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentPhase("DIAGNOSTIC")}
                className="text-xs font-semibold text-slate-600 hover:underline dark:text-slate-400"
              >
                ← Làm lại bài chẩn đoán
              </button>
              <button
                type="button"
                onClick={() => setCurrentPhase("LEARNING_PACK")}
                className="rounded-full bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                Xem Gói Học Tập Bồi Đắp Lỗ Hổng →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: LEARNING PACK & GEMINI NOTEBOOK */}
      {currentPhase === "LEARNING_PACK" && learningPack && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Gói Bồi Đắp Tri Thức Khắc Phục Lỗ Hổng
            </span>

            <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {learningPack.objective}
            </h2>

            {/* Parent Guide */}
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs leading-relaxed text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200">
              <span className="font-bold uppercase tracking-wider block mb-1">Dành Cho Phụ Huynh:</span>
              {learningPack.parentGuide}
            </div>

            {/* Worked Examples */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ví dụ mẫu có hướng dẫn từng bước:
              </h3>
              <div className="mt-3 space-y-2">
                {learningPack.workedExamplePlan.map((ex, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
                    {ex}
                  </div>
                ))}
              </div>
            </div>

            {/* Gemini Notebook Protocol Card */}
            <div className="mt-6 rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 p-6 dark:border-indigo-500/20 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    GIA SƯ AI NGUỒN CHUẨN
                  </span>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Giao Thức Học Cùng Gemini Notebook
                  </h4>
                </div>
                <a
                  href="https://notebooklm.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Mở Gemini Notebook ↗
                </a>
              </div>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Sử dụng sổ tay nghiên cứu có gắn nguồn chính thức của Google để con được giải thích từng bước mà không lo AI bịa đặt kiến thức:
              </p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Lời nhắc sư phạm chuẩn (Đã khóa nguồn Bộ GD&ĐT):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {copiedPrompt ? "✓ Đã sao chép vào bộ nhớ tạm!" : "Sao chép lời nhắc (Copy Prompt)"}
                  </button>
                </div>
                <pre className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {ManualGeminiNotebookProvider.getRemediationGuide(learningPack).suggestedPrompt}
                </pre>
              </div>
            </div>

            <div className="mt-8 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentPhase("GAP_REPORT")}
                className="text-xs font-semibold text-slate-600 hover:underline dark:text-slate-400"
              >
                ← Xem lại cây phân tích
              </button>
              <button
                type="button"
                onClick={() => setCurrentPhase("RETEST")}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Đã Ôn Tập Xong: Làm Bài Kiểm Tra Lại (Re-test) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: RETEST FORM */}
      {currentPhase === "RETEST" && (
        <form onSubmit={handleReTestSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Bài Kiểm Tra Lại (Song Song) Xác Nhận Làm Chủ Tri Thức
            </span>
            <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Kiểm Tra Lại Để Đóng Lỗ Hổng Kiến Thức
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Học sinh giải 4 câu hỏi song song với các con số mới để chứng minh việc làm chủ thực chất.
            </p>
          </div>

          <div className="space-y-6">
            {reTestItems.map((item, idx) => {
              const selected = reTestAnswers[item.id] || "";
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Câu hỏi kiểm tra lại {idx + 1} / {reTestItems.length}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {graph.nodes.find((n) => n.id === item.primaryNodeId)?.label}
                    </span>
                  </div>

                  <p className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
                    {item.prompt}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {item.options?.map((opt) => {
                      const isSelected = selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setReTestAnswers((prev) => ({ ...prev, [item.id]: opt.id }))}
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={Object.keys(reTestAnswers).length < reTestItems.length}
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-500 disabled:opacity-40"
            >
              Nộp Bài Kiểm Tra Lại & Cập Nhật Hồ Sơ →
            </button>
          </div>
        </form>
      )}

      {/* PHASE 5: MASTERY ACHIEVED TIMELINE */}
      {currentPhase === "MASTERY_ACHIEVED" && masteryRecord && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-white p-8 text-center shadow-lg dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ĐÃ KHẮC PHỤC THÀNH CÔNG LỖ HỔNG TRI THỨC
            </span>

            <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              Xác Nhận Làm Chủ: {masteryRecord.nodeLabel}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {masteryRecord.reason}
            </p>

            {/* Immutable Audit Timeline */}
            <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-6 text-left dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nhật Ký Tiến Bộ Bằng Chứng (Audit Trail):
              </h3>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Khảo sát ban đầu: Trạng thái {masteryRecord.previousState} ({masteryRecord.previousConfidence} confidence)
                    </p>
                    <p className="text-xs text-slate-500">
                      Phát hiện ngộ nhận và lỗi ở bài kiểm tra chẩn đoán ban đầu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Hành động bồi đắp: Gói học tập & Hướng dẫn sư phạm Gemini Notebook
                    </p>
                    <p className="text-xs text-slate-500">
                      Ôn tập lại kỹ thuật BCNN và các bước quy đồng mẫu số chuẩn mực.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Kiểm tra lại: Trạng thái {masteryRecord.newState} ({masteryRecord.newConfidence} confidence)
                    </p>
                    <p className="text-xs text-slate-500">
                      Đạt {masteryRecord.reTestCorrectCount}/{masteryRecord.reTestAttemptsCount} câu hỏi song song; lỗ hổng kiến thức chính thức được đóng lại.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setUserAnswers({});
                  setReTestAnswers({});
                  setGapReport(null);
                  setLearningPack(null);
                  setMasteryRecord(null);
                  setCurrentPhase("DIAGNOSTIC");
                }}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Khảo Sát Chủ Đề Khác / Thử Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
