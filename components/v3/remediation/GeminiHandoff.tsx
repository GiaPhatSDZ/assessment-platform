"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, Bot, AlertCircle } from "lucide-react";

interface GeminiHandoffProps {
  copyablePrompt: string;
  sourceDocTitles: string[];
}

export function GeminiHandoff({ copyablePrompt, sourceDocTitles }: GeminiHandoffProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyablePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between border-b border-warm-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Giao Thức Học Tập Manual Gemini Notebook (NotebookLM)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sử dụng AI làm gia sư sư phạm kiên nhẫn bám sát nguồn SGK Bộ GD&ĐT.
            </p>
          </div>
        </div>
        <a
          href="https://notebooklm.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-warm-200 bg-warm-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-warm-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <span>Mở NotebookLM</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Guide steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-warm-200 bg-warm-50/40 p-3.5 space-y-1 dark:border-slate-800">
          <div className="font-bold text-slate-800 dark:text-slate-200">1. Truy cập NotebookLM</div>
          <p className="text-slate-500">Mở NotebookLM bằng tài khoản Google cá nhân của bạn, hoàn toàn miễn phí và riêng tư.</p>
        </div>
        <div className="rounded-xl border border-warm-200 bg-warm-50/40 p-3.5 space-y-1 dark:border-slate-800">
          <div className="font-bold text-slate-800 dark:text-slate-200">2. Đính kèm tài liệu nguồn</div>
          <p className="text-slate-500">Tải lên bài học SGK Toán 6 (Bộ Cánh Diều, Kết Nối Tri Thức hoặc Chân Trời Sáng Tạo).</p>
        </div>
        <div className="rounded-xl border border-warm-200 bg-warm-50/40 p-3.5 space-y-1 dark:border-slate-800">
          <div className="font-bold text-slate-800 dark:text-slate-200">3. Dán Prompt Socratic</div>
          <p className="text-slate-500">Dán câu lệnh sư phạm đã được lập trình sẵn dưới đây để AI đóng vai gia sư không giải tắt.</p>
        </div>
      </div>

      {/* Copyable Prompt box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Câu lệnh mẫu chuẩn sư phạm (Copyable Prompt):
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-edu-700 dark:hover:bg-edu-800"
            }`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Đã sao chép!" : "Sao chép Prompt"}</span>
          </button>
        </div>

        <div className="relative rounded-xl border border-warm-200 bg-warm-50 p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          {copyablePrompt}
        </div>
      </div>

      {/* Safe Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 p-3 text-[11px] text-amber-900 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
        <span>
          <strong>Lưu ý bảo mật & tính khách quan:</strong> Gemini / NotebookLM hoạt động độc lập và <strong>không có quyền can thiệp vào điểm số hay chứng nhận làm chủ kiến thức</strong>. Sau khi học xong, học sinh cần quay lại nền tảng làm bài kiểm tra lại song song (Re-test) để hệ thống ghi nhận bằng chứng thực tế.
        </span>
      </div>
    </div>
  );
}
