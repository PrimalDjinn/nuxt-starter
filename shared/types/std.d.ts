export type JSFunction<ReturnType = any, Parameters = any> = (
  ...args: Parameters extends Array<any> ? Parameters : [Parameters]
) => ReturnType;
