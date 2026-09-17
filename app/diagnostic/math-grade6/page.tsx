import { Metadata } from "next";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { KnowledgeGapRunner } from "@/components/diagnostic/KnowledgeGapRunner";

export const metadata: Metadata = {
  title: "Chẩn Đoán Lỗ Hổng Kiến Thức Toán Lớp 6 · Phân Số — AI School V3",
  description:
    "Hệ thống chẩn đoán và lần theo kiến thức nền tảng để phát hiện lỗ hổng tri thức môn Toán Lớp 6 bám sát Chương trình GDPT 2018 của Bộ GD&ĐT.",
};

export default function MathGrade6DiagnosticPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <KnowledgeGapRunner />
      </main>
      <Footer />
    </div>
  );
}
