import chalk from "chalk";
import type { GluegunCommand } from "gluegun";
import type { ProxyConfig } from "../proxy/config.ts";
import { DEFAULT_CONFIG } from "../proxy/config.ts";
import { createProxy } from "../proxy/proxy.ts";

const command: GluegunCommand = {
  name: "pg-browser-proxy",
  description: "PostgreSQL proxy for browser native Potgres",

  run: async (toolbox) => {
    const { parameters, print } = toolbox;

    // Extract options
    const tcpPort =
      parameters.options["tcp-port"] ||
      parameters.options.t ||
      DEFAULT_CONFIG.tcpPort;

    const wsPort =
      parameters.options["ws-port"] ||
      parameters.options.w ||
      DEFAULT_CONFIG.wsPort;

    const config: Required<ProxyConfig> = {
      tcpPort: Number(tcpPort),
      wsPort: Number(wsPort),
    };

    const spinner = print.spin("Starting proxy servers...");

    const proxy = createProxy(config);

    // Handle termination signals
    const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGQUIT"];

    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(); // New line after Ctrl+C
        try {
          await proxy.shutdown();
          spinner.succeed(chalk.yellow("Servers shut down successfully"));
          await new Promise((resolve) => setTimeout(resolve, 100));
          process.exit(0);
        } catch (error) {
          spinner.fail(chalk.red("Error during shutdown:"));
          console.error(error);
          await new Promise((resolve) => setTimeout(resolve, 100));
          process.exit(1);
        }
      });
    }

    // Handle uncaught errors
    process.on("uncaughtException", async (error) => {
      spinner.fail("Uncaught exception:");
      console.error(error);
      await proxy.shutdown();
      spinner.fail(chalk.red("Error during shutdown:"));
      await new Promise((resolve) => setTimeout(resolve, 100));
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      spinner.fail("Unhandled rejection:");
      console.error(reason);
      await proxy.shutdown();
      spinner.fail(chalk.red("Error during shutdown:"));
      await new Promise((resolve) => setTimeout(resolve, 100));
      process.exit(1);
    });

    // Start servers
    try {
      await proxy.start();
      spinner.succeed("Proxy servers started successfully");

      print.info(`
${chalk.bold("Server Information")}
${chalk.cyan("TCP Port:")}       localhost:${config.tcpPort}
${chalk.cyan("WebSocket:")}      ws://localhost:${config.wsPort}

${chalk.bold("Example Commands")}
${chalk.dim("psql")}           psql -h localhost -p ${config.tcpPort}
${chalk.dim("pg_dump")}        pg_dump -h localhost -p ${config.tcpPort}

${chalk.dim("Press Ctrl+C to stop")}
      `);
    } catch (error) {
      spinner.fail("Failed to start servers:");
      console.error(error);
      await proxy.shutdown();
      spinner.fail(chalk.red("Error during shutdown:"));
      process.exit(1);
    }
  },
};

export default command;
