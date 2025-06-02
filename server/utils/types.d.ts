import type { Clients, Channels } from "./socket";

export {};

declare global {
  /** @plugin 1.socket.ts */
  var clients: Clients;
  /** @plugin 1.socket.ts */
  var channels: Channels;
}
