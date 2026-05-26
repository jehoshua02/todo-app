import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  outputDir: "./test-results",
  timeout: 30_000,
  retries: 0,
  workers: 1,
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
