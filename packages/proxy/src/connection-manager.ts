import type { PostgresConnection } from "pg-gateway";
import type { WebSocket } from "ws";

type ConnectionId = string;

class ConnectionManager {
  private connection?: PostgresConnection;
  private websocket?: WebSocket;
  private connectionId?: ConnectionId;

  public hasConnection() {
    return !!this.connection && !!this.connectionId;
  }

  public getConnection() {
    return this.connection;
  }

  public getConnectionId() {
    return this.connectionId;
  }

  public setConnection(connectionId: ConnectionId, socket: PostgresConnection) {
    this.connectionId = connectionId;
    this.connection = socket;
  }

  public deleteConnection() {
    this.connection = undefined;
    this.connectionId = undefined;
  }

  public hasWebsocket() {
    return !!this.websocket;
  }

  public getWebsocket() {
    return this.websocket;
  }

  public setWebsocket(websocket: WebSocket) {
    this.websocket = websocket;
  }

  public deleteWebsocket() {
    this.websocket = undefined;
    this.deleteConnection();
  }
}

export const connectionManager = new ConnectionManager();
