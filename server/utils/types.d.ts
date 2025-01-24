import type { ConsolaInstance } from "consola";
import type { Channels, Clients } from "#imports";

declare global {
  /** @plugin 0.logger.ts */
  var log: ConsolaInstance;
  /** @plugin 1.socket.ts */
  var clients: Clients;
  /** @plugin 1.socket.ts */
  var channels: Channels;
}

export {}