import type { H3Event } from "h3"

function anouncer() {
    let time_start: number;
    return {
        handler(context: H3Event) {
            time_start = performance.now()
        },
        onBeforeResponse(context: H3Event) {
            if (!isVercel) log.info(`[${context.node.req.method}]\t${context.node.req.url} - ${(performance.now() - time_start).toLocaleString()}ms`)
        }
    }
}

export default defineEventHandler(anouncer())