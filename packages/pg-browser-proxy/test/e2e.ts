import { PGlite } from "@electric-sql/pglite";
import { commands } from "@vitest/browser/context";
import { describe, expect, it } from "vitest";
import { connectProxy } from "../src/browser/index.ts";

describe("postgres client (node) with pglite (browser)", () => {
  it("simple query returns result", async () => {
    await commands.startProxy();
    const pglite = new PGlite();
    await pglite.waitReady;
    const client = connectProxy((message) => pglite.execProtocolRaw(message), {
      silent: true,
    });
    await commands.connectPostgres();

    const result = await commands.executeQuery("SELECT 1 + 1 as total");
    expect(result).toEqual(JSON.stringify([{ total: 2 }], null, 2));

    await commands.disconnectPostgres();
    client.close();
    await pglite.close();
    await commands.shutdownProxy();
  });
});
