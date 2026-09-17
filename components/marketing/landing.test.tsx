import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("Landing Page Experience", () => {
  it("renders main heading H1, primary CTA, and core sections", () => {
    render(<HomePage />);

    // H1 (V3 Template 01)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Tìm đúng chỗ con đang hổng"
    );

    // Primary CTA
    const ctas = screen.getAllByRole("link", { name: /Bắt đầu kiểm tra kiến thức/i });
    expect(ctas.length).toBeGreaterThan(0);

    // FAQ section
    expect(
      screen.getByRole("heading", { level: 2, name: /Giải Đáp Thắc Mắc Về Phương Pháp Chẩn Đoán/i })
    ).toBeInTheDocument();

    // Privacy assurances
    expect(
      screen.getAllByText(/Không số điện thoại bắt buộc/i).length
    ).toBeGreaterThan(0);
  });
});
