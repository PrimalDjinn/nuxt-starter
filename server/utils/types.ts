import { Clients, Channels } from "../utils/socket";
import { type ConsolaInstance } from "consola";
declare global {
  /** @plugin 0.logger.ts */
  var log: ConsolaInstance;
  /** @plugin 1.socket.ts */
  var clients: Clients;
  /** @plugin 1.socket.ts */
  var channels: Channels;
}
