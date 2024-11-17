import { spawn } from "node:child_process";
import { join } from "node:path";
import type { FullConfig } from "@playwright/test";
import { addProcess } from "./servers.ts";

async function globalSetup(config: FullConfig) {
  // 1. Start server using Node with experimental-strip-types
  const serverPath = join(import.meta.dirname, "../../proxy/dist/index.js");
  const serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
  });
  addProcess(serverProcess);

  // 2. Serve the built test app
  const devServer = spawn("bun", ["run", "start"], {
    stdio: "inherit",
    cwd: join(import.meta.dirname, "../../../examples/basic"),
  });
  addProcess(devServer);
}

export default globalSetup;
