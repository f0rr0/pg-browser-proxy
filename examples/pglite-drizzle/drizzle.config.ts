import { defineConfig } from "drizzle-kit";

const isStudio = process.env.DRIZZLE_STUDIO === "true";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: !isStudio ? "pglite" : undefined,
  dbCredentials: isStudio
    ? {
        url: "postgres://localhost:5432",
        ssl: false,
      }
    : undefined,
  strict: true,
  verbose: true,
});
