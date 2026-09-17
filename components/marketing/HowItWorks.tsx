export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Chẩn Đoán Khách Quan",
      description: "Học sinh thực hiện 3–4 câu hỏi trọng tâm. Hệ thống phân tích từng phương án chọn để phát hiện các ngộ nhận sư phạm điển hình.",
    },
    {
      step: "02",
      title: "Lần Theo Cây Tiên Quyết",
      description: "Thuật toán truy vết ngược đồ thị tri thức để xác định: Con đang sai ở bài hiện tại hay bắt nguồn từ lỗ hổng kiến thức nền tảng của lớp dưới.",
    },
    {
      step: "03",
      title: "Gói Học Tập & Gemini Notebook",
      description: "Hệ thống chuẩn bị ví dụ mẫu có hướng dẫn, tài liệu nguồn chuẩn và prompt để học sinh đàm thoại học tập an toàn cùng trợ lý AI.",
    },
    {
      step: "04",
      title: "Kiểm Tra Lại & Đóng Lỗ Hổng",
      description: "Làm bài kiểm tra song song với số liệu mới. Khi vượt qua, hệ thống cập nhật hồ sơ từ 'Đang hổng' sang 'Đã làm chủ kiến thức'.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Quy Trình Sư Phạm Khép Kín
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Vòng Lặp Kiểm Soát Kiến Thức 4 Bước
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Không dừng lại ở việc chấm điểm rồi để đó. Mỗi lỗ hổng phát hiện đều có lộ trình bồi đắp và kiểm tra lại cụ thể.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="font-serif text-2xl font-black text-indigo-600/30 dark:text-indigo-400/30">
                {item.step}
              </div>
              <h3 className="mt-2 font-serif text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
