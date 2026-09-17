"use client";

import React, { useState } from "react";
import { GapReport } from "@/src/domain/diagnostic/gap-engine";
import { KnowledgeGraph } from "@/src/domain/curriculum/types";
import { NodeMasteryState } from "@/src/domain/diagnostic/types";
import { PrerequisiteTree } from "@/components/v3/curriculum/PrerequisiteTree";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface GapInsightViewProps {
  report: GapReport;
  graph: KnowledgeGraph;
  nodeStates: Record<string, NodeMasteryState>;
  onProceedToLearningPack: () => void;
  onRetestDirectly: () => void;
}

export function GapInsightView({
  report,
  graph,
  nodeStates,
  onProceedToLearningPack,
  onRetestDirectly,
}: GapInsightViewProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showParentCopilot, setShowParentCopilot] = useState(true);

  return (
    <div className="mx-auto w-full max-w-insight space-y-10 animate-fadeIn">
      {/* Top Banner: Human-scale Conclusion Headline */}
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
          Kết Quả Chẩn Đoán Thực Chất
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink leading-tight">
          Có dấu hiệu con cần củng cố &ldquo;{report.targetNodeLabel}&rdquo; trước.
        </h1>

        {/* Quiet Evidence Row */}
        <p className="text-xs sm:text-sm font-medium text-ink-muted flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{report.prerequisiteChainPath?.length || 3} câu kiểm tra</span>
          <span className="text-line">•</span>
          <span>{report.detectedMisconceptions?.length || 2} lỗi cùng mô thức</span>
          <span className="text-line">•</span>
          <span>1 mắt xích nền tảng chưa chắc chắn</span>
        </p>
      </div>

      {/* Main Visual Centerpiece: The Knowledge Path Motif */}
      <div className="rounded-marketingWindow border border-line/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/50 pb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              Bản Đồ Mắt Xích Tri Thức Của Con
            </h2>
            <p className="text-xs text-ink-muted">
              Biểu diễn trực quan các khái niệm đã vững và điểm nghẽn sư phạm cần tháo gỡ.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-brand">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              Đã vững
            </span>
            <span className="inline-flex items-center gap-1 text-danger">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
              Cần củng cố
            </span>
          </div>
        </div>

        {/* Render Interactive Prerequisite Tree */}
        <PrerequisiteTree nodes={graph.nodes} edges={graph.edges} nodeStates={nodeStates} />

        {/* Human Language Misconception Insight */}
        <div className="rounded-app bg-danger-soft/40 border border-danger/30 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-danger uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>Phân tích liên kết tiên quyết</span>
          </div>
          <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
            {report.explanation ||
              "Khi cộng hai phân số khác mẫu số, con có phản xạ cộng trực tiếp tử số với tử số và mẫu số với mẫu số. Điều này xuất phát từ việc con chưa ghi nhớ bước quy đồng mẫu số chung trước khi thực hiện phép cộng."}
          </p>
        </div>

        {/* Expandable Pedagogical Reasoning Drawer */}
        <div className="border-t border-line/40 pt-4">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-brand hover:underline"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Vì sao hệ thống đưa ra gợi ý này?
            </span>
            {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showExplanation && (
            <div className="mt-3 p-4 rounded-app bg-canvas text-xs text-ink-muted leading-relaxed space-y-2 border border-line/40 animate-fadeIn">
              <p>
                Đồ thị tri thức chuẩn GDPT 2018 quy định: Để thực hiện được phép cộng hai phân số khác mẫu ở Lớp 6, học sinh bắt buộc phải thành thạo kỹ năng quy đồng mẫu số ở Lớp 5 và nhận biết bội chung nhỏ nhất.
              </p>
              <p>
                Phương pháp sư phạm tối ưu không phải là bắt con làm thêm 50 bài cộng phân số của lớp 6, mà là quay lại củng cố đúng bài &ldquo;Quy đồng mẫu số&rdquo; trong 15-20 phút.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Companion Panel for Parents (Parent Copilot) */}
      {showParentCopilot && (
        <div className="rounded-marketingWindow border border-line/80 bg-surfaceStrong p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-line/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand-soft flex items-center justify-center text-brand">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Gợi Ý Cho Phụ Huynh (Parent Copilot)
                </h3>
                <p className="text-2xs text-ink-muted">
                  Giải pháp sư phạm không áp lực để đồng hành cùng con tại nhà
                </p>
              </div>
            </div>
            <span className="text-2xs font-mono font-semibold text-brand bg-brand-soft/60 px-2.5 py-1 rounded-pill">
              Dành cho phụ huynh
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-app bg-accent-soft/40 border border-accent/30 text-ink leading-relaxed">
              <span className="font-bold text-amber-900 block mb-1">
                Câu hỏi gợi mở nên hỏi con tối nay:
              </span>
              &ldquo;Nếu mẹ có một nửa quả cam (1/2) và con có một phần tư quả cam (1/4), nếu gộp lại thì ta có 2/6 quả cam được không? Hay ta phải chia nửa quả cam của mẹ thành 2 phần tư trước?&rdquo;
            </div>

            <div className="flex items-center gap-2 text-2xs text-ink-muted pt-1">
              <BookOpen className="h-3.5 w-3.5 text-brand" />
              <span>
                Cơ sở sư phạm: Phương pháp mô hình hóa trực quan (Singapore/CPA Approach) theo chương trình GDPT 2018.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3.5 pt-4">
        <button
          type="button"
          onClick={onRetestDirectly}
          className="inline-flex items-center justify-center gap-2 rounded-app border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-ink hover:bg-canvas transition-colors shadow-2xs"
        >
          <RefreshCw className="h-4 w-4 text-ink-muted" />
          <span>Kiểm tra lại ngay</span>
        </button>

        <button
          type="button"
          onClick={onProceedToLearningPack}
          className="inline-flex items-center justify-center gap-2 rounded-app bg-brand px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark transition-all shadow-2xs active:scale-[0.98]"
        >
          <span>Xem gói học bù từ SGK</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
