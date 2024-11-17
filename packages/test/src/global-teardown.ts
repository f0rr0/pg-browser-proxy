import { killAllProcesses } from "./servers.ts";

async function globalTeardown() {
  killAllProcesses();
}

export default globalTeardown;
