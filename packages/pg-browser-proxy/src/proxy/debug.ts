import createDebug from "debug";

createDebug.formatters.e = (fn) => fn();

export const debug = createDebug("pg-browser-proxy");
