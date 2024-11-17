# 𓃰 PG Browser Proxy 🔌

A WebSocket-TCP proxy that enables PostgreSQL clients to connect to a Postgres database running in the browser. Designed to work with [PGlite](https://pglite.dev/), a lightweight embeddable Postgres that runs in WebAssembly.

This allows you to:
- Use standard PostgreSQL clients (psql, pgAdmin, [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview), etc.) to connect to a browser-based database
- Use tools like `pg_dump` to backup your database

## How it Works

The proxy creates two servers:
1. A WebSocket server (port 443) that communicates with the database instance in the browser
2. A TCP server (port 5432) that accepts standard PostgreSQL client connections

When a PostgreSQL client connects to the TCP server, the proxy:
1. Forwards the client's messages to the browser through WebSocket
2. Returns the browser's responses back to the client through TCP

## Usage

### 1. Install the Packages

```sh
bun add @f0rr0/pg-browser @f0rr0/pg-proxy
```

### 2. Start the Proxy

You can start the proxy either:

Using bunx:
```sh
bunx pg-proxy
```

Or add it to your package.json scripts:
```json
{
  "scripts": {
    "proxy": "pg-proxy"
  }
}
```

Then run:
```sh
bun run proxy
```

### 3. Connect Your Database Instance

Once the proxy is running, connect your database in your application code. Here's an example using PGlite:

```typescript
import { createSocket } from "@f0rr0/pg-browser";
import { PGliteWorker } from "@electric-sql/pglite/worker";

const db = await PGliteWorker.create(
  new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  })
);

// Connect to the proxy in development
if (process.env.NODE_ENV === "development") {
  createSocket((message) => db.execProtocolRaw(message));
}
```

The key requirement is that your database must expose a method to handle raw Postgres wire protocol messages.

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
  }
});
```

## Notes

- Only one browser connection is allowed at a time
- TCP clients have a 5-minute idle timeout
- WebSocket connections have a 1-hour lifetime

## Development

### Setup

1. Install dependencies:

```sh
bun install
```

2. Build the workspaces:

```sh
bun run build
```

### Development Workflow

Start the proxy in development mode:

```sh
cd packages/proxy
bun run dev
```

### Example App

An example app using PGlite with Drizzle is available in the `examples/pglite-drizzle` directory. To run it:

1. Build the core packages:
```sh
bun install
bun --filter './packages/*' build 
bun install # ensure pg-proxy binary is available
```

1. Navigate to the example directory and start the proxy:
```sh
cd examples/pglite-drizzle
bun run proxy
```

2. Start the example app:
```sh
bun run dev
```

3. You can then connect to the database using Drizzle Studio or any other PostgreSQL client:
```sh
bun run db:studio
```

## Further Reading

- Built on top of [pg-gateway](https://github.com/supabase-community/pg-gateway)
- [postgres.new](https://github.com/supabase-community/postgres-new) - The original inspiration for this local development tool
- [postgres.new: In-browser Postgres with an AI interface](https://supabase.com/blog/postgres-new) - A blog post by Supabase about running Postgres in the browser
