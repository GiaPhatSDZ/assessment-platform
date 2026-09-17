import { Metadata } from "next";
import { AppShell } from "@/components/v3/layout/AppShell";
import { CoverageExplorer } from "@/components/v3/curriculum/CoverageExplorer";
import { PrerequisiteTree } from "@/components/v3/curriculum/PrerequisiteTree";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";

export const metadata: Metadata = {
  title: "Bản Đồ Chương Trình K–12 & Cây Tri Thức — AI School V3",
  description: "Bản đồ kiến thức thực chất, đối soát theo chuẩn GDPT 2018 của Bộ GD&ĐT.",
};

export default function CurriculumPage() {
  const graph = CurriculumService.getFractionsKnowledgeGraph();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <CoverageExplorer />

        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Đồ Thị Tri Thức Mẫu: Toán Lớp 6 Phân Số
          </h3>
          <p className="text-xs text-slate-500">
            Minh họa cấu trúc Direct Acyclic Graph (DAG) liên kết giữa Tiểu học (Lớp 4) và THCS (Lớp 6).
          </p>
          <PrerequisiteTree nodes={graph.nodes} edges={graph.edges} />
        </div>
      </div>
    </AppShell>
  );
}
