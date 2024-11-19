import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/browser/index.ts"],
    outDir: "dist/browser",
    bundle: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    format: ["esm"],
    dts: true,
    minify: true,
    tsconfig: "tsconfig.json",
  },
  {
    entry: ["src/cli/bin.ts"],
    outDir: "bin",
    bundle: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    format: ["esm"],
    dts: false,
    minify: true,
    tsconfig: "tsconfig.json",
  },
  {
    entry: ["src/proxy/proxy.ts"],
    outDir: "dist/proxy",
    bundle: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    format: ["esm"],
    dts: true,
    minify: true,
    tsconfig: "tsconfig.json",
  },
]);