import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import { getAuthenticatedUser } from "@/src/infrastructure/auth/supabase-ssr";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";
import { ParticipantDashboard } from "@/components/dashboard/ParticipantDashboard";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  const cookieStore = await cookies();
  const mockUserId = cookieStore.get("mock_user_session")?.value;

  let activeUser: { id: string; email: string; displayName?: string | null } | null = null;

  if (user) {
    activeUser = {
      id: user.id,
      email: user.email || "",
      displayName:
        (user.user_metadata?.full_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "Học viên",
    };
  } else if (mockUserId) {
    activeUser = {
      id: mockUserId,
      email: "dev@example.com",
      displayName: "Nhà phát triển (Thử nghiệm)",
    };
  }

  // If not authenticated, render login prompt gate
  if (!activeUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            <LogIn className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Đăng Nhập Để Xem Bảng Điều Khiển
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn cần đăng nhập bằng email để tra cứu toàn bộ lịch sử các bài đánh giá năng lực và tải lại các bản báo cáo AI trước đây.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?next=/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span>Đăng nhập bằng Magic Link</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Liên kết an toàn • Xác thực trực tiếp qua Email</span>
          </div>
        </div>
      </div>
    );
  }

  // Load user assessment sessions
  const sessions = await assessmentRepository.getUserSessions(activeUser.id);

  return <ParticipantDashboard user={activeUser} sessions={sessions} />;
}
