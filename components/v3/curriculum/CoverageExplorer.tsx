"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Ban, ArrowRight, BookOpen } from "lucide-react";

interface CoverageItem {
  grade: string;
  subject: string;
  topic: string;
  sourceDoc: string;
  status: "AVAILABLE" | "IN_PROGRESS" | "BLOCKED_BY_EVIDENCE";
  link?: string;
  notes: string;
}

const COVERAGE_DATA: CoverageItem[] = [
  {
    grade: "Lớp 6 (THCS)",
    subject: "Toán học",
    topic: "Cộng, trừ hai phân số không cùng mẫu số",
    sourceDoc: "TT 32/2018/TT-BGDĐT (Trang 55)",
    status: "IN_PROGRESS",
    link: "/diagnostic/math-grade6",
    notes: "Đồ thị 4 nút tri thức tiên quyết; câu hỏi chẩn đoán và học liệu đang trong tiến trình thẩm định sư phạm (DRAFT).",
  },
  {
    grade: "Lớp 6 (THCS)",
    subject: "Toán học",
    topic: "Phép nhân và phép chia phân số",
    sourceDoc: "TT 32/2018/TT-BGDĐT",
    status: "IN_PROGRESS",
    notes: "Đang đối soát mục tiêu học tập và thẩm định bộ câu hỏi chẩn đoán.",
  },
  {
    grade: "Lớp 4 (Tiểu học)",
    subject: "Toán học",
    topic: "Cộng hai phân số cùng mẫu số",
    sourceDoc: "TT 32/2018/TT-BGDĐT",
    status: "IN_PROGRESS",
    notes: "Nút tiên quyết trong đồ thị Toán 6; đang đối soát chuẩn đầu ra.",
  },
  {
    grade: "Lớp 7 - 12",
    subject: "Toán học & Khoa học",
    topic: "Đại số, Hình học & Vật lý",
    sourceDoc: "Đang chờ đối soát văn bản nguồn",
    status: "BLOCKED_BY_EVIDENCE",
    notes: "Tuyệt đối không sinh dữ liệu chẩn đoán ảo bằng AI khi chưa có đồ thị thẩm định.",
  },
  {
    grade: "Mầm non",
    subject: "Phát triển nhận thức",
    topic: "Khám phá môi trường xung quanh",
    sourceDoc: "TT 28/2016 & Thí điểm 2026",
    status: "BLOCKED_BY_EVIDENCE",
    notes: "Chưa triển khai bài chẩn đoán điện tử cho độ tuổi tiền học đường.",
  },
];

export function CoverageExplorer() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-edu-200 bg-edu-50 px-3 py-1 text-xs font-semibold text-edu-800 dark:bg-edu-950/40 dark:text-edu-300 dark:border-edu-900">
            <BookOpen className="h-3.5 w-3.5 text-edu-700" />
            <span>Sổ Đăng Ký Phạm Vi Bao Phủ Chương Trình Quốc Gia</span>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Bản Đồ Kiến Thức Thực Chất — Cam Kết Không Dữ Liệu Ảo
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Hệ thống chỉ mở bài chẩn đoán khi đã xây dựng đầy đủ đồ thị tri thức tiên quyết và thẩm định từng câu hỏi theo chuẩn Bộ GD&ĐT. Mọi phần chưa đủ minh chứng được ghi rõ ràng là <code>BLOCKED_BY_EVIDENCE</code>.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-warm-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-warm-200 dark:divide-slate-800 text-left text-xs">
              <thead className="bg-warm-100/60 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3">Khối lớp & Môn</th>
                  <th className="px-4 py-3">Chủ đề kiến thức</th>
                  <th className="px-4 py-3">Căn cứ pháp lý</th>
                  <th className="px-4 py-3">Trạng thái chẩn đoán</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200/80 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {COVERAGE_DATA.map((item, idx) => {
                  let statusBadge;
                  if (item.status === "AVAILABLE") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Đã có chẩn đoán</span>
                      </span>
                    );
                  } else if (item.status === "IN_PROGRESS") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Đang biên soạn</span>
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        <Ban className="h-3.5 w-3.5" />
                        <span>Chưa hỗ trợ</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={idx} className="hover:bg-warm-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        <div>{item.grade}</div>
                        <div className="text-[11px] text-slate-500">{item.subject}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.topic}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-sm">{item.notes}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {item.sourceDoc}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {statusBadge}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {item.link ? (
                          <Link
                            href={item.link}
                            className="inline-flex items-center gap-1 font-semibold text-edu-700 hover:text-edu-800 dark:text-edu-400"
                          >
                            <span>Làm bài ngay</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Đang cập nhật</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
