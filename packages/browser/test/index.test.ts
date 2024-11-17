import { beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config";
import { createSocket } from "../src/index";

describe("createSocket", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  it("should throw an error in production environment", () => {
    process.env.NODE_ENV = "production";
    expect(() => createSocket(async () => new Uint8Array())).toThrow(
      "createSocket should only be used in development environments.",
    );
  });

  it("should throw if already initialized", () => {
    const socket = createSocket(async () => new Uint8Array());
    expect(() => createSocket(async () => new Uint8Array())).toThrow(
      "WebSocket client is already initialized.",
    );
    socket.close();
  });

  it("should use default configuration when none provided", () => {
    const socket = createSocket(async () => new Uint8Array());
    // @ts-ignore - accessing private property for testing
    expect(socket._ws.url).toBe(
      `ws://${DEFAULT_CONFIG.wsHost}:${DEFAULT_CONFIG.wsPort}`,
    );
    socket.close();
  });

  it("should use provided configuration", () => {
    const config = {
      wsPort: 8080,
      wsHost: "127.0.0.1",
    };
    const socket = createSocket(
      async () => new Uint8Array(),
      undefined,
      config,
    );
    // @ts-ignore - accessing private property for testing
    expect(socket._ws.url).toBe(`ws://${config.wsHost}:${config.wsPort}`);
    socket.close();
  });
});
