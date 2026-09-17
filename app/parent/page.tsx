import { Metadata } from "next";
import { AppShell } from "@/components/v3/layout/AppShell";
import { ParentView } from "@/components/v3/profile/ParentView";

export const metadata: Metadata = {
  title: "Dành Cho Phụ Huynh — AI School V3",
  description: "Hiểu đúng lỗ hổng thực sự để đồng hành cùng con, không xếp hạng ảo, không áp lực điểm số.",
};

export default function ParentPage() {
  return (
    <AppShell>
      <ParentView />
    </AppShell>
  );
}
