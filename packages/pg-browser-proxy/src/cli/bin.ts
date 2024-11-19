#!/usr/bin/env node

import { build } from "gluegun";
import help from "./help.ts";
import main from "./main.ts";

export async function runCLI() {
  const cli = build()
    .brand("pg-browser-proxy")
    .src(import.meta.dirname, {
      required: false,
      preloadedCommands: [main, help],
    })
    .help({
      command: help,
    })
    .version()
    .checkForUpdates(20)
    .create();

  await cli.run();
}

runCLI();
