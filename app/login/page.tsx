"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams?.get ? searchParams.get("next") : null;
  const errorParam = searchParams?.get ? searchParams.get("error") : null;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "auth_failed"
      ? "Xác thực không thành công hoặc liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới."
      : errorParam === "missing_code"
      ? "Mã xác thực không hợp lệ hoặc đã được sử dụng."
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mockDevUrl, setMockDevUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setMockDevUrl(null);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          next: rawNext || "/dashboard",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Không thể gửi liên kết đăng nhập. Vui lòng thử lại.");
      } else {
        setSuccessMessage(data.message || "Kiểm tra hòm thư của bạn để nhận liên kết đăng nhập.");
        if (data.mockUrl) {
          setMockDevUrl(data.mockUrl);
        }
      }
    } catch {
      setErrorMessage("Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Đăng Nhập Học Viên
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Nhận liên kết đăng nhập bảo mật qua email (Magic Link) mà không cần tạo mật khẩu phức tạp.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Kiểm tra email của bạn
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Chúng tôi đã gửi một liên kết đăng nhập đến{" "}
                <strong className="text-slate-900 dark:text-white">{email}</strong>. Nhấp vào liên kết để truy cập bảng điều khiển ngay lập tức.
              </p>
            </div>

            {mockDevUrl && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-left dark:border-blue-900/50 dark:bg-blue-950/30">
                <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                  Chế độ thử nghiệm cục bộ:
                </span>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 mb-2">
                  Supabase chưa kết nối môi trường thực tế. Nhấp trực tiếp để kiểm tra luồng:
                </p>
                <Link
                  href={mockDevUrl}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <span>Mở liên kết Magic Link giả lập</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSuccessMessage(null);
                setMockDevUrl(null);
              }}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400 pt-2"
            >
              Gửi lại bằng email khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Địa chỉ Email của bạn
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ten-ban@cong-ty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Gửi liên kết Magic Link</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Bảo mật tuyệt đối • Không spam quảng cáo</span>
            </div>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Trở về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
      <Suspense fallback={<div className="text-sm text-slate-500">Đang tải biểu mẫu...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
