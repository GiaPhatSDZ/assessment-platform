import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

test.describe("V3 Web Design Templates & Responsive Suites", () => {
  for (const vp of VIEWPORTS) {
    test(`renders Landing page cleanly at ${vp.name} (${vp.width}x${vp.height}) without horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Main H1 is visible
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Tìm đúng chỗ con đang hổng"
      );

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("flows from Landing -> /learn/new -> /diagnostic/math-grade6 cleanly", async ({
    page,
  }) => {
    await page.goto("/");
    const startCta = page.getByRole("link", { name: /Bắt đầu kiểm tra kiến thức/i }).first();
    await expect(startCta).toBeVisible();
    await startCta.click();

    // Reached /learn/new wizard
    await expect(page).toHaveURL(/.*\/learn\/new/);
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "Ai là người tham gia bài chẩn đoán"
    );

    // Step 1 -> Step 2
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByText("Chọn khối lớp theo chương trình")).toBeVisible();

    // Step 2 -> Step 3
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByText("Chọn môn học cần chẩn đoán")).toBeVisible();

    // Step 3 -> Step 4
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByText("Chọn chủ đề kiến thức mục tiêu")).toBeVisible();

    // Step 4 -> Enter diagnostic room
    await page.getByRole("button", { name: "Vào phòng chẩn đoán" }).click();
    await expect(page).toHaveURL(/.*\/diagnostic\/math-grade6/);

    // Verify diagnostic workspace has NO raw LaTeX and NO dev cheat buttons
    await expect(page.locator(".katex").first()).toBeVisible();
    await expect(page.getByText("Mô phỏng ngộ nhận thực tế")).toHaveCount(0);
    await expect(page.getByText("Điền đáp án đúng toàn bộ")).toHaveCount(0);
  });
});
