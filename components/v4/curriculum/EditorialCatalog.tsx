"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PrerequisiteTree } from "@/components/v3/curriculum/PrerequisiteTree";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import catalog from "@/curriculum/vietnam/catalog.json";
import coverageRegistry from "@/curriculum/vietnam/coverage-registry.json";
import { CoverageStatus, SubjectCoverageRecord } from "@/src/domain/content/schema";
import {
  ArrowRight,
  BookCheck,
  Clock,
  Ban,
  FileCheck2,
  ListTree,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Search,
} from "lucide-react";

type StageId = "PRESCHOOL" | "PRIMARY" | "LOWER_SECONDARY" | "UPPER_SECONDARY";

const STAGE_CONFIG: Record<
  StageId,
  { label: string; range: string; stageKey: string; standard: string }
> = {
  PRESCHOOL: {
    label: "Mầm non",
    range: "3 – 6 tuổi",
    stageKey: "preschool",
    standard: "Thông tư 28/2016/TT-BGDĐT & Đề án đổi mới CTGDMN 2026",
  },
  PRIMARY: {
    label: "Tiểu học",
    range: "Lớp 1 – 5",
    stageKey: "primary",
    standard: "Thông tư 32/2018/TT-BGDĐT",
  },
  LOWER_SECONDARY: {
    label: "Trung học cơ sở (THCS)",
    range: "Lớp 6 – 9",
    stageKey: "lower-secondary",
    standard: "Thông tư 32/2018/TT-BGDĐT",
  },
  UPPER_SECONDARY: {
    label: "Trung học phổ thông (THPT)",
    range: "Lớp 10 – 12",
    stageKey: "upper-secondary",
    standard: "Thông tư 32/2018/TT-BGDĐT",
  },
};

function StatusBadge({ status }: { status: CoverageStatus }) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-pill">
          <BookCheck className="h-3.5 w-3.5 text-emerald-600" />
          Đã phát hành (PUBLISHED)
        </span>
      );
    case "DIAGNOSTIC_READY":
      return (
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-pill">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600" />
          Sẵn sàng chẩn đoán (DIAGNOSTIC_READY)
        </span>
      );
    case "CONTENT_IN_REVIEW":
      return (
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-pill">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          Đang thẩm định nội dung (CONTENT_IN_REVIEW)
        </span>
      );
    case "OUTCOMES_EXTRACTED":
      return (
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-pill">
          <ListTree className="h-3.5 w-3.5 text-indigo-600" />
          Đã bóc tách YCCĐ (OUTCOMES_EXTRACTED)
        </span>
      );
    case "SOURCE_INGESTED":
      return (
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-pill">
          <FileCheck2 className="h-3.5 w-3.5 text-slate-500" />
          Đã nạp nguồn pháp lý (SOURCE_INGESTED)
        </span>
      );
    case "NOT_INGESTED":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1 rounded-pill">
          <Ban className="h-3.5 w-3.5 text-stone-400" />
          Chưa nạp nguồn (NOT_INGESTED)
        </span>
      );
  }
}

export function EditorialCatalog() {
  const [activeStage, setActiveStage] = useState<StageId>("LOWER_SECONDARY");
  const [activeTab, setActiveTab] = useState<"STAGE_VIEW" | "FULL_REGISTRY">("STAGE_VIEW");
  const [showGraphDrawer, setShowGraphDrawer] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const graph = CurriculumService.getFractionsKnowledgeGraph();
  const currentStageConfig = STAGE_CONFIG[activeStage];

  // Derive counts dynamically from coverage registry
  const totalSubjects = coverageRegistry.length;
  const publishedCount = coverageRegistry.filter((r) => r.sourceStatus === "PUBLISHED").length;
  const inReviewCount = coverageRegistry.filter((r) => r.sourceStatus === "CONTENT_IN_REVIEW").length;
  const notIngestedCount = coverageRegistry.filter((r) => r.sourceStatus === "NOT_INGESTED").length;

  // Filter items for current stage from the authoritative registry
  const stageRecords = useMemo(() => {
    return (coverageRegistry as SubjectCoverageRecord[]).filter(
      (r) => r.stage === currentStageConfig.stageKey
    );
  }, [currentStageConfig.stageKey]);

  // Search filtered records for full table
  const filteredRegistry = useMemo(() => {
    if (!searchQuery.trim()) return coverageRegistry as SubjectCoverageRecord[];
    const q = searchQuery.toLowerCase();
    return (coverageRegistry as SubjectCoverageRecord[]).filter(
      (r) =>
        r.subjectNameVi.toLowerCase().includes(q) ||
        r.subjectId.toLowerCase().includes(q) ||
        String(r.grade).toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-10">
      {/* Editorial Catalog Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
          Danh Mục Chương Trình Quốc Gia & Cây Tri Thức
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-ink leading-tight">
          Cây Tri Thức & Danh Mục Khảo Sát
        </h1>
        <p className="text-base text-ink-muted leading-relaxed font-normal">
          Dữ liệu được kết xuất trực tiếp từ danh mục Chương trình GDPT 2018 và CTGDMN. Mọi trạng thái đều phản ánh trung thực mức độ kiểm duyệt học liệu thực tế.
        </p>
      </div>

      {/* Coverage Truth Audit Card */}
      <div className="rounded-app border border-line bg-surface p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/50 pb-3">
          <div className="flex items-center gap-2 text-ink">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-sm sm:text-base">
              Kiểm toán tính trung thực về độ phủ (Coverage Truth)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xs font-mono bg-canvas px-3 py-1 rounded-pill text-ink-muted border border-line/40">
              Tổng số môn: {totalSubjects}
            </span>
            <span className="text-2xs font-mono bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-pill">
              Đang thẩm định: {inReviewCount}
            </span>
            <span className="text-2xs font-mono bg-stone-100 text-stone-600 border border-stone-200 px-3 py-1 rounded-pill">
              Chưa nạp: {notIngestedCount}
            </span>
          </div>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          <strong>Nguyên tắc đạo đức sư phạm:</strong> Hệ thống không tạo bài học hay câu hỏi bằng AI hàng loạt. Một môn học chỉ được phát hành khi đã hoàn tất quy trình đối soát học liệu từ nguồn văn bản pháp lý chính thức. Mọi dữ liệu hiển thị bên dưới đều được nạp trực tiếp từ danh mục và tệp tin thực tế trên đĩa.
        </p>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("STAGE_VIEW")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "STAGE_VIEW"
                ? "bg-brand text-white shadow-2xs"
                : "bg-surfaceStrong text-ink-muted hover:text-ink border border-line/50"
            }`}
          >
            Theo cấp học (Stage View)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FULL_REGISTRY")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "FULL_REGISTRY"
                ? "bg-brand text-white shadow-2xs"
                : "bg-surfaceStrong text-ink-muted hover:text-ink border border-line/50"
            }`}
          >
            Sổ đăng ký toàn quốc ({totalSubjects} môn)
          </button>
        </div>
      </div>

      {activeTab === "STAGE_VIEW" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Stage Rail */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 overflow-x-auto pb-2 lg:pb-0">
            {(Object.keys(STAGE_CONFIG) as StageId[]).map((stageId) => {
              const s = STAGE_CONFIG[stageId];
              const isSelected = activeStage === stageId;
              const countInStage = (coverageRegistry as SubjectCoverageRecord[]).filter(
                (r) => r.stage === s.stageKey
              ).length;

              return (
                <button
                  key={stageId}
                  type="button"
                  onClick={() => setActiveStage(stageId)}
                  className={`w-full text-left p-4 sm:p-5 rounded-app transition-all border shrink-0 ${
                    isSelected
                      ? "bg-surface border-brand shadow-2xs text-ink"
                      : "bg-surface/50 border-line/40 hover:bg-surface text-ink-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl sm:text-2xl font-bold">{s.label}</span>
                    <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded-pill bg-canvas">
                      {s.range}
                    </span>
                  </div>
                  <div className="text-2xs text-ink-muted mt-2 flex items-center justify-between">
                    <span>{countInStage} môn trong danh mục</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Panel: Stage Subjects from Catalog & Registry */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-marketingWindow border border-line/70 bg-surface p-6 sm:p-8 space-y-6">
              <div className="border-b border-line/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="font-serif text-2xl font-bold text-ink">
                    {currentStageConfig.label} ({currentStageConfig.range})
                  </h2>
                  <span className="text-2xs font-mono font-medium text-ink-muted bg-canvas px-2.5 py-1 rounded border border-line/40">
                    {currentStageConfig.standard}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Danh sách môn học kết xuất trực tiếp từ danh mục pháp lý. Trạng thái phản ánh mức độ hoàn thiện dữ liệu thực tế.
                </p>
              </div>

              {/* Subject List Rows */}
              <div className="space-y-3">
                {stageRecords.map((record, idx) => {
                  const isGrade6Math = record.grade === 6 && record.subjectId === "math";

                  return (
                    <div
                      key={`${record.grade}-${record.subjectId}-${idx}`}
                      className="rounded-app border border-line/60 bg-surfaceStrong p-4 sm:p-5 transition-all hover:border-line space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xs font-mono font-semibold text-brand bg-brand-soft/60 px-2 py-0.5 rounded">
                              {typeof record.grade === "number" ? `Lớp ${record.grade}` : record.grade}
                            </span>
                            <span className="text-2xs font-mono text-ink-muted">{record.subjectId}</span>
                            {record.kind && (
                              <span className="text-2xs font-mono text-ink-muted border border-line/50 px-1.5 py-0.5 rounded">
                                {record.kind === "mandatory"
                                  ? "Bắt buộc"
                                  : record.kind === "elective"
                                  ? "Lựa chọn"
                                  : "Tùy chọn"}
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-lg font-bold text-ink mt-1">
                            {record.subjectNameVi}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          <StatusBadge status={record.sourceStatus} />
                        </div>
                      </div>

                      {/* Content metrics or status explanation */}
                      <div className="text-xs text-ink-muted border-t border-line/40 pt-2.5 flex flex-wrap items-center gap-4">
                        <span>
                          Yêu cầu cần đạt:{" "}
                          <strong className="text-ink font-mono">
                            {record.outcomesReviewed}/{record.outcomesTotal}
                          </strong>
                        </span>
                        <span>
                          Đốt tri thức:{" "}
                          <strong className="text-ink font-mono">
                            {record.nodesReviewed}/{record.nodesTotal}
                          </strong>
                        </span>
                        <span>
                          Câu hỏi thẩm duyệt:{" "}
                          <strong className="text-ink font-mono">{record.questionsReviewed}</strong>
                        </span>
                      </div>

                      {/* Interactive Drawer & Diagnostic for vertical slice */}
                      {isGrade6Math && (
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <Link
                            href="/diagnostic/math-grade6"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-dark px-3 py-1.5 rounded transition-colors"
                          >
                            <span>Làm bài chẩn đoán</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setShowGraphDrawer(!showGraphDrawer)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            <span>
                              {showGraphDrawer ? "Ẩn cây tri thức tiên quyết" : "Xem cây tri thức tiên quyết mẫu (DAG)"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embedded DAG Knowledge Graph Drawer */}
            {showGraphDrawer && (
              <div className="rounded-marketingWindow border border-line/80 bg-surface p-6 sm:p-8 space-y-4 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between border-b border-line/50 pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink">
                      Cây Tri Thức Tiên Quyết: Phân Số Lớp 6
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Đồ thị có hướng (DAG) liên kết từ Lớp 4 (Khái niệm phân số) $\rightarrow$ Lớp 5 (Quy đồng) $\rightarrow$ Lớp 6 (Cộng trừ khác mẫu).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGraphDrawer(false)}
                    className="text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    Đóng
                  </button>
                </div>

                <PrerequisiteTree nodes={graph.nodes} edges={graph.edges} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full National Coverage Registry Table */
        <div className="rounded-marketingWindow border border-line/70 bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/50 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink">
                Sổ Đăng Ký Độ Phủ Toàn Quốc
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Theo dõi minh bạch trạng thái của toàn bộ {totalSubjects} môn học từ Mẫu giáo 3–6 đến Lớp 12.
              </p>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm môn học hoặc lớp..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line bg-surface text-ink focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line/60 bg-surfaceStrong text-ink font-semibold">
                <tr>
                  <th className="py-3 px-3">Cấp / Lớp</th>
                  <th className="py-3 px-3">Mã môn</th>
                  <th className="py-3 px-3">Tên môn học</th>
                  <th className="py-3 px-3">Phân loại</th>
                  <th className="py-3 px-3">Trạng thái thẩm định</th>
                  <th className="py-3 px-3 text-center">YCCĐ</th>
                  <th className="py-3 px-3 text-center">Đốt tri thức</th>
                  <th className="py-3 px-3 text-center">Câu hỏi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 text-ink-muted">
                {filteredRegistry.map((item, idx) => (
                  <tr key={`${item.stage}-${item.grade}-${item.subjectId}-${idx}`} className="hover:bg-surfaceStrong/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {typeof item.grade === "number" ? `Lớp ${item.grade}` : item.grade}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-2xs">{item.subjectId}</td>
                    <td className="py-2.5 px-3 font-medium text-ink">{item.subjectNameVi}</td>
                    <td className="py-2.5 px-3 text-2xs">
                      {item.kind === "mandatory" ? (
                        <span className="text-brand font-medium">Bắt buộc</span>
                      ) : item.kind === "elective" ? (
                        <span className="text-amber-700">Lựa chọn</span>
                      ) : (
                        <span className="text-stone-500">Tùy chọn</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.sourceStatus as CoverageStatus} />
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {item.outcomesReviewed}/{item.outcomesTotal}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {item.nodesReviewed}/{item.nodesTotal}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {item.questionsReviewed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
