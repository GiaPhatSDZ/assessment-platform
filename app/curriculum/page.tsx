import { Metadata } from "next";
import { AppShell } from "@/components/v4/layout/AppShell";
import { EditorialCatalog } from "@/components/v4/curriculum/EditorialCatalog";

export const metadata: Metadata = {
  title: "Bản Đồ Chương Trình K–12 & Cây Tri Thức — AI School",
  description: "Bản đồ kiến thức thực chất, đối soát theo chuẩn GDPT 2018 của Bộ GD&ĐT.",
};

export default function CurriculumPage() {
  return (
    <AppShell mode="BRAND">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EditorialCatalog />
      </div>
    </AppShell>
  );
}
