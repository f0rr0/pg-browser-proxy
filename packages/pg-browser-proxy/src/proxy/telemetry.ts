import { debug as mainDebug } from "./debug.ts";

const debug = mainDebug.extend("telemetry");

export interface UserMetadata {
  origin?: string;
  ip?: string;
  userAgent?: string;
  host?: string;
  port?: string;
  [key: string]: string | undefined;
}

class BaseEvent {
  event_message: string;
  metadata: Record<string, unknown>;
  timestamp: string;

  constructor(event_message: string, metadata: Record<string, unknown>) {
    this.event_message = event_message;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
}

export class DatabaseShared extends BaseEvent {
  constructor(metadata: { userMetadata: UserMetadata }) {
    super("database-shared", metadata);
  }
}

export class DatabaseUnshared extends BaseEvent {
  constructor(metadata: { userMetadata: UserMetadata }) {
    super("database-unshared", metadata);
  }
}

export class UserConnected extends BaseEvent {
  constructor(metadata: { connectionId: string; userMetadata?: UserMetadata }) {
    super("user-connected", metadata);
  }
}

export class UserDisconnected extends BaseEvent {
  constructor(metadata: { connectionId: string; userMetadata?: UserMetadata }) {
    super("user-disconnected", metadata);
  }
}

export async function logEvent(event: BaseEvent) {
  debug(JSON.stringify(event, null, 2));
}
