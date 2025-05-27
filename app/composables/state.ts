import { isDevelopment } from "../../server/utils/env";

type Result<T> = T | undefined;
type Error = Ref<any | undefined>;
export async function useAsyncState<T>(
  key: string,
  fn: () => Promise<Result<T>>
): Promise<{ data: Ref<Result<T>>; error: Error }>;
export async function useAsyncState<T>(
  key: string,
  fn: () => Promise<Result<T>>,
  options: { immediate: true }
): Promise<{ data: Ref<Result<T>>; error: Error }>;
export async function useAsyncState<T>(
  key: string,
  fn: () => Promise<Result<T>>,
  options: { immediate: false }
): Promise<{
  data: Ref<Result<T>>;
  error: Error;
  execute: () => Promise<void>;
}>;
export async function useAsyncState<T>(
  key: string,
  fn: () => Promise<Result<T>>,
  options: { immediate: boolean }
): Promise<{
  data: Ref<Result<T>>;
  error: Error;
  execute?: () => Promise<void>;
}>;
export async function useAsyncState<T>(
  key: string,
  fn: () => Promise<Result<T>>,
  options?: { immediate?: boolean }
): Promise<{
  data: Ref<Result<T>>;
  error: Error;
  execute?: () => Promise<void>;
}> {
  if (options?.immediate !== false) {
    options = { immediate: true };
  }
  async function pull() {
    try {
      const data = await fn();
      return { data, error: undefined };
    } catch (error) {
      return Promise.resolve({ error: error as Error, data: undefined });
    }
  }

  let initial: Ref<Result<T>>;
  const error = ref<Error | undefined>(undefined);
  if (tryUseNuxtApp()) {
    const { data } = useNuxtData(key);
    initial = data;
  } else {
    if (isDevelopment) {
      console.info(
        "Nuxt instance not found, re-executing initialisation function and discarding results right after." +
          " There is no state thus, results will not be re-used, please check your implementation." +
          " This has a low likelihood of being a Nuxt error, well unless you are an idiot, you idiot."
      );
    }
    initial = ref(undefined);
  }

  async function execute() {
    const { data: _data, error: _error } = await pull();
    initial.value = _data;
    if (_error) {
      console.error("An error occurred while fetching data for", key);
      console.error(error.value);
      error.value = _error;

      if (
        typeof error?.value === "string" &&
        error.value.toLocaleLowerCase().includes("nuxt")
      ) {
        console.warn(
          "Please note that the initialisation function of useAsyncState should not contain a function that needs nuxt instance"
        );
      }
    }
  }

  if (options.immediate) {
    if (!initial.value) await execute();
    return { data: initial, error };
  }

  return Promise.resolve({ data: initial, error, execute });
}
