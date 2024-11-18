import { live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { createSocket } from "@f0rr0/pg-browser";
import type { MigrationConfig } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/pglite";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import { PGliteProvider } from "./db/context.tsx";
import migrations from "./db/migrations/migrations.json";
import { schema } from "./db/schema.ts";

const db = await PGliteWorker.create(
  new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  }),
  {
    extensions: {
      live,
    },
  },
);

db.waitReady
  .then(() => {
    // @ts-expect-error
    const drizzleDb = drizzle(db, {
      schema,
    });
    // @ts-expect-error
    return drizzleDb.dialect.migrate(migrations, drizzleDb.session, {
      migrationsTable: "migrations",
      migrationsSchema: "public",
    } satisfies Omit<MigrationConfig, "migrationsFolder">);
  })
  .then(() => console.log("Migrations complete"))
  .catch(console.error);

if (process.env.NODE_ENV === "development") {
  createSocket((message) => db.execProtocolRaw(message));
}

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <PGliteProvider db={db}>
        <App />
      </PGliteProvider>
    </React.StrictMode>,
  );
}
