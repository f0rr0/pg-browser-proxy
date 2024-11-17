import { Mutex } from "async-mutex";
import {
  isStartupMessage,
  isTerminateMessage,
  parse,
  serialize,
} from "./utils.ts";

export type ExecProtocolRawFn = (message: Uint8Array) => Promise<Uint8Array>;

export const createSocket = (execProtocolRaw: ExecProtocolRawFn) => {
  if (process.env.NODE_ENV === "development") {
    const ws = new WebSocket("ws://localhost:443");
    ws.binaryType = "arraybuffer";

    const mutex = new Mutex();

    ws.onmessage = (event) => {
      mutex.runExclusive(async () => {
        const data = new Uint8Array(event.data);
        const { connectionId, message } = parse(data);

        if (isStartupMessage(message) || isTerminateMessage(message)) {
          return;
        }

        const response = await execProtocolRaw(message);
        ws.send(serialize(connectionId, response));
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onopen = () => {
      console.log("Connected to local WebSocket server");
    };

    return ws;
  }

  return null;
};
