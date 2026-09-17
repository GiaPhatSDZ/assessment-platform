export function Faq() {
  const faqItems = [
    {
      question: "Hệ thống có chấm điểm phần trăm hay xếp hạng so sánh con với học sinh khác không?",
      answer: "Không. Điểm số phần trăm hoặc xếp hạng phần trăm (percentile) chỉ có ý nghĩa khi có bộ dữ liệu chuẩn hóa quốc gia đã được thẩm định. Thay vào đó, hệ thống xác định trạng thái thực chất của từng nút tri thức: Chưa đánh giá, Cần theo dõi, Đang bồi dưỡng, hoặc Đã làm chủ vững vàng.",
    },
    {
      question: "Tại sao hệ thống không bắt buộc nhập số điện thoại hay thông tin cá nhân của con?",
      answer: "Chúng tôi tuân thủ triệt để nguyên tắc bảo vệ quyền riêng tư cho học sinh và gia đình. Bạn không cần nhập số điện thoại, không sợ bị các cuộc gọi telesale làm phiền. Mọi dữ liệu phiên làm bài được bảo mật và bạn có thể tra cứu lại bất cứ lúc nào.",
    },
    {
      question: "Gemini Notebook có tự động cho điểm hay quyết định trình độ của con không?",
      answer: "Không. Trợ lý Gemini Notebook chỉ đóng vai trò hỗ trợ giải thích, trả lời thắc mắc dựa trên các tài liệu nguồn chuẩn được nạp vào. Quyết định học sinh đã làm chủ kiến thức hay chưa chỉ được xác nhận sau khi con hoàn thành bài kiểm tra lại độc lập trên hệ thống.",
    },
    {
      question: "Hệ thống lấy đâu ra cơ sở để nói con tôi bị hổng kiến thức?",
      answer: "Mọi chuẩn kiến thức và yêu cầu cần đạt được trích lục trực tiếp từ Chương trình Giáo dục phổ thông (Thông tư 32/2018/TT-BGDĐT) của Bộ GD&ĐT Việt Nam. Cây kiến thức tiên quyết và các ngộ nhận được xây dựng dựa trên nghiên cứu sư phạm thực chứng.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Minh Bạch Sư Phạm
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Những Câu Hỏi Phụ Huynh Hay Thắc Mắc
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqItems.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
            >
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                {item.question}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
