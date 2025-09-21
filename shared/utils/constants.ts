import { take } from "./std";

export enum SocketStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  UNKNOWN = "UNKNOWN",
  CONNECTING = "CONNECTING",
  SHUTDOWN = "SHUTDOWN",
}

export enum TYPE {
  AUTH_REQ = "AUTH_REQ",
  AUTH_RES = "AUTH_RES",
  HEARTBEAT = "heartbeat",
  ERROR = "error",
  CLOSE_SOCKET = "close socket",
  PING = "ping",
  PONG = "pong",
  IDENTITY = "IDENTITY",
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  SUCCESS = "SUCCESS",
  MESSAGE = "MESSAGE",
}
