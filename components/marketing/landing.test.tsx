import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("Landing Page Experience", () => {
  it("renders main heading H1, primary CTA, and core sections", () => {
    render(<HomePage />);

    // H1
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Đo lường năng lực thực chất trong kỷ nguyên Trí tuệ Nhân tạo"
    );

    // Primary CTA
    const ctas = screen.getAllByRole("link", { name: /Bắt đầu/i });
    expect(ctas.length).toBeGreaterThan(0);

    // 4 Dimensions
    expect(screen.getAllByText("Tư duy phân tích").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Giải quyết vấn đề").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hiểu biết & ứng dụng AI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Khả năng thích nghi").length).toBeGreaterThan(0);

    // FAQ section
    expect(
      screen.getByRole("heading", { level: 2, name: /Câu hỏi thường gặp/i })
    ).toBeInTheDocument();

    // Disclaimer hint
    expect(
      screen.getByText(/Không yêu cầu đăng ký tài khoản trước/i)
    ).toBeInTheDocument();
  });
});
