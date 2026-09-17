import React from "react";
import { BookMarked, ShieldCheck, Scale } from "lucide-react";

export function SourceTrustBand() {
  const sources = [
    {
      code: "SRC-VN-MOET-GEP-2018",
      name: "Chương trình Giáo dục Phổ thông Tổng thể",
      authority: "Bộ Giáo dục và Đào tạo Việt Nam",
      legalDoc: "Thông tư 32/2018/TT-BGDĐT",
    },
    {
      code: "SRC-VN-MOET-MATH-2018",
      name: "Chương trình Giáo dục Phổ thông Môn Toán",
      authority: "Bộ Giáo dục và Đào tạo Việt Nam",
      legalDoc: "Thông tư 32/2018/TT-BGDĐT",
    },
    {
      code: "SRC-VN-MOET-PRESCHOOL-2016",
      name: "Chương trình Giáo dục Mầm non Quốc gia",
      authority: "Bộ Giáo dục và Đào tạo Việt Nam",
      legalDoc: "Thông tư 28/2016/TT-BGDĐT & Đề án Thí điểm 2026",
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-line/60 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-2 mb-10">
          <span className="text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
            Căn Cứ Thẩm Quyền Quốc Gia
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
            Mọi chuẩn kiến thức đều có nguồn gốc pháp lý rõ ràng.
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Hệ thống không tự ý phát minh chuẩn kiến thức hay dùng AI sinh câu hỏi tùy tiện. Toàn bộ cây tri thức đều được trích xuất từ văn bản quy phạm pháp luật chính thức.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sources.map((src) => (
            <div
              key={src.code}
              className="rounded-app border border-line/60 bg-canvas p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold text-brand bg-surface px-2 py-0.5 rounded border border-line/40">
                  {src.code}
                </span>
                <Scale className="h-4 w-4 text-ink-muted" />
              </div>

              <div className="font-serif text-base font-bold text-ink">
                {src.name}
              </div>

              <div className="space-y-1 text-2xs text-ink-muted border-t border-line/40 pt-3">
                <div>
                  Cơ quan ban hành: <span className="font-medium text-ink">{src.authority}</span>
                </div>
                <div>
                  Căn cứ pháp lý: <span className="font-medium text-ink">{src.legalDoc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
