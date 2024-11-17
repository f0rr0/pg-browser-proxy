import { resolve } from "node:path";
import { readMigrationFiles } from "drizzle-orm/migrator";

const migrations = readMigrationFiles({
  migrationsFolder: resolve(__dirname, ".."),
});

await Bun.write(
  resolve(__dirname, "../migrations.json"),
  JSON.stringify(migrations),
);

console.log("Migrations compiled!");
