import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, resolveConfig } from "../src/config";

describe("client configuration", () => {
  it("should use default values when no config provided", () => {
    const config = resolveConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("should override default values with provided config", () => {
    const config = resolveConfig({
      wsPort: 8080,
      wsHost: "127.0.0.1",
    });
    expect(config).toEqual({
      wsPort: 8080,
      wsHost: "127.0.0.1",
    });
  });

  it("should partially override default values", () => {
    const config = resolveConfig({
      wsPort: 8080,
    });
    expect(config).toEqual({
      wsPort: 8080,
      wsHost: DEFAULT_CONFIG.wsHost,
    });
  });
});
