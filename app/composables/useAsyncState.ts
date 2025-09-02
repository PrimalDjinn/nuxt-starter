import type { ShallowRef } from "vue";

async function fill_return<T>(
  promise: Promise<T> | Awaited<T>,
  _return: {
    status: Ref<AsyncStatus>;
    data: ShallowRef<T | undefined> | Ref<T>;
    error: ShallowRef<Error | undefined> | Ref<Error>;
  }
) {
  _return.status.value = "loading";

  if (!promise) {
    _return.data.value = undefined;
    _return.error.value = undefined;
    _return.status.value = "idle";
    return;
  }

  const { result, error } = await execute(() => promise);
  if (result) {
    // @ts-expect-error toValue for refs
    _return.data.value = toValue(result);
    _return.error.value = undefined;
    _return.status.value = "success";
  } else {
    _return.data.value = undefined;
    _return.error.value = toValue(error);
    _return.status.value = "error";
  }
}

type AsyncStatus = "idle" | "loading" | "success" | "error";

type SuccessState<T> = {
  status: Ref<"success">;
  data: Ref<T>;
  error: Ref<undefined>;
  refresh: JSFunction;
};

type ErrorState = {
  status: Ref<"error">;
  data: Ref<undefined>;
  error: Ref<Error>;
  refresh: JSFunction;
};

type LoadingState<T> = {
  status: Ref<"loading">;
  data: Ref<T | undefined>;
  error: Ref<Error | undefined>;
  refresh: JSFunction;
};

type IdleState<T> = {
  status: Ref<"idle">;
  data: Ref<undefined>;
  error: Ref<undefined>;
  refresh: JSFunction;
};

export type AsyncState<T> =
  | IdleState<T>
  | LoadingState<T>
  | SuccessState<T>
  | ErrorState;

export type AsyncStateOptions = { deep?: boolean; ttl?: number };
export default async function useAsyncState<T>(
  key: string,
  init?: JSFunction<MaybePromise<T>>
): Promise<AsyncState<T>>;
export default async function useAsyncState<T>(
  key: string,
  options?: AsyncStateOptions
): Promise<AsyncState<T>>;
export default async function useAsyncState<T>(
  key: string,
  init?: JSFunction<MaybePromise<T>>,
  options?: AsyncStateOptions
): Promise<AsyncState<T>>;
export default async function useAsyncState<T>(
  key: string,
  arg1?: JSFunction<MaybePromise<T>> | AsyncStateOptions,
  arg2?: AsyncStateOptions
) {
  let init: JSFunction<MaybePromise<T>> | undefined;
  let options: AsyncStateOptions | undefined;

  if (typeof arg1 === "function") {
    init = arg1;
    options = arg2;
  } else {
    options = arg1;
  }

  if (isNone(options)) options = {};
  if (isNone(options.deep)) options.deep = false;

  const fn = init
    ? async () => {
        _return.status.value = "loading";
        if (options.deep) {
          return await init();
        } else {
          const { result: data, error } = await execute(init);
          if (error) console.error(error);
          const result = toValue(data);
          return shallowRef(result);
        }
      }
    : undefined;

  const _return = {
    status: ref<AsyncStatus>("idle"),
    data: options.deep ? ref() : shallowRef(),
    error: options.deep ? ref() : shallowRef(),
    refresh() {
      console.warn("No refresh function");
    },
  } as AsyncState<T>;

  const promise = useState(key, fn);
  const commit = async () => {
    const _awaited = await useState<Promise<T>>(key).value;
    const existing = toValue(_awaited);
    if (existing) {
      await fill_return(existing, _return);
      return;
    }

    if (fn && (!promise.value || !(await promise.value))) {
      promise.value = fn();
    }

    if (!isNone(options.ttl)) {
      setTimeout(() => {
        promise.value = undefined as any;
      }, options.ttl);
    }

    await fill_return(promise.value, _return);
  };

  await commit();
  watch(
    promise,
    (promise) => {
      fill_return(promise, _return);
    },
    options
  );

  _return.refresh = () => {
    useState(key).value = undefined;
    commit();
  };
  return _return;
}
