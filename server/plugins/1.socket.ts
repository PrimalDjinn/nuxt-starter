import { Clients, Channels } from "../utils/socket";

declare global {
    var clients: Clients | undefined
    var channels: Channels | undefined;
}

export default defineNitroPlugin(app => {
    global.clients = new Clients()
    global.channels = new Channels()

    global.clients!.on("end", (data, client) => {
        console.log("Client with id:", client.id, "disconnected")
    })

    global.clients!.on("error", (error, client) => {
        const response = {
            statusCode: 400,
            type: TYPE.ERROR,
            body: "Invalid Json"
        } as SocketTemplate
        client.send(response)
        client.close()
        console.error("Error", error)
    })

    setInterval(() => {
        global.clients?.broadcast({
            type: TYPE.HEARTBEAT,
            body: "Pong"
        })
    }, 30000)
})