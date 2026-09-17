import { Metadata } from "next";
import { AppShell } from "@/components/v3/layout/AppShell";
import { LearnerHome } from "@/components/v3/profile/LearnerHome";

export const metadata: Metadata = {
  title: "Góc Học Tập Cá Nhân — AI School V3",
  description: "Theo dõi chính xác tiến trình làm chủ các mắt xích kiến thức chuẩn Bộ GD&ĐT.",
};

export default function LearnPage() {
  return (
    <AppShell>
      <LearnerHome />
    </AppShell>
  );
}
