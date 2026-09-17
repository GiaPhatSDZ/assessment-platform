import { Metadata } from "next";
import { AppShell } from "@/components/v4/layout/AppShell";
import { LearnerHistory } from "@/components/v3/profile/LearnerHistory";

export const metadata: Metadata = {
  title: "Lịch Sử Năng Lực & Kiểm Soát Lỗ Hổng — AI School",
  description: "Dòng thời gian minh chứng tiến trình từ chẩn đoán ban đầu đến khi làm chủ vững vàng.",
};

export default function HistoryPage() {
  return (
    <AppShell mode="INSIGHT">
      <LearnerHistory />
    </AppShell>
  );
}
