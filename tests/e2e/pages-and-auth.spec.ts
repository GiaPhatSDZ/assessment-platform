import { test, expect } from "@playwright/test";

test.describe("M6 & M7 & M8 E2E Flow: Auth, Legal, Dashboard, Admin Gates", () => {
  test("loads legal pages with correct headings and disclaimers", async ({ page }) => {
    // 1. Privacy page
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(/Chính Sách Bảo Mật/i);
    await expect(page.getByText("Không Thu Thập Số Điện Thoại", { exact: true })).toBeVisible();

    // 2. Terms page
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText(/Điều Khoản Dịch Vụ/i);
    await expect(page.getByText(/Tuyên bố từ chối trách nhiệm quan trọng/i)).toBeVisible();
  });

  test("loads login page and renders magic link form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/Đăng Nhập Học Viên/i);
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.getByRole("button", { name: /Gửi liên kết Magic Link/i })).toBeVisible();
  });

  test("unauthenticated access to /dashboard prompts login gate", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Đăng Nhập Để Xem Bảng Điều Khiển/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Đăng nhập bằng Magic Link/i })).toBeVisible();
  });

  test("unauthenticated access to /admin prompts admin login gate", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/Yêu Cầu Xác Thực Quản Trị/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Đăng nhập quản trị viên/i })).toBeVisible();
  });
});
