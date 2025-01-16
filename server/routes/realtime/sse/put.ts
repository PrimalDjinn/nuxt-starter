export default defineEventHandler(async event => {
    new SseClient(event, SocketStatus.CLOSED)
})