"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  BarChart3,
  Calendar,
  ArrowRight,
  LogOut,
  Award,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { AssessmentSessionRecord } from "@/src/application/assessment-repository";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";
import { getResultBand } from "@/src/domain/assessment/result-bands";

interface ParticipantDashboardProps {
  user: {
    id: string;
    email: string;
    displayName?: string | null;
  };
  sessions: AssessmentSessionRecord[];
}

export function ParticipantDashboard({ user, sessions }: ParticipantDashboardProps) {
  const completedSessions = sessions.filter((s) => s.status === "completed" && s.result);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top bar with user profile & logout */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Award className="h-4 w-4" />
              <span>Bảng Điều Khiển Học Viên</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Lịch Sử & Báo Cáo Đánh Giá
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Đăng nhập với tài khoản: <span className="font-semibold text-slate-900 dark:text-slate-200">{user.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/learn/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-edu-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-edu-800 transition"
            >
              <span>Bắt đầu chẩn đoán kiến thức</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                title="Đăng xuất"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </form>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tổng số bài hoàn thành
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {completedSessions.length}
              </span>
              <span className="text-xs text-emerald-600 font-medium dark:text-emerald-400">
                Phiên xác thực
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Điểm trung bình gần nhất
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {completedSessions.length > 0 && completedSessions[0].result
                  ? Math.round(
                      completedSessions[0].result.dimensions.reduce(
                        (acc, d) => acc + d.normalizedScore,
                        0
                      ) / completedSessions[0].result.dimensions.length
                    )
                  : "--"}
              </span>
              <span className="text-xs text-slate-500">/ 100 điểm chuẩn</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Lần làm bài gần nhất
            </span>
            <div className="mt-2 flex items-baseline gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {completedSessions.length > 0 && completedSessions[0].completedAt
                ? new Date(completedSessions[0].completedAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "Chưa có"}
            </div>
          </div>
        </div>

        {/* Completed Assessments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Danh Sách Bài Đánh Giá Của Bạn
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {completedSessions.length} kết quả được lưu
            </span>
          </div>

          {completedSessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Bạn chưa có kết quả đánh giá nào
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Hoàn thành bài đánh giá 10 câu hỏi để nhận đồ thị năng lực 4 chiều toán học và bản kế hoạch hành động 6 tuần.
              </p>
              <div className="mt-6">
                <Link
                  href="/learn/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-edu-800 transition"
                >
                  <span>Bắt đầu chẩn đoán kiến thức</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions.map((session) => {
                const result = session.result;
                const completedDate = session.completedAt
                  ? new Date(session.completedAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Không xác định";

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800/80">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Đã hoàn thành • Mã phiên #{session.id.slice(-6)}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {aiCareerReadinessAssessmentV1.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{completedDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                        <Link
                          href={`/assessment/ai-career-readiness/result/${session.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60 transition"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          <span>Kết quả đồ thị</span>
                        </Link>

                        <Link
                          href={`/report/${session.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Báo cáo chi tiết AI</span>
                        </Link>
                      </div>
                    </div>

                    {/* Dimensions Summary */}
                    {result && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {result.dimensions.map((dim) => {
                          const meta = aiCareerReadinessAssessmentV1.dimensions.find(
                            (d) => d.id === dim.dimensionId
                          );
                          const band = getResultBand(dim.normalizedScore);

                          return (
                            <div
                              key={dim.dimensionId}
                              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {meta?.label || dim.dimensionId}
                                </span>
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                  {dim.normalizedScore}
                                </span>
                              </div>

                              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                                  style={{ width: `${dim.normalizedScore}%` }}
                                />
                              </div>

                              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {band.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
