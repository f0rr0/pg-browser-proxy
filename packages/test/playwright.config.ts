import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  globalSetup: "./src/global-setup.ts",
  globalTeardown: "./src/global-teardown.ts",
  projects: [
    {
      name: "e2e",
      testMatch: /e2e\.test\.ts/,
      use: {
        baseURL: "http://127.0.0.1:3000",
        headless: false,
      },
    },
  ],
});
