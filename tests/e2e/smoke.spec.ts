import { test, expect } from "@playwright/test";

test.describe("E2E Smoke Suite", () => {
  test("loads landing page and renders heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Đo lường năng lực thực chất trong kỷ nguyên Trí tuệ Nhân tạo"
    );
    await expect(page.getByText("Assessment Studio").first()).toBeVisible();
  });
});
