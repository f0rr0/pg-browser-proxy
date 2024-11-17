import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, resolveConfig } from "../src/config.ts";

describe("proxy configuration", () => {
  it("should use default values when no config provided", () => {
    const config = resolveConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("should override default values with provided config", () => {
    const config = resolveConfig({
      tcpPort: 5433,
      wsPort: 8080,
    });
    expect(config).toEqual({
      tcpPort: 5433,
      wsPort: 8080,
    });
  });

  it("should partially override default values", () => {
    const config = resolveConfig({
      tcpPort: 5433,
    });
    expect(config).toEqual({
      tcpPort: 5433,
      wsPort: DEFAULT_CONFIG.wsPort,
    });
  });
});
