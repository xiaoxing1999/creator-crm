import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.HUB_TEST_URL || "http://localhost:3000",
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath: process.env.CHROME_BIN },
  },
});
