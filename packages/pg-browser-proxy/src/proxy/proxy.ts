import type { ProxyConfig } from "./config.ts";
import { resolveConfig } from "./config.ts";
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
          resolve();
        });
        httpServer.on("error", reject);
      }),
      new Promise<void>((resolve, reject) => {
        tcpServer.listen(resolvedConfig.tcpPort, () => {
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
  };

  return {
    httpServer,
    tcpServer,
    start,
    shutdown,
  };
}
