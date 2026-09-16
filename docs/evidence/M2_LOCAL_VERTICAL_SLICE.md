# Evidence Report: Milestone M2 — Local Deterministic Vertical Slice

**Date:** 2026-09-17  
**Milestone:** M2 — Marketing Shell and Local Vertical Slice  
**Executor:** Gemini 3.8 Flash (Autonomous)  
**Status:** PASS  

---

## 1. Scope Verified

Milestone M2 proves the core end-to-end user journey on both Desktop and Mobile viewports without requiring external database or AI providers:

1. **Public Marketing Shell (`/`):**
   - Renders Vietnamese copy, hero badge, value propositions, 4 dimension previews, how-it-works 3-step guide, result preview, and FAQ.
   - Preserves referral parameter `?ref=...` into the assessment runner CTA link.
2. **Assessment Runner (`/assessment/[slug]`):**
   - Renders exactly 10 questions, single-choice scale (1..5), progress bar with counter.
   - Full keyboard operability (keys 1–5, Enter, Tab).
   - Refresh resilience via local session storage (`LocalBrowserSessionStore`).
   - Pure mathematical scoring engine invocation on final submission (`scoreAssessment`).
3. **Deterministic Result Preview (`/assessment/[slug]/result/[sessionId]`):**
   - Accessible SVG radar chart with dual text/score representations.
   - Dimension score cards for all 4 dimensions (`analytical_thinking`, `problem_solving`, `ai_literacy`, `adaptability`).
   - Qualitative result bands (Khởi đầu, Đang phát triển, Vững vàng, Xuất sắc).
   - Delayed lead capture trigger for AI action plan.
   - Refresh resilience (result reloads from stored finalized score snapshot).

---

## 2. Test Execution & Evidence

### 2.1 E2E Playwright Execution
- **Command:** `npx playwright test`
- **Browsers Tested:**
  - `chromium` (Desktop 1280x720)
  - `Mobile Chrome` (Pixel 5 viewport 393x851)
- **Output Summary:**
  ```text
  Running 4 tests using 2 workers
    ok 1 [chromium] › tests/e2e/smoke.spec.ts:4:7 › loads landing page and renders heading (2.4s)
    ok 3 [Mobile Chrome] › tests/e2e/smoke.spec.ts:4:7 › loads landing page and renders heading (2.1s)
    ok 4 [Mobile Chrome] › tests/e2e/vertical-slice.spec.ts:4:7 › completes end-to-end assessment runner flow and verifies result refresh resilience (9.9s)
    ok 2 [chromium] › tests/e2e/vertical-slice.spec.ts:4:7 › completes end-to-end assessment runner flow and verifies result refresh resilience (16.3s)
  4 passed (28.3s)
  ```

### 2.2 Unit & Integration Tests (Vitest)
- **Command:** `npm run test`
- **Output Summary:**
  ```text
  Test Files  10 passed (10)
  Tests       44 passed (44)
  Duration    14.15s
  ```

### 2.3 Quality Gates
- **`npm run typecheck`:** Exit code 0, strict mode compliant.
- **`npm run lint`:** Exit code 0, zero warnings or errors.
- **`npm run build`:** Exit code 0, all static and dynamic routes compiled successfully.

---

## 3. Known Limitations & Handoff to M3

- Current persistence relies on `LocalBrowserSessionStore` (browser `localStorage`) as the client resilience layer.
- Milestone M3 introduces server-side PostgreSQL migrations, Supabase repositories, and secure HttpOnly cookie anonymous visitor credentials to make server recomputation the final authority.
