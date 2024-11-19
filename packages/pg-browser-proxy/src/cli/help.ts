import chalk from "chalk";
import type { GluegunCommand } from "gluegun";
import { DEFAULT_CONFIG } from "../proxy/config.ts";

const command: GluegunCommand = {
  name: "help",
  alias: "h",
  dashed: true,
  description: "Display help information",
  run: (toolbox) => {
    const { print } = toolbox;

    print.info(`
  ${chalk.bold.blue("🔌 PG Browser Proxy")}
  
  ${chalk.blue("A WebSocket-TCP proxy that enables PostgreSQL clients to connect to in-browser databases")}
  
  ${chalk.bold("Options:")}
    -t, --tcp-port <port>    TCP port for PostgreSQL clients ${chalk.dim(`(default: ${DEFAULT_CONFIG.tcpPort})`)}
    -w, --ws-port <port>     WebSocket port for browser connections ${chalk.dim(`(default: ${DEFAULT_CONFIG.wsPort})`)}
    -s, --silent             Suppress all output
    -h, --help               Display help
    -v, --version            Display version
  
  ${chalk.bold("Examples:")}
    # Start with default settings
    $ pg-proxy
  
    # Use custom ports
    $ pg-proxy --tcp-port 5433 --ws-port 8080
    
  ${chalk.bold("Documentation:")}
    ${chalk.blue("https://github.com/f0rr0/pg-browser-proxy#readme")}
  
  ${chalk.bold("Environment Variables:")}
    ${chalk.dim("DEBUG")}    Enable debug logs (e.g., DEBUG=pg-proxy:*)
  
  ${chalk.bold("Common PostgreSQL Client Commands:")}
    ${chalk.dim("psql")}     psql -h localhost -p <tcp-port>
    ${chalk.dim("pg_dump")}  pg_dump -h localhost -p <tcp-port> > backup.sql
  `);
  },
};

export default command;
