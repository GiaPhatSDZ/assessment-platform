import { test, expect } from "@playwright/test";

test.describe("E2E Smoke Suite", () => {
  test("loads landing page and renders heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Tìm đúng chỗ con đang hổng"
    );
    await expect(page.getByText("AI School V3").first()).toBeVisible();
  });
});
