import type { H3Event } from "h3"
import {consola} from "consola"

function announcer() {
    let time_start: number;
    return {
        handler(context: H3Event) {
            time_start = performance.now()
        },
        onBeforeResponse(context: H3Event) {
            if (!isVercel) consola.info(`[${context.node.req.method}]\t${context.node.req.url} - ${(performance.now() - time_start).toLocaleString()}ms`)
        }
    }
}

export default defineEventHandler(announcer())
