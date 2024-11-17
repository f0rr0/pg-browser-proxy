import { PGliteWorker } from "@electric-sql/pglite/worker";
import { createSocket } from "@f0rr0/pg-browser";

const db = await PGliteWorker.create(
  new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  }),
);

db.waitReady
  .then(() => {
    console.log("DB ready");
    createSocket((message) => db.execProtocolRaw(message));
  })
  .catch((err) => {
    console.error(err);
  });
