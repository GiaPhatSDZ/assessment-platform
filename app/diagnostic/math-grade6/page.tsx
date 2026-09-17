import { Metadata } from "next";
import { Grade6FractionsDiagnosticFlow } from "@/components/v3/diagnostic/Grade6FractionsDiagnosticFlow";

export const metadata: Metadata = {
  title: "Chẩn Đoán Lỗ Hổng Kiến Thức Toán Lớp 6 · Phân Số — AI School V3",
  description:
    "Hệ thống chẩn đoán và lần theo kiến thức nền tảng để phát hiện lỗ hổng tri thức môn Toán Lớp 6 bám sát Chương trình GDPT 2018 của Bộ GD&ĐT.",
};

export default function MathGrade6DiagnosticPage() {
  return <Grade6FractionsDiagnosticFlow />;
}
