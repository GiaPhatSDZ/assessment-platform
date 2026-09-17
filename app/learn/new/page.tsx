import { Metadata } from "next";
import { AppShell } from "@/components/v4/layout/AppShell";
import { NewDiagnosticWizard } from "@/components/v3/profile/NewDiagnosticWizard";

export const metadata: Metadata = {
  title: "Bắt Đầu Bài Chẩn Đoán Mới — AI School",
  description: "Chọn người học, khối lớp, môn học và chủ đề được hỗ trợ để rà soát lỗ hổng kiến thức.",
};

export default function NewDiagnosticPage() {
  return (
    <AppShell mode="BRAND">
      <NewDiagnosticWizard />
    </AppShell>
  );
}
