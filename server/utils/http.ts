import type { H3Event, Router, EventHandlerRequest, EventHandlerResponse, EventHandler, EventHandlerObject } from "h3"
import {consola} from "consola"

type Response<T> = T;
export function createResponse<T extends object>(
  response: {
    statusMessage?: string;
    data?: T | string;
    headers?: Record<string, string>;
  } & OneOf<[{ statusCode: number }, { status: number }]>
): Response<T> {
  let inferred: Record<string, string> = {};
  let { statusMessage, data, headers } = response;
  let statusCode =
    (response as any)?.statusCode || (response as any)?.status || 200;

  switch (typeof data) {
    case "string":
      inferred = { "Content-Type": "text/plain" };
      break;
    case "object":
      inferred = { "Content-Type": "application/json" };
      data = JSON.stringify(data);
      break;
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
      inferred = { "Content-Type": "text/plain" };
      data = (data as any).toString();
      break;
    case "function":
      const result = (data as Function)();
      if (result instanceof Response) return result as T;
      return createResponse({ statusCode, data: result, headers: headers });
    default:
      inferred = {};
  }

  return new Response(data as BodyInit | XMLHttpRequestBodyInit, {
    status: statusCode,
    statusText: statusMessage || undefined,
    headers: new Headers({ ...inferred, ...headers }),
  }) as T;
}

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
        consola.warn(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`)
        return createError({
            status: 404,
            message: "The requested route does not exist."
        })
    }))

    return useBase(`/${folderName}`, router.handler)
}