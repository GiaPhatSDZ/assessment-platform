import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../../app/page";

describe("Application Smoke Test", () => {
  it("renders HomePage heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Con không chỉ cần học thêm"
    );
  });
});
