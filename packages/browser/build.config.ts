import type { BuildConfig } from "bun";

const config: BuildConfig = {
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "external",
};

export default config;
