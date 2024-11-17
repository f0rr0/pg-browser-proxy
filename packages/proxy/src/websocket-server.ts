import * as http from "node:http";
import { BackendError } from "pg-gateway";
import { WebSocketServer } from "ws";
import { connectionManager } from "./connection-manager.ts";
import { debug as mainDebug } from "./debug.ts";
import { parse } from "./protocol.ts";
import {
  DatabaseShared,
  DatabaseUnshared,
  type UserMetadata,
  logEvent,
} from "./telemetry.ts";

const debug = mainDebug.extend("websocket-server");

export const httpServer = http.createServer();

export const websocketServer = new WebSocketServer({
  server: httpServer,
});

websocketServer.on("error", (error) => {
  debug("websocket server error", error);
});

function extractUserMetadata(request: http.IncomingMessage): UserMetadata {
  const headers = request.headers;

  return {
    origin: headers.origin,
    userAgent: headers["user-agent"],
    host: headers.host,
  };
}

websocketServer.on("connection", async (websocket, request) => {
  try {
    debug("websocket connection");

    const host = request.headers.host;

    if (!host) {
      debug("No host header present");
      websocket.close();
      return;
    }

    if (connectionManager.hasWebsocket()) {
      debug("Database already shared");
      websocket.close();
      return;
    }

    connectionManager.setWebsocket(websocket);

    const userMetadata = extractUserMetadata(request);
    debug("User connected with metadata:", userMetadata);

    logEvent(new DatabaseShared({ userMetadata }));

    websocket.on("message", (data: Buffer) => {
      const { connectionId, message } = parse(data);
      const tcpConnection = connectionManager.getConnection();
      if (tcpConnection) {
        debug("websocket message: %e", () => message.toString("hex"));
        tcpConnection.streamWriter?.write(message);
      }
    });

    // 1 hour lifetime for the websocket connection
    const websocketConnectionTimeout = setTimeout(
      () => {
        debug("websocket connection timed out");
        const tcpConnection = connectionManager.getConnection();
        if (tcpConnection) {
          const errorMessage = BackendError.create({
            code: "57P01",
            message: "terminating connection due to lifetime timeout (1 hour)",
            severity: "FATAL",
          }).flush();
          tcpConnection.streamWriter?.write(errorMessage);
        }
        websocket.close();
      },
      1000 * 60 * 60 * 1,
    );

    websocket.on("close", () => {
      clearTimeout(websocketConnectionTimeout);
      connectionManager.deleteWebsocket();
      // TODO: have a way of ending a PostgresConnection
      logEvent(new DatabaseUnshared({ userMetadata }));
    });
  } catch (error) {
    debug("Error in WebSocket connection:", error);
    websocket.close();
  }
});
