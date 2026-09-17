import React from "react";
import Link from "next/link";
import { ShieldCheck, BookOpen, HeartHandshake } from "lucide-react";

export function ProductFooter() {
  return (
    <footer className="border-t border-line/60 bg-surface text-ink-muted mt-auto pt-14 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Core Pedagogical & Privacy Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-line/50">
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-brand-soft/60 flex items-center justify-center text-brand shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                Nguồn Thẩm Định Quốc Gia
              </h4>
              <p className="text-xs leading-relaxed text-ink-muted">
                Đối soát theo Thông tư 32/2018/TT-BGDĐT. Mọi kết luận chẩn đoán đều gắn với mã yêu cầu cần đạt chính thức.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-brand-soft/60 flex items-center justify-center text-brand shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                Không Xếp Hạng Trẻ Em
              </h4>
              <p className="text-xs leading-relaxed text-ink-muted">
                Không tạo áp lực điểm số thi đua. Hệ thống chỉ tập trung tìm ra đúng mắt xích bị hổng để học bù hiệu quả.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-brand-soft/60 flex items-center justify-center text-brand shrink-0">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                AI Đồng Hành Cùng Phụ Huynh
              </h4>
              <p className="text-xs leading-relaxed text-ink-muted">
                Trí tuệ nhân tạo chỉ phục vụ giải thích sư phạm cho phụ huynh, không phỏng đoán hay sinh nội dung không kiểm duyệt cho trẻ.
              </p>
            </div>
          </div>
        </div>

        {/* Directory & Legal Links */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 font-medium">
            <Link href="/" className="text-ink font-serif font-bold text-sm">
              AI School
            </Link>
            <Link href="/learn" className="hover:text-ink transition-colors">
              Góc Học Tập
            </Link>
            <Link href="/curriculum" className="hover:text-ink transition-colors">
              Chương Trình K–12
            </Link>
            <Link href="/parent" className="hover:text-ink transition-colors">
              Dành Cho Phụ Huynh
            </Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Bảo Mật
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              Điều Khoản
            </Link>
          </div>

          <div className="text-ink-muted/80 text-center sm:text-right">
            © {new Date().getFullYear()} AI School. Khung thẩm định năng lực K–12 Việt Nam.
          </div>
        </div>
      </div>
    </footer>
  );
}
