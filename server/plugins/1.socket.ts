import { Clients, Channels } from "../utils/socket";
import { consola } from "consola";

declare global {
  /** @plugin 1.socket.ts */
  var clients: Clients;
  /** @plugin 1.socket.ts */
  var channels: Channels;
}

export default defineNitroPlugin(() => {
  global.clients = new Clients();
  global.channels = new Channels();

  global.clients!.on("end", (data, client) => {
    consola.info("Client with id:", client.id, "disconnected");
  });

  global.clients!.on("error", (error, client) => {
    const response = {
      statusCode: 400,
      type: TYPE.ERROR,
      body: "Invalid Json",
    } as SocketTemplate;
    client.send(response);
    client.close();
    console.error("Error", error);
  });

  setInterval(() => {
    global.clients?.broadcast({
      type: TYPE.HEARTBEAT,
      body: "Pong",
    });
  }, 30000);
});
