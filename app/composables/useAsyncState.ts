import type { ShallowRef } from "vue";
import { isNone, type None } from "~/utils/std/tools";
import type { JSFunction, MaybePromise } from "~~/shared/types/utils";
import { execute, isPromise } from "~~/shared/utils/execute";

async function fill_return<T>(
  promise: Promise<T> | Awaited<ReturnType<typeof execute>>,
  _return: {
    data: ShallowRef<T | undefined> | Ref<T, undefined>;
    error: ShallowRef<Error | undefined> | Ref<Error, undefined>;
  }
) {
  if (!promise) {
    _return.data.value = undefined;
    _return.error.value = undefined;
    return;
  }

  const { result, error } = isPromise(promise) ? await execute(promise) : promise;
  if (result) {
    // @ts-expect-error
    _return.data.value = toValue(result);
    _return.error.value = undefined;
  } else {
    _return.data.value = undefined;
    _return.error.value = toValue(error);
  }
}

type AsyncState<T> =
  | {
      data: Ref<T>;
      error: Ref<undefined>;
    }
  | {
      data: Ref<undefined>;
      error: Ref<Error>;
    };
export default async function useAsyncState<T>(key: string, init?: JSFunction<MaybePromise<T>>): Promise<AsyncState<T>>;
export default async function useAsyncState<T>(key: string, options?: { deep?: boolean }): Promise<AsyncState<T>>;
export default async function useAsyncState<T>(
  key: string,
  init?: JSFunction<MaybePromise<T>>,
  options?: { deep?: boolean }
): Promise<AsyncState<T>>;
export default async function useAsyncState<T>(
  key: string,
  arg1?: JSFunction<MaybePromise<T>> | { deep?: boolean },
  arg2?: { deep?: boolean }
) {
  let init: JSFunction<MaybePromise<T>> | undefined;
  let options: { deep?: boolean } | undefined;
  if (typeof arg1 === "function") {
    init = arg1;
    options = arg2;
  } else {
    options = arg1;
  }

  if (isNone(options)) {
    options = {};
  }

  if (isNone(options.deep)) {
    options.deep = false;
  }

  const _return = {
    data: options.deep ? ref() : shallowRef(),
    error: options.deep ? ref() : shallowRef(),
  };

  if (tryUseNuxtApp()) {
    const existing = useState<Promise<T>>(key);
    if (await existing.value) {
      await fill_return(existing.value, _return);
      return _return;
    }

    const fn = init
      ? async () => {
          if (options.deep) {
            return await init();
          } else {
            const { result: data, error } = await execute(init);
            if (error) {
              consola.fatal(error);
            }
            const result = toValue(data);
            return shallowRef(result);
          }
        }
      : undefined;

    const data = useState(key, fn);

    await fill_return(data.value, _return);
    watch(
      data,
      (promise) => {
        fill_return(promise, _return);
      },
      options
    );

    return _return;
  }

  consola.warn("No nuxt instance available");
  if (init) {
    await fill_return(execute(init), _return);
  } else {
    consola.fatal("No init function provided");
  }
  return _return;
}
