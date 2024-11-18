import * as net from "node:net";
import { BackendError } from "pg-gateway";
import { fromNodeSocket } from "pg-gateway/node";
import { connectionManager } from "./connection-manager.ts";
import {
  createStartupMessage,
  createTerminateMessage,
} from "./create-message.ts";
import { debug as mainDebug } from "./debug.ts";
import { getConnectionId, serialize } from "./protocol.ts";
import { UserConnected, UserDisconnected, logEvent } from "./telemetry.ts";
import type { UserMetadata } from "./telemetry.ts";

const debug = mainDebug.extend("tcp-server");

const isUsingPrismaShadowDb = true;

export const tcpServer = net.createServer();

tcpServer.on("connection", async (socket) => {
  try {
    debug("new tcp connection");

    const userMetadata: UserMetadata = {
      ip: socket.localAddress,
      port: socket.localPort?.toString() || "",
    };

    const connection = await fromNodeSocket(socket, {
      serverVersion() {
        return "16.3";
      },
      auth: {
        method: "trust",
      },
      onStartup(state) {
        // if (state.clientParams?.database === 'prisma-shadow') {
        //   console.info(`Connecting client to shadow database`)
        //   activeDb = new PGlite()
        // }

        // await activeDb.waitReady

        const websocket = connectionManager.getWebsocket();

        if (!websocket) {
          throw BackendError.create({
            code: "XX000",
            message: "the browser is not sharing the database",
            severity: "FATAL",
          });
        }

        if (connectionManager.hasConnection()) {
          throw BackendError.create({
            code: "53300",
            message: "sorry, too many clients already",
            severity: "FATAL",
          });
        }

        const connectionId = getConnectionId();
        connectionManager.setConnection(connectionId, connection);

        logEvent(
          new UserConnected({
            connectionId,
            userMetadata: {
              ...userMetadata,
              ...state.clientParams,
            },
          }),
        );

        const clientIpMessage = createStartupMessage("postgres", "postgres", {
          client_ip: socket.localAddress ?? "unknown",
        });
        websocket.send(serialize(connectionId, clientIpMessage));
      },
      onMessage(message, state) {
        if (!state.isAuthenticated) {
          return;
        }

        const websocket = connectionManager.getWebsocket();

        if (!websocket) {
          throw BackendError.create({
            code: "XX000",
            message: "the browser is not sharing the database",
            severity: "FATAL",
          });
        }

        const connectionId = connectionManager.getConnectionId();

        if (!connectionId) {
          throw BackendError.create({
            code: "08003",
            message: "connection does not exist",
            severity: "FATAL",
          });
        }

        debug("tcp message: %e", () => Buffer.from(message).toString("hex"));

        websocket.send(serialize(connectionId, message));

        // return an empty buffer to indicate that the message has been handled
        return new Uint8Array();
      },
    });

    // 5 minutes idle timeout for the tcp connection
    socket.setTimeout(1000 * 60 * 5);
    socket.on("timeout", () => {
      debug("tcp connection timeout");
      if (connectionManager.hasConnection()) {
        const errorMessage = BackendError.create({
          code: "57P05",
          message: "terminating connection due to idle timeout (5 minutes)",
          severity: "FATAL",
        }).flush();
        connection.streamWriter?.write(errorMessage);
      }
      socket.end();
    });

    socket.on("close", () => {
      const connectionId = connectionManager.getConnectionId();
      if (connectionId) {
        logEvent(new UserDisconnected({ connectionId, userMetadata }));
        const websocket = connectionManager.getWebsocket();
        websocket?.send(serialize(connectionId, createTerminateMessage()));
        connectionManager.deleteConnection();
      }
    });
  } catch (error) {
    debug("Error in TCP connection:", error);
    socket.end();
  }
});
