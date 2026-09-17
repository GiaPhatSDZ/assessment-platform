"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
  Sparkles,
  Share2,
  Lock,
  LogOut,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { AdminFunnelMetrics, AdminSessionInspectionRecord } from "@/src/application/assessment-repository";

interface AdminOverviewViewProps {
  adminEmail: string;
  metrics: AdminFunnelMetrics;
  sessions: AdminSessionInspectionRecord[];
}

export function AdminOverviewView({ adminEmail, metrics, sessions }: AdminOverviewViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Lock className="h-3.5 w-3.5" />
              <span>Khu Vực Quản Trị • Server Authorized</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Bảng Điều Khiển Quản Trị & Phễu Chuyển Đổi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Quản trị viên: <span className="font-semibold text-slate-900 dark:text-slate-200">{adminEmail}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Về Dashboard Học Viên</span>
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </form>
          </div>
        </div>

        {/* Funnel Metrics Grid */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Số Liệu Phễu Đánh Giá Thực Tế (Database Real-time)
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Bắt đầu làm bài
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.totalStarts}
                </span>
                <span className="text-[10px] text-slate-400">phiên</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Hoàn thành
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {metrics.totalCompletions}
                </span>
                <span className="text-[10px] text-slate-400">bài</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Tỷ lệ hoàn thành
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {metrics.completionRate}%
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Yêu cầu báo cáo AI
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {metrics.totalLeadRequests}
                </span>
                <span className="text-[10px] text-slate-400">leads</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Báo cáo AI đã tạo
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
                  {metrics.totalReportsGenerated}
                </span>
                <span className="text-[10px] text-slate-400">bản</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Tỷ lệ chuyển đổi Lead
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {metrics.leadConversionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Attribution Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Phân Tích Hiệu Suất Nguồn Giới Thiệu (Referral Breakdown)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">Mã giới thiệu (?ref=)</th>
                  <th className="py-2.5 font-semibold text-right">Lượt bắt đầu</th>
                  <th className="py-2.5 font-semibold text-right">Lượt hoàn thành</th>
                  <th className="py-2.5 font-semibold text-right">Tỷ lệ hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {metrics.referralBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Chưa có dữ liệu nguồn giới thiệu nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  metrics.referralBreakdown.map((ref) => {
                    const rate =
                      ref.starts > 0 ? Math.round((ref.completions / ref.starts) * 1000) / 10 : 0;
                    return (
                      <tr key={ref.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {ref.code === "DIRECT" ? (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Trực tiếp (Direct)
                            </span>
                          ) : (
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              {ref.code}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                          {ref.starts}
                        </td>
                        <td className="py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {ref.completions}
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                          {rate}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Privacy-Conscious Session Inspector */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Giám Sát Phiên Đánh Giá Tối Giản (Privacy-Conscious Session Inspector)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chỉ hiển thị định danh kỹ thuật và điểm toán học 4 chiều. Không hiển thị email/tên cá nhân để bảo vệ quyền riêng tư.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Hiển thị {sessions.length} phiên gần nhất
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">Mã phiên</th>
                  <th className="py-2.5 font-semibold">Trạng thái</th>
                  <th className="py-2.5 font-semibold">Nguồn ref</th>
                  <th className="py-2.5 font-semibold">Thời gian bắt đầu</th>
                  <th className="py-2.5 font-semibold text-right">Điểm 4 chiều (AT / PS / AI / AD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center font-sans text-slate-400">
                      Chưa có phiên làm bài nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  sessions.map((sess) => {
                    const startedTime = new Date(sess.startedAt).toLocaleString("vi-VN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 text-slate-800 dark:text-slate-200">
                          #{sess.id.slice(-8)}
                        </td>
                        <td className="py-2.5">
                          {sess.status === "completed" ? (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Completed
                            </span>
                          ) : (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              {sess.status}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-400">
                          {sess.referralCode || "--"}
                        </td>
                        <td className="py-2.5 text-slate-500 font-sans">
                          {startedTime}
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {sess.dimensionScores && sess.dimensionScores.length > 0 ? (
                            sess.dimensionScores
                              .map((d) => d.normalizedScore)
                              .join(" / ")
                          ) : (
                            <span className="font-normal text-slate-400">Chưa có kết quả</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
