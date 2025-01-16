import consola from "consola";
import { isDevelopment } from "../../server/utils/env";

type Result<T> = T | undefined;
type Error = any | undefined;
type Return<T> = { data: Ref<Result<T>>; error: Error };

export const useAsyncState = async <T>(
  key: string,
  fn: () => Promise<T>
): Promise<Return<T>> => {
  async function pull() {
    try {
      const data = await fn();
      return { result: data, error: undefined };
    } catch (error) {
      return Promise.resolve({ error: error as Error, result: undefined });
    }
  }

  if (tryUseNuxtApp()) {
    const { data: initial } = useNuxtData(key);
    if (initial.value)
      return Promise.resolve({ data: initial as Ref<T>, error: undefined });

    const { result, error } = await pull();
    initial.value = result;
    if (error) {
      consola.error("An error occurred while fetching data for", key);
      consola.error(error);
    }
    return { data: initial, error };
  } else {
    if (isDevelopment) {
      consola.warn(
        "Nuxt instance not found, re-executing initialisation function and discarding results right after." +
          " There is no state thus, results will not be re-used, please check your implementation." +
          " This has a low likelihood of being a Nuxt error, well unless you are an idiot, you idiot."
      );
    }

    const { result, error } = await pull();
    consola.log("result", result, error);
    return { data: ref(result) as Ref<typeof result>, error };
  }
};
