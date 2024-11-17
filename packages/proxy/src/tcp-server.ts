import * as net from "node:net";
import { BackendError } from "pg-gateway";
import { fromNodeSocket } from "pg-gateway/node";
import { connectionManager } from "./connection-manager.ts";
import {
  createStartupMessage,
  createTerminateMessage,
} from "./create-message.ts";
import { debug as mainDebug } from "./debug.ts";
import { pgDumpMiddleware } from "./pg-dump-middleware/pg-dump-middleware.ts";
import { getConnectionId, serialize } from "./protocol.ts";
import { UserConnected, UserDisconnected, logEvent } from "./telemetry.ts";

const debug = mainDebug.extend("tcp-server");

export const tcpServer = net.createServer();

tcpServer.on("connection", async (socket) => {
  debug("new tcp connection");

  const connection = await fromNodeSocket(socket, {
    auth: {
      method: "trust",
    },
    onStartup() {
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

      logEvent(new UserConnected({ connectionId }));

      const clientIpMessage = createStartupMessage("postgres", "postgres", {
        client_ip: socket.remoteAddress ?? "unknown",
      });
      websocket.send(serialize(connectionId, clientIpMessage));
    },
    serverVersion() {
      return "16.3";
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

      const processedMessage = pgDumpMiddleware.client(
        socket,
        connectionId,
        connection.state,
        Buffer.from(message),
      );
      websocket.send(serialize(connectionId, processedMessage));

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
      connectionManager.deleteConnection();

      logEvent(
        new UserDisconnected({
          connectionId,
        }),
      );

      const websocket = connectionManager.getWebsocket();
      websocket?.send(serialize(connectionId, createTerminateMessage()));
    }
  });
});