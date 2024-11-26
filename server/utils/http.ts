import type { H3Event } from "h3"

export function safeEventHandler(func: (event: H3Event) => Response) {
    const safe = (event: H3Event) => {
        try {
            return func(event)
        } catch (error: any) {
            return createError({
                statusCode: 500,
                data: error,
                message: error?.message || "Unknown Internal Server Error"
            })
        }
    }
    return defineEventHandler(safe)
}