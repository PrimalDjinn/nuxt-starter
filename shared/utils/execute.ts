export function isPromise(arg: any): arg is Promise<any> {
  return arg && typeof arg.then === "function";
}

type CatchError = (onrejected: (error: any) => any) => any;
type ResultError<E> = E extends any ? Error : E;
type Result<T, E = Error | CatchError> =
  | { result: T; error: undefined }
  | {
      result: undefined;
      error: E extends CatchError
        ? ResultError<Parameters<Parameters<E>[0]>[0]>
        : E;
    };

type PromiseResult<T, E> = Promise<
  T extends Promise<infer U> ? Result<U, T["catch"]> : Result<T, E>
>;
export function execute<F extends (...args: any[]) => any, E = Error>(
  fun: F,
  ...args: Parameters<F>
): Result<ReturnType<F>, E>;
export async function execute<T, E = Error>(
  promise: Promise<T>
): PromiseResult<Promise<T>, E>;
export function execute(arg: any, ...args: any[]) {
  if (isPromise(arg)) {
    return arg
      .then((v) => ({ result: v, error: undefined }))
      .catch((e) => ({ result: undefined, error: e }));
  }

  try {
    return { result: arg(...args), error: undefined };
  } catch (e: any) {
    return { result: undefined, error: e };
  }
}
