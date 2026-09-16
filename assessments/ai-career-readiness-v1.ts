import { AssessmentDefinition } from "../src/domain/assessment/types";
import { DEFAULT_RESULT_BANDS } from "../src/domain/assessment/result-bands";

export const AI_CAREER_READINESS_SLUG = "ai-career-readiness";

export const aiCareerReadinessAssessmentV1: AssessmentDefinition = {
  id: "asmt-ai-career-readiness-v1",
  slug: AI_CAREER_READINESS_SLUG,
  title: "Đánh Giá Mức Độ Sẵn Sàng Nghề Nghiệp Trong Kỷ Nguyên AI",
  locale: "vi",
  version: 1,
  status: "published",
  description:
    "Công cụ tự đánh giá giúp bạn nhận diện rõ ràng 4 nhóm năng lực cốt lõi: Tư duy phân tích, Giải quyết vấn đề, Hiểu biết & ứng dụng AI, cùng Khả năng thích nghi trong môi trường làm việc hiện đại.",
  disclaimer:
    "Kết quả tự đánh giá mang tính chất tham khảo định hướng phát triển cá nhân, không cấu thành chẩn đoán tâm lý, y khoa hoặc thẩm định nhân sự chính thức.",
  dimensions: [
    {
      id: "analytical_thinking",
      label: "Tư duy phân tích",
      shortDescription:
        "Khả năng phân rã vấn đề phức tạp, đối chiếu dữ liệu khách quan và tư duy suy luận logic.",
      order: 1,
    },
    {
      id: "problem_solving",
      label: "Giải quyết vấn đề",
      shortDescription:
        "Kỹ năng xác định nguyên nhân gốc rễ, đưa ra giải pháp thực tế và quyết đoán khi gặp trở ngại.",
      order: 2,
    },
    {
      id: "ai_literacy",
      label: "Hiểu biết & ứng dụng AI",
      shortDescription:
        "Năng lực phối hợp hiệu quả với các mô hình AI, thẩm định kết quả và tối ưu hóa hiệu suất.",
      order: 3,
    },
    {
      id: "adaptability",
      label: "Khả năng thích nghi",
      shortDescription:
        "Sự sẵn sàng tiếp thu điều mới, kiên cường trước thay đổi và tinh thần tự học tập liên tục.",
      order: 4,
    },
  ],
  questions: [
    {
      id: "q1",
      type: "single_choice_scale",
      prompt:
        "Khi tiếp nhận một tập thông tin hoặc dữ liệu có mâu thuẫn trong công việc, cách tiếp cận thông thường của bạn là gì?",
      required: true,
      options: [
        { id: "q1_opt1", label: "Tôi thường bỏ qua và chọn số liệu có sẵn dễ dùng nhất", value: 1 },
        { id: "q1_opt2", label: "Hỏi ý kiến đồng nghiệp mà không đào sâu nguồn gốc số liệu", value: 2 },
        { id: "q1_opt3", label: "Tự rà soát lại nguồn gốc nhưng dừng lại khi thấy tạm ổn", value: 3 },
        { id: "q1_opt4", label: "Phân tách từng nguồn, đối chiếu chéo phương pháp thu thập dữ liệu", value: 4 },
        { id: "q1_opt5", label: "Xây dựng khung phân tích đối chiếu đa chiều và lập luận dựa trên bằng chứng xác thực", value: 5 },
      ],
      scoring: [{ dimensionId: "analytical_thinking", weight: 1.5 }],
    },
    {
      id: "q2",
      type: "single_choice_scale",
      prompt:
        "Khi đọc một báo cáo nhận định chuyên môn, bạn đánh giá các kết luận được đưa ra như thế nào?",
      required: true,
      options: [
        { id: "q2_opt1", label: "Chấp nhận hoàn toàn kết luận nếu đến từ người có thâm niên", value: 1 },
        { id: "q2_opt2", label: "Chỉ chú ý đến biểu đồ tổng quát mà ít khi kiểm tra số liệu chi tiết", value: 2 },
        { id: "q2_opt3", label: "Xem xét xem kết luận có trực quan và hợp lý theo kinh nghiệm cá nhân", value: 3 },
        { id: "q2_opt4", label: "Đặt câu hỏi về các giả định ẩn và phương sai của mẫu số liệu", value: 4 },
        { id: "q2_opt5", label: "Phân tích cấu trúc lập luận, bóc tách mối liên hệ nhân quả và kiểm tra các điểm mù logic", value: 5 },
      ],
      scoring: [{ dimensionId: "analytical_thinking", weight: 1.5 }],
    },
    {
      id: "q3",
      type: "single_choice_scale",
      prompt:
        "Khi một quy trình hoặc dự án gặp sự cố bất ngờ dẫn đến chậm trễ, phản ứng đầu tiên của bạn là gì?",
      required: true,
      options: [
        { id: "q3_opt1", label: "Cảm thấy lúng túng và chờ đợi chỉ đạo tiếp theo từ cấp trên", value: 1 },
        { id: "q3_opt2", label: "Tìm cách đối phó tạm thời để hoàn tất hạn chót mà không khắc phục gốc rễ", value: 2 },
        { id: "q3_opt3", label: "Khắc phục các lỗi trực diện đã thấy rõ", value: 3 },
        { id: "q3_opt4", label: "Cách ly điểm nghẽn, truy vết nguyên nhân trực tiếp và điều chỉnh bước tiếp theo", value: 4 },
        { id: "q3_opt5", label: "Sử dụng phương pháp truy nguyên gốc rễ (Root-cause analysis) và lập phương án phòng ngừa dài hạn", value: 5 },
      ],
      scoring: [{ dimensionId: "problem_solving", weight: 1.2 }],
    },
    {
      id: "q4",
      type: "single_choice_scale",
      prompt:
        "Trong tình huống khẩn cấp cần đưa ra quyết định mà dữ liệu hiện tại còn thiếu sót, bạn hành động ra sao?",
      required: true,
      options: [
        { id: "q4_opt1", label: "Trì hoãn quyết định cho đến khi có đầy đủ dữ liệu hoàn hảo", value: 1 },
        { id: "q4_opt2", label: "Quyết định hoàn toàn dựa vào may rủi hoặc cảm tính nhất thời", value: 2 },
        { id: "q4_opt3", label: "Chọn giải pháp an toàn nhất dù hiệu quả có thể rất thấp", value: 3 },
        { id: "q4_opt4", label: "Đánh giá xác suất rủi ro, chọn giải pháp tối ưu và thiết lập chốt chặn an toàn", value: 4 },
        { id: "q4_opt5", label: "Xác định rõ giới hạn thông tin, cân bằng chi phí rủi ro và ra quyết định dứt khoát có kế hoạch ứng phó dự phòng", value: 5 },
      ],
      scoring: [{ dimensionId: "problem_solving", weight: 1.3 }],
    },
    {
      id: "q5",
      type: "single_choice_scale",
      prompt:
        "Khi gặp một bài toán chưa từng có tiền lệ trong lĩnh vực công việc của mình, bạn tìm giải pháp như thế nào?",
      required: true,
      options: [
        { id: "q5_opt1", label: "Tuyên bố bài toán không khả thi và từ chối xử lý", value: 1 },
        { id: "q5_opt2", label: "Thử sai lặp đi lặp lại một cách ngẫu nhiên", value: 2 },
        { id: "q5_opt3", label: "Tìm kiếm các ví dụ tương tự trên mạng để sao chép", value: 3 },
        { id: "q5_opt4", label: "Phân rã bài toán thành các khối nhỏ đã biết và nghiên cứu các nguyên lý tương đương", value: 4 },
        { id: "q5_opt5", label: "Vận dụng tư duy nguyên lý căn bản (First Principles), kết hợp các mô hình tư duy đa ngành để thiết kế giải pháp đột phá", value: 5 },
      ],
      scoring: [
        { dimensionId: "problem_solving", weight: 1.0 },
        { dimensionId: "analytical_thinking", weight: 0.5 },
      ],
    },
    {
      id: "q6",
      type: "single_choice_scale",
      prompt:
        "Mức độ bạn ứng dụng các công cụ Trí tuệ nhân tạo (AI Generative, Code/Writing Assistants) vào công việc hàng ngày?",
      required: true,
      options: [
        { id: "q6_opt1", label: "Chưa từng sử dụng hoặc không tin tưởng bất kỳ công cụ AI nào", value: 1 },
        { id: "q6_opt2", label: "Thỉnh thoảng dùng như một công cụ tìm kiếm thay cho Google", value: 2 },
        { id: "q6_opt3", label: "Dùng định kỳ cho các việc đơn giản: tóm tắt văn bản, sửa lỗi chính tả", value: 3 },
        { id: "q6_opt4", label: "Tích hợp AI làm trợ lý phân tích, soạn thảo khung dự án và hỗ trợ viết code/nghiên cứu", value: 4 },
        { id: "q6_opt5", label: "Thiết kế quy trình làm việc cộng tác sâu giữa người và AI, tự động hóa các tác vụ phức tạp", value: 5 },
      ],
      scoring: [{ dimensionId: "ai_literacy", weight: 1.5 }],
    },
    {
      id: "q7",
      type: "single_choice_scale",
      prompt:
        "Khi AI đưa ra một kết quả phân tích hoặc khuyến nghị giải pháp, bạn thẩm định nội dung đó như thế nào?",
      required: true,
      options: [
        { id: "q7_opt1", label: "Sao chép nguyên văn vào báo cáo vì tin rằng AI luôn đúng", value: 1 },
        { id: "q7_opt2", label: "Đọc lướt qua xem có thuận tai không rồi sử dụng", value: 2 },
        { id: "q7_opt3", label: "Kiểm tra lại một vài con số hoặc dữ kiện dễ thấy", value: 3 },
        { id: "q7_opt4", label: "Chủ động kiểm tra hiện tượng ảo giác (hallucination), đối chiếu nguồn gốc dữ liệu bên ngoài", value: 4 },
        { id: "q7_opt5", label: "Thiết lập quy trình kiểm chứng nghiêm ngặt về tính chuẩn xác, bảo mật dữ liệu và sự thiên vị (bias) trước khi ứng dụng", value: 5 },
      ],
      scoring: [{ dimensionId: "ai_literacy", weight: 1.5 }],
    },
    {
      id: "q8",
      type: "single_choice_scale",
      prompt:
        "Khả năng bạn xây dựng câu lệnh (prompt) và bối cảnh (context) để chỉ đạo AI thực hiện nhiệm vụ phức tạp?",
      required: true,
      options: [
        { id: "q8_opt1", label: "Chỉ gõ câu hỏi ngắn một câu tương tự từ khóa tìm kiếm", value: 1 },
        { id: "q8_opt2", label: "Cung cấp một vài mô tả sơ lược và hy vọng AI hiểu ý", value: 2 },
        { id: "q8_opt3", label: "Áp dụng cấu trúc cơ bản: Vai trò + Nhiệm vụ", value: 3 },
        { id: "q8_opt4", label: "Tổ chức prompt có cấu trúc: Vai trò, bối cảnh, tiêu chí đánh giá, định dạng đầu ra và ví dụ cụ thể (Few-shot)", value: 4 },
        { id: "q8_opt5", label: "Thiết kế chuỗi suy luận (Chain-of-Thought), phân chia tác vụ nhiều bước và tinh chỉnh lặp lại để kiểm soát chất lượng tối ưu", value: 5 },
      ],
      scoring: [{ dimensionId: "ai_literacy", weight: 1.2 }],
    },
    {
      id: "q9",
      type: "single_choice_scale",
      prompt:
        "Khi cơ cấu tổ chức hoặc công nghệ cốt lõi tại nơi làm việc của bạn thay đổi đột ngột, tâm thế của bạn ra sao?",
      required: true,
      options: [
        { id: "q9_opt1", label: "Phản kháng, hoang mang và mong muốn quay về cách làm việc cũ", value: 1 },
        { id: "q9_opt2", label: "Chỉ miễn cưỡng làm theo quy định bắt buộc với tâm lý căng thẳng", value: 2 },
        { id: "q9_opt3", label: "Mất một khoảng thời gian dài mới bắt nhịp lại được công việc", value: 3 },
        { id: "q9_opt4", label: "Nhanh chóng chấp nhận thực tế và chủ động tìm hiểu các yêu cầu mới", value: 4 },
        { id: "q9_opt5", label: "Xem biến động là cơ hội tái định vị năng lực, dẫn dắt bản thân và hỗ trợ người khác thích nghi", value: 5 },
      ],
      scoring: [{ dimensionId: "adaptability", weight: 1.4 }],
    },
    {
      id: "q10",
      type: "single_choice_scale",
      prompt:
        "Tần suất và thái độ của bạn trong việc chủ động học tập các kiến thức hoặc công cụ mới nằm ngoài vùng an toàn?",
      required: true,
      options: [
        { id: "q10_opt1", label: "Không có nhu cầu học thêm bất kỳ điều gì ngoài kiến thức đã có", value: 1 },
        { id: "q10_opt2", label: "Chỉ học khi bị cấp trên yêu cầu hoặc đối mặt nguy cơ bị đào thải", value: 2 },
        { id: "q10_opt3", label: "Thỉnh thoảng đọc tin tức công nghệ mới nhưng ít khi thực hành", value: 3 },
        { id: "q10_opt4", label: "Dành thời gian hàng tuần tự học qua các khóa học, tài liệu và thử nghiệm thực tế", value: 4 },
        { id: "q10_opt5", label: "Duy trì kỷ luật học tập liên tục, liên tục thử nghiệm công nghệ mới và xây dựng các dự án thực nghiệm cá nhân", value: 5 },
      ],
      scoring: [
        { dimensionId: "adaptability", weight: 1.4 }],
    },
  ],
  resultBands: DEFAULT_RESULT_BANDS,
};
