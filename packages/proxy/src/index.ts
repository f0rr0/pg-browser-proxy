#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import type { ProxyConfig } from "./config.ts";
import { DEFAULT_CONFIG, resolveConfig } from "./config.ts";
import { debug as mainDebug } from "./debug.ts";
import { tcpServer } from "./tcp-server.ts";
import { httpServer, websocketServer } from "./websocket-server.ts";

const debug = mainDebug.extend("cli");

export function createProxy(config?: ProxyConfig) {
  const resolvedConfig = resolveConfig(config);
  let isShuttingDown = false;

  const start = async () => {
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        httpServer.listen(resolvedConfig.wsPort, () => {
          console.log(
            `websocket server listening on port ${resolvedConfig.wsPort}`,
          );
          resolve();
        });
        httpServer.on("error", reject);
      }),
      new Promise<void>((resolve, reject) => {
        tcpServer.listen(resolvedConfig.tcpPort, () => {
          console.log(`tcp server listening on port ${resolvedConfig.tcpPort}`);
          resolve();
        });
        tcpServer.on("error", reject);
      }),
    ]);
  };

  const shutdown = async (signal?: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    debug("Shutting down servers%s", signal ? ` (signal: ${signal})` : "");

    // Close all existing WebSocket connections
    for (const client of websocketServer.clients) {
      try {
        client.terminate();
      } catch (err) {
        debug("Error terminating WebSocket client:", err);
      }
    }

    // Close both servers
    await Promise.allSettled([
      new Promise<void>((resolve) => {
        httpServer.close(() => {
          debug("WebSocket server closed");
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        tcpServer.close(() => {
          debug("TCP server closed");
          resolve();
        });
      }),
    ]);

    debug("Shutdown complete");

    // Only exit the process if this was triggered by a signal
    if (signal) {
      process.exit(0);
    }
  };

  return {
    httpServer,
    tcpServer,
    start,
    shutdown,
  };
}

const program = new Command();

program
  .name("pg-proxy")
  .description("PostgreSQL WebSocket proxy for browser-based databases")
  .option(
    "-t, --tcp-port <port>",
    "TCP port for PostgreSQL clients",
    String(DEFAULT_CONFIG.tcpPort),
  )
  .option(
    "-w, --ws-port <port>",
    "WebSocket port for browser connections",
    String(DEFAULT_CONFIG.wsPort),
  )
  .action(async (options) => {
    const config: ProxyConfig = {
      tcpPort: Number.parseInt(options.tcpPort),
      wsPort: Number.parseInt(options.wsPort),
    };

    const proxy = createProxy(config);

    // Handle various termination signals
    const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGQUIT"];

    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(); // New line after ^C
        await proxy.shutdown(signal);
      });
    }

    // Handle uncaught errors
    process.on("uncaughtException", async (error) => {
      console.error("Uncaught exception:", error);
      await proxy.shutdown();
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      console.error("Unhandled rejection:", reason);
      await proxy.shutdown();
      process.exit(1);
    });

    try {
      await proxy.start();
    } catch (error) {
      console.error("Failed to start servers:", error);
      await proxy.shutdown();
      process.exit(1);
    }
  });

program.parse(process.argv);

// Export for programmatic usage
export { httpServer, tcpServer };
