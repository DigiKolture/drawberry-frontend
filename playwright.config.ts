import { defineConfig } from "@playwright/test";

// Seam 2 — the geometric golden-diff. Jest/jsdom has no layout engine, so fidelity (does an
// emitted table reproduce the flex Canvas geometry?) can only be checked in a real browser.
// These tests render flex vs emitted tables in Chromium and diff element positions/sizes.
export default defineConfig({
  testDir: "tests/golden",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["line"]],
  use: {
    browserName: "chromium",
    headless: true,
    viewport: { width: 900, height: 1200 },
  },
});
