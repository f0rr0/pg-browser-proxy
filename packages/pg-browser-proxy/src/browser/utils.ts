export function isStartupMessage(message: Uint8Array): boolean {
  if (message.length < 8) {
    return false; // Message is too short to be a valid startup message
  }

  const view = new DataView(
    message.buffer,
    message.byteOffset,
    message.byteLength,
  );

  // Get the message length (first 4 bytes)
  const messageLength = view.getInt32(0, false); // big-endian

  // Check if the message length matches the actual buffer length
  if (messageLength !== message.length) {
    return false;
  }

  // Get the protocol version (next 4 bytes)
  const protocolVersion = view.getInt32(4, false); // big-endian

  // Check if the protocol version is valid (3.0)
  // Protocol version 3.0 is represented as 196608 (0x00030000)
  if (protocolVersion !== 196608) {
    return false;
  }

  // Additional check: ensure the message ends with a null terminator
  if (message[message.length - 1] !== 0) {
    return false;
  }

  return true;
}

export function isTerminateMessage(message: Uint8Array): boolean {
  // A valid Terminate message should be exactly 5 bytes long
  if (message.length !== 5) {
    return false;
  }

  const view = new DataView(
    message.buffer,
    message.byteOffset,
    message.byteLength,
  );

  if (message[0] !== "X".charCodeAt(0)) {
    return false;
  }

  // Check if the length field (next 4 bytes) is equal to 4
  const length = view.getInt32(1, false);
  if (length !== 4) {
    return false;
  }

  return true;
}

export function parse(data: Uint8Array) {
  const connectionIdBytes = data.subarray(0, 16);
  const connectionId = new TextDecoder().decode(connectionIdBytes);
  const message = data.subarray(16);
  return { connectionId, message };
}

export function serialize(connectionId: string, message: Uint8Array) {
  const encoder = new TextEncoder();
  const connectionIdBytes = encoder.encode(connectionId);
  const data = new Uint8Array(connectionIdBytes.length + message.length);
  data.set(connectionIdBytes, 0);
  data.set(message, connectionIdBytes.length);
  return data;
}
