import { test, expect } from "@playwright/test";

test.describe("M2 Local Deterministic Vertical Slice", () => {
  test("completes end-to-end assessment runner flow and verifies result refresh resilience", async ({
    page,
  }) => {
    // 1. Legacy Assessment Runner direct access for audit resilience
    await page.goto("/assessment/ai-career-readiness");

    // 3. Answer all 10 questions systematically
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(`Câu hỏi ${i} / 10`)).toBeVisible();

      // Click option 4 for all questions
      const options = page.locator("button[aria-pressed]");
      await expect(options.first()).toBeVisible();
      await options.nth(3).click(); // pick 4th option

      if (i < 10) {
        const nextButton = page.getByRole("button", { name: "Câu tiếp theo" });
        await nextButton.click();
      } else {
        const submitButton = page.getByRole("button", { name: /Hoàn thành & Xem kết quả/i });
        await submitButton.click();
      }
    }

    // 4. Result Page renders with deterministic score
    await expect(page).toHaveURL(/\/assessment\/ai-career-readiness\/result\//, {
      timeout: 15000,
    });

    await expect(page.getByText("Hồ Sơ Năng Lực Nghề Nghiệp Kỷ Nguyên AI")).toBeVisible();
    await expect(page.getByText("Tư duy phân tích").first()).toBeVisible();
    await expect(page.getByText("Giải quyết vấn đề").first()).toBeVisible();
    await expect(page.getByText("Hiểu biết & ứng dụng AI").first()).toBeVisible();
    await expect(page.getByText("Khả năng thích nghi").first()).toBeVisible();

    // Verify radar chart is rendered
    const radarChart = page.locator('svg[role="img"]');
    await expect(radarChart).toBeVisible();

    // 5. Test refresh resilience: reload page and verify result still appears
    await page.reload();
    await expect(page.getByText("Hồ Sơ Năng Lực Nghề Nghiệp Kỷ Nguyên AI")).toBeVisible();
    await expect(page.getByText("Tư duy phân tích").first()).toBeVisible();
  });
});
