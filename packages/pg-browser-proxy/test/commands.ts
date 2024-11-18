import postgres from "postgres";
import type { BrowserCommand } from "vitest/node";
import { createProxy } from "../src/proxy/proxy.ts";

const { start, shutdown } = createProxy();

const startProxy: BrowserCommand<[port?: number]> = async ({ testPath }) => {
  await start();
};

const shutdownProxy: BrowserCommand<[port?: number]> = async (_, port) => {
  await shutdown();
};

let sql: postgres.Sql;

const connectPostgres: BrowserCommand<[port?: number]> = async (
  _,
  port = 5432,
) => {
  const connectionString = `postgresql://postgres:postgres@localhost:${port}/postgres`;
  sql = postgres(connectionString);

  // `fetch_types` uses the extended query protocol which
  // interferes with our tests
  sql.options.fetch_types = false;
};

const disconnectPostgres: BrowserCommand<[]> = async () => {
  await sql.end();
};

const executeQuery: BrowserCommand<[query: string]> = async (_, query) => {
  const result = await sql.unsafe(query);
  return JSON.stringify(result, null, 2);
};

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    startProxy: () => Promise<void>;
    shutdownProxy: () => Promise<void>;
    connectPostgres: () => Promise<void>;
    disconnectPostgres: () => Promise<void>;
    executeQuery: (query: string) => Promise<string>;
  }
}

export {
  startProxy,
  shutdownProxy,
  connectPostgres,
  disconnectPostgres,
  executeQuery,
};
