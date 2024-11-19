# 𓃰 PG Browser Proxy 🔌

A WebSocket-TCP proxy that enables PostgreSQL clients to connect to a Postgres database running in the browser. Designed to work with [PGlite](https://pglite.dev/), a lightweight embeddable Postgres that runs in WebAssembly.

This allows you to:

- Use standard PostgreSQL clients (psql, pgAdmin, [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview), etc.) to connect to a browser-based database
- Use tools like `pg_dump` to backup your database

## How it Works

The proxy creates two servers:

1. A WebSocket server that communicates with the database instance in the browser
2. A TCP server that accepts standard PostgreSQL client connections

When a PostgreSQL client connects to the TCP server, the proxy:

1. Forwards the client's messages to the browser through WebSocket
2. Returns the browser's responses back to the client through TCP

### Examples

- [PGlite + Drizzle](https://github.com/f0rr0/pg-browser-proxy/tree/main/examples/pglite-drizzle)
- [PGlite + Prisma](https://github.com/f0rr0/pg-browser-proxy/tree/main/examples/pglite-prisma)

## Usage

### 1. Install the Packages

```sh
bun add pg-browser-proxy
```

### 2. Start the Proxy

Using bunx:

```sh
bunx pg-browser-proxy
```

To use custom ports:

```sh
bunx pg-browser-proxy -t 5433 -w 8080
```

See all options:

```sh
bunx pg-browser-proxy -h
```

### 3. Connect Your Database Instance

```typescript
import { connectProxy } from "pg-browser-proxy";
import { PGliteWorker } from "@electric-sql/pglite/worker";

const db = await PGliteWorker.create(
  new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  }),
);

// Connect to the proxy in development
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  connectProxy((message) => db.execProtocolRaw(message), {
    wsPort: 443, // optional, defaults to 443
  });
}
```

The key requirement is that your database must be able to handle raw [Postgres wire protocol](https://www.postgresql.org/docs/current/protocol.html) messages.

### 4. Connect with PostgreSQL Tools

Once both the proxy and your application are running, you can connect to your browser's database using any PostgreSQL client:

```sh
# Using psql
psql -h localhost -p 5432 -U postgres

# Using pg_dump
pg_dump -h localhost -p 5432 -U postgres > backup.sql
```

For tools like Drizzle Studio, configure your connection in your drizzle config:

```typescript
export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://localhost:5432",
    ssl: false,
  },
});
```

## Notes

- Only one browser connection is allowed at a time

## Further Reading

- [pg-gateway](https://github.com/supabase-community/pg-gateway) - Built on top of this project
- [postgres.new](https://supabase.com/blog/postgres-new) - A blog post by Supabase about running Postgres in the browser
