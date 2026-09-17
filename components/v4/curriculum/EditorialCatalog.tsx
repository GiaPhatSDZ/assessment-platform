"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PrerequisiteTree } from "@/components/v3/curriculum/PrerequisiteTree";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import coverageRegistry from "@/curriculum/vietnam/coverage-registry.json";
import { CoverageStatus } from "@/src/domain/content/schema";
import {
  ArrowRight,
  BookCheck,
  Clock,
  Ban,
  FileCheck2,
  ListTree,
  CheckCircle2,
  Layers,
  Database,
  ShieldCheck,
} from "lucide-react";

type StageId = "PRESCHOOL" | "PRIMARY" | "LOWER_SECONDARY" | "UPPER_SECONDARY";

interface SubjectRow {
  id: string;
  subject: string;
  topic: string;
  code: string;
  grade: number | string;
  status: CoverageStatus;
  yccd: string;
  diagnosticHref?: string;
  hasKnowledgeGraph?: boolean;
}

const CURRICULUM_DATA: Record<
  StageId,
  { name: string; ageRange: string; standard: string; rows: SubjectRow[] }
> = {
  PRESCHOOL: {
    name: "Mầm non (3 – 6 tuổi)",
    ageRange: "3 – 6 tuổi",
    standard: "Thông tư 28/2016/TT-BGDĐT & Đề án 2026 (Thí điểm)",
    rows: [
      {
        id: "PRE-01",
        subject: "Toán tiền học đường",
        topic: "Nhận biết chữ số & tập đếm số lượng 1 – 10",
        code: "PRE-MATH-COUNT-01",
        grade: "5-6 tuổi",
        status: "CONTENT_IN_REVIEW",
        yccd: "Nhận biết các con số từ 1 đến 10, đếm số lượng đồ vật tương ứng trong phạm vi 10.",
      },
      {
        id: "PRE-02",
        subject: "Phát triển nhận thức",
        topic: "Phân biệt không gian & hình học cơ bản",
        code: "PRE-COG-GEO-01",
        grade: "4-5 tuổi",
        status: "SOURCE_INGESTED",
        yccd: "Nhận biết hình vuông, tam giác, tròn qua đồ vật trực quan; phân biệt trên - dưới.",
      },
    ],
  },
  PRIMARY: {
    name: "Tiểu học",
    ageRange: "Lớp 1 – 5",
    standard: "Thông tư 32/2018/TT-BGDĐT",
    rows: [
      {
        id: "PRI-G4-FRAC",
        subject: "Toán học",
        topic: "Khái niệm phân số, phân số bằng nhau, rút gọn phân số",
        code: "MATH-VN-G4-FRAC-01",
        grade: 4,
        status: "CONTENT_IN_REVIEW",
        yccd: "Nhận biết khái niệm phân số là một hoặc nhiều phần bằng nhau của đơn vị; nhận biết phân số bằng nhau.",
      },
      {
        id: "PRI-G5-DENOM",
        subject: "Toán học",
        topic: "Quy đồng mẫu số hai phân số",
        code: "MATH-VN-G5-DENOM-01",
        grade: 5,
        status: "CONTENT_IN_REVIEW",
        yccd: "Thực hiện được quy đồng mẫu số hai phân số trong trường hợp có mẫu số chung đơn giản.",
      },
      {
        id: "PRI-G5-DEC",
        subject: "Toán học",
        topic: "Số thập phân và các phép tính với số thập phân",
        code: "MATH-VN-G5-DEC-01",
        grade: 5,
        status: "OUTCOMES_EXTRACTED",
        yccd: "Nhận biết số thập phân; thực hiện được các phép cộng, trừ, nhân, chia số thập phân.",
      },
    ],
  },
  LOWER_SECONDARY: {
    name: "Trung học cơ sở (THCS)",
    ageRange: "Lớp 6 – 9",
    standard: "Thông tư 32/2018/TT-BGDĐT",
    rows: [
      {
        id: "SEC-G6-FRAC-ADD",
        subject: "Toán học",
        topic: "Phép cộng và trừ hai phân số khác mẫu số",
        code: "MATH-VN-G6-NUM-001",
        grade: 6,
        status: "PUBLISHED",
        yccd: "Thực hiện được phép cộng, trừ hai phân số khác mẫu số thông qua bước quy đồng mẫu số chung.",
        diagnosticHref: "/diagnostic/math-grade6",
        hasKnowledgeGraph: true,
      },
      {
        id: "SEC-G6-NUM-GCD",
        subject: "Toán học",
        topic: "Ước chung lớn nhất & Bội chung nhỏ nhất",
        code: "MATH-VN-G6-NUM-GCD",
        grade: 6,
        status: "DIAGNOSTIC_READY",
        yccd: "Vận dụng được ƯCLN và BCNN vào các bài toán rút gọn phân số và tìm mẫu số chung.",
      },
      {
        id: "SEC-G6-GEO-FLAT",
        subject: "Toán học",
        topic: "Hình học trực quan: Hình tam giác đều, hình vuông, lục giác đều",
        code: "MATH-VN-G6-GEO-01",
        grade: 6,
        status: "OUTCOMES_EXTRACTED",
        yccd: "Mô tả được các yếu tố cơ bản (cạnh, góc, đường chéo) của các hình phẳng quen thuộc.",
      },
      {
        id: "SEC-G7-RATIONAL",
        subject: "Toán học",
        topic: "Tập hợp các số hữu tỉ và các phép tính",
        code: "MATH-VN-G7-NUM-01",
        grade: 7,
        status: "SOURCE_INGESTED",
        yccd: "Nhận biết được số hữu tỉ và biểu diễn số hữu tỉ trên trục số; thực hiện các phép tính trong Q.",
      },
    ],
  },
  UPPER_SECONDARY: {
    name: "Trung học phổ thông (THPT)",
    ageRange: "Lớp 10 – 12",
    standard: "Thông tư 32/2018/TT-BGDĐT",
    rows: [
      {
        id: "HIGH-G10-FUNC",
        subject: "Toán học",
        topic: "Hàm số bậc nhất, bậc hai và đồ thị",
        code: "MATH-VN-G10-ALG-01",
        grade: 10,
        status: "SOURCE_INGESTED",
        yccd: "Chưa hỗ trợ trực tuyến; kế hoạch mở rộng sau khi hoàn thành chuẩn hóa cấp THCS.",
      },
      {
        id: "HIGH-G12-CALC",
        subject: "Toán học",
        topic: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
        code: "MATH-VN-G12-CALC-01",
        grade: 12,
        status: "NOT_INGESTED",
        yccd: "Chưa nạp văn bản chương trình chính thức vào hệ thống.",
      },
    ],
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
  const [activeTab, setActiveTab] = useState<"SLICES" | "REGISTRY">("SLICES");
  const [showGraphDrawer, setShowGraphDrawer] = useState<boolean>(false);

  const currentStage = CURRICULUM_DATA[activeStage];
  const graph = CurriculumService.getFractionsKnowledgeGraph();

  // Registry summary stats
  const totalSubjects = coverageRegistry.length;
  const publishedCount = coverageRegistry.filter((r) => r.sourceStatus === "PUBLISHED").length;
  const ingestedCount = coverageRegistry.filter((r) => r.sourceStatus === "SOURCE_INGESTED").length;

  return (
    <div className="space-y-10">
      {/* Editorial Catalog Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
          Bản Đồ Kiến Thức Thực Chất K–12
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-ink leading-tight">
          Cây Tri Thức & Danh Mục Khảo Sát
        </h1>
        <p className="text-base text-ink-muted leading-relaxed font-normal">
          Mỗi chủ đề đều có cơ sở pháp lý theo Thông tư 32/2018/TT-BGDĐT. Trạng thái phản ánh
          trung thực 6 cấp độ thẩm định sư phạm của hệ thống.
        </p>
      </div>

      {/* Honest Coverage Audit Banner */}
      <div className="rounded-app border border-line bg-surface p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/50 pb-3">
          <div className="flex items-center gap-2 text-ink">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-sm sm:text-base">
              Cam kết tính chân thực về độ phủ chương trình (Coverage Truth)
            </h3>
          </div>
          <span className="text-2xs font-mono bg-canvas px-3 py-1 rounded-pill text-ink-muted border border-line/40">
            Tổng số môn K–12: {totalSubjects} | Đã phát hành: {publishedCount}
          </span>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          <strong>Nguyên tắc bất di dịch:</strong> Thư mục tồn tại ≠ Nội dung sẵn sàng. Hệ thống
          tuyệt đối không dùng AI tạo sinh bài học hoặc câu hỏi runtime cho học sinh. Chỉ có chủ đề
          đã hoàn thành quy trình đối soát học liệu (như Lát cắt Toán 6 Phân số) mới được chuyển
          sang trạng thái <span className="font-semibold text-emerald-700">PUBLISHED</span>.
        </p>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("SLICES")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "SLICES"
                ? "bg-brand text-white shadow-2xs"
                : "bg-surfaceStrong text-ink-muted hover:text-ink border border-line/50"
            }`}
          >
            Chủ đề mẫu đối soát (Vertical Slices)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REGISTRY")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "REGISTRY"
                ? "bg-brand text-white shadow-2xs"
                : "bg-surfaceStrong text-ink-muted hover:text-ink border border-line/50"
            }`}
          >
            Sổ đăng ký độ phủ toàn quốc ({totalSubjects} môn)
          </button>
        </div>
      </div>

      {activeTab === "SLICES" ? (
        /* Main Layout: Left Stage Rail (4 cols) + Right List Rows (8 cols) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Stage Rail */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 overflow-x-auto pb-2 lg:pb-0">
            {(
              [
                { id: "PRESCHOOL", label: "Mầm non", range: "3 – 6 tuổi" },
                { id: "PRIMARY", label: "Tiểu học", range: "Lớp 1 – 5" },
                { id: "LOWER_SECONDARY", label: "THCS", range: "Lớp 6 – 9" },
                { id: "UPPER_SECONDARY", label: "THPT", range: "Lớp 10 – 12" },
              ] as const
            ).map((s) => {
              const isSelected = activeStage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStage(s.id)}
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
                </button>
              );
            })}
          </div>

          {/* Right Content Panel: Editorial List Rows */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-marketingWindow border border-line/70 bg-surface p-6 sm:p-8 space-y-6">
              <div className="border-b border-line/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="font-serif text-2xl font-bold text-ink">{currentStage.name}</h2>
                  <span className="text-2xs font-mono font-medium text-ink-muted bg-canvas px-2.5 py-1 rounded border border-line/40">
                    {currentStage.standard}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Danh sách các chủ đề đã được mã hóa vào đồ thị tri thức có hướng (DAG).
                </p>
              </div>

              {/* List Rows */}
              <div className="space-y-3">
                {currentStage.rows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-app border border-line/60 bg-surfaceStrong p-4 sm:p-5 transition-all hover:border-line space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xs font-mono font-semibold text-brand bg-brand-soft/60 px-2 py-0.5 rounded">
                            {typeof row.grade === "number" ? `Lớp ${row.grade}` : row.grade}
                          </span>
                          <span className="text-2xs font-mono text-ink-muted">{row.code}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-ink mt-1">{row.topic}</h3>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        <StatusBadge status={row.status} />
                      </div>
                    </div>

                    {/* YCCĐ Descriptor */}
                    <p className="text-xs text-ink-muted leading-relaxed border-t border-line/40 pt-2.5">
                      <span className="font-medium text-ink">Yêu cầu cần đạt: </span>
                      {row.yccd}
                    </p>

                    {/* Interactive Action Bar if available */}
                    {(row.diagnosticHref || row.hasKnowledgeGraph) && (
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {row.hasKnowledgeGraph && (
                          <button
                            type="button"
                            onClick={() => setShowGraphDrawer(!showGraphDrawer)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            <span>
                              {showGraphDrawer ? "Ẩn cây tri thức mẫu" : "Xem cây tri thức mẫu"}
                            </span>
                          </button>
                        )}

                        {row.diagnosticHref && (
                          <Link
                            href={row.diagnosticHref}
                            className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg bg-brand px-3.5 py-1.5 text-white hover:bg-brand-dark transition-colors shadow-2xs ml-auto"
                          >
                            <span>Làm bài chẩn đoán</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
                      Liên kết có hướng từ Lớp 4 (Khái niệm, Rút gọn) → Lớp 5 (Quy đồng) → Lớp 6
                      (Cộng trừ khác mẫu).
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
                Sổ Đăng Ký Độ Phủ Chương Trình Quốc Gia V1
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Theo dõi chính xác trạng thái của từng môn học từ Mẫu giáo 3–6 đến Lớp 12.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-ink-muted bg-canvas px-3 py-1.5 rounded border border-line/40">
              139/139 Bản ghi đã kiểm soát
            </span>
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
                {coverageRegistry.map((item, idx) => (
                  <tr key={`${item.stage}-${item.grade}-${item.subjectId}-${idx}`} className="hover:bg-surfaceStrong/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {typeof item.grade === "number" ? `Lớp ${item.grade}` : item.grade}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-2xs">{item.subjectId}</td>
                    <td className="py-2.5 px-3 font-medium text-ink">{item.subjectNameVi}</td>
                    <td className="py-2.5 px-3 text-2xs">
                      {"kind" in item && item.kind === "MANDATORY" ? (
                        <span className="text-brand font-medium">Bắt buộc</span>
                      ) : "kind" in item && item.kind === "ELECTIVE" ? (
                        <span className="text-amber-700">Tự chọn</span>
                      ) : (
                        <span className="text-stone-500">Mặc định</span>
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
