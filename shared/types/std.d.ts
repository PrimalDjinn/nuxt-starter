export type JSFunction<ReturnType = any, Parameters = []> = (
  ...args: Parameters extends Array<any> ? Parameters : [Parameters]
) => ReturnType;

export type MaybePromise<T> = Promise<T> | T;
