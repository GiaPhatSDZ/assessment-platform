import { ResultBandDefinition } from "./types";

export const DEFAULT_RESULT_BANDS: ResultBandDefinition[] = [
  {
    id: "emerging",
    minScore: 0,
    maxScore: 39,
    label: "Khởi đầu",
    description: "Năng lực đang ở giai đoạn làm quen và tiếp cận ban đầu, cần thêm trải nghiệm thực tế.",
  },
  {
    id: "developing",
    minScore: 40,
    maxScore: 59,
    label: "Đang phát triển",
    description: "Đã nắm bắt được nguyên lý cơ bản và có khả năng áp dụng trong các tình huống quen thuộc.",
  },
  {
    id: "strong",
    minScore: 60,
    maxScore: 79,
    label: "Vững vàng",
    description: "Thành thạo trong xử lý công việc, tư duy chủ động và linh hoạt với những thay đổi phức tạp.",
  },
  {
    id: "standout",
    minScore: 80,
    maxScore: 100,
    label: "Xuất sắc",
    description: "Năng lực nổi bật, khả năng dẫn dắt, đổi mới và tạo ra giá trị khác biệt mang tính bền vững.",
  },
];

export function getResultBand(
  score: number,
  customBands: ResultBandDefinition[] = DEFAULT_RESULT_BANDS
): ResultBandDefinition {
  const clamped = Math.min(100, Math.max(0, score));

  for (const band of customBands) {
    if (clamped >= band.minScore && clamped <= band.maxScore) {
      return band;
    }
  }

  // Fallback to highest band if 100 or lowest if 0
  if (clamped >= 100 && customBands.length > 0) {
    return customBands[customBands.length - 1];
  }
  return customBands[0];
}
