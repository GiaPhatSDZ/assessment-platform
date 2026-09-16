import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReportPageContent } from "./ReportPageContent";

describe("Report Page Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders personalized summary, strengths, growth areas, and action plan from API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        report: {
          summary: "Báo cáo năng lực tổng hợp ghi nhận thế mạnh vượt trội ở tư duy phân tích.",
          strengths: [
            {
              dimensionId: "analytical_thinking",
              title: "Tư duy phân tích sắc sảo",
              description: "Luôn tìm kiếm bằng chứng xác thực.",
            },
          ],
          growthAreas: [
            {
              dimensionId: "ai_literacy",
              title: "Nâng cao kỹ năng Prompt",
              description: "Cần tối ưu hóa quy trình cộng tác với AI.",
            },
          ],
          actionPlan: [
            {
              step: 1,
              timeframe: "Tuần 1 - 2",
              title: "Thực hành Prompt Engineering",
              description: "Thực hành các mẫu prompt nâng cao.",
            },
          ],
          disclaimer: "Kết quả tự đánh giá mang tính tham khảo.",
        },
      }),
    });

    render(<ReportPageContent sessionId="sess-test-999" />);

    await waitFor(() => {
      expect(
        screen.getByText(/Báo cáo năng lực tổng hợp ghi nhận thế mạnh/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Tư duy phân tích sắc sảo")).toBeInTheDocument();
    expect(screen.getByText("Nâng cao kỹ năng Prompt")).toBeInTheDocument();
    expect(screen.getByText("Thực hành Prompt Engineering")).toBeInTheDocument();
    expect(screen.getByText("Tuần 1 - 2")).toBeInTheDocument();
  });

  it("gracefully displays fallback message when API fails while preserving scores", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    render(<ReportPageContent sessionId="sess-fail-123" />);

    await waitFor(() => {
      expect(
        screen.getByRole("alert")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Báo cáo diễn giải AI tạm thời không khả dụng/i)
    ).toBeInTheDocument();

    // Deterministic dimension scores still remain visible
    expect(screen.getByText("Tư duy phân tích")).toBeInTheDocument();
  });
});
