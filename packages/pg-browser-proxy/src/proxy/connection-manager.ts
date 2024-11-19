import type { PostgresConnection } from "pg-gateway";
import type { WebSocket } from "ws";

class ConnectionManager {
  private connection?: PostgresConnection;
  private websocket?: WebSocket;
  private connectionId?: string;

  public hasConnection() {
    return !!this.connection;
  }

  public getConnection() {
    return this.connection;
  }

  public getConnectionId() {
    return this.connectionId;
  }

  public setConnection(connectionId: string, connection: PostgresConnection) {
    this.connectionId = connectionId;
    this.connection = connection;
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
