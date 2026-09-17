import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("Landing Page Experience", () => {
  it("renders main heading H1, primary CTA, and core sections", () => {
    render(<HomePage />);

    // H1 (V3 Knowledge Control)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Con không chỉ cần học thêm."
    );

    // Primary CTA
    const ctas = screen.getAllByRole("link", { name: /chẩn đoán/i });
    expect(ctas.length).toBeGreaterThan(0);

    // V3 Vertical Slice Section
    expect(
      screen.getByText(/Lát Cắt Mẫu Chuẩn Hóa Thực Tế/i)
    ).toBeInTheDocument();

    // FAQ section
    expect(
      screen.getByRole("heading", { level: 2, name: /Những Câu Hỏi Phụ Huynh Hay Thắc Mắc/i })
    ).toBeInTheDocument();

    // Privacy hint
    expect(
      screen.getAllByText(/Không yêu cầu Số điện thoại/i).length
    ).toBeGreaterThan(0);
  });
});
