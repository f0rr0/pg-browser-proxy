import type { PGliteInterfaceExtensions } from "@electric-sql/pglite";
import { makePGliteProvider } from "@electric-sql/pglite-react";
import type { live } from "@electric-sql/pglite/live";
import type { PGliteWorker } from "@electric-sql/pglite/worker";

const { PGliteProvider, usePGlite } = makePGliteProvider<
  PGliteWorker &
    PGliteInterfaceExtensions<{
      live: typeof live;
    }>
>();

export { PGliteProvider, usePGlite };
