"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Shield, Check, AlertCircle } from "lucide-react";

interface FullReportCtaProps {
  sessionId: string;
}

export function FullReportCta({ sessionId }: FullReportCtaProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setError("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (!consentProcessing) {
      setError("Vui lòng xác nhận đồng ý xử lý thông tin để nhận báo cáo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          displayName: displayName.trim(),
          email: email.trim().toLowerCase(),
          consentProcessing,
          consentMarketing,
        }),
      });

      if (!res.ok) {
        // Even if server returns non-ok in offline/local mock, proceed to report page
      }
      router.push(`/report/${sessionId}`);
    } catch {
      router.push(`/report/${sessionId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-blue-600 bg-blue-50/50 p-6 sm:p-8 dark:border-blue-500 dark:bg-blue-950/20 shadow-md">
      {!isOpen ? (
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              <span>Báo Cáo Chuyên Sâu Cá Nhân Hóa</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Bạn muốn nhận Kế hoạch hành động chi tiết do AI phân tích?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Báo cáo mở rộng phân tích sâu các điểm mạnh, vùng cần cải thiện và gợi ý các hành động học tập cụ thể theo từng tuần.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>Xem báo cáo đầy đủ</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Thông tin nhận Báo cáo đầy đủ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Báo cáo sẽ được tạo tự động và lưu trữ an toàn trong phiên của bạn.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Địa chỉ email nhận báo cáo <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentProcessing}
                  onChange={(e) => setConsentProcessing(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  <span className="text-rose-500 font-bold">* </span>
                  Tôi đồng ý để hệ thống xử lý họ tên và email nhằm tạo và gửi báo cáo phân tích năng lực cá nhân.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  (Tùy chọn) Tôi đồng ý nhận thêm các tài liệu hướng dẫn và cập nhật chuyên môn hữu ích qua email.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Xác nhận & Mở báo cáo</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Bảo mật tuyệt đối • Không spam • Hủy đăng ký bất kỳ lúc nào</span>
          </div>
        </form>
      )}
    </div>
  );
}
