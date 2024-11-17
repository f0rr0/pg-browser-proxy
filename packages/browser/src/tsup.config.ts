import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  outDir: "dist",
  bundle: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ["esm"],
  dts: true,
  minify: true,
  tsconfig: "tsconfig.json",
});
