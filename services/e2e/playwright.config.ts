import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  outputDir: "./test-results",
  snapshotPathTemplate: "screenshots/{arg}-{projectName}{ext}",
  timeout: 30_000,
  retries: 0,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:8080",
    screenshot: "on",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1280, height: 720 } },
    },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
