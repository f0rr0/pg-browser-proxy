import { defineWorkspace } from "vitest/config";
import * as commands from "./test/commands.ts";

export default defineWorkspace([
  {
    test: {
      name: "unit",
      environment: "node",
      include: ["src/**/*.{test,spec}.ts"],
    },
  },
  {
    test: {
      name: "e2e-chromium",
      include: ["test/**/e2e.ts"],
      browser: {
        enabled: true,
        provider: "playwright",
        name: "chromium",
        headless: true,
        commands,
        screenshotFailures: false,
      },
    },
    optimizeDeps: {
      exclude: ["@electric-sql/pglite"],
    },
  },
]);
