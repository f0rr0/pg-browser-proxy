import { Mutex } from "async-mutex";
import type { ClientConfig } from "./config.ts";
import { resolveConfig } from "./config.ts";
import {
  isStartupMessage,
  isTerminateMessage,
  parse,
  serialize,
} from "./utils.ts";

export type ExecProtocolRawFn = (message: Uint8Array) => Promise<Uint8Array>;

export type SocketEvents = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: Uint8Array) => void;
};

type Socket = {
  close: () => void;
};

let instance: Socket | null = null;

export const createSocket = (
  execProtocolRaw: ExecProtocolRawFn,
  events?: SocketEvents,
  config?: ClientConfig,
): Socket => {
  if (instance) {
    throw new Error("WebSocket client is already initialized.");
  }

  if (process.env.NODE_ENV !== "development") {
    console.warn(
      "createSocket should only be used in development environments.",
    );
  }

  const resolvedConfig = resolveConfig(config);
  const wsUrl = `ws://${resolvedConfig.wsHost}:${resolvedConfig.wsPort}`;

  console.log(`Attempting to connect to WebSocket server at ${wsUrl}`);

  const ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";

  const mutex = new Mutex();

  ws.onopen = () => {
    console.log("✅ Connected to local WebSocket server");
    events?.onOpen?.();
  };

  ws.onmessage = (event) => {
    mutex.runExclusive(async () => {
      const data = new Uint8Array(event.data);
      const { connectionId, message } = parse(data);

      if (isStartupMessage(message) || isTerminateMessage(message)) {
        return;
      }

      // Notify user code of received message
      events?.onMessage?.(message);

      const response = await execProtocolRaw(message);
      ws.send(serialize(connectionId, response));
    });
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket connection error:", error);
    console.error(`
Failed to connect to WebSocket server at ${wsUrl}
Please check:
1. Is pg-proxy running? Start it with: bunx @f0rr0/pg-proxy
2. Is the port ${resolvedConfig.wsPort} correct? You can change it with:
   - CLI: bunx @f0rr0/pg-proxy --ws-port <port>
   - Code: createSocket(execFn, events, { wsPort: <port> })
3. Is the host ${resolvedConfig.wsHost} correct?
`);
    events?.onError?.(error);
  };

  ws.onclose = (event) => {
    console.log(`
WebSocket connection closed ${event.wasClean ? "cleanly" : "unexpectedly"}
${event.wasClean ? "" : "If this was unexpected, you can:"}
${event.wasClean ? "" : "1. Check if pg-proxy is still running"}
${event.wasClean ? "" : "2. Reload the page to reconnect"}
Code: ${event.code}
Reason: ${event.reason || "No reason provided"}
`);
    events?.onClose?.();
    instance = null; // Allow reconnection after close
  };

  instance = {
    close: () => {
      ws.close(1000, "Closed by client");
      instance = null;
    },
  };

  return instance;
};
