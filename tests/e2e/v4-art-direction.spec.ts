import { test, expect } from "@playwright/test";

const REQUIRED_VIEWPORTS = [
  { name: "mobile-small-360", width: 360, height: 640 },
  { name: "mobile-modern-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

test.describe("AI School V4 Art Direction & Responsive Layout Suites", () => {
  for (const vp of REQUIRED_VIEWPORTS) {
    test(`renders Landing Act 1-5 at ${vp.name} (${vp.width}x${vp.height}) without horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Act 1: Lora Serif H1 is visible
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      await expect(h1).toContainText("Tìm đúng chỗ con đang hổng");

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Act 2: Prerequisite tracing section is present
      await expect(
        page.getByRole("heading", { level: 2, name: /Một câu trả lời sai hiếm khi vì lười biếng/i })
      ).toBeVisible();

      // Act 3: Stage rail is present
      await expect(page.getByText("THCS").first()).toBeVisible();

      // Act 5: Parent Copilot scene is present
      await expect(page.getByText(/Parent Copilot/i).first()).toBeVisible();
    });
  }

  test("flows from Landing -> /curriculum -> /diagnostic/math-grade6 in Focus Mode", async ({
    page,
  }) => {
    // 1. Curriculum catalog
    await page.goto("/curriculum");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Cây Tri Thức & Danh Mục Khảo Sát"
    );

    // Click to start diagnostic from row
    const diagLink = page.getByRole("link", { name: /Làm bài chẩn đoán/i }).first();
    await expect(diagLink).toBeVisible();
    await diagLink.click();

    // Reached /diagnostic/math-grade6 in Focus Mode
    await expect(page).toHaveURL(/.*\/diagnostic\/math-grade6/);

    // Verify Focus Mode Minimalist Header and zero marketing slop
    await expect(page.getByText("Chế độ tập trung")).toBeVisible();
    await expect(page.getByText("Thoát ra góc học tập")).toBeVisible();

    // Verify math rendering with KaTeX
    await expect(page.locator(".katex").first()).toBeVisible();

    // Zero developer cheat buttons or raw node IDs
    await expect(page.getByText("Mô phỏng ngộ nhận thực tế")).toHaveCount(0);
    await expect(page.getByText("Điền đáp án đúng toàn bộ")).toHaveCount(0);
    await expect(page.getByText("MATH-VN-G6-NUM-001")).toHaveCount(0);

    // Select option 1 and click Next
    const firstOption = page.locator("button[type='button']").filter({ hasText: "1" }).first();
    await firstOption.click();
    await page.getByRole("button", { name: /Tiếp tục/i }).click();

    // Advanced to question 2
    await expect(page.getByText(/Câu 2 \//i)).toBeVisible();
  });
});
