import * as http from "node:http";
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

    if (!request.headers.host) {
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
      const { message } = parse(data);
      const tcpConnection = connectionManager.getConnection();
      if (tcpConnection) {
        debug("websocket message: %e", () => message.toString("hex"));
        tcpConnection.streamWriter?.write(message);
      }
    });

    websocket.on("close", () => {
      connectionManager.deleteWebsocket();
      // TODO: have a way of ending a PostgresConnection
      logEvent(new DatabaseUnshared({ userMetadata }));
    });
  } catch (error) {
    debug("Error in WebSocket connection:", error);
    websocket.close();
  }
});
