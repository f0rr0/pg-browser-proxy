import { PGlite } from "@electric-sql/pglite";
import { OpfsAhpFS } from "@electric-sql/pglite/opfs-ahp";
import { worker } from "@electric-sql/pglite/worker";

worker({
  async init() {
    return new PGlite({
      fs: new OpfsAhpFS("pglite-db"),
    });
  },
});
