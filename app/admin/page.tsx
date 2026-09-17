import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { getAuthenticatedUser } from "@/src/infrastructure/auth/supabase-ssr";
import { isAuthorizedAdmin } from "@/src/infrastructure/auth/admin-auth";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";
import { AdminOverviewView } from "@/components/admin/AdminOverviewView";

export default async function AdminPage() {
  const user = await getAuthenticatedUser();
  const cookieStore = await cookies();
  const mockUserId = cookieStore.get("mock_user_session")?.value;

  let email: string | null = null;

  if (user && user.email) {
    email = user.email;
  } else if (mockUserId) {
    email = "admin@example.com"; // Development fallback
  }

  // 1. Unauthenticated Gate (401)
  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <LogIn className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Yêu Cầu Xác Thực Quản Trị
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn cần đăng nhập bằng tài khoản email được cấp quyền quản trị để truy cập trang này.
            </p>
          </div>

          <Link
            href="/login?next=/admin"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Đăng nhập quản trị viên
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Authorization Gate (403 Forbidden)
  if (!isAuthorizedAdmin(email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-rose-200/80 bg-white p-8 text-center shadow-sm dark:border-rose-900/50 dark:bg-slate-900 space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              403 - Quyền Truy Cập Bị Từ Chối
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tài khoản <strong className="text-slate-900 dark:text-white">{email}</strong> không nằm trong danh sách quản trị viên được phân quyền (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded dark:bg-slate-800">ADMIN_EMAILS</code>).
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              Về bảng điều khiển học viên
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400"
              >
                Đăng xuất và đổi tài khoản
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin View: fetch real DB metrics
  const metrics = await assessmentRepository.getAdminFunnelMetrics();
  const sessions = await assessmentRepository.getAdminSessionList(50);

  return <AdminOverviewView adminEmail={email} metrics={metrics} sessions={sessions} />;
}
