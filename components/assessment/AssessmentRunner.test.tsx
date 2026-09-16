import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssessmentRunner } from "./AssessmentRunner";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

describe("AssessmentRunner Component", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("renders the first question, progress bar, and option choices", () => {
    render(<AssessmentRunner assessment={aiCareerReadinessAssessmentV1} />);

    expect(screen.getByText(/Câu hỏi 1 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(aiCareerReadinessAssessmentV1.questions[0].prompt)).toBeInTheDocument();

    const option1 = screen.getByText(aiCareerReadinessAssessmentV1.questions[0].options[0].label);
    expect(option1).toBeInTheDocument();
  });

  it("selects an option on click and enables Next button", () => {
    render(<AssessmentRunner assessment={aiCareerReadinessAssessmentV1} />);

    const nextBtn = screen.getByRole("button", { name: /Câu tiếp theo/i });
    expect(nextBtn).toBeDisabled();

    const option1Btn = screen.getByRole("button", {
      name: new RegExp(aiCareerReadinessAssessmentV1.questions[0].options[0].label, "i"),
    });
    fireEvent.click(option1Btn);

    expect(nextBtn).not.toBeDisabled();
  });

  it("navigates forward to question 2 and then back to question 1", () => {
    render(<AssessmentRunner assessment={aiCareerReadinessAssessmentV1} />);

    // Select option for question 1
    const option1Btn = screen.getByRole("button", {
      name: new RegExp(aiCareerReadinessAssessmentV1.questions[0].options[0].label, "i"),
    });
    fireEvent.click(option1Btn);

    // Click Next
    const nextBtn = screen.getByRole("button", { name: /Câu tiếp theo/i });
    fireEvent.click(nextBtn);

    // Expect question 2
    expect(screen.getByText(/Câu hỏi 2 \/ 10/i)).toBeInTheDocument();

    // Click Back
    const backBtn = screen.getByRole("button", { name: /Quay lại/i });
    fireEvent.click(backBtn);

    // Back to question 1 with option still selected
    expect(screen.getByText(/Câu hỏi 1 \/ 10/i)).toBeInTheDocument();
    expect(option1Btn).toHaveAttribute("aria-pressed", "true");
  });

  it("supports keyboard numeric shortcuts (pressing '1' selects option 1)", () => {
    render(<AssessmentRunner assessment={aiCareerReadinessAssessmentV1} />);

    fireEvent.keyDown(window, { key: "1" });

    const option1Btn = screen.getByRole("button", {
      name: new RegExp(aiCareerReadinessAssessmentV1.questions[0].options[0].label, "i"),
    });
    expect(option1Btn).toHaveAttribute("aria-pressed", "true");
  });
});
