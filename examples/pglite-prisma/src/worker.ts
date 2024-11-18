import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { OpfsAhpFS } from "@electric-sql/pglite/opfs-ahp";
import { worker } from "@electric-sql/pglite/worker";

worker({
  async init() {
    return new PGlite({
      fs: new OpfsAhpFS("pglite-db"),
      extensions: {
        live,
      },
    });
  },
});
