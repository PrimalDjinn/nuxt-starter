import type { StorageValue } from "unstorage";

export default async function <T extends StorageValue>(
  key: string,
  init?: () => T | Ref<T>
): Promise<Ref<T | null>> {
  if (import.meta.server) {
    // There is no local storage in the server, we return useState to avoid global pollution
    // Future would be to later store the stored kvs in the client
    return useState(key, init);
  }

  const storage = useStorage();
  if (!storage) {
    console.warn("Could not get local storage");
    return useState(key, init);
  }

  try {
    const refVal = ref();

    let initVal;
    if (init) {
      initVal = toValue(await init?.());
      if (initVal) {
        storage.setItem(key, initVal);
      } else {
        storage.removeItem(key);
      }
    }

    storage.watch(async (_, changed_key) => {
      if (changed_key === key) {
        const val = await storage.getItem<T>(changed_key);
        if (val !== refVal.value) {
          refVal.value = val ?? undefined;
        }
      }
    });

    const val = initVal || (await storage.getItem<T>(key));
    refVal.value = val ?? undefined;

    watch(refVal, (newVal) => {
      if (newVal) {
        storage.setItem(key, newVal);
      } else {
        storage.removeItem(key);
      }
    });
    return refVal;
  } catch (e) {
    window.addEventListener(
      "beforeunload",
      () => {
        storage.clear();
      },
      { once: true }
    );
    return useState(key, init);
  }
}
