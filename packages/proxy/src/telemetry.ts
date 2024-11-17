class BaseEvent {
  event_message: string;
  metadata: Record<string, unknown>;
  constructor(event_message: string, metadata: Record<string, unknown>) {
    this.event_message = event_message;
    this.metadata = metadata;
  }
}

export class DatabaseShared extends BaseEvent {
  constructor(metadata: { userId: string }) {
    super("database-shared", metadata);
  }
}

export class DatabaseUnshared extends BaseEvent {
  constructor(metadata: { userId: string }) {
    super("database-unshared", metadata);
  }
}

export class UserConnected extends BaseEvent {
  constructor(metadata: { connectionId: string }) {
    super("user-connected", metadata);
  }
}

export class UserDisconnected extends BaseEvent {
  constructor(metadata: { connectionId: string }) {
    super("user-disconnected", metadata);
  }
}

type Event =
  | DatabaseShared
  | DatabaseUnshared
  | UserConnected
  | UserDisconnected;

export async function logEvent(event: Event) {
  console.log(event);
}
