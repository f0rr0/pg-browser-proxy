import type { ChildProcess } from "node:child_process";

let serverProcesses: ChildProcess[] = [];

export function addProcess(proc: ChildProcess) {
  serverProcesses.push(proc);
}

export function killAllProcesses() {
  for (const proc of serverProcesses) {
    proc.kill();
  }
  serverProcesses = [];
}
