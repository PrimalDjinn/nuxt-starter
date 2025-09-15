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

// Recursive type to unwrap nested promises
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type PromiseResult<T, E> = Promise<
  Result<UnwrapPromise<T>, T extends Promise<any> ? T["catch"] : E>
>;

export function execute<F extends (...args: any[]) => any, E = Error>(
  fun: F | None,
  ...args: Parameters<F>
): ReturnType<F> extends Promise<any>
  ? PromiseResult<ReturnType<F>, E>
  : Result<ReturnType<F>, E>;
export async function execute<T, E = Error>(
  promise: Promise<T>
): PromiseResult<Promise<T>, E>;
export function execute(arg: any, ...args: any[]) {
  if (isPromise(arg)) {
    return arg
      .then((v) => ({ result: v, error: undefined }))
      .catch((e) => ({ result: undefined, error: e }));
  }

  if (typeof arg === "function") {
    try {
      return execute(arg(...args));
    } catch (e: any) {
      return { result: undefined, error: e };
    }
  }

  return { result: arg, error: undefined };
}
