"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, Bot, AlertCircle, ShieldCheck } from "lucide-react";

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
    <div className="rounded-marketingWindow border border-line bg-surface p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">
                Giao Thức Hỗ Trợ Phụ Huynh (Parent Copilot / NotebookLM)
              </h3>
              <span className="text-2xs font-semibold bg-brand-soft px-2 py-0.5 rounded-pill text-brand border border-line/40">
                Dành cho Phụ huynh
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Công cụ hỗ trợ cha mẹ tham khảo phương pháp sư phạm gợi mở, bám sát SGK chuẩn Bộ GD&ĐT.
            </p>
          </div>
        </div>
        <a
          href="https://notebooklm.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surfaceStrong px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface transition shrink-0"
        >
          <span>Mở NotebookLM</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Guide steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-app border border-line/60 bg-surfaceStrong p-3.5 space-y-1">
          <div className="font-semibold text-ink">1. Phụ huynh mở NotebookLM</div>
          <p className="text-ink-muted">Sử dụng tài khoản Google cá nhân của cha mẹ, hoàn toàn riêng tư và miễn phí.</p>
        </div>
        <div className="rounded-app border border-line/60 bg-surfaceStrong p-3.5 space-y-1">
          <div className="font-semibold text-ink">2. Đính kèm tài liệu nguồn</div>
          <p className="text-ink-muted">Tải bài học SGK Toán 6 làm ngữ cảnh kiểm định duy nhất cho trợ lý.</p>
        </div>
        <div className="rounded-app border border-line/60 bg-surfaceStrong p-3.5 space-y-1">
          <div className="font-semibold text-ink">3. Nhận câu hỏi gợi mở cho con</div>
          <p className="text-ink-muted">Dán prompt sư phạm đối soát dưới đây để nhận câu hỏi gợi ý, không làm bài hộ con.</p>
        </div>
      </div>

      {/* Copyable Prompt box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">
            Câu lệnh đối soát dành cho phụ huynh (Parent Copilot Prompt):
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Đã sao chép!" : "Sao chép câu lệnh"}</span>
          </button>
        </div>

        <div className="relative rounded-app border border-line bg-canvas p-4 font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed">
          {copyablePrompt}
        </div>
      </div>

      {/* Safe Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-app bg-amber-50/70 p-3.5 text-xs text-amber-950 border border-amber-200">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-800" />
        <span className="leading-relaxed">
          <strong>Ranh giới an toàn cho trẻ em:</strong> Học sinh không trực tiếp thao tác hoặc trò chuyện với AI. Trợ lý này phục vụ riêng phụ huynh để nắm bắt phương pháp sư phạm gợi mở. AI không có quyền can thiệp vào điểm số, đồ thị tri thức hay chứng nhận làm chủ kiến thức.
        </span>
      </div>
    </div>
  );
}
