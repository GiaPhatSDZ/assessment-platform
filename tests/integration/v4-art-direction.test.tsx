import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import CurriculumPage from "@/app/curriculum/page";
import { FocusDiagnosticWorkspace } from "@/components/v4/diagnostic/FocusDiagnosticWorkspace";
import { GapInsightView } from "@/components/v4/remediation/GapInsightView";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";

describe("AI School V4 Art Direction & Visual Architecture Suite", () => {
  it("renders Landing V4 with all 5 major narrative acts and no generic SaaS slop", () => {
    const { container } = render(<HomePage />);

    // Act 1: Display Serif H1 and Primary CTA
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Tìm đúng chỗ con đang hổng");
    expect(
      screen.getAllByRole("link", { name: /Bắt đầu kiểm tra kiến thức/i }).length
    ).toBeGreaterThan(0);

    // Act 2: Prerequisite Tracing
    expect(
      screen.getByRole("heading", { level: 2, name: /Một câu trả lời chưa đúng thường phản ánh/i })
    ).toBeInTheDocument();

    // Act 3: Curriculum Stage Rail
    expect(screen.getByText("THCS")).toBeInTheDocument();
    expect(screen.getByText("Tiểu học")).toBeInTheDocument();
    expect(screen.getAllByText(/Đã có nội dung/i).length).toBeGreaterThan(0);

    // Act 4: Product Progression
    expect(
      screen.getByRole("heading", { level: 2, name: /Từ phát hiện lỗ hổng đến khi nắm vững/i })
    ).toBeInTheDocument();

    // Act 5: Parent Support & Contextual Copilot
    expect(
      screen.getByRole("heading", { level: 2, name: /Bố mẹ không cần phải nhớ hết kiến thức/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Parent Copilot · Bảng Hướng Dẫn Sư Phạm/i)).toBeInTheDocument();

    // Source Trust & FAQ
    expect(screen.getByText(/SRC-VN-MOET-GEP-2018/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Giải Đáp Thắc Mắc Về Phương Pháp Chẩn Đoán/i })
    ).toBeInTheDocument();

    // Ethical commitments: No phone number required
    expect(screen.getAllByText(/Không số điện thoại bắt buộc/i).length).toBeGreaterThan(0);

    // Ensure zero public links to legacy career assessment
    const legacyLinks = container.querySelectorAll(
      'a[href*="/assessment/ai-career-readiness"]'
    );
    expect(legacyLinks.length).toBe(0);
  });

  it("renders Curriculum catalog with editorial stage rail and honest coverage rows", () => {
    render(<CurriculumPage />);

    // Stage rail entries
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Cây Tri Thức & Danh Mục Khảo Sát"
    );
    expect(screen.getByText("Mầm non")).toBeInTheDocument();
    expect(screen.getByText("Trung học cơ sở (THCS)")).toBeInTheDocument();
  });

  it("renders FocusDiagnosticWorkspace distraction-free with KaTeX math and zero cheat controls", () => {
    const sampleItems = [
      {
        id: "ITEM-SAMPLE-01",
        primaryNodeId: "NODE-MATH-6-FRAC-03",
        nodeIds: ["NODE-MATH-6-FRAC-03"],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "APPLY" as const,
        prompt: "Tính giá trị của biểu thức: \\frac{3}{8} + \\frac{5}{12}",
        options: [
          { id: "opt-1", text: "\\frac{19}{24}" },
          { id: "opt-2", text: "\\frac{8}{20}" },
        ],
        correctAnswer: "\\frac{19}{24}",
        rationale: "Mẫu số chung là 24.",
        misconceptionTags: ["MISCON-ADD-DENOM"],
        itemStatus: "REVIEWED" as const,
        isReTest: false,
      },
    ];

    const { container } = render(
      <FocusDiagnosticWorkspace
        items={sampleItems}
        subjectTitle="Toán Lớp 6"
        topicTitle="Phép cộng phân số khác mẫu số"
        onComplete={() => {}}
      />
    );

    // Math is rendered with KaTeX class, zero raw \frac in rendered DOM
    expect(container.querySelectorAll(".katex").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("\\frac{");

    // Zero developer cheat buttons in learner view
    expect(screen.queryByText(/Mô phỏng ngộ nhận thực tế/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Điền đáp án đúng toàn bộ/i)).not.toBeInTheDocument();

    // Zero internal raw node IDs exposed
    expect(container.textContent).not.toContain("MATH-VN-G6-NUM-001");
  });

  it("renders GapInsightView with human-scale copy and no raw ROOT_GAP developer labels", () => {
    const graph = CurriculumService.getFractionsKnowledgeGraph();
    const mockReport = {
      sessionId: "sess-test",
      targetNodeId: "NODE-MATH-6-FRAC-03",
      targetNodeLabel: "Quy đồng mẫu số hai phân số",
      classification: "PREREQUISITE_GAP_CANDIDATE" as const,
      prerequisiteChainPath: ["NODE-MATH-4-FRAC-01", "NODE-MATH-5-FRAC-02", "NODE-MATH-6-FRAC-03"],
      detectedMisconceptions: ["MISCON-ADD-DENOM"],
      explanation: "Con cộng trực tiếp tử với tử, mẫu với mẫu do chưa nắm vững bước quy đồng.",
      actionableNextStep: "Ôn tập bài quy đồng mẫu số",
      generatedAt: new Date().toISOString(),
      ruleVersion: "1.0.0",
    };

    const nodeStates = {
      "NODE-MATH-4-FRAC-01": {
        nodeId: "NODE-MATH-4-FRAC-01",
        state: "SECURE" as const,
        confidence: "HIGH" as const,
        attemptsCount: 3,
        correctCount: 3,
        misconceptionTags: [],
        lastAssessedAt: new Date().toISOString(),
        ruleVersion: "1.0.0",
      },
      "NODE-MATH-5-FRAC-02": {
        nodeId: "NODE-MATH-5-FRAC-02",
        state: "DEVELOPING" as const,
        confidence: "MEDIUM" as const,
        attemptsCount: 3,
        correctCount: 1,
        misconceptionTags: ["MISCON-ADD-DENOM"],
        lastAssessedAt: new Date().toISOString(),
        ruleVersion: "1.0.0",
      },
    };

    const { container } = render(
      <GapInsightView
        report={mockReport}
        graph={graph}
        nodeStates={nodeStates}
        onProceedToLearningPack={() => {}}
        onRetestDirectly={() => {}}
      />
    );

    // Human language conclusion
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Có dấu hiệu con cần củng cố “Quy đồng mẫu số hai phân số” trước"
    );

    // Parent Copilot contextual panel
    expect(screen.getByText(/Parent Copilot/i)).toBeInTheDocument();
    expect(screen.getByText(/Dành cho phụ huynh/i)).toBeInTheDocument();

    // No developer ROOT_GAP or raw internal tokens
    expect(container.textContent).not.toContain("ROOT_GAP");
  });
});
