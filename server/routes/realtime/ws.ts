import type { Peer } from "crossws";

export default defineWebSocketHandler({
  open(peer: Peer) {
    const client = new WsClient(peer, SocketStatus.OPEN);
    client.send({
      statusCode: 200,
      type: TYPE.IDENTITY,
      value: client.id,
    } satisfies SocketTemplate);
  },
  message(peer: Peer, message) {
    const client = new WsClient(peer, SocketStatus.OPEN, { noAuth: true });
    client.emit("data", message);
  },
  close(peer: Peer, event) {
    const client = new WsClient(peer, SocketStatus.CLOSED);
    client.emit("end", event);
    client.close()
    log.warn("Force closing Ws Connection")
  },
  error(peer: Peer, error) {
    const client = new WsClient(peer, SocketStatus.CLOSED);
    client.emit("error", error);
    client.close()
    log.warn("Force closing Ws Connection");
  },
});
