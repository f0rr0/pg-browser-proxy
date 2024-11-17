import { expect, test } from "@playwright/test";
import postgres from "postgres";

test("should execute basic SQL query", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const sql = postgres({
    host: "localhost",
    port: 5432,
    username: "postgres",
    database: "postgres",
    ssl: false,
  });

  const results = await sql`SELECT * from now()`;

  expect(results.length).toBe(1);
  expect(results[0].now).toBeDefined();

  await sql.end();
});
