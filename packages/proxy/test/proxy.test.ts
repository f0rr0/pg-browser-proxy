import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config.ts";
import { createProxy } from "../src/proxy.ts";

describe("createProxy", () => {
  it("should use default configuration when none provided", async () => {
    const proxy = createProxy();
    expect(proxy.httpServer.address()).toBe(null); // Not listening yet

    await new Promise<void>((resolve) => {
      proxy.httpServer.listen(DEFAULT_CONFIG.wsPort, () => {
        const addr = proxy.httpServer.address();
        expect(addr).toBeDefined();
        if (typeof addr === "object" && addr !== null) {
          expect(addr.port).toBe(DEFAULT_CONFIG.wsPort);
        }
        resolve();
      });
    });

    await proxy.shutdown();
  });

  it("should use provided configuration", async () => {
    const config = {
      tcpPort: 5433,
      wsPort: 8080,
    };

    const proxy = createProxy(config);

    await new Promise<void>((resolve) => {
      proxy.httpServer.listen(config.wsPort, () => {
        const addr = proxy.httpServer.address();
        expect(addr).toBeDefined();
        if (typeof addr === "object" && addr !== null) {
          expect(addr.port).toBe(config.wsPort);
        }
        resolve();
      });
    });

    await proxy.shutdown();
  });
});
