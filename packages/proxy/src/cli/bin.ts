#!/usr/bin/env node

import { build } from "gluegun";
import help from "./help.ts";
import main from "./main.ts";

async function runCLI() {
  const cli = build()
    .brand("pg-proxy")
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
