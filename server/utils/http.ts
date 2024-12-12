import type { H3Event, Router, EventHandlerRequest, EventHandlerResponse, EventHandler, EventHandlerObject } from "h3"

export const safeEventHandler = <Request extends EventHandlerRequest = EventHandlerRequest, Response = EventHandlerResponse>(handler: EventHandler<Request, Response> | EventHandlerObject<Request, Response>) => {
    const makeSafe = (func: EventHandler<Request, Response>) => {
        return (event: H3Event) => {
            try {
                return func(event)
            } catch (error: any) {
                throw createError({
                    statusCode: 500,
                    data: error,
                    message: error?.message || "Unknown Internal Server Error"
                })
            }
        }
    }

    if (typeof handler === "function") {
        handler = makeSafe(handler)
    } else {
        handler.handler = makeSafe(handler.handler)

    }

    return defineEventHandler(handler)
}

export function useController(folderName: string, router: Router) {
    router.use('/**', defineEventHandler((event: H3Event) => {
        log.warn(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`)
        return createError({
            status: 404,
            message: "The requested route does not exist."
        })
    }))

    return useBase(`/${folderName}`, router.handler)
}