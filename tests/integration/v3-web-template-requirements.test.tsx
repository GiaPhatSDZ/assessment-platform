import { describe, it, expect } from "vitest";
import { siteConfig } from "@/src/config/site";
import { MathText } from "@/components/math/MathText";
import { LearnerHome } from "@/components/v3/profile/LearnerHome";
import { DiagnosticWorkspace } from "@/components/v3/diagnostic/DiagnosticWorkspace";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("V3 Web Design Templates & Routing Requirements", () => {
  it("ensures public navigation does not link to legacy adult career assessment", () => {
    const allLinks = [
      ...siteConfig.navItems.map((item) => item.href),
      ...siteConfig.footerLinks.map((item) => item.href),
    ];
    expect(allLinks).not.toContain("/assessment/ai-career-readiness");
  });

  it("renders math without leaving raw \\frac in the DOM text output", () => {
    const rawMathString = "Tính kết quả của phép tính: \\frac{3}{8} + \\frac{5}{12}";
    const { container } = render(<MathText text={rawMathString} />);

    // Raw \frac should not appear in raw form in any text node
    expect(container.textContent).not.toContain("\\frac");
    // Should have rendered katex or mathml elements
    expect(container.querySelector(".katex")).not.toBeNull();
  });

  it("ensures math options with pure fractions render cleanly", () => {
    const { container } = render(<MathText text="\\frac{19}{24}" />);
    expect(container.textContent).not.toContain("\\frac");
    expect(container.querySelector(".katex")).not.toBeNull();
  });

  it("ensures LearnerHome (/learn) has primary CTA linking to /learn/new and does not render generic /100 score", () => {
    render(<LearnerHome user={{ displayName: "Bảo Nam" }} />);

    const newDiagnosticLinks = screen.getAllByRole("link", {
      name: /Bắt đầu chẩn đoán kiến thức|Chọn bài kiểm tra mới/i,
    });
    expect(newDiagnosticLinks.length).toBeGreaterThan(0);
    expect(newDiagnosticLinks[0]).toHaveAttribute("href", "/learn/new");

    // Must not show generic capability average
    expect(screen.queryByText(/Điểm trung bình năng lực/i)).toBeNull();
  });

  it("ensures DiagnosticWorkspace contains no production developer cheat controls", () => {
    const initialItems = CurriculumService.getInitialDiagnosticItems();
    render(
      <DiagnosticWorkspace
        items={initialItems}
        subjectTitle="Toán Lớp 6"
        topicTitle="Phân số"
        onComplete={() => {}}
      />
    );

    // No developer cheat buttons
    expect(screen.queryByText(/Mô phỏng ngộ nhận thực tế/i)).toBeNull();
    expect(screen.queryByText(/Điền đáp án đúng toàn bộ/i)).toBeNull();

    // No legacy adult career question
    expect(
      screen.queryByText(/Khi đọc một báo cáo nhận định chuyên môn/i)
    ).toBeNull();
  });
});
